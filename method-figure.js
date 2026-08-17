/* ADEPT interactive method figure */
(() => {
  const figure = document.querySelector("[data-method-figure]");
  if (!figure) return;

  const stages = [...figure.querySelectorAll(".mf-stage")];
  const heads = [...figure.querySelectorAll(".mf-head")];
  const dots = [...figure.querySelectorAll(".mf-progress button")];
  const tooltip = figure.querySelector(".mf-tooltip");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const loadVideo = (stage) => {
    const video = stage.querySelector("video[data-src]");
    if (!video) return stage.querySelector("video");
    video.src = video.dataset.src;
    video.removeAttribute("data-src");
    return video;
  };

  const playActive = () => {
    stages.forEach((stage) => {
      const active = stage.classList.contains("is-active");
      const video = stage.querySelector("video");
      if (!video) return;
      if (active && figureInView) {
        if (video.dataset.src) loadVideo(stage);
        if (reducedMotion) { video.controls = true; return; }
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  };

  const activate = (index) => {
    stages.forEach((stage, i) => {
      const active = i === index;
      stage.classList.toggle("is-active", active);
      stage.querySelector(".mf-head").setAttribute("aria-expanded", String(active));
    });
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    hideTip();
    playActive();
  };

  stages.forEach((stage, i) => {
    stage.addEventListener("click", (event) => {
      if (stage.classList.contains("is-active")) return;
      if (event.target.closest("[data-tip]")) return;
      activate(i);
    });
  });
  heads.forEach((head, i) => head.addEventListener("click", () => activate(i)));
  dots.forEach((dot, i) => dot.addEventListener("click", () => activate(i)));

  figure.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const current = stages.findIndex((s) => s.classList.contains("is-active"));
    const next = event.key === "ArrowRight"
      ? Math.min(stages.length - 1, current + 1)
      : Math.max(0, current - 1);
    if (next !== current) {
      activate(next);
      heads[next].focus();
    }
  });

  /* Pause media when the figure leaves the viewport */
  let figureInView = false;
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
