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
        if (button && button.dataset.section !== activeSection) subjectNavigate(button.dataset.section);
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
      wheel.setPointerCapture?.(event.pointerId);
    });
    wheel.addEventListener("pointermove", event => {
      if (!pointer || event.pointerId !== pointer.id) return;
      const distance = pointer.y - event.clientY;
      if (Math.abs(distance) > 10) pointer.moved = true;
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
