/* Örnek creative interface — native adaptation of BranchedMenu + SplitText.
   Works with the existing vanilla-JS application without React runtime or new dependencies. */
(() => {
  "use strict";

  const groupsOpen = [true, true];
  let activeSection = "home";
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  const iconArrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';

  function toggleGroup(section, open) {
    const head = section.querySelector(".ob-branch-head");
    const panel = section.querySelector(".ob-branch-panel");
    section.dataset.open = String(open);
    head.setAttribute("aria-expanded", String(open));
    panel.setAttribute("aria-hidden", String(!open));
    panel.querySelectorAll("button").forEach(button => button.tabIndex = open ? 0 : -1);
    const number = Number(section.dataset.groupIndex);
    groupsOpen[number] = open;
  }

  function refreshBranch() {
    const nav = document.querySelector("aside nav.ob-branch-nav");
    if (!nav) return;
    const links = Array.from(nav.querySelectorAll(".ob-branch-link"));
    links.forEach(link => {
      const isCurrent = link.dataset.section === activeSection;
      link.classList.toggle("active", isCurrent);
      if (isCurrent) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    const current = links.find(link => link.dataset.section === activeSection);
    if (!current) return;
    const group = current.closest(".ob-branch-group");
    if (!group) return;
    if (group.dataset.open !== "true") toggleGroup(group, true);
    const tree = group.querySelector(".ob-branch-tree");
    const node = current.closest(".ob-branch-node");
    if (!tree || !node) return;
    const update = () => {
      if (!node.isConnected) return;
      const y = node.offsetTop + node.offsetHeight / 2;
      tree.style.setProperty("--ob-trail-length", Math.max(y - 7, 0) + "px");
      tree.style.setProperty("--ob-marker-top", y + "px");
    };
    requestAnimationFrame(update);
  }

  function enhanceBranchMenu() {
    const nav = document.querySelector("aside nav");
    if (!nav) return;
    if (nav.querySelector(".ob-branch-group")) {
      refreshBranch();
      return;
    }
    const existing = Array.from(nav.children);
    const menu = [];
    let section = null;
    for (const element of existing) {
      if (element.classList.contains("navgroup")) {
        section = { label: element.textContent.trim(), buttons: [] };
        menu.push(section);
      } else if (element.matches("button[data-section]") && section) {
        section.buttons.push(element);
      }
    }
    if (!menu.length) return;

    const preserved = existing.filter(element => element.matches('label[for="subject-switch"], #subject-switch'));
    nav.replaceChildren(...preserved);
    nav.classList.add("ob-branch-nav");

    const eyebrow = document.createElement("div");
    eyebrow.className = "ob-menu-eyebrow";
    eyebrow.innerHTML = '<span class="ob-menu-dot"></span> ОҚУ НАВИГАЦИЯСЫ';
    nav.append(eyebrow);

    menu.forEach((item, index) => {
      const group = document.createElement("section");
      group.className = "ob-branch-group";
      group.dataset.groupIndex = String(index);

      const head = document.createElement("button");
      head.type = "button";
      head.className = "ob-branch-head";
      head.innerHTML = '<span class="ob-branch-head-label">' + item.label + '</span><span class="ob-branch-count">' + String(item.buttons.length).padStart(2, "0") + '</span><span class="ob-branch-chevron">' + iconArrow + '</span>';
      const panel = document.createElement("div");
      panel.className = "ob-branch-panel";
      panel.id = "ob-branch-panel-" + index;
      head.setAttribute("aria-controls", panel.id);
      const fold = document.createElement("div");
      fold.className = "ob-branch-fold";
      const tree = document.createElement("div");
      tree.className = "ob-branch-tree";
      const trail = document.createElement("span");
      trail.className = "ob-branch-trail";
      trail.setAttribute("aria-hidden", "true");
      tree.append(trail);

      item.buttons.forEach(link => {
        const node = document.createElement("div");
        node.className = "ob-branch-node";
        link.classList.add("ob-branch-link");
        node.append(link);
        tree.append(node);
      });
      fold.append(tree);
      panel.append(fold);
      group.append(head, panel);
      nav.append(group);
      head.addEventListener("click", () => toggleGroup(group, group.dataset.open !== "true"));
      toggleGroup(group, groupsOpen[index] !== false);
    });

    const shortcut = document.createElement("div");
    shortcut.className = "ob-branch-shortcut";
    shortcut.innerHTML = '<span class="ob-branch-shortcut-kicker">КҮННІҢ ҚАДАМЫ</span><strong>5 минуттан баста.</strong><p>Кішкентай жаттығу — үлкен әдет.</p><button type="button">Жылдам жаттығу <span aria-hidden="true">↗</span></button>';
    shortcut.querySelector("button").addEventListener("click", () => subjectNavigate("rush"));
    nav.append(shortcut);
    refreshBranch();
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
      originalSubjectMenu.apply(this, arguments);
      enhanceBranchMenu();
    };
  }
  if (typeof subjectNavigate === "function") {
    const originalNavigate = subjectNavigate;
    subjectNavigate = function (key) {
      activeSection = key;
      const value = originalNavigate.apply(this, arguments);
      refreshBranch();
      enhanceStudyHeading();
      return value;
    };
  }
  if (typeof renderWelcome === "function") {
    const originalRenderWelcome = renderWelcome;
    renderWelcome = function () {
      const value = originalRenderWelcome.apply(this, arguments);
      enhanceWelcome();
      return value;
    };
  }

  enhanceWelcome();
  enhanceBranchMenu();
  enhanceStudyHeading();
  window.addEventListener("resize", () => { if (!document.body.classList.contains("on-welcome")) refreshBranch(); }, { passive: true });
})();