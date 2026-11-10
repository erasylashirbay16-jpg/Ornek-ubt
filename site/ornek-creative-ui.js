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


/* Scroll glass navigation: keep links/logo crisp while text behind is blurred.
   Applies to the public welcome header only, not the exercise/test interface. */
(() => {
  "use strict";
  let scheduled = false;

  function updateScrollGlass() {
    scheduled = false;
    const nav = document.body.classList.contains("on-welcome")
      ? document.querySelector("#welcome > .arch-nav, #welcome > .welcome-nav")
      : null;
    if (!nav) return;
    nav.classList.toggle("ornek-nav-scrolled", window.scrollY > 32);
  }

  function scheduleScrollGlass() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(updateScrollGlass);
  }

  if (typeof renderWelcome === "function") {
    const priorRender = renderWelcome;
    renderWelcome = function () {
      const result = priorRender.apply(this, arguments);
      scheduleScrollGlass();
      return result;
    };
  }

  window.addEventListener("scroll", scheduleScrollGlass, { passive: true });
  window.addEventListener("resize", scheduleScrollGlass, { passive: true });
  window.addEventListener("pageshow", scheduleScrollGlass);
  scheduleScrollGlass();
})();
