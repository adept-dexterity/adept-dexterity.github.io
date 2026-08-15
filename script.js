const header = document.querySelector(".site-header");
const revealElements = document.querySelectorAll(".reveal");
const sections = document.querySelectorAll("section[id]");
const contents = document.querySelector(".contents");
const contentsLinks = document.querySelectorAll(".contents a");
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeLabel = document.querySelector("[data-theme-label]");
const themeColor = document.querySelector('meta[name="theme-color"]');
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

const getSavedTheme = () => {
  try {
    const theme = localStorage.getItem("adept-theme");
    return theme === "dark" || theme === "light" ? theme : null;
  }
  catch { return null; }
};

const setTheme = (theme, persist = false) => {
  const isDark = theme === "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  themeToggle?.setAttribute("aria-pressed", String(isDark));
  themeToggle?.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
  if (themeLabel) themeLabel.textContent = isDark ? "Light" : "Dark";
  if (themeColor) themeColor.content = isDark ? "#11130f" : "#fffff8";
  if (!persist) return;
  try { localStorage.setItem("adept-theme", isDark ? "dark" : "light"); } catch {}
};

setTheme(document.documentElement.dataset.theme ?? (systemTheme.matches ? "dark" : "light"));

themeToggle?.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  setTheme(nextTheme, true);
});

const followSystemTheme = (event) => {
  if (!getSavedTheme()) setTheme(event.matches ? "dark" : "light");
};

if (systemTheme.addEventListener) systemTheme.addEventListener("change", followSystemTheme);
else systemTheme.addListener(followSystemTheme);

window.addEventListener(
  "scroll",
  () => header.classList.toggle("scrolled", window.scrollY > 20),
  { passive: true },
);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

revealElements.forEach((element) => revealObserver.observe(element));

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      contentsLinks.forEach((link) => {
        const isActive = link.hash === `#${entry.target.id}`;
        link.classList.toggle("active", isActive);
        link.closest("li")?.classList.toggle("is-active", isActive);
        if (isActive) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  },
  { rootMargin: "-20% 0px -65% 0px" },
);

sections.forEach((section) => sectionObserver.observe(section));

const updateContentsProgress = () => {
  if (!contents || contentsLinks.length < 2) return;

  const marker = window.scrollY + window.innerHeight * 0.35;
  const milestones = [...contentsLinks]
    .map((link) => document.querySelector(link.hash))
    .filter(Boolean)
    .map((section) => section.offsetTop);

  let progress = 0;
  for (let index = 0; index < milestones.length - 1; index += 1) {
    const start = milestones[index];
    const end = milestones[index + 1];
    if (marker < start) break;

    const segmentProgress = Math.min(1, (marker - start) / (end - start));
    progress = (index + segmentProgress) / (milestones.length - 1);
  }
  if (marker >= milestones.at(-1)) progress = 1;

  contents.style.setProperty("--contents-progress", progress);
  contentsLinks.forEach((link) => {
    const target = document.querySelector(link.hash);
    link.closest("li")?.classList.toggle("is-past", Boolean(target && marker >= target.offsetTop));
  });
};

window.addEventListener("scroll", updateContentsProgress, { passive: true });
window.addEventListener("resize", updateContentsProgress);
updateContentsProgress();

document.querySelectorAll("[data-video-placeholder]").forEach((placeholder) => {
  placeholder.addEventListener("click", () => {
    const status = placeholder.querySelector(".media-status");
    if (!status) return;
    const original = status.textContent;
    status.textContent = "Replace with your MP4";
    window.setTimeout(() => { status.textContent = original; }, 1800);
  });
});

const copyButton = document.querySelector("[data-copy-citation]");
copyButton?.addEventListener("click", async () => {
  const citation = document.querySelector("[data-citation]")?.textContent ?? "";
  try {
    await navigator.clipboard.writeText(citation);
    copyButton.textContent = "Copied";
    window.setTimeout(() => { copyButton.textContent = "Copy"; }, 1800);
  } catch {
    copyButton.textContent = "Select text";
  }
});
