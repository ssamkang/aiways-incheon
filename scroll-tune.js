(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

  if (reduceMotion || isTouchDevice) return;

  let sections = [];
  let lock = false;
  let lastWheelAt = 0;

  const easeOutExpoSoft = (t) => {
    if (t >= 1) return 1;
    return 1 - Math.pow(2, -9 * t);
  };

  function collectSections() {
    const candidates = [
      document.querySelector(".aiw-hero"),
      ...document.querySelectorAll(".story-section"),
      ...document.querySelectorAll(".section-shell"),
      document.querySelector(".ranking-section"),
      document.querySelector(".site-footer"),
    ].filter(Boolean);

    const unique = [];
    const seen = new Set();

    candidates.forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      unique.push(el);
    });

    sections = unique
      .map((el) => ({
        el,
        top: Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY)),
      }))
      .sort((a, b) => a.top - b.top);
  }

  function nearestIndex() {
    const y = window.scrollY;
    let best = 0;
    let bestDist = Infinity;

    sections.forEach((section, index) => {
      const dist = Math.abs(section.top - y);
      if (dist >= bestDist) return;
      best = index;
      bestDist = dist;
    });

    return best;
  }

  function finishScroll() {
    window.setTimeout(() => {
      document.body.classList.remove("is-section-scrolling");
      lock = false;
    }, 120);
  }

  function animateTo(targetY, duration = 880) {
    const startY = window.scrollY;
    const maxY = document.documentElement.scrollHeight - window.innerHeight;
    const endY = Math.max(0, Math.min(targetY, maxY));
    const distance = endY - startY;
    const startTime = performance.now();

    if (Math.abs(distance) < 6) {
      lock = false;
      return;
    }

    document.body.classList.add("is-section-scrolling");

    function step(now) {
      const raw = Math.min(1, (now - startTime) / duration);
      const eased = easeOutExpoSoft(raw);
      window.scrollTo(0, startY + distance * eased);

      if (raw < 1) {
        requestAnimationFrame(step);
        return;
      }

      window.scrollTo(0, endY);
      finishScroll();
    }

    requestAnimationFrame(step);
  }

  function shouldUseSnap() {
    if (window.innerWidth < 1000) return false;
    if (!sections.length) return false;

    const activeElement = document.activeElement;
    if (!activeElement) return true;

    return !["INPUT", "TEXTAREA", "SELECT"].includes(activeElement.tagName);
  }

  function onWheel(event) {
    if (!shouldUseSnap()) return;

    const now = performance.now();

    if (Math.abs(event.deltaY) < 18) return;

    if (lock) {
      event.preventDefault();
      return;
    }

    if (now - lastWheelAt < 180) {
      event.preventDefault();
      return;
    }

    lastWheelAt = now;

    const current = nearestIndex();
    const direction = event.deltaY > 0 ? 1 : -1;
    const next = Math.max(0, Math.min(sections.length - 1, current + direction));

    if (next === current) return;

    event.preventDefault();
    lock = true;
    animateTo(sections[next].top, 920);
  }

  function normalizeTarget(trigger) {
    const selector = trigger.dataset?.scroll || trigger.getAttribute("href");
    if (!selector || selector === "#") return null;
    return selector === "#demo-card" ? "#classify" : selector;
  }

  function targetTopFor(target) {
    if (Number.isFinite(target.offsetTop)) return Math.max(0, target.offsetTop);
    return Math.max(0, Math.round(target.getBoundingClientRect().top + window.scrollY));
  }

  function onAnchorClick(event) {
    const origin = event.target instanceof Element ? event.target : event.target?.parentElement;
    const trigger = origin?.closest('a[href^="#"], [data-scroll]');
    if (!trigger) return;

    const selector = normalizeTarget(trigger);
    if (!selector) return;

    const target = document.querySelector(selector);
    if (!target) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    lock = true;
    collectSections();
    animateTo(targetTopFor(target), 860);
  }

  function init() {
    collectSections();

    document.addEventListener("click", onAnchorClick, true);
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener(
      "resize",
      () => {
        window.clearTimeout(window.__aiwResizeTimer);
        window.__aiwResizeTimer = window.setTimeout(collectSections, 180);
      },
      { passive: true }
    );

    window.addEventListener("load", collectSections, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
    return;
  }

  init();
})();
