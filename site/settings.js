/* Örnek: accessible site-wide display preferences. Does not touch test/account data. */
(() => {
  'use strict';
  const KEY = 'ornek-display-settings-v1';
  const defaults = { largeText: false, reducedMotion: false, highContrast: false };
  let preferences = { ...defaults };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    for (const name of Object.keys(defaults)) if (typeof saved[name] === 'boolean') preferences[name] = saved[name];
  } catch (_) {}

  const $ = (selector, root = document) => root.querySelector(selector);
  const onSpecialities = () => location.pathname.startsWith('/specialities');
  const currentLanguage = () => document.documentElement.lang === 'ru' ? 'ru' : 'kk';
  const phrases = {
    kk: {
      settings: 'Параметрлер', title: 'Сайт параметрлері',
      intro: 'Örnek-ті өзіңе ыңғайлы етіп бапта.',
      language: 'Интерфейс тілі', appearance: 'Көрініс және қолжетімділік',
      largeText: 'Үлкен мәтін', largeDesc: 'Мәтінді оқуды жеңілдетеді',
      reducedMotion: 'Анимацияны азайту', motionDesc: 'Қозғалыс эффектілерін өшіреді',
      highContrast: 'Жоғары контраст', contrastDesc: 'Мәтін мен шекараларды айқындайды',
      default: 'Әдепкіге қайтару', close: 'Дайын',
      note: 'Бұл параметрлер тек осы браузерде сақталады. Тест нәтижелері өзгермейді.'
    },
    ru: {
      settings: 'Настройки', title: 'Настройки сайта',
      intro: 'Настрой Örnek под себя.',
      language: 'Язык интерфейса', appearance: 'Вид и доступность',
      largeText: 'Крупный текст', largeDesc: 'Помогает читать текст',
      reducedMotion: 'Уменьшить анимацию', motionDesc: 'Отключает эффекты движения',
      highContrast: 'Высокий контраст', contrastDesc: 'Делает текст и границы заметнее',
      default: 'По умолчанию', close: 'Готово',
      note: 'Настройки сохраняются только в этом браузере. Результаты тестов не изменяются.'
    }
  };

  const gear = '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="m19.4 15 .1.1 1.4 1.1-1.9 3.3-1.8-.5a8 8 0 0 1-2 1.1l-.4 1.9h-3.8l-.4-1.9a8 8 0 0 1-2-1.1l-1.8.5-1.9-3.3 1.4-1.2a8 8 0 0 1 0-2.2L4.9 11.6l1.9-3.3 1.8.5a8 8 0 0 1 2-1.1l.4-1.9h3.8l.4 1.9a8 8 0 0 1 2 1.1l1.8-.5 1.9 3.3-1.4 1.2a8 8 0 0 1-.1 2.2Z" transform="translate(0 -1.2) scale(.96)"/></svg>';

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(preferences)); } catch (_) {}
    apply();
  }
  function apply() {
    const root = document.documentElement;
    root.dataset.ornekText = preferences.largeText ? 'large' : 'normal';
    root.dataset.ornekMotion = preferences.reducedMotion ? 'off' : 'on';
    root.dataset.ornekContrast = preferences.highContrast ? 'high' : 'normal';
  }
  apply();

  function makeTrigger() {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ornek-settings-trigger';
    b.dataset.ornekSettingsTrigger = '';
    b.setAttribute('aria-haspopup', 'dialog');
    b.innerHTML = gear + '<span></span>';
    return b;
  }
  function attachButtons() {
    const locations = [
      $('#welcome .ornek-header-v3 .ornek-v3-actions') ||
        $('#welcome .ornek-nav-end') ||
        $('#welcome .welcome-nav-actions'),
      $('header.top .toptools')
    ];
    for (const container of locations) {
      if (!container || container.querySelector('[data-ornek-settings-trigger]')) continue;
      const button = makeTrigger();
      const mobileMenu = container.querySelector('.ornek-v3-menu-toggle');
      if (mobileMenu) container.insertBefore(button, mobileMenu);
      else container.appendChild(button);
    }
    const specialHeader = onSpecialities() ? $('body > header') : null;
    if (specialHeader && !specialHeader.querySelector('[data-ornek-settings-trigger]')) {
      specialHeader.insertBefore(makeTrigger(), $('#language') || null);
    }
    const t = phrases[currentLanguage()];
    document.querySelectorAll('[data-ornek-settings-trigger]').forEach(button => {
      button.setAttribute('aria-label', t.settings);
      button.setAttribute('title', t.settings);
      const span = button.querySelector('span');
      if (span) span.textContent = t.settings;
    });
  }

  let dialog;
  let lastTrigger;
  function createDialog() {
    dialog = document.createElement('dialog');
    dialog.className = 'ornek-settings-dialog';
    dialog.id = 'ornek-display-settings';
    dialog.setAttribute('aria-labelledby', 'ornek-settings-heading');
    dialog.innerHTML =
      '<div class="os-heading"><div><h2 id="ornek-settings-heading"></h2><p data-os-intro></p></div>' +
      '<button class="os-x" type="button" data-os-close aria-label="Жабу">×</button></div>' +
      '<div class="os-content"><div class="os-label" data-os-language></div>' +
      '<div class="os-languages" role="group" aria-label="Тіл / Язык">' +
      '<button type="button" data-os-lang="kk">Қазақша</button><button type="button" data-os-lang="ru">Русский</button></div>' +
      '<div class="os-label os-separator" data-os-appearance></div>' +
      '<label class="os-option"><span><strong data-os-largeText></strong><small data-os-largeDesc></small></span>' +
      '<input type="checkbox" data-os-pref="largeText"></label>' +
      '<label class="os-option"><span><strong data-os-reducedMotion></strong><small data-os-motionDesc></small></span>' +
      '<input type="checkbox" data-os-pref="reducedMotion"></label>' +
      '<label class="os-option"><span><strong data-os-highContrast></strong><small data-os-contrastDesc></small></span>' +
      '<input type="checkbox" data-os-pref="highContrast"></label>' +
      '<p class="os-note" data-os-note></p></div>' +
      '<div class="os-footer"><button type="button" class="os-reset" data-os-reset></button>' +
      '<button type="button" class="os-done" data-os-close></button></div>';
    document.body.appendChild(dialog);
    dialog.addEventListener('click', e => {
      const target = e.target.closest('button');
      if (target?.matches('[data-os-close]')) close();
      if (target?.matches('[data-os-reset]')) {
        preferences = { ...defaults };
        save();
        renderDialog();
      }
      if (target?.hasAttribute('data-os-lang')) {
        const lang = target.dataset.osLang;
        if (currentLanguage() !== lang) {
          if (onSpecialities()) {
            $('#language')?.click();
          } else if (typeof setQLanguage === 'function') {
            setQLanguage(lang);
          } else {
            try { localStorage.setItem('qadam-ui-language', lang); } catch (_) {}
            document.documentElement.lang = lang;
          }
        }
        renderDialog();
      }
    });
    dialog.addEventListener('change', e => {
      const input = e.target.closest('input[data-os-pref]');
      if (!input) return;
      preferences[input.dataset.osPref] = input.checked;
      save();
    });
    dialog.addEventListener('click', e => {
      if (e.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close();
    });
    dialog.addEventListener('close', () => lastTrigger?.isConnected && lastTrigger.focus({ preventScroll: true }));
  }
  function renderDialog() {
    const l = currentLanguage(), t = phrases[l];
    dialog.querySelector('#ornek-settings-heading').textContent = t.title;
    dialog.querySelector('[data-os-intro]').textContent = t.intro;
    for (const key of ['language','appearance','largeText','largeDesc','reducedMotion','motionDesc','highContrast','contrastDesc','note'])
      dialog.querySelector('[data-os-' + key + ']').textContent = t[key];
    dialog.querySelector('[data-os-reset]').textContent = t.default;
    dialog.querySelector('.os-done').textContent = t.close;
    dialog.querySelector('.os-x').setAttribute('aria-label', t.close);
    dialog.querySelectorAll('[data-os-lang]').forEach(b => {
      const active = b.dataset.osLang === l;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    dialog.querySelectorAll('[data-os-pref]').forEach(b => { b.checked = !!preferences[b.dataset.osPref]; });
  }
  function open(trigger) {
    lastTrigger = trigger;
    if (!dialog) createDialog();
    renderDialog();
    if (!dialog.open) dialog.showModal();
  }
  function close() {
    if (dialog?.open) dialog.close();
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-ornek-settings-trigger]');
    if (button) open(button);
  });
  window.OrnekSettings = { open: () => open(document.querySelector('[data-ornek-settings-trigger]')) };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else start();
  function start() {
    attachButtons();
    new MutationObserver(attachButtons).observe(document.body, { childList: true, subtree: true });
    new MutationObserver(() => { attachButtons(); if (dialog?.open) renderDialog(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }
})();