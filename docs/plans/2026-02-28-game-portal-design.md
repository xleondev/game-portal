# Game Portal Design

**Date:** 2026-02-28
**Stack:** Astro (static), `games.json` config, Google AdSense

---

## Overview

A static game portal that lists all game web apps in a browsable grid. New games are added by dropping files into a directory and adding an entry to a JSON config. Monetized with Google AdSense ads.

---

## Pages & Site Structure

```
/                        → Homepage — grid of all games, filterable by tag
/games/[slug]/           → Game detail page — description, thumbnail, play button, ads
/games/[slug]/play/      → Fullscreen game player (iframe pointing to game files)
```

- **Homepage:** Card grid of all games with thumbnails, titles, and tag filters.
- **Detail page:** Game description, thumbnail, tags, "Play" button, AdSense ads above/below iframe.
- **Play page:** Fullscreen iframe loading the game's static `index.html`.

---

## Data Schema (`src/data/games.json`)

```json
[
  {
    "slug": "astro-dash",
    "title": "Astro Dash",
    "description": "An 8-bit endless runner — jump, slide, and dodge obstacles across three space zones.",
    "thumbnail": "/games/astro-dash/thumbnail.png",
    "tags": ["runner", "arcade", "8-bit"],
    "featured": true,
    "publishedAt": "2026-02-28"
  }
]
```

**To add a new game:** add an entry here, drop game files into `public/games/<slug>/`, redeploy.

---

## File Structure

```
public/
  games/
    astro-dash/          ← static game files (index.html, game.js, etc.)
    <new-game>/
  ads.txt                ← AdSense publisher verification
src/
  data/
    games.json           ← game registry
  pages/
    index.astro          ← homepage
    games/[slug].astro   ← game detail page
    games/[slug]/play.astro  ← game player (iframe)
  layouts/
    Layout.astro         ← AdSense script tag injected here
  components/
    GameCard.astro       ← reusable card for homepage grid
    AdSlot.astro         ← reusable AdSense ad unit
```

---

## AdSense Integration

- AdSense `<script>` tag added once in `Layout.astro` (loads on every page).
- `public/ads.txt` contains AdSense publisher verification string.
- Ad slots placed:
  - Homepage: between rows of game cards.
  - Detail page: above and below the game iframe.

---

## Deployment

- Host on **Netlify** or **Vercel** (free tier, auto-deploys on git push).
- All game files served as static assets from `public/games/`.
- No backend, no database, no build-time secrets.
