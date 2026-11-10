/* In-page tutoring; credentials and Gemini requests stay on the server. */
const roomAiSessions = new Map();
const roomAiText = (kk, ru) => typeof qLanguage !== 'undefined' && qLanguage === 'ru' ? ru : kk;
function roomAiSession() {
  const item = roomCurrent();
  if (!item) return null;
  const key = String(item.id) + ':' + item.t;
  if (!roomAiSessions.has(key)) {
    if (roomAiSessions.size >= 20) {
      const first = roomAiSessions.keys().next().value;
      roomAiSessions.get(first).controller?.abort();
      roomAiSessions.delete(first);
    }
    roomAiSessions.set(key, { messages: [], pending: false, error: '', controller: null });
  }
  return roomAiSessions.get(key);
}
roomAskHTML = function () {
  return `<div class="assistant-intro"><img src="assets/ornek-icon.svg" alt="Örnek" width="44" height="44"><h3>${roomAiText('Бірге ойланып көрейік.', 'Давай подумаем вместе.')}</h3><p>${roomAiText('Сұрағыңды жаз — жауап осы жерде шығады.', 'Напиши вопрос — ответ появится здесь.')}</p></div><div id="roomAiLog" class="room-ai-log" role="log" aria-live="polite" aria-relevant="additions text" aria-label="${roomAiText('Көмекшімен әңгіме', 'Разговор с помощником')}"></div><div class="assistant-prompts" id="roomAiPrompts">${[
    [roomAiText('Неден бастаймын?', 'С чего начать?'), 'hint'],
    [roomAiText('Қандай тәсіл тиімді?', 'Какой способ лучше?'), 'method'],
    [roomAiText('Қадамдап түсіндір', 'Объясни по шагам'), 'steps']
  ].map(([label, key]) => `<button class="assistant-prompt" onclick="roomAiPrompt('${key}')">${label}${roomIcon('next')}</button>`).join('')}</div><p class="assistant-note">${roomAiText('ИИ жауабы қате болуы мүмкін. Есептеуін тексер. Сұрағың мен есеп мәтіні Google Gemini-ге жіберіледі; жеке деректерді жазба.', 'ИИ может ошибаться. Проверяй вычисления. Вопрос и условие задачи отправляются Google Gemini; не указывай личные данные.')}</p>`;
};
function roomAiPrompt(key) {
  const prompts = {
    hint: roomAiText('Жауабын бірден айтпай, алғашқы қадамға шағын ишара бер.', 'Дай небольшую подсказку для первого шага, не раскрывая ответ.'),
    method: roomAiText('Бұл есепке ең тиімді шешу тәсілін таңдап, неге қолайлы екенін түсіндір.', 'Выбери эффективный способ решения и объясни, почему он подходит.'),
    steps: roomAiText('Есепті қадамдап түсіндір. Соңында шешімді бастапқы шартпен тексер.', 'Объясни решение по шагам и проверь ответ по условию.')
  };
  roomSendAI(prompts[key]);
}
function roomRenderAI() {
  if (roomModal !== 'ask') return;
  const log = document.getElementById('roomAiLog');
  const session = roomAiSession();
  if (!log || !session) return;
  log.replaceChildren();
  for (const message of session.messages) {
    const article = document.createElement('article');
    article.className = 'room-ai-message room-ai-' + message.role;
    const label = document.createElement('strong');
    label.textContent = message.role === 'user' ? roomAiText('Сен', 'Ты') : 'Өрнек ИИ';
    const text = document.createElement('p');
    text.textContent = message.text;
    article.append(label, text);
    log.append(article);
  }
  log.setAttribute('aria-busy', String(session.pending));
  if (session.pending) {
    const status = document.createElement('p');
    status.className = 'room-ai-thinking';
    status.setAttribute('role', 'status');
    status.textContent = roomAiText('Көмекші ойланып жатыр…', 'Помощник думает…');
    log.append(status);
  }
  const form = document.querySelector('#studySheet .assistant-composer');
  if (form) {
    const send = form.querySelector('[type=submit]');
    send.disabled = session.pending;
    send.innerHTML = roomAiText('Жіберу', 'Отправить') + roomIcon('arrow');
    const textarea = form.querySelector('textarea');
    textarea.disabled = session.pending;
    let stop = form.querySelector('.room-ai-stop');
    if (!stop) {
      stop = document.createElement('button');
      stop.type = 'button';
      stop.className = 'room-ai-stop';
      stop.onclick = roomCancelAI;
      form.querySelector('.composer-bottom').append(stop);
    }
    stop.textContent = roomAiText('Тоқтату', 'Остановить');
    stop.hidden = !session.pending;
  }
  document.querySelectorAll('#roomAiPrompts button').forEach(b => b.disabled = session.pending);
  const prompts = document.getElementById('roomAiPrompts');
  if (prompts) prompts.hidden = session.messages.length > 0;
  const error = document.getElementById('assistantError');
  if (error) {
    error.replaceChildren();
    if (session.error) {
      error.append(document.createTextNode(session.error + ' '));
      if (session.retry) {
        const retry = document.createElement('button');
        retry.type = 'button';
        retry.className = 'room-ai-retry';
        retry.textContent = roomAiText('Қайта жіберу', 'Повторить');
        retry.onclick = () => roomSendAI(session.retry);
        error.append(retry);
      }
    }
  }
  if (session.messages.length || session.pending) {
    const panel = document.getElementById('studyPanel');
    panel.scrollTop = panel.scrollHeight;
  }
}
function roomCancelAI() {
  const session = roomAiSession();
  session?.controller?.abort();
}
roomSendAI = async function (request) {
  const item = roomCurrent();
  const session = roomAiSession();
  if (!item || !session || session.pending || typeof request !== 'string' || !request.trim()) return;
  const text = request.trim().slice(0, 1200);
  session.error = '';
  session.retry = '';
  session.messages.push({ role: 'user', text });
  session.pending = true;
  session.controller = new AbortController();
  const input = document.getElementById('assistantQuestion');
  if (input) input.value = '';
  roomRenderAI();
  const timeout = setTimeout(() => session.controller?.abort('timeout'), 55000);
  try {
    // Always send complete user/assistant pairs plus the current question.
    const history = session.messages.slice(-9);
    while (history[0]?.role !== 'user') history.shift();
    const response = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: typeof qLanguage !== 'undefined' ? qLanguage : 'kk',
        question: { section: sections[item.s]?.[0] || 'Математика', text: roomDecoded(item.t), options: item.o.map(roomDecoded) },
        messages: history.map(m => ({ role: m.role, text: m.text.slice(0, m.role === 'user' ? 1200 : 6000) }))
      }),
      signal: session.controller.signal
    });
    const data = await response.json();
    if (!response.ok || !data.answer) {
      const errors = {
        quota: roomAiText('Gemini сұрау лимитіне жетті. Біраздан кейін қайтала.', 'Достигнут лимит запросов Gemini. Попробуй позже.'),
        rate_limit: roomAiText('Сұраулар тым жиі. Бір минуттан кейін қайтала.', 'Слишком много запросов. Повтори через минуту.'),
        provider_auth: roomAiText('Gemini API кілтін тексеру керек. Сайт иесіне хабарла.', 'Нужно проверить ключ Gemini API. Сообщи владельцу сайта.'),
        not_configured: roomAiText('Көмекші әлі бапталмаған. Сайт иесіне хабарла.', 'Помощник ещё не настроен. Сообщи владельцу сайта.'),
        model_unavailable: roomAiText('Gemini моделі қазір қолжетімсіз. Кейінірек қайтала.', 'Модель Gemini сейчас недоступна. Попробуй позже.'),
        no_answer: roomAiText('Жауап алынбады. Сұрағыңды басқаша жазып көр.', 'Ответ не получен. Попробуй переформулировать вопрос.'),
        timeout: roomAiText('Жауап ұзаққа созылды. Қайта жіберіп көр.', 'Ответ занял слишком много времени. Попробуй ещё раз.')
      };
      throw Error(errors[data.code] || roomAiText('Байланыс үзілді. Біраздан кейін қайта жібер.', 'Не удалось получить ответ. Попробуй ещё раз.'));
    }
    session.messages.push({ role: 'assistant', text: data.answer + (data.incomplete ? roomAiText('\n\nЖауап қысқартылды. «Жалғастыр» деп жаза аласың.', '\n\nОтвет сокращён. Можно написать «Продолжи».') : '') });
    session.messages = session.messages.slice(-20);
  } catch (error) {
    session.messages.pop();
    session.retry = text;
    session.error = session.controller.signal.aborted ? roomAiText('Сұрау тоқтатылды. Қайта жіберуге болады.', 'Запрос остановлен. Можно отправить повторно.') : error.message;
  } finally {
    clearTimeout(timeout);
    session.pending = false;
    session.controller = null;
    if (roomAiSession() === session) roomRenderAI();
  }
};
const roomAiOpenBase = openStudySheet;
openStudySheet = function (tab = 'ask') {
  roomAiOpenBase(tab);
  if (tab === 'ask') roomRenderAI();
};
