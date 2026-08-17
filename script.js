const revealElements = document.querySelectorAll(".reveal");
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
  document.querySelectorAll("img[data-light-src][data-dark-src]").forEach((image) => {
    const source = isDark ? image.dataset.darkSrc : image.dataset.lightSrc;
    if (source && image.getAttribute("src") !== source) image.setAttribute("src", source);
  });
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

const updateContentsProgress = () => {
  if (!contents || !contentsLinks.length) return;

  const marker = window.scrollY + window.innerHeight * 0.35;
  const milestones = [...contentsLinks]
    .map((link) => ({ link, target: document.querySelector(link.hash) }))
    .filter(({ target }) => Boolean(target));

  if (!milestones.length) return;

  const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
  let activeIndex = 0;
  milestones.forEach(({ target }, index) => {
    if (marker >= target.offsetTop) activeIndex = index;
  });
  if (atPageEnd) activeIndex = milestones.length - 1;

  let progress = 0;
  for (let index = 0; index < milestones.length - 1; index += 1) {
    const start = milestones[index].target.offsetTop;
    const end = milestones[index + 1].target.offsetTop;
    if (marker < start) break;

    const segmentProgress = Math.min(1, (marker - start) / (end - start));
    progress = (index + segmentProgress) / (milestones.length - 1);
  }
  if (atPageEnd || marker >= milestones.at(-1).target.offsetTop) progress = 1;

  contents.style.setProperty("--contents-progress", progress);
  milestones.forEach(({ link }, index) => {
    const isActive = index === activeIndex;
    const listItem = link.closest("li");
    link.classList.toggle("active", isActive);
    listItem?.classList.toggle("is-active", isActive);
    listItem?.classList.toggle("is-past", index < activeIndex);
    if (isActive) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
};

window.addEventListener("scroll", updateContentsProgress, { passive: true });
window.addEventListener("resize", updateContentsProgress);
window.addEventListener("load", updateContentsProgress);
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
