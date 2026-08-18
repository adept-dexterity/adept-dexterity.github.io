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

/* Lazy autoplay loops for populated media cards */
(() => {
  const lazies = [...document.querySelectorAll("video[data-lazy-video]")];
  if (!lazies.length) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting) {
        if (video.dataset.src) { video.src = video.dataset.src; video.removeAttribute("data-src"); }
        if (reduced) { video.controls = true; return; }
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.2 });
  lazies.forEach((video) => io.observe(video));
})();

/* Rollout gallery: stage + task filter, autoplay in view */
(() => {
  const section = document.getElementById("gallery");
  if (!section) return;
  const stageButtons = [...section.querySelectorAll(".gallery-stage")];
  const tagChips = [...section.querySelectorAll(".gallery-chip")];
  const cards = [...section.querySelectorAll(".gallery-card")];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target.querySelector("video");
      if (!video) return;
      if (entry.isIntersecting && !entry.target.hidden) {
        if (video.dataset.src) { video.src = video.dataset.src; video.removeAttribute("data-src"); }
        if (reduced) { video.controls = true; return; }
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.15 });
  cards.forEach((card) => io.observe(card));

  const setTag = (cat) => {
    tagChips.forEach((chip) => chip.classList.toggle("is-active", chip.dataset.cat === cat));
    cards.forEach((card) => {
      const show = card.dataset.cat === cat;
      card.hidden = !show;
      const video = card.querySelector("video");
      if (!show) video.pause();
    });
  };

  const setStage = (stage) => {
    stageButtons.forEach((b) => b.classList.toggle("is-active", b.dataset.stage === stage));
    const stageTags = tagChips.filter((chip) => chip.dataset.stage === stage);
    tagChips.forEach((chip) => { chip.hidden = chip.dataset.stage !== stage; });
    setTag(stageTags[0].dataset.cat);
  };

  stageButtons.forEach((b) => b.addEventListener("click", () => setStage(b.dataset.stage)));
  tagChips.forEach((chip) => chip.addEventListener("click", () => setTag(chip.dataset.cat)));
  setStage("pretrain");
})();

/* Native SVG step plots: per-stage real-world success (Table 4) */
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const STAGES_INSERT = ["Reaching", "Grasping", "Lifting", "Reorienting", "Aligning", "Inserting\n(Overall)"];
  const STAGES_PLACE = ["Reaching", "Grasping\n(flipping and regrasping)", "Lifting", "Reorienting", "Aligning", "Placing\n(Overall)"];
  const PLOTS = {
    kuka_fmb: { stages: STAGES_INSERT, series: [
      { cls: "blue", values: [100, 90, 80, 80, 70, 50], labelSide: -1 },
      { cls: "green", values: [100, 80, 60, 40, 30, 30], labelSide: 1 },
    ]},
    flexiv_fmb: { stages: STAGES_INSERT, series: [
      { cls: "blue", values: [100, 100, 100, 90, 80, 80], labelSide: -1 },
      { cls: "green", values: [100, 70, 50, 30, 30, 30], labelSide: 1 },
    ]},
    kuka_dish: { stages: STAGES_PLACE, series: [
      { cls: "blue", values: [100, 100, 80, 70, 60, 60], labelSide: -1 },
    ]},
  };
  const W = 470, H = 350, M = { l: 40, r: 36, t: 14, b: 54 };
  const PW = W - M.l - M.r, PH = H - M.t - M.b;
  const X = (i) => M.l + (PW / 5) * i;
  const Y = (v) => M.t + PH - (v / 112) * PH;
  const el = (tag, attrs) => {
    const node = document.createElementNS(NS, tag);
    for (const key in attrs) node.setAttribute(key, attrs[key]);
    return node;
  };
  const color = (cls) => `var(--plot-${cls})`;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const build = (host) => {
    const cfg = PLOTS[host.dataset.plot];
    if (!cfg) return;
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}` });
    const clipId = `ptclip-${host.dataset.plot}`;

    for (let v = 0; v <= 100; v += 20) {
      svg.appendChild(el("line", { class: "pt-grid", x1: M.l, x2: W - M.r, y1: Y(v), y2: Y(v) }));
      const tick = el("text", { class: "pt-axis", x: M.l - 8, y: Y(v) + 4, "text-anchor": "end" });
      tick.textContent = String(v);
      svg.appendChild(tick);
    }
    cfg.stages.forEach((stage, i) => {
      const lines = stage.split("\n");
      const text = el("text", { class: "pt-stage", x: X(i), y: H - M.b + 21, "text-anchor": "middle" });
      lines.forEach((line, j) => {
        const span = el("tspan", { x: X(i), dy: j === 0 ? 0 : 14 });
        if (j > 0) { span.setAttribute("font-size", "11.5"); span.setAttribute("fill-opacity", ".7"); }
        span.textContent = line;
        text.appendChild(span);
      });
      svg.appendChild(text);
    });

    const defs = el("defs", {});
    const clip = el("clipPath", { id: clipId });
    const clipRect = el("rect", { x: M.l - 8, y: 0, width: reduced ? W : 0, height: H });
    clip.appendChild(clipRect);
    defs.appendChild(clip);
    svg.appendChild(defs);

    const revealables = [];
    cfg.series.forEach((series) => {
      const pts = [];
      series.values.forEach((v, i) => {
        const half = PW / 5 / 2;
        if (i === 0) pts.push([X(0), Y(v)]);
        else {
          pts.push([X(i) - half, Y(series.values[i - 1])], [X(i) - half, Y(v)]);
        }
        if (i === series.values.length - 1) pts.push([X(i), Y(v)]);
        else pts.push([X(i) + half, Y(v)]);
      });
      const line = el("polyline", {
        class: "pt-line", points: pts.map((p) => p.join(",")).join(" "),
        stroke: color(series.cls), "clip-path": `url(#${clipId})`,
      });
      svg.appendChild(line);
      series.values.forEach((v, i) => {
        const marker = el("circle", { class: "pt-marker", cx: X(i), cy: Y(v), r: 5, fill: color(series.cls), opacity: reduced ? 1 : 0 });
        const lbl = el("text", {
          class: "pt-lbl", x: X(i), y: Y(v) + (series.labelSide < 0 ? -12 : 21),
          "text-anchor": "middle", fill: color(series.cls), opacity: reduced ? 1 : 0,
        });
        lbl.textContent = `${v}%`;
        svg.appendChild(marker); svg.appendChild(lbl);
        revealables.push({ x: X(i), nodes: [marker, lbl] });
      });
    });
    host.appendChild(svg);
    return { clipRect, revealables };
  };

  const hosts = [...document.querySelectorAll(".plot-svg")];
  const anims = new Map();
  hosts.forEach((host) => anims.set(host, build(host)));
  if (reduced) return;

  const sweep = (anim) => {
    const start = performance.now();
    const DELAY = 250, DUR = 2800;
    const tick = (now) => {
      let t = Math.min(1, Math.max(0, (now - start - DELAY) / DUR));
      t = t * t * (3 - 2 * t);
      const sweepX = M.l + (W - M.l) * t;
      anim.clipRect.setAttribute("width", Math.max(0, sweepX - (M.l - 8)));
      anim.revealables.forEach(({ x, nodes }) => {
        if (sweepX >= x) nodes.forEach((n) => n.setAttribute("opacity", 1));
      });
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const anim = anims.get(entry.target);
      if (anim && !anim.done) { anim.done = true; sweep(anim); }
      io.unobserve(entry.target);
    });
  }, { threshold: 0.35 });
  hosts.forEach((host) => io.observe(host));
})();
