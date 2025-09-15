# Quran Site (Single-folder Build)

This folder contains a ready-to-host static website:

- Pages: index.html, prayers.html, live.html, quran.html, recitations.html, azkar.html, favorites.html, tasbeeh.html, media.html, mosque.html
- Assets in the same directory: style.css, main.js, data.js, background SVGs

## Deploy to GitHub Pages

1. Create a new public repository on GitHub (e.g., `quran-site`).
2. Upload **all files in this folder** to the repo root (no subfolders required).
3. Go to **Settings → Pages**, set:
   - Branch: `main`
   - Folder: `/root`
4. Save. Your site will be available at `https://USERNAME.github.io/quran-site/`.

> Notes:
> - Quran text/translation/tafsir and prayer times require internet access (APIs).
> - Radio stream links open in new tabs to ensure playback on all devices.
