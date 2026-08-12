const header = document.querySelector(".site-header");
const revealElements = document.querySelectorAll(".reveal");
const sections = document.querySelectorAll("section[id]");
const contentsLinks = document.querySelectorAll(".contents a");

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
        link.classList.toggle("active", link.hash === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-20% 0px -65% 0px" },
);

sections.forEach((section) => sectionObserver.observe(section));

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
