/* Örnek creative interface — OptionWheel + SplitText, native JavaScript.
   Preserves the existing study engines and requires no React runtime. */
(() => {
  "use strict";
  let activeSection = "home";
  let wheelTimer = null;
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  const spacing = 58;
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

  function setWheelIndex(wheel, next, navigate) {
    if (!wheel) return;
    const buttons = Array.from(wheel.querySelectorAll(".ow-item"));
    if (!buttons.length) return;
    const index = clamp(next, 0, buttons.length - 1);
    wheel.dataset.selected = String(index);
    wheel.setAttribute("aria-activedescendant", buttons[index].id);
    buttons.forEach((button, i) => {
      const distance = i - index;
      const amount = Math.abs(distance);
      button.style.setProperty("--ow-y", (distance * spacing) + "px");
      button.style.setProperty("--ow-x", (Math.pow(amount, 1.6) * 6.2).toFixed(1) + "px");
      button.style.setProperty("--ow-rotate", (clamp(-distance * 6, -25, 25)) + "deg");
      button.style.setProperty("--ow-scale", String(1 - Math.min(amount * 0.075, .3)));
      button.style.setProperty("--ow-opacity", String(amount === 0 ? 1 : Math.max(.18, 1 - amount * .23)));
      button.style.setProperty("--ow-blur", (Math.min(amount * .55, 2)) + "px");
      button.style.visibility = amount <= 3.35 ? "visible" : "hidden";
      button.style.pointerEvents = amount <= 3.35 ? "auto" : "none";
      button.setAttribute("aria-selected", String(i === index));
      if (i === index) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
      button.tabIndex = i === index ? 0 : -1;
      button.classList.toggle("active", i === index);
    });
    const number = wheel.closest(".ow-shell")?.querySelector(".ow-count");
    if (number) number.textContent = String(index + 1).padStart(2, "0") + " / " + String(buttons.length).padStart(2, "0");
    if (navigate && activeSection !== buttons[index].dataset.section) subjectNavigate(buttons[index].dataset.section);
  }

  function syncOptionWheel() {
    const wheel = document.querySelector("aside nav .ow-wheel");
    if (!wheel) return;
    const buttons = Array.from(wheel.querySelectorAll(".ow-item"));
    const index = buttons.findIndex(button => button.dataset.section === activeSection);
    setWheelIndex(wheel, index >= 0 ? index : 0, false);
  }

  function enhanceOptionWheel() {
    const nav = document.querySelector("aside nav");
    if (!nav) return;
    if (nav.querySelector(".ow-wheel")) {
      syncOptionWheel();
      return;
    }
    const buttons = Array.from(nav.querySelectorAll("button[data-section]"));
    if (!buttons.length) return;
    const preserved = Array.from(nav.children).filter(element => element.matches('label[for="subject-switch"], #subject-switch'));
    nav.replaceChildren(...preserved);
    nav.classList.remove("ob-branch-nav");
    nav.classList.add("ow-nav");

    const shell = document.createElement("section");
    shell.className = "ow-shell";
    shell.setAttribute("aria-label", "Örnek айналмалы мәзірі");
    shell.innerHTML = '<div class="ow-topline"><span class="ow-live-dot"></span><span>БӨЛІМДЕР</span><span class="ow-count">01 / 08</span></div><div class="ow-wheel" tabindex="0" role="listbox" aria-label="Оқу бөлімдерін таңдаңыз" aria-orientation="vertical"><div class="ow-orbit" aria-hidden="true"></div><div class="ow-track"></div><div class="ow-focus-line" aria-hidden="true"><span></span></div></div><div class="ow-bottom"><button type="button" class="ow-prev" aria-label="Алдыңғы бөлім">↑</button><span>АЙНАЛДЫР · СҮЙРЕ · ТАҢДА</span><button type="button" class="ow-next" aria-label="Келесі бөлім">↓</button></div>';
    const wheel = shell.querySelector(".ow-wheel");
    const track = shell.querySelector(".ow-track");
    buttons.forEach((button, index) => {
      button.classList.remove("ob-branch-link");
      button.classList.add("ow-item");
      button.id = "ow-option-" + index;
      button.dataset.index = String(index);
      button.setAttribute("role", "option");
      button.title = button.textContent.trim();
      track.append(button);
    });
    nav.append(shell);

    let pointer = null;
    let suppressClick = false;
    const selected = () => Number(wheel.dataset.selected) || 0;
    function settle() {
      window.clearTimeout(wheelTimer);
      wheelTimer = window.setTimeout(() => {
        const button = buttons[selected()];
        // Scrolling and dragging preview the choice; click commits it.
      }, 190);
    }
    function shift(dir, immediate) {
      const next = clamp(selected() + dir, 0, buttons.length - 1);
      if (next === selected()) return false;
      setWheelIndex(wheel, next, false);
      if (immediate) {
        window.clearTimeout(wheelTimer);
        const button = buttons[next];
        if (button && button.dataset.section !== activeSection) subjectNavigate(button.dataset.section);
      } else settle();
      return true;
    }
    wheel.addEventListener("wheel", event => {
      if (event.ctrlKey) return;
      if (shift(event.deltaY > 0 ? 1 : -1, false)) event.preventDefault();
    }, { passive: false });
    wheel.addEventListener("keydown", event => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        shift(event.key === "ArrowDown" ? 1 : -1, true);
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        const next = event.key === "Home" ? 0 : buttons.length - 1;
        setWheelIndex(wheel, next, false);
        const button = buttons[next];
        if (button.dataset.section !== activeSection) subjectNavigate(button.dataset.section);
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        buttons[selected()]?.click();
      }
    });
    wheel.addEventListener("pointerdown", event => {
      if (event.button !== 0) return;
      pointer = { id: event.pointerId, y: event.clientY, index: selected(), moved: false };
      // Capture only after a real drag; ordinary clicks must reach the option.
    });
    wheel.addEventListener("pointermove", event => {
      if (!pointer || event.pointerId !== pointer.id) return;
      const distance = pointer.y - event.clientY;
      if (Math.abs(distance) > 10 && !pointer.moved) { pointer.moved = true; wheel.setPointerCapture?.(event.pointerId); }
      if (pointer.moved) {
        wheel.classList.add("ow-dragging");
        setWheelIndex(wheel, clamp(pointer.index + Math.round(distance / 44), 0, buttons.length - 1), false);
      }
    });
    function finishPointer(event) {
      if (!pointer || event.pointerId !== pointer.id) return;
      const moved = pointer.moved;
      pointer = null;
      wheel.classList.remove("ow-dragging");
      if (moved) {
        suppressClick = true;
        settle();
        window.setTimeout(() => { suppressClick = false; }, 130);
      }
    }
    wheel.addEventListener("pointerup", finishPointer);
    wheel.addEventListener("pointercancel", finishPointer);
    wheel.addEventListener("click", event => {
      if (suppressClick && event.target.closest(".ow-item")) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
    shell.querySelector(".ow-prev").addEventListener("click", () => shift(-1, true));
    shell.querySelector(".ow-next").addEventListener("click", () => shift(1, true));
    wheel.querySelectorAll(".ow-item").forEach(button => {
      button.addEventListener("click", () => {
        if (!suppressClick) setWheelIndex(wheel, Number(button.dataset.index), false);
      });
    });

    const shortcut = document.createElement("div");
    shortcut.className = "ob-branch-shortcut";
    shortcut.innerHTML = '<span class="ob-branch-shortcut-kicker">КҮННІҢ ҚАДАМЫ</span><strong>5 минуттан баста.</strong><p>Кішкентай жаттығу — үлкен әдет.</p><button type="button">Жылдам жаттығу <span aria-hidden="true">↗</span></button>';
    shortcut.querySelector("button").addEventListener("click", () => subjectNavigate("rush"));
    nav.append(shortcut);
    syncOptionWheel();
  }

  function splitText(element) {
    if (document.querySelector('script[src*="scroll-float.js"]')) return;
    if (!element || element.dataset.ornekSplit === "1") return;
    if (element.textContent.trim().length > 125) return;
    element.dataset.ornekSplit = "1";
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    let step = 0;
    for (const textNode of textNodes) {
      if (!textNode.parentNode || !textNode.nodeValue.trim()) continue;
      const parts = textNode.nodeValue.split(/(\s+)/);
      const fragment = document.createDocumentFragment();
      parts.forEach(part => {
        if (!part) return;
        if (!part.trim()) {
          fragment.append(document.createTextNode(part));
          return;
        }
        const piece = document.createElement("span");
        piece.className = "ob-split-piece";
        piece.textContent = part;
        piece.style.setProperty("--ob-stagger", Math.min(step * 60, 840) + "ms");
        step++;
        fragment.append(piece);
      });
      textNode.replaceWith(fragment);
    }
    if (!step) return;
    element.classList.add("ob-split-text");
    const reveal = () => element.classList.add("ob-split-revealed");
    if ((reduced && reduced.matches) || !("IntersectionObserver" in window)) {
      reveal();
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        reveal();
        observer.disconnect();
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    observer.observe(element);
  }

  function enhanceWelcome() {
    const root = document.getElementById("welcome");
    if (!root || !document.body.classList.contains("on-welcome")) return;
    root.classList.add("ob-creative-ready");
    [
      ".arch-hero h1",
      ".arch-section-title h2",
      ".ornek-method h2",
      ".arch-how h2"
    ].forEach(selector => root.querySelectorAll(selector).forEach(splitText));

    const copy = root.querySelector(".arch-hero-copy");
    if (copy && !copy.querySelector(".ob-quick-launch")) {
      const quick = document.createElement("div");
      quick.className = "ob-quick-launch";
      quick.innerHTML = '<div class="ob-quick-label"><span class="ob-quick-pulse"></span> ЖЫЛДАМ БАСТАУ <span class="ob-quick-line"></span></div><div class="ob-quick-buttons"><button type="button" data-ob-subject="math"><span>∑</span> Математика <b>↗</b></button><button type="button" data-ob-subject="reading"><span>▤</span> Оқу <b>↗</b></button><button type="button" data-ob-subject="history"><span>◇</span> Тарих <b>↗</b></button></div>';
      quick.querySelectorAll("[data-ob-subject]").forEach(button => {
        button.addEventListener("click", () => openSubject(button.dataset.obSubject));
      });
      copy.append(quick);
    }
    const example = root.querySelector(".arch-example");
    if (example && !example.querySelector(".ob-demo-decoration")) {
      const decor = document.createElement("span");
      decor.className = "ob-demo-decoration";
      decor.setAttribute("aria-hidden", "true");
      decor.textContent = "✦";
      example.prepend(decor);
    }
  }

  function enhanceStudyHeading() {
    const app = document.getElementById("app");
    if (!app || document.body.classList.contains("on-welcome")) return;
    const title = app.querySelector("h1");
    if (title && title.textContent.length < 100) splitText(title);
  }

  if (typeof subjectMenu === "function") {
    const originalSubjectMenu = subjectMenu;
    subjectMenu = function () {
      const result = originalSubjectMenu.apply(this, arguments);
      enhanceOptionWheel();
      return result;
    };
  }
  if (typeof subjectNavigate === "function") {
    const originalNavigate = subjectNavigate;
    subjectNavigate = function (key) {
      activeSection = key;
      const result = originalNavigate.apply(this, arguments);
      syncOptionWheel();
      enhanceStudyHeading();
      return result;
    };
  }
  if (typeof renderWelcome === "function") {
    const originalRenderWelcome = renderWelcome;
    renderWelcome = function () {
      const result = originalRenderWelcome.apply(this, arguments);
      enhanceWelcome();
      return result;
    };
  }

  enhanceWelcome();
  enhanceOptionWheel();
  enhanceStudyHeading();
  window.addEventListener("resize", () => {
    if (!document.body.classList.contains("on-welcome")) syncOptionWheel();
  }, { passive: true });
})();


/* Örnek StarBorder for primary actions — native JS + CSS adaptation.
   One clockwise white trail, four-second lap, subtle glow and click pulse.
   Existing click handlers and navigation remain untouched. */
(() => {
  "use strict";
  const actionSelectors = [
    ".arch-cta",
    ".arch-nav .arch-account",
    ".arch-subject-grid > .arch-subject",
    ".ob-quick-buttons > button",
    ".welcome-cta > button",
    ".welcome-bottom > button",
    ".qhero-actions > button:first-child",
    ".hero > button",
    ".subject-banner > button",
    ".testintro > button",
    ".testtile:nth-child(-n+4) > button:not(.secondary)",
    ".subject-shortcuts > button:first-child",
    ".ob-branch-shortcut > button",
    ".arch-footer > a[href='#arch-subjects']",
    ".reading-hero > button",
    ".history-hero > button",
    "button[onclick^='startMixed(']",
    ".panel > button[onclick^='startSection(']"
  ];
  const selector = actionSelectors.join(",");
  let queued = false;
  function enhanceActions() {
    queued = false;
    document.querySelectorAll(selector).forEach(element => {
      if (element.classList.contains("ornek-star-border")) return;
      if (element.matches(":disabled, [aria-disabled='true']")) return;
      element.classList.add("ornek-star-border");
      if (element.classList.contains("arch-subject")) element.classList.add("ornek-star-border--card");
    });
  }
  function queueEnhance() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(enhanceActions);
  }
  queueEnhance();
  const observer = new MutationObserver(records => {
    if (records.some(record => record.addedNodes.length)) queueEnhance();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  document.addEventListener("click", event => {
    if (!(event.target instanceof Element)) return;
    const element = event.target.closest(".ornek-star-border");
    if (!element || element.matches(":disabled, [aria-disabled='true']")) return;
    element.classList.remove("ornek-star-pulse");
    void element.offsetWidth;
    element.classList.add("ornek-star-pulse");
    window.setTimeout(() => element.classList.remove("ornek-star-pulse"), 680);
  }, true);
})();


/* Örnek Countdown Counter: animated days to the planning date for main 2027 UNT.
   2027-05-10 is a planning reference, not a confirmed 2027 NTC announcement.
   Uses Asia/Almaty calendar date. */
(() => {
  "use strict";
  const TARGET_YEAR = 2027;
  const TARGET_MONTH = 5;
  const TARGET_DAY = 10;
  const MS_PER_DAY = 86400000;
  const TARGET_MS = Date.parse("2027-05-10T00:00:00+05:00");
  let activeNumber = null;
  let shownDays = null;
  let animation = 0;
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");

  function timeToUNT() {
    // Midnight on 10 May 2027 in Kazakhstan (UTC+5).
    const remaining = Math.max(0, TARGET_MS - Date.now());
    const seconds = Math.ceil(remaining / 1000);
    return {
      days: Math.floor(seconds / 86400),
      hours: Math.floor(seconds % 86400 / 3600),
      minutes: Math.floor(seconds % 3600 / 60),
      seconds: seconds % 60,
      started: remaining === 0
    };
  }

  function animateTo(node, value, force = false) {
    if (!node || !node.isConnected) return;
    if (shownDays === value && !force) return;
    cancelAnimationFrame(animation);
    const oldValue = Number(node.textContent.replace(/\s/g, ""));
    const start = Number.isFinite(oldValue) && node.textContent.trim() !== "—"
      ? oldValue
      : Math.max(0, value - 25);
    shownDays = value;
    node.setAttribute("aria-label", value + " күн қалды");
    if (prefersReducedMotion?.matches) {
      node.textContent = String(value);
      return;
    }
    const started = performance.now();
    const duration = 1050;
    const easeOut = n => 1 - Math.pow(1 - n, 4);
    function tick(now) {
      if (!node.isConnected) return;
      const t = Math.min(1, (now - started) / duration);
      node.textContent = String(Math.round(start + (value - start) * easeOut(t)));
      if (t < 1) animation = requestAnimationFrame(tick);
      else node.textContent = String(value);
    }
    animation = requestAnimationFrame(tick);
  }

  function updateCounter(force = false) {
    const node = document.querySelector("#ornek-unt-days-number");
    if (!node) return;
    if (activeNumber !== node) {
      activeNumber = node;
      shownDays = null;
      force = true;
    }
    const time = timeToUNT();
    animateTo(node, time.days, force);
    const card = node.closest(".ornek-unt-counter");
    if (!card) return;
    card.dataset.started = time.started ? "true" : "false";
    for (const part of ["hours", "minutes", "seconds"]) {
      const field = card.querySelector('[data-unt-part="' + part + '"]');
      if (!field) continue;
      const value = String(time[part]).padStart(2, "0");
      if (field.textContent !== value) field.textContent = value;
    }
  }

  function attachCounter() {
    const root = document.getElementById("welcome");
    if (!root || !document.body.classList.contains("on-welcome")) return;
    if (root.querySelector(".ornek-unt-counter")) {
      updateCounter();
      return;
    }
    const hero = root.querySelector(".arch-hero, .welcome-hero");
    if (!hero) return;
    const card = document.createElement("section");
    card.className = "ornek-unt-counter";
    card.setAttribute("aria-label", "2027 жылғы негізгі ҰБТ-ға дейінгі күндер");
    card.innerHTML = [
      '<div class="ornek-unt-counter-info">',
      '<span class="ornek-unt-counter-kicker"><i aria-hidden="true"></i> ÖRNEK · ҰБТ 2027</span>',
      '<h2>Мақсатқа бір күн жақындадың.</h2>',
      '<p>Негізгі ҰБТ басталатын жоспарлы күнге дейін</p>',
      '<span class="ornek-unt-counter-note">10 мамыр 2027 — есептік бағдар. 2027 жылғы ресми кесте жарияланбаған.</span>',
      '</div>',
      '<div class="ornek-unt-counter-value">',
      '<span class="ornek-unt-counter-pretitle">ДАЙЫНДЫҚ УАҚЫТЫ</span>',
      '<div class="ornek-unt-numberline">',
      '<strong class="ornek-unt-number" id="ornek-unt-days-number" aria-label="Қалған күндер" aria-live="off">—</strong>',
      '<span class="ornek-unt-unit">КҮН<br>ҚАЛДЫ</span>',
      '</div>',
      '<div class="ornek-unt-clock" role="timer" aria-label="Қалған сағат, минут және секунд" aria-live="off">',
      '<div class="ornek-unt-clock-part"><strong data-unt-part="hours">00</strong><span>САҒАТ</span></div>',
      '<span class="ornek-unt-clock-colon" aria-hidden="true">:</span>',
      '<div class="ornek-unt-clock-part"><strong data-unt-part="minutes">00</strong><span>МИНУТ</span></div>',
      '<span class="ornek-unt-clock-colon" aria-hidden="true">:</span>',
      '<div class="ornek-unt-clock-part"><strong data-unt-part="seconds">00</strong><span>СЕКУНД</span></div>',
      '</div>',
      '<div class="ornek-unt-counter-progress"><span></span></div>',
      '</div>'
    ].join("");
    hero.insertAdjacentElement("afterend", card);
    updateCounter();
  }

  if (typeof renderWelcome === "function") {
    const originalRender = renderWelcome;
    renderWelcome = function () {
      const output = originalRender.apply(this, arguments);
      attachCounter();
      return output;
    };
  }
  attachCounter();
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) updateCounter();
  });
  window.addEventListener("pageshow", () => updateCounter());
  window.setInterval(() => updateCounter(), 250);
})();


/* Scroll glass navigation v2 — screenshot repair.
   Keep the header light, use a transparent SVG wordmark, and offset section anchors. */
(() => {
  "use strict";
  let scheduled = false;
  let initialHashApplied = false;
  const anchorIds = new Set([
    "arch-subjects", "arch-how", "why-qadam", "qadam-features",
    "qadam-how", "qadam-demo", "ornek-subjects"
  ]);

  function normalizeWelcomeNav() {
    if (!document.body.classList.contains("on-welcome")) return;
    const nav = document.querySelector("#welcome > .arch-nav, #welcome > .welcome-nav");
    if (!nav) return;

    const brandLink = nav.querySelector("a:first-child");
    if (brandLink && !brandLink.querySelector(".ornek-nav-lockup")) {
      // The original uploaded PNG has an opaque near-white background;
      // use the transparent brand mark + transparent wordmark in the header.
      const lockup = document.createElement("span");
      lockup.className = "ornek-nav-lockup";
      const mark = document.createElement("img");
      mark.className = "ornek-nav-symbol";
      mark.src = "/assets/ornek-icon.svg";
      mark.alt = "";
      mark.width = 36;
      mark.height = 36;
      mark.decoding = "async";
      const name = document.createElement("img");
      name.className = "ornek-nav-wordmark";
      name.src = "/assets/ornek-wordmark.svg";
      name.alt = "Örnek";
      name.width = 128;
      name.height = 44;
      name.decoding = "async";
      lockup.append(mark, name);
      brandLink.setAttribute("aria-label", "Örnek — басты бет");
      brandLink.replaceChildren(lockup);
    }
  }

  function updateScrollGlass() {
    scheduled = false;
    normalizeWelcomeNav();
    const nav = document.body.classList.contains("on-welcome")
      ? document.querySelector("#welcome > .arch-nav, #welcome > .welcome-nav")
      : null;
    if (!nav) return;
    nav.classList.toggle("ornek-nav-scrolled", window.scrollY > 36);
  }

  function scheduleScrollGlass() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateScrollGlass);
  }

  function scrollToAnchor(hash, smooth = true) {
    if (!document.body.classList.contains("on-welcome")) return false;
    const id = String(hash || "").replace(/^#/, "");
    if (!anchorIds.has(id)) return false;
    const element = document.getElementById(id);
    if (!element || !element.closest("#welcome")) return false;
    const position = Math.max(0, window.scrollY + element.getBoundingClientRect().top - 113);
    window.scrollTo({
      top: position,
      behavior: smooth && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        ? "smooth"
        : "auto"
    });
    return true;
  }

  function applyInitialHash() {
    if (initialHashApplied || !anchorIds.has(location.hash.slice(1))) return;
    initialHashApplied = true;
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToAnchor(location.hash, false)));
  }

  if (typeof renderWelcome === "function") {
    const originalRender = renderWelcome;
    renderWelcome = function () {
      const result = originalRender.apply(this, arguments);
      normalizeWelcomeNav();
      scheduleScrollGlass();
      applyInitialHash();
      return result;
    };
  }

  document.addEventListener("click", event => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest('#welcome a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute("href");
    if (!hash || !anchorIds.has(hash.slice(1))) return;
    const element = document.getElementById(hash.slice(1));
    if (!element) return;
    event.preventDefault();
    if (location.hash !== hash) window.history.pushState(null, "", hash);
    scrollToAnchor(hash);
  });

  window.addEventListener("scroll", scheduleScrollGlass, { passive: true });
  window.addEventListener("resize", scheduleScrollGlass, { passive: true });
  window.addEventListener("pageshow", scheduleScrollGlass);
  window.addEventListener("hashchange", () => scrollToAnchor(location.hash, true));
  normalizeWelcomeNav();
  scheduleScrollGlass();
  applyInitialHash();
})();


/* Örnek Header V3 — polished educational navigation inspired by the supplied
   layout, but using Örnek brand, actual available subjects and real actions.
   Existing landing page, account, locale and study engines are preserved. */
(() => {
  "use strict";

  const gridIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.5"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1.5"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1.5"/><rect x="14" y="14" width="6.5" height="6.5" rx="1.5"/></svg>';
  const chevIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
  const userIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-4 3-6 7-6s7 2 7 6"/></svg>';
  const menuIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  const subjectMarks = { math:"∑", reading:"▤", history:"◇", profile:"ƒ" };
  const subjectLabels = {
    kk: {
      math:["Математикалық сауаттылық","Есептер мен логика"],
      reading:["Оқу сауаттылығы","Мәтінмен жұмыс"],
      history:["Қазақстан тарихы","Тарихи білім"],
      profile:["Бейіндік математика","Тереңдетілген есептер"]
    },
    ru: {
      math:["Математическая грамотность","Задачи и логика"],
      reading:["Грамотность чтения","Работа с текстом"],
      history:["История Казахстана","Исторические задания"],
      profile:["Профильная математика","Углублённая практика"]
    }
  };

  function language() {
    return typeof qLanguage !== "undefined" && qLanguage === "ru" ? "ru" : "kk";
  }
  function subjects() {
    const ids = ["math", "reading", "history", "profile"];
    const available = typeof subjectNames !== "undefined" ? subjectNames : null;
    return ids.filter(id => available ? Object.prototype.hasOwnProperty.call(available,id) : id !== "profile");
  }
  function buildHeader() {
    const l = language();
    const kk = l === "kk";
    const t = kk ? {
      subjects:"Пәндер каталогы", catalog:"Пәнді таңдау", home:"ҰБТ", tests:"Тест нұсқалары",
      plan:"Оқу жоспары", analytics:"Нәтижелер", login:"Кіру", account:"Аккаунт",
      menu:"Мәзір", free:"Тегін дайындық", catalogTitle:"Өзіңе керек пәнді таңда"
    } : {
      subjects:"Каталог предметов", catalog:"Выбрать предмет", home:"ЕНТ", tests:"Варианты тестов",
      plan:"План подготовки", analytics:"Результаты", login:"Войти", account:"Аккаунт",
      menu:"Меню", free:"Бесплатная подготовка", catalogTitle:"Выбери предмет"
    };
    const available = subjects();
    const items = available.map(id => {
      const [name,description] = subjectLabels[l][id];
      return '<button class="ornek-v3-subject" type="button" role="menuitem" data-ornek-v3-subject="' + id + '">' +
        '<span class="ornek-v3-subject-icon">' + subjectMarks[id] + '</span>' +
        '<span class="ornek-v3-subject-copy"><strong>' + name + '</strong><small>' + description + '</small></span>' +
        '<span class="ornek-v3-subject-arrow" aria-hidden="true">↗</span></button>';
    }).join("");
    const links = [
      ["home",t.home],["tests",t.tests],["plan",t.plan],["analytics",t.analytics]
    ];
    const mid = links.map(([key,label]) =>
      '<button type="button" class="ornek-v3-link' + (key==="home" ? " is-current" : "") +
      '" data-ornek-v3-action="' + key + '">' + label + '</button>'
    ).join("");
    const mobileLinks = links.map(([key,label]) =>
      '<button type="button" data-ornek-v3-action="' + key + '">' + label + '<span aria-hidden="true">↗</span></button>'
    ).join("");
    const profile = typeof ornekAccount !== "undefined" && ornekAccount.user;
    const label = profile ? t.account : t.login;

    return '<a class="ornek-v3-brand" href="/" aria-label="Örnek — басты бет">' +
      '<span class="ornek-nav-lockup"><img class="ornek-nav-symbol" src="/assets/ornek-icon.svg" alt="" width="37" height="37">' +
      '<span class="ornek-v3-brand-name">Örnek<span class="ornek-v3-brand-dot">.</span></span></span></a>' +
      '<div class="ornek-v3-catalog-wrap">' +
      '<button type="button" class="ornek-v3-catalog" data-ornek-v3-toggle="catalog" aria-haspopup="menu" aria-expanded="false" aria-controls="ornek-v3-catalog-menu">' +
      gridIcon + '<span>' + t.subjects + '</span>' + chevIcon + '</button>' +
      '<div id="ornek-v3-catalog-menu" class="ornek-v3-popover" role="menu" hidden>' +
      '<div class="ornek-v3-popover-top"><strong>' + t.catalogTitle + '</strong><small>' + t.free + '</small></div>' +
      items + '</div></div>' +
      '<nav class="ornek-v3-mainlinks" aria-label="' + t.menu + '">' + mid + '</nav>' +
      '<div class="ornek-v3-actions">' +
      '<div class="ornek-v3-language" role="group" aria-label="Тіл / Язык">' +
      '<button type="button" data-ornek-v3-lang="kk" class="' + (kk ? "is-current" : "") + '" aria-pressed="' + kk + '">Қаз</button>' +
      '<button type="button" data-ornek-v3-lang="ru" class="' + (!kk ? "is-current" : "") + '" aria-pressed="' + !kk + '">Рус</button>' +
      '</div>' +
      '<button type="button" class="ornek-v3-login" data-ornek-v3-action="login">' + userIcon +
      '<span>' + label + '</span></button>' +
      '<button type="button" class="ornek-v3-menu-toggle" data-ornek-v3-toggle="mobile" aria-expanded="false" aria-controls="ornek-v3-mobile-menu" aria-label="' + t.menu + '">' + menuIcon + '</button>' +
      '</div>' +
      '<div id="ornek-v3-mobile-menu" class="ornek-v3-mobile-panel" hidden>' +
      '<div class="ornek-v3-mobile-heading">' + t.menu + '</div>' + mobileLinks +
      '<div class="ornek-v3-mobile-heading">' + t.catalog + '</div>' + items.replaceAll('role="menuitem"','role="menuitem"') +
      '<div class="ornek-v3-mobile-languages"><button type="button" data-ornek-v3-lang="kk">Қаз</button><button type="button" data-ornek-v3-lang="ru">Рус</button></div>' +
      '</div>';
  }

  function closeMenus(nav, returnFocus=false) {
    for (const which of ["catalog","mobile"]) {
      const panel = nav.querySelector("#ornek-v3-" + (which==="catalog" ? "catalog-menu" : "mobile-menu"));
      const trigger = nav.querySelector('[data-ornek-v3-toggle="' + which + '"]');
      if (!panel || !trigger) continue;
      if (!panel.hidden && returnFocus) trigger.focus();
      panel.hidden = true;
      trigger.setAttribute("aria-expanded","false");
    }
  }

  function activate(id) {
    if (id==="home") {
      const dest = document.getElementById("arch-subjects");
      if (dest) {
        dest.scrollIntoView({behavior:window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",block:"start"});
      }
      return;
    }
    if (id==="login") {
      if (typeof showAccount==="function") showAccount();
      return;
    }
    const routes = {tests:"testsPage",plan:"planner",analytics:"analytics"};
    if (routes[id] && typeof openSubject==="function") {
      openSubject("math");
      if (typeof subjectNavigate==="function") subjectNavigate(routes[id]);
    }
  }

  function decorate() {
    if (!document.body.classList.contains("on-welcome")) return;
    const root = document.getElementById("welcome");
    const nav = root?.querySelector(":scope > .arch-nav, :scope > .welcome-nav");
    if (!nav || nav.classList.contains("ornek-header-v3")) return;
    nav.classList.add("ornek-header-v3");
    nav.setAttribute("aria-label","Örnek негізгі мәзірі");
    nav.innerHTML = buildHeader();
  }

  document.addEventListener("click", event => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const nav = document.querySelector("#welcome > .ornek-header-v3");
    if (!nav) return;
    if (!nav.contains(target)) {
      closeMenus(nav);
      return;
    }
    const trigger = target.closest("[data-ornek-v3-toggle]");
    if (trigger) {
      const which = trigger.dataset.ornekV3Toggle;
      const panel = nav.querySelector("#ornek-v3-" + (which === "catalog" ? "catalog-menu" : "mobile-menu"));
      if (!panel) return;
      const wasOpen = !panel.hidden;
      closeMenus(nav);
      panel.hidden = wasOpen;
      trigger.setAttribute("aria-expanded",String(!wasOpen));
      if (!wasOpen) panel.querySelector("button")?.focus({preventScroll:true});
      return;
    }
    const subject = target.closest("[data-ornek-v3-subject]");
    if (subject) {
      closeMenus(nav);
      if (typeof openSubject==="function") openSubject(subject.dataset.ornekV3Subject);
      return;
    }
    const lang = target.closest("[data-ornek-v3-lang]");
    if (lang) {
      closeMenus(nav);
      if (typeof setQLanguage==="function") setQLanguage(lang.dataset.ornekV3Lang);
      return;
    }
    const action = target.closest("[data-ornek-v3-action]");
    if (action) {
      closeMenus(nav);
      activate(action.dataset.ornekV3Action);
    }
  });
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    const nav = document.querySelector("#welcome > .ornek-header-v3");
    if (nav) closeMenus(nav,true);
  });

  if (typeof renderWelcome==="function") {
    const prior = renderWelcome;
    renderWelcome = function() {
      const result = prior.apply(this,arguments);
      decorate();
      return result;
    };
  }
  decorate();
})();
