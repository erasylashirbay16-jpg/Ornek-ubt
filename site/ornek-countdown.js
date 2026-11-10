/* Örnek Countdown Counter: animated days to the planning date for main 2027 UNT.
   2027-05-10 is a planning reference, not a confirmed 2027 NTC announcement.
   Uses Asia/Almaty calendar date. */
(() => {
  "use strict";
  const TARGET_YEAR = 2027;
  const TARGET_MONTH = 5;
  const TARGET_DAY = 10;
  const MS_PER_DAY = 86400000;
  let activeNumber = null;
  let shownDays = null;
  let animation = 0;
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");

  function kazakhstanToday() {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Almaty",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());
    const get = type => Number(parts.find(p => p.type === type)?.value);
    return Date.UTC(get("year"), get("month") - 1, get("day"));
  }

  function daysToUNT() {
    const target = Date.UTC(TARGET_YEAR, TARGET_MONTH - 1, TARGET_DAY);
    return Math.max(0, Math.round((target - kazakhstanToday()) / MS_PER_DAY));
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
    const value = daysToUNT();
    animateTo(node, value, force);
    const card = node.closest(".ornek-unt-counter");
    if (card) card.dataset.started = value === 0 ? "true" : "false";
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
  window.setInterval(() => updateCounter(), 60000);
})();
