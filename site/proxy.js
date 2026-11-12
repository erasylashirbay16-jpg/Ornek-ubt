import { next, rewrite } from '@vercel/functions';

// A signed, HttpOnly session is checked BEFORE any page, static asset or API is served.
const COOKIE_NAME = '__Host-ornek_gate';
const encoder = new TextEncoder();

async function isValidSession(token, secret) {
  if (!token || !secret) return false;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'v1') return false;
  const expires = parts[1];
  const hex = parts[2];
  if (!/^[0-9]{10}$/.test(expires) || !/^[0-9a-f]{64}$/.test(hex)) return false;
  const now = Math.floor(Date.now() / 1000);
  const deadline = Number(expires);
  if (deadline <= now || deadline > now + 12 * 60 * 60) return false;

  try {
    const bytes = new Uint8Array(32);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    );
    return await crypto.subtle.verify(
      'HMAC', key, bytes, encoder.encode('ornek-gate:' + expires)
    );
  } catch {
    return false;
  }
}

export default async function proxy(request) {
  const pathname = new URL(request.url).pathname;
  // Only the code-entry page and verification endpoint are public.
  if (pathname === '/gate.html' || pathname === '/api/gate-verify') {
    return next();
  }

  const secret = process.env.GATE_SIGNING_SECRET;
  if (!secret) {
    return new Response('Access verification is unavailable.', {
      status: 503, headers: { 'Cache-Control': 'no-store' }
    });
  }

  const header = request.headers.get('cookie') || '';
  const item = header.split(';').map(part => part.trim())
    .find(part => part.startsWith(COOKIE_NAME + '='));
  const token = item ? item.slice(COOKIE_NAME.length + 1) : '';

  if (await isValidSession(token, secret)) return next();

  if (pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({ error: 'access_code_required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Access code required.', {
      status: 401, headers: { 'Cache-Control': 'no-store' }
    });
  }
  return rewrite(new URL('/gate.html', request.url));
}
