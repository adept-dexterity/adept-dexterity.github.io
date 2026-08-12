# ADEPT project website

A framework-free project page for **ADEPT: Accelerating Dexterity via
Pre-Training and Post-Training using Reinforcement Learning**.

## Preview locally

```bash
cd adept-website
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Customize

- Confirm author order and affiliations against the camera-ready paper.
- Replace the pending arXiv, X thread, code, and PDF destinations in the hero.
- Replace the illustrative training chart with the final exported figure.
- Recheck the draft-derived 2–14× and 5–10 s headline claims before launch.
- Add MP4 files under `media/`; see `media/README.md` for the video snippet.
- Update the paper link and BibTeX when available.
- Add an Open Graph preview image and set `og:image` before launch.

## Publish with GitHub Pages

This is a static site with relative asset paths, so it works from a GitHub Pages
project subpath. Either make this folder the publishing source with a GitHub
Actions workflow, or move it to a dedicated `<username>.github.io` repository.
