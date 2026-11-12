import { createHmac, timingSafeEqual } from 'node:crypto';

const MAX_FAILURES = 5;
const WINDOW_MS = 10 * 60 * 1000;
const LOCK_MS = 60 * 1000;
const SESSION_SECONDS = 8 * 60 * 60;
const buckets = new Map();

function respond(res, status, data) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(status).json(data);
}

function rateBucket(ip) {
  const now = Date.now();
  if (buckets.size > 3000) {
    for (const [key, entry] of buckets) {
      if (now > Math.max(entry.until, entry.lockedUntil)) buckets.delete(key);
    }
  }
  let bucket = buckets.get(ip);
  if (!bucket || now > bucket.until && now > bucket.lockedUntil) {
    bucket = { attempts: 0, until: now + WINDOW_MS, lockedUntil: 0 };
    buckets.set(ip, bucket);
  }
  return bucket;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return respond(res, 405, { error: 'method_not_allowed' });
  }
  const origin = req.headers.origin;
  const hostname = req.headers.host;
  if (!hostname || origin !== 'https://' + hostname) {
    return respond(res, 403, { error: 'invalid_origin' });
  }
  if (!String(req.headers['content-type'] || '').startsWith('application/json')) {
    return respond(res, 415, { error: 'invalid_content_type' });
  }
  if (Number(req.headers['content-length'] || '0') > 1024) {
    return respond(res, 413, { error: 'too_large' });
  }
  const expected = process.env.GATE_CODE;
  const secret = process.env.GATE_SIGNING_SECRET;
  if (!expected || !secret) {
    return respond(res, 503, { error: 'not_configured' });
  }

  const ip = String(req.headers['x-vercel-forwarded-for'] ||
    req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  const bucket = rateBucket(ip);
  if (bucket.lockedUntil > Date.now()) {
    const retryAfter = Math.ceil((bucket.lockedUntil - Date.now()) / 1000);
    res.setHeader('Retry-After', String(retryAfter));
    return respond(res, 429, { error: 'temporarily_locked', retryAfter });
  }

  let code;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    code = body && typeof body.code === 'string' ? body.code : '';
  } catch {
    code = '';
  }
  const a = Buffer.from(code);
  const b = Buffer.from(expected);
  const correct = a.length === b.length && timingSafeEqual(a, b);

  if (!correct) {
    bucket.attempts += 1;
    if (bucket.attempts >= MAX_FAILURES) {
      bucket.lockedUntil = Date.now() + LOCK_MS;
      res.setHeader('Retry-After', String(LOCK_MS / 1000));
      return respond(res, 429, { error: 'temporarily_locked', retryAfter: 60 });
    }
    return respond(res, 401, {
      error: 'wrong_code', attemptsRemaining: MAX_FAILURES - bucket.attempts
    });
  }

  buckets.delete(ip);
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const signature = createHmac('sha256', secret)
    .update('ornek-gate:' + expires).digest('hex');
  const token = 'v1.' + expires + '.' + signature;
  res.setHeader('Set-Cookie',
    '__Host-ornek_gate=' + token +
    '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=' + SESSION_SECONDS
  );
  return respond(res, 200, { ok: true });
}
