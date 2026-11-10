/* Rising Ink-inspired pointer effect for Örnek's native JavaScript site.
   Original implementation (not the licensed React Bits Pro component). */
(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointerIsFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const selector = [
    '#welcome :is(h1,h2,h3,h4,p,button,a,summary,small,strong,span,.overline,.ornek-chip,.subject-category,.subject-free,.subject-language-note,.tag,.eyebrow,.muted,.hero-label,.handlabel,.welcome-step-number,.feature-label,.footer-note)',
    '#app :is(h1,h2,h3,h4,p,button,a,summary,small,strong,span,.muted,.overline,.eyebrow,.tag,.hero-label,.stat,.stat-value,.stat-label,.notice,.subject-category,.subject-free,.subject-shortcuts,.session-ticket,.qhero .hero-label,.reading-spec-note,.sidebar-heading)',
    'aside :is(button,a,summary,small,strong,.examlabel,.navgroup)',
    'header.top :is(button,a,small,strong,.topbrand,.toptools)',
    '.site-footer :is(p,a,small,strong,span)'
  ].join(', ');
  const excluded = 'script,style,noscript,textarea,option,select,pre,code,svg,math,[contenteditable],[aria-hidden="true"],.sr-only,.ri-sr-only,.ri-word,.ri-char,.ornek-rising-ink,.ornek-scroll-float,.arch-cta,dialog,.questionrow,.question-room,.qroom,.reading-workspace,.reading-passage,.reading-context,.history-workspace,.history-question,.reading-question,.qtext,.options,.option,.feedback,.testgrid,.testtile,.testintro,.formula,.motivation-loop,.arch-example,.example-paper,.ornek-privacy-legalbar,.ornek-countdown,[role="timer"]';
  const registry = new WeakMap();
  const MAX_CHARS = 350;
  const RADIUS = 125;
  let active = null;
  let pointerX = 0;
  let pointerY = 0;
  let frame = 0;
  let scanQueued = false;

  const isTestPage = () => !document.body.classList.contains('on-welcome') &&
    !!document.querySelector('#app :is(.qroom,.reading-workspace,.history-workspace,.testgrid,.testintro,.questionrow,.qtext,.options,.reading-question,.history-question)');
  const canAnimate = () => pointerIsFine.matches && !reducedMotion.matches && !isTestPage();

  function clearActive() {
    if (!active) return;
    const letters = registry.get(active) || [];
    for (const letter of letters) {
      letter.style.removeProperty('transform');
      letter.style.removeProperty('text-shadow');
    }
    active = null;
  }

  function update() {
    frame = 0;
    if (!active || !active.isConnected || !canAnimate()) {
      clearActive();
      return;
    }
    const letters = registry.get(active) || [];
    for (const letter of letters) {
      const word = letter.parentElement;
      const bounds = word.getBoundingClientRect();
      // offsetLeft/offsetTop are layout coordinates, unaffected by 3D transforms.
      const x = bounds.left + letter.offsetLeft + letter.offsetWidth / 2;
      const y = bounds.top + letter.offsetTop + letter.offsetHeight / 2;
      const dx = pointerX - x;
      const dy = pointerY - y;
      const proximity = Math.max(0, 1 - Math.hypot(dx, dy) / RADIUS);
      if (!proximity) {
        letter.style.removeProperty('transform');
        letter.style.removeProperty('text-shadow');
        continue;
      }
      const amount = proximity * proximity * (3 - 2 * proximity);
      const rise = 23 * amount;
      const twist = Math.max(-12, Math.min(12, -dx * 0.1)) * amount;
      const tip = 16 * amount;
      letter.style.transform = `translate3d(0, ${(-rise).toFixed(1)}px, ${(rise * 1.15).toFixed(1)}px) rotateX(${tip.toFixed(1)}deg) rotateY(${twist.toFixed(1)}deg)`;
      letter.style.textShadow = `0 ${Math.round(rise * 0.45)}px ${Math.round(8 + rise * 0.7)}px rgba(44,25,79,${(amount * 0.2).toFixed(3)})`;
    }
  }

  function split(el) {
    if (!canAnimate() || el.dataset.risingInk === 'ready' || el.closest('.ornek-rising-ink')) return;
    const readable = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
    if (!readable || Array.from(readable).length > MAX_CHARS) return;

    // Animate navigation and homepage buttons, but never change exercises or embedded controls.
    if (el.closest(excluded) || el.querySelector('button,a,input,select,textarea,[contenteditable]')) return;
    if (el.matches('[aria-live], [role="status"], [role="timer"]')) return;

    const letters = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.textContent.trim() && !node.parentElement?.closest(excluded)) nodes.push(node);
    }
    if (!nodes.length) return;
    el.dataset.risingInk = 'ready';
    el.classList.add('ornek-rising-ink');
    for (const node of nodes) {
      const fragment = document.createDocumentFragment();
      for (const part of node.textContent.split(/(\s+)/u)) {
        if (!part) continue;
        if (/^\s+$/u.test(part)) {
          fragment.append(document.createTextNode(part));
          continue;
        }
        const word = document.createElement('span');
        word.className = 'ri-word';
        word.setAttribute('aria-hidden', 'true');
        for (const character of Array.from(part)) {
          const letter = document.createElement('span');
          letter.className = 'ri-char';
          letter.textContent = character;
          word.append(letter);
          letters.push(letter);
        }
        fragment.append(word);
      }
      node.replaceWith(fragment);
    }
    // Keep each heading/paragraph readable as an uninterrupted sentence to assistive technology.
    const sr = document.createElement('span');
    sr.className = 'ri-sr-only';
    sr.textContent = readable;
    el.prepend(sr);
    registry.set(el, letters);
  }

  function scan() {
    scanQueued = false;
    if (!pointerIsFine.matches || reducedMotion.matches || isTestPage()) return;
    for (const el of document.querySelectorAll(selector)) split(el);
  }
  function scheduleScan() {
    if (scanQueued) return;
    scanQueued = true;
    queueMicrotask(scan);
  }

  document.addEventListener('pointermove', (event) => {
    if (!canAnimate() || event.pointerType === 'touch') {
      clearActive();
      return;
    }
    const el = event.target instanceof Element
      ? event.target.closest('.ornek-rising-ink')
      : null;
    if (el !== active) clearActive();
    if (!el) return;
    active = el;
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!frame) frame = requestAnimationFrame(update);
  }, { passive: true });
  document.addEventListener('pointerout', (event) => {
    if (!event.relatedTarget) clearActive();
  }, { passive: true });
  window.addEventListener('blur', clearActive);
  window.addEventListener('scroll', clearActive, { passive: true });
  reducedMotion.addEventListener('change', () => { clearActive(); scheduleScan(); });
  pointerIsFine.addEventListener('change', () => { clearActive(); scheduleScan(); });

  new MutationObserver((records) => {
    if (records.some(record => Array.from(record.addedNodes).some(node =>
      node.nodeType === Node.ELEMENT_NODE &&
      !node.classList?.contains('ri-word') &&
      !node.classList?.contains('ri-char') &&
      !node.classList?.contains('ri-sr-only')
    ))) scheduleScan();
  }).observe(document.body, { subtree: true, childList: true });

  scan();
})();
