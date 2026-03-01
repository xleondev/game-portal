# Game Portal — Claude Context

Live site: https://games.xleon.dev
Stack: Astro v5, Vanilla CSS, Netlify, Google AdSense
Deploy: `git push` → Netlify auto-deploys from `main`

## Critical Convention

Game files must live in a `game/` subdirectory — never directly in `<slug>/`:

```
public/games/<slug>/
  game/
    index.html   ← required entry point
    ...
  thumbnail.svg
```

Reason: Astro generates `dist/games/<slug>/index.html` for the detail page. A game file at the same path overwrites it, breaking the Play Now button.

## Adding a Game

Use the `game-portal-add-game` skill. It covers: game structure, SVG thumbnail generation, `games.json` entry, tests, and deploy.

## Key Files

| File | Purpose |
|---|---|
| `src/data/games.json` | Game registry — single source of truth |
| `src/data/games.ts` | Typed loader + `Game` interface |
| `src/data/games.test.ts` | Vitest validation (run: `npm test`) |
| `src/layouts/Layout.astro` | Shared HTML shell, AdSense script tag |
| `src/components/AdSlot.astro` | AdSense `<ins>` unit — use `is:inline` on script |
| `src/pages/games/[slug]/play.astro` | Fullscreen iframe player |

## AdSense Placeholders

| Location | Placeholder |
|---|---|
| `src/layouts/Layout.astro` | `YOUR_PUBLISHER_ID` |
| `src/components/AdSlot.astro` | `YOUR_PUBLISHER_ID` |
| `src/pages/index.astro` | `HOMEPAGE_SLOT_ID` |
| `src/pages/games/[slug]/index.astro` | `DETAIL_TOP_SLOT_ID`, `DETAIL_BOTTOM_SLOT_ID` |
| `public/ads.txt` | `pub-XXXXXXXXXX` |

## Game iframe Sandbox

```
sandbox="allow-scripts allow-same-origin"
```

Games can run JS and access same-origin resources. They cannot navigate the parent frame.

## AdSlot Known Issue

Astro v5 deduplicates `<script>` tags. The `adsbygoogle.push({})` call in AdSlot.astro **must** use `is:inline` to fire once per ad unit.

## Local Dev

```bash
npm install
npm run dev    # http://localhost:4321
npm test       # data validation
npm run build  # production build
```
