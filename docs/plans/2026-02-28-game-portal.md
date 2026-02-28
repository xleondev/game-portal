# Game Portal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a static Astro game portal that lists all game web apps in a browsable grid, with Google AdSense monetization and a JSON-driven content system for adding new games.

**Architecture:** Static Astro site with `src/data/games.json` as the game registry. Each game's static files live in `public/games/<slug>/` and are served as-is. Game detail and play pages are Astro dynamic routes using `getStaticPaths()` driven by the JSON data.

**Tech Stack:** Astro (static), Vanilla CSS, Google AdSense, Netlify/Vercel for deployment.

---

### Task 1: Initialize Astro project

**Files:**
- Create: `astro.config.mjs`, `package.json`, `tsconfig.json`, `src/env.d.ts`

**Step 1: Run Astro scaffolding in the existing project directory**

```bash
cd /Users/louis_ng/projects/game-portal
npm create astro@latest . -- --template minimal --install --no-git
```

When prompted:
- Template: `minimal`
- Install dependencies: `Yes`
- Initialize git: `No` (already initialized)
- TypeScript: `Strict`

**Step 2: Verify it starts**

```bash
npm run dev
```

Expected: Server running at `http://localhost:4321` with default Astro page.

**Step 3: Commit**

```bash
git add .
git commit -m "feat: initialize Astro project"
```

---

### Task 2: Set up project structure and games.json

**Files:**
- Create: `src/data/games.json`
- Create: `src/data/games.ts` (typed loader)

**Step 1: Create the games data directory and JSON file**

Create `src/data/games.json`:

```json
[
  {
    "slug": "astro-dash",
    "title": "Astro Dash",
    "description": "An 8-bit endless runner — jump, slide, and dodge obstacles across three increasingly dangerous space zones. Survive long enough to face the boss.",
    "thumbnail": "/games/astro-dash/thumbnail.png",
    "tags": ["runner", "arcade", "8-bit"],
    "featured": true,
    "publishedAt": "2026-02-28"
  }
]
```

**Step 2: Create a typed loader**

Create `src/data/games.ts`:

```ts
import gamesData from './games.json';

export interface Game {
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  tags: string[];
  featured: boolean;
  publishedAt: string;
}

export const games: Game[] = gamesData as Game[];

export function getGame(slug: string): Game | undefined {
  return games.find((g) => g.slug === slug);
}
```

**Step 3: Write a data validation test**

Install Vitest:

```bash
npm install -D vitest
```

Add to `package.json` scripts:
```json
"test": "vitest run"
```

Create `src/data/games.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { games, getGame } from './games';

describe('games data', () => {
  it('has at least one game', () => {
    expect(games.length).toBeGreaterThan(0);
  });

  it('every game has required fields', () => {
    for (const game of games) {
      expect(game.slug).toBeTruthy();
      expect(game.title).toBeTruthy();
      expect(game.description).toBeTruthy();
      expect(game.tags).toBeInstanceOf(Array);
    }
  });

  it('getGame returns correct game by slug', () => {
    const game = getGame('astro-dash');
    expect(game?.title).toBe('Astro Dash');
  });

  it('getGame returns undefined for unknown slug', () => {
    expect(getGame('unknown')).toBeUndefined();
  });
});
```

**Step 4: Run tests**

```bash
npm test
```

Expected: All 4 tests pass.

**Step 5: Commit**

```bash
git add src/data/
git commit -m "feat: add games data schema and validation tests"
```

---

### Task 3: Copy Astro Dash game files

**Files:**
- Create: `public/games/astro-dash/` (copy from `../astro-dash/`)

**Step 1: Copy game files into the portal's public directory**

```bash
cp -r /Users/louis_ng/projects/astro-dash/. /Users/louis_ng/projects/game-portal/public/games/astro-dash/
```

**Step 2: Verify the game loads standalone**

```bash
npm run dev
```

Open `http://localhost:4321/games/astro-dash/index.html` — the game should run fully.

**Step 3: Add a placeholder thumbnail**

Astro Dash has no `thumbnail.png`. Create a simple SVG placeholder at `public/games/astro-dash/thumbnail.png` — or just update `games.json` to use a placeholder path. For now, update `games.json` to use `/placeholder-thumbnail.svg` and create that file:

Create `public/placeholder-thumbnail.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#1a1a2e"/>
  <text x="200" y="160" text-anchor="middle" fill="#888" font-family="monospace" font-size="16">No Preview</text>
</svg>
```

Update `src/data/games.json` thumbnail field:
```json
"thumbnail": "/placeholder-thumbnail.svg"
```

**Step 4: Commit**

```bash
git add public/
git commit -m "feat: add Astro Dash game files and placeholder thumbnail"
```

---

### Task 4: Create Layout and AdSlot components

**Files:**
- Create: `src/layouts/Layout.astro`
- Create: `src/components/AdSlot.astro`

**Step 1: Create the main layout**

Create `src/layouts/Layout.astro`:

```astro
---
interface Props {
  title: string;
  description?: string;
}
const { title, description = 'Free browser games — play instantly, no download needed.' } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <title>{title}</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <!-- Google AdSense — replace YOUR_PUBLISHER_ID with ca-pub-XXXXXXXXXX -->
    <script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=YOUR_PUBLISHER_ID"
      crossorigin="anonymous"
    ></script>
    <style>
      *, *::before, *::after { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: system-ui, sans-serif;
        background: #0f0f1a;
        color: #e0e0e0;
      }
      header {
        padding: 1rem 2rem;
        border-bottom: 1px solid #222;
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      header a { color: #e0e0e0; text-decoration: none; font-weight: bold; font-size: 1.25rem; }
      main { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    </style>
  </head>
  <body>
    <header>
      <a href="/">🎮 Game Portal</a>
    </header>
    <main>
      <slot />
    </main>
  </body>
</html>
```

**Step 2: Create the AdSlot component**

Create `src/components/AdSlot.astro`:

```astro
---
interface Props {
  slot: string; // AdSense data-ad-slot value
}
const { slot } = Astro.props;
---
<!-- Replace YOUR_PUBLISHER_ID and use actual slot IDs from your AdSense account -->
<ins
  class="adsbygoogle"
  style="display:block"
  data-ad-client="YOUR_PUBLISHER_ID"
  data-ad-slot={slot}
  data-ad-format="auto"
  data-full-width-responsive="true"
></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
```

**Step 3: Verify build has no errors**

```bash
npm run build
```

Expected: Build succeeds with no TypeScript errors.

**Step 4: Commit**

```bash
git add src/layouts/ src/components/AdSlot.astro
git commit -m "feat: add Layout and AdSlot components"
```

---

### Task 5: Create GameCard component

**Files:**
- Create: `src/components/GameCard.astro`

**Step 1: Create the component**

Create `src/components/GameCard.astro`:

```astro
---
import type { Game } from '../data/games';
interface Props {
  game: Game;
}
const { game } = Astro.props;
---
<a href={`/games/${game.slug}/`} class="card">
  <img src={game.thumbnail} alt={`${game.title} preview`} loading="lazy" />
  <div class="card-body">
    <h2>{game.title}</h2>
    <p>{game.description}</p>
    <div class="tags">
      {game.tags.map((tag) => <span class="tag">{tag}</span>)}
    </div>
  </div>
</a>

<style>
  .card {
    display: block;
    text-decoration: none;
    color: inherit;
    background: #1a1a2e;
    border: 1px solid #2a2a4a;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.15s, border-color 0.15s;
  }
  .card:hover { transform: translateY(-2px); border-color: #5555aa; }
  .card img { width: 100%; aspect-ratio: 4/3; object-fit: cover; background: #111; }
  .card-body { padding: 1rem; }
  .card-body h2 { margin: 0 0 0.5rem; font-size: 1.1rem; }
  .card-body p { margin: 0 0 0.75rem; font-size: 0.875rem; color: #aaa; line-height: 1.4; }
  .tags { display: flex; flex-wrap: wrap; gap: 0.25rem; }
  .tag {
    background: #2a2a4a;
    color: #aaa;
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
  }
</style>
```

**Step 2: Verify build**

```bash
npm run build
```

Expected: No errors.

**Step 3: Commit**

```bash
git add src/components/GameCard.astro
git commit -m "feat: add GameCard component"
```

---

### Task 6: Create homepage

**Files:**
- Modify: `src/pages/index.astro`

**Step 1: Replace the default homepage**

Replace `src/pages/index.astro` with:

```astro
---
import Layout from '../layouts/Layout.astro';
import GameCard from '../components/GameCard.astro';
import AdSlot from '../components/AdSlot.astro';
import { games } from '../data/games';
---
<Layout title="Game Portal — Free Browser Games">
  <h1>Free Browser Games</h1>
  <p class="subtitle">Play instantly — no download, no login.</p>

  <div class="grid">
    {games.map((game, i) => (
      <>
        <GameCard game={game} />
        {/* Ad after every 6th card */}
        {(i + 1) % 6 === 0 && (
          <div class="ad-row">
            <AdSlot slot="HOMEPAGE_SLOT_ID" />
          </div>
        )}
      </>
    ))}
  </div>
</Layout>

<style>
  h1 { margin: 0 0 0.25rem; font-size: 2rem; }
  .subtitle { color: #888; margin: 0 0 2rem; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.5rem;
  }
  .ad-row {
    grid-column: 1 / -1;
  }
</style>
```

**Step 2: Start dev server and verify**

```bash
npm run dev
```

Open `http://localhost:4321` — should show Astro Dash as a card in the grid.

**Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add homepage with game grid"
```

---

### Task 7: Create game detail page

**Files:**
- Create: `src/pages/games/[slug]/index.astro`

**Step 1: Create the directory and file**

```bash
mkdir -p src/pages/games/\[slug\]
```

Create `src/pages/games/[slug]/index.astro`:

```astro
---
import Layout from '../../../layouts/Layout.astro';
import AdSlot from '../../../components/AdSlot.astro';
import { games, getGame } from '../../../data/games';
import type { GetStaticPaths } from 'astro';

export const getStaticPaths: GetStaticPaths = () => {
  return games.map((game) => ({ params: { slug: game.slug } }));
};

const { slug } = Astro.params;
const game = getGame(slug!);
if (!game) return Astro.redirect('/');
---
<Layout title={`${game.title} — Game Portal`} description={game.description}>
  <div class="detail">
    <AdSlot slot="DETAIL_TOP_SLOT_ID" />

    <div class="hero">
      <img src={game.thumbnail} alt={`${game.title} preview`} class="thumbnail" />
      <div class="info">
        <h1>{game.title}</h1>
        <p>{game.description}</p>
        <div class="tags">
          {game.tags.map((tag) => <span class="tag">{tag}</span>)}
        </div>
        <a href={`/games/${game.slug}/play/`} class="play-btn">▶ Play Now</a>
      </div>
    </div>

    <AdSlot slot="DETAIL_BOTTOM_SLOT_ID" />
  </div>
</Layout>

<style>
  .detail { display: flex; flex-direction: column; gap: 1.5rem; }
  .hero { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start; }
  @media (max-width: 640px) { .hero { grid-template-columns: 1fr; } }
  .thumbnail { width: 100%; border-radius: 8px; }
  h1 { margin: 0 0 0.75rem; }
  p { color: #aaa; line-height: 1.6; }
  .tags { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-bottom: 1.5rem; }
  .tag { background: #2a2a4a; color: #aaa; font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px; }
  .play-btn {
    display: inline-block;
    background: #5555aa;
    color: #fff;
    text-decoration: none;
    padding: 0.75rem 2rem;
    border-radius: 6px;
    font-size: 1.1rem;
    font-weight: bold;
    transition: background 0.15s;
  }
  .play-btn:hover { background: #7777cc; }
</style>
```

**Step 2: Verify route**

```bash
npm run dev
```

Open `http://localhost:4321/games/astro-dash/` — should show detail page with thumbnail, description, tags, and Play button.

**Step 3: Commit**

```bash
git add src/pages/games/
git commit -m "feat: add game detail page"
```

---

### Task 8: Create game play page

**Files:**
- Create: `src/pages/games/[slug]/play.astro`

**Step 1: Create the play page**

Create `src/pages/games/[slug]/play.astro`:

```astro
---
import { games, getGame } from '../../../data/games';
import type { GetStaticPaths } from 'astro';

export const getStaticPaths: GetStaticPaths = () => {
  return games.map((game) => ({ params: { slug: game.slug } }));
};

const { slug } = Astro.params;
const game = getGame(slug!);
if (!game) return Astro.redirect('/');
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{game.title} — Play</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { background: #000; display: flex; flex-direction: column; height: 100vh; }
      .bar {
        background: #111;
        padding: 0.5rem 1rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-shrink: 0;
      }
      .bar a { color: #aaa; text-decoration: none; font-size: 0.875rem; }
      .bar a:hover { color: #fff; }
      .bar h1 { color: #fff; font-size: 0.875rem; font-weight: normal; flex: 1; }
      iframe {
        flex: 1;
        border: none;
        width: 100%;
      }
    </style>
  </head>
  <body>
    <div class="bar">
      <a href={`/games/${game.slug}/`}>← Back</a>
      <h1>{game.title}</h1>
      <a href="/">🎮 All Games</a>
    </div>
    <iframe
      src={`/games/${game.slug}/index.html`}
      title={game.title}
      allowfullscreen
    ></iframe>
  </body>
</html>
```

**Step 2: Verify the game plays**

```bash
npm run dev
```

Open `http://localhost:4321/games/astro-dash/play/` — Astro Dash should load and be playable inside the iframe.

**Step 3: Commit**

```bash
git add src/pages/games/\[slug\]/play.astro
git commit -m "feat: add game play page with iframe"
```

---

### Task 9: Add ads.txt for AdSense verification

**Files:**
- Create: `public/ads.txt`

**Step 1: Create ads.txt**

Create `public/ads.txt`:

```
google.com, pub-XXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

Replace `pub-XXXXXXXXXX` with your actual AdSense publisher ID when you have it. This file is required by AdSense to verify site ownership.

**Step 2: Verify it's served**

```bash
npm run dev
```

Open `http://localhost:4321/ads.txt` — should show the file content.

**Step 3: Replace placeholder AdSense IDs**

In these files, replace `YOUR_PUBLISHER_ID` with your actual `ca-pub-XXXXXXXXXX` value:
- `src/layouts/Layout.astro`
- `src/components/AdSlot.astro`

Also replace `HOMEPAGE_SLOT_ID`, `DETAIL_TOP_SLOT_ID`, `DETAIL_BOTTOM_SLOT_ID` with actual slot IDs from your AdSense dashboard. Get these by creating ad units at https://adsense.google.com.

**Step 4: Commit**

```bash
git add public/ads.txt src/layouts/Layout.astro src/components/AdSlot.astro
git commit -m "feat: add AdSense ads.txt and publisher IDs"
```

---

### Task 10: Final build verification and deploy setup

**Files:**
- Create: `netlify.toml` (or `vercel.json`)

**Step 1: Run full build and check for errors**

```bash
npm run build
```

Expected: Build completes, `dist/` directory created with all static pages.

**Step 2: Preview the production build**

```bash
npm run preview
```

Open `http://localhost:4321` and verify:
- [ ] Homepage shows Astro Dash card
- [ ] Clicking card goes to detail page
- [ ] "Play Now" button loads game in iframe
- [ ] Back link works

**Step 3: Create Netlify config**

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
```

**Step 4: Deploy**

Option A — Netlify CLI:
```bash
npx netlify-cli deploy --prod --dir=dist
```

Option B — Push to GitHub and connect repo at https://app.netlify.com (recommended for auto-deploy on push).

**Step 5: Final commit**

```bash
git add netlify.toml
git commit -m "feat: add Netlify deploy config"
```

---

## Adding a New Game (Ongoing)

1. Drop game files into `public/games/<slug>/`
2. Add entry to `src/data/games.json`
3. Run `npm run build` and redeploy

That's it.
