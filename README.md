# Game Portal

A static game portal built with Astro. Add browser games via a JSON config, monetize with Google AdSense, and deploy to Netlify with zero backend.

**Live site:** https://games.xleon.dev

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Astro](https://astro.build) v5 — static site generator |
| Styling | Vanilla CSS (scoped per component) |
| Data | `src/data/games.json` — no database |
| Tests | [Vitest](https://vitest.dev) — data validation |
| Hosting | [Netlify](https://netlify.com) — auto-deploy on push |
| Monetization | Google AdSense |

### Project Structure

```
public/
  games/
    <slug>/
      game/          ← all game files (index.html, JS, CSS, assets)
      thumbnail.svg  ← game card thumbnail
  ads.txt            ← AdSense publisher verification
src/
  data/
    games.json       ← game registry (add games here)
    games.ts         ← typed loader + Game interface
    games.test.ts    ← Vitest validation tests
  components/
    GameCard.astro   ← card used in the homepage grid
    AdSlot.astro     ← Google AdSense ad unit
  layouts/
    Layout.astro     ← shared HTML shell (AdSense script lives here)
  pages/
    index.astro                    ← homepage (game grid)
    games/[slug]/index.astro       ← game detail page
    games/[slug]/play.astro        ← fullscreen game player
netlify.toml         ← Netlify build config
```

---

## Local Development

```bash
npm install
npm run dev       # starts dev server at http://localhost:4321
npm test          # run data validation tests
npm run build     # production build → dist/
npm run preview   # preview production build locally
```

---

## Adding a Game

### 1. Add game files

Create a folder under `public/games/<slug>/` and drop all game files inside a `game/` subdirectory:

```
public/games/my-new-game/
  game/
    index.html     ← game entry point (required)
    ...            ← all other JS, CSS, asset files
  thumbnail.svg    ← game card image (400×300 recommended)
```

> **Important:** game files must go inside the `game/` subdirectory, not directly in `<slug>/`. This prevents the game's `index.html` from conflicting with the portal's detail page at the same URL path.

### 2. Add an entry to `src/data/games.json`

```json
{
  "slug": "my-new-game",
  "title": "My New Game",
  "description": "A short description shown on the game card and detail page.",
  "thumbnail": "/games/my-new-game/thumbnail.svg",
  "tags": ["arcade", "puzzle"],
  "featured": false,
  "publishedAt": "2026-01-01"
}
```

| Field | Type | Description |
|---|---|---|
| `slug` | string | URL-safe identifier — must match the folder name in `public/games/` |
| `title` | string | Display name |
| `description` | string | Shown on the card and detail page |
| `thumbnail` | string | Path to thumbnail image (relative to `public/`) |
| `tags` | string[] | Category labels shown as pills on the card |
| `featured` | boolean | Reserved for future use (e.g. featured section) |
| `publishedAt` | string | Date in `YYYY-MM-DD` format |

### 3. Deploy

```bash
git add .
git commit -m "feat: add my-new-game"
git push
```

Netlify auto-deploys on push. The new game appears on the homepage within ~1 minute.

---

## Editing a Game

- **Update metadata** (title, description, tags): edit the entry in `src/data/games.json` and push.
- **Update game files**: replace files in `public/games/<slug>/game/` and push.
- **Update thumbnail**: replace `public/games/<slug>/thumbnail.svg` and push.

---

## Removing a Game

1. Delete the game folder:
   ```bash
   rm -rf public/games/<slug>/
   ```
2. Remove its entry from `src/data/games.json`.
3. Commit and push.

---

## Configuring Google AdSense

### Step 1 — Apply for AdSense

Go to [adsense.google.com](https://adsense.google.com), sign in, and submit `https://games.xleon.dev` for review. Approval typically takes 1–14 days.

### Step 2 — Add your Publisher ID

Once approved, replace `YOUR_PUBLISHER_ID` with your real `ca-pub-XXXXXXXXXX` value in two files:

**`src/layouts/Layout.astro`**
```html
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"
  crossorigin="anonymous"
></script>
```

**`src/components/AdSlot.astro`**
```html
<ins
  class="adsbygoogle"
  data-ad-client="ca-pub-XXXXXXXXXX"
  ...
></ins>
```

### Step 3 — Create ad units and add slot IDs

In the AdSense dashboard, create **3 Display ad units** (responsive). Each gives you a numeric slot ID. Then replace the placeholders:

| File | Placeholder | Placement |
|---|---|---|
| `src/pages/index.astro` | `HOMEPAGE_SLOT_ID` | Between game rows on homepage |
| `src/pages/games/[slug]/index.astro` | `DETAIL_TOP_SLOT_ID` | Above game info on detail page |
| `src/pages/games/[slug]/index.astro` | `DETAIL_BOTTOM_SLOT_ID` | Below game info on detail page |

### Step 4 — Update ads.txt

Replace the placeholder in `public/ads.txt`:

```
google.com, ca-pub-XXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

### Step 5 — Deploy

```bash
git add .
git commit -m "feat: add AdSense publisher and slot IDs"
git push
```

---

## Deployment

The site deploys automatically to Netlify on every push to `main`. Build settings are in `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
```

To trigger a manual deploy:
```bash
npm run build
npx netlify-cli deploy --prod --dir=dist
```
