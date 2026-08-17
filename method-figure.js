/* ADEPT interactive method figure — browser-tab layout */
(() => {
  const figure = document.querySelector("[data-method-figure]");
  if (!figure) return;

  const tabs = [...figure.querySelectorAll(".mf-tab")];
  const panels = [...figure.querySelectorAll(".mf-panel")];
  const tooltip = figure.querySelector(".mf-tooltip");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let figureInView = false;

  const loadVideo = (panel) => {
    const video = panel.querySelector("video[data-src]");
    if (!video) return;
    video.src = video.dataset.src;
    video.removeAttribute("data-src");
  };

  const playActive = () => {
    panels.forEach((panel) => {
      const video = panel.querySelector("video");
      if (!video) return;
      if (!panel.hidden && figureInView) {
        loadVideo(panel);
        if (reducedMotion) { video.controls = true; return; }
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  };

  const activate = (index, focusTab = false) => {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.setAttribute("tabindex", active ? "0" : "-1");
    });
    panels.forEach((panel, i) => {
      const active = i === index;
      if (active && panel.hidden && !reducedMotion) {
        panel.classList.remove("is-entering");
        void panel.offsetWidth;
        panel.classList.add("is-entering");
      }
      panel.hidden = !active;
    });
    if (focusTab) tabs[index].focus();
    hideTip();
    playActive();
  };

  tabs.forEach((tab, i) => tab.addEventListener("click", () => activate(i)));

  figure.querySelector(".mf-tabs").addEventListener("keydown", (event) => {
    const current = tabs.findIndex((t) => t.classList.contains("is-active"));
    let next = null;
    if (event.key === "ArrowRight") next = (current + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    if (next === null) return;
    event.preventDefault();
    activate(next, true);
  });

  /* Pause media when the figure leaves the viewport */
  const viewObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        figureInView = entry.isIntersecting;
        playActive();
      });
    },
    { threshold: 0.15 },
  );
  viewObserver.observe(figure);

  /* Tooltips */
  let tipTarget = null;

  const showTip = (target) => {
    tipTarget = target;
    tooltip.textContent = target.dataset.tip;
    tooltip.hidden = false;
    const figureRect = figure.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const tipRect = tooltip.getBoundingClientRect();
    let left = targetRect.left - figureRect.left + targetRect.width / 2 - tipRect.width / 2;
    left = Math.max(6, Math.min(left, figureRect.width - tipRect.width - 6));
    let top = targetRect.bottom - figureRect.top + 10;
    if (top + tipRect.height > figureRect.height - 4) {
      top = targetRect.top - figureRect.top - tipRect.height - 10;
    }
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    requestAnimationFrame(() => tooltip.classList.add("is-visible"));
  };

  const hideTip = () => {
    tipTarget = null;
    tooltip.classList.remove("is-visible");
    tooltip.hidden = true;
  };

  figure.querySelectorAll("[data-tip]").forEach((term) => {
    term.setAttribute("tabindex", "0");
    term.addEventListener("mouseenter", () => showTip(term));
    term.addEventListener("mouseleave", hideTip);
    term.addEventListener("focus", () => showTip(term));
    term.addEventListener("blur", hideTip);
    term.addEventListener("click", (event) => {
      event.stopPropagation();
      if (tipTarget === term) hideTip();
      else showTip(term);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideTip();
  });
  window.addEventListener("scroll", hideTip, { passive: true });

  activate(0);
})();
