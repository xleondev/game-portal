# Shape Explorer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build "Shape Explorer" — a browser game teaching 3D shapes to kids (ages 6–12) via three modes: Explore (rotate & inspect), Quiz (multiple-choice), and Build (fold nets / assemble pieces).

**Architecture:** Single self-contained HTML/CSS/JS game in `public/games/shape-explorer/game/`. Three.js r165 loaded from CDN for 3D rendering. All state in `localStorage`. Three tabs (Explore, Quiz, Build) with a level selector (1–5). Clean CSS-variable theme system — switching themes requires only adding a CSS file and swapping a class on `<body>`.

**Tech Stack:** Vanilla JS (ES modules), Three.js r165 (CDN), CSS custom properties for theming, Vitest (existing, for registry test only), no bundler.

---

## Task 1: Register game in portal

**Files:**
- Modify: `src/data/games.json`
- Test: `src/data/games.test.ts`

**Step 1: Add entry to games.json**

Add to the array in `src/data/games.json`:

```json
{
  "slug": "shape-explorer",
  "title": "Shape Explorer",
  "description": "Rotate, quiz, and build 30 3D shapes — from basic cubes to star polyhedra — across 5 levels covering Grades 1–12.",
  "thumbnail": "/games/shape-explorer/thumbnail.svg",
  "tags": ["educational", "3d", "math", "kids"],
  "featured": false,
  "publishedAt": "2026-03-01"
}
```

**Step 2: Run existing tests to verify they pass**

```bash
npm test
```

Expected: all tests pass (the registry test checks required fields — our entry has them all).

**Step 3: Commit**

```bash
git add src/data/games.json
git commit -m "feat: register shape-explorer game"
```

---

## Task 2: Create directory structure & thumbnail

**Files:**
- Create: `public/games/shape-explorer/game/index.html`
- Create: `public/games/shape-explorer/thumbnail.svg`

**Step 1: Create the game directory**

```bash
mkdir -p public/games/shape-explorer/game/themes
mkdir -p public/games/shape-explorer/game/assets/sounds
```

**Step 2: Create thumbnail.svg**

Create `public/games/shape-explorer/thumbnail.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#e8eef7"/>
  <!-- Background shapes (decorative) -->
  <polygon points="320,40 360,110 280,110" fill="#f4a26150" stroke="#f4a261" stroke-width="2"/>
  <circle cx="80" cy="80" r="45" fill="#7ec8e350" stroke="#7ec8e3" stroke-width="2"/>
  <!-- Central cube (isometric) -->
  <polygon points="200,80 250,110 250,170 200,140" fill="#5b8dee"/>
  <polygon points="200,80 150,110 150,170 200,140" fill="#7ec8e3"/>
  <polygon points="200,80 250,110 200,140 150,110" fill="#a8c8f8"/>
  <!-- Title -->
  <text x="200" y="220" font-family="system-ui,sans-serif" font-size="28" font-weight="700"
        text-anchor="middle" fill="#1a1a2e">Shape Explorer</text>
  <text x="200" y="250" font-family="system-ui,sans-serif" font-size="14"
        text-anchor="middle" fill="#6b7280">30 shapes · 5 levels · Grades 1–12</text>
</svg>
```

**Step 3: Create index.html**

Create `public/games/shape-explorer/game/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Shape Explorer</title>
  <link rel="stylesheet" href="themes/clean.css">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app">
    <header id="top-bar">
      <h1>Shape Explorer</h1>
      <div id="level-selector"></div>
      <button id="theme-btn" title="Switch theme">🎨</button>
    </header>
    <nav id="tabs">
      <button class="tab-btn active" data-tab="explore">Explore</button>
      <button class="tab-btn" data-tab="quiz">Quiz</button>
      <button class="tab-btn" data-tab="build">Build</button>
    </nav>
    <main id="content"></main>
    <footer id="collection-shelf">
      <h2>My Collection</h2>
      <div id="collection-grid"></div>
    </footer>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.min.js"></script>
  <script type="module" src="main.js"></script>
</body>
</html>
```

**Step 4: Verify the game loads in dev**

```bash
npm run dev
```

Open http://localhost:4321/games/shape-explorer — confirm the detail page renders. Open http://localhost:4321/games/shape-explorer/play — confirm the iframe loads (will be blank at this stage, that's fine).

**Step 5: Commit**

```bash
git add public/games/shape-explorer/
git commit -m "feat: add shape-explorer scaffold and thumbnail"
```

---

## Task 3: Shape data

**Files:**
- Create: `public/games/shape-explorer/game/shapes.js`

**Step 1: Create shapes.js**

Create `public/games/shape-explorer/game/shapes.js` with all 30 shapes. Each entry follows this structure:

```js
export const SHAPES = [
  // ── Level 1: Basic (Grades 1–2) ──────────────────────────────────────
  {
    id: "cube",
    name: "Cube",
    level: 1,
    colorVar: "--shape-cube",
    faces: 6, edges: 12, vertices: 8,
    curvedFaces: 0,
    realWorld: "Dice, building blocks, ice cubes",
    eulerCheck: true,   // F - E + V = 2 holds
    netAvailable: true,
    geometry: "BoxGeometry",
    geometryArgs: [1.5, 1.5, 1.5],
  },
  {
    id: "sphere",
    name: "Sphere",
    level: 1,
    colorVar: "--shape-sphere",
    faces: 0, edges: 0, vertices: 0,
    curvedFaces: 1,
    realWorld: "Basketball, globe, orange",
    eulerCheck: false,
    netAvailable: false,
    geometry: "SphereGeometry",
    geometryArgs: [0.9, 32, 32],
  },
  {
    id: "cone",
    name: "Cone",
    level: 1,
    colorVar: "--shape-cone",
    faces: 1, edges: 1, vertices: 1,
    curvedFaces: 1,
    realWorld: "Ice cream cone, party hat, traffic cone",
    eulerCheck: false,
    netAvailable: true,
    geometry: "ConeGeometry",
    geometryArgs: [0.9, 1.8, 32],
  },
  {
    id: "cylinder",
    name: "Cylinder",
    level: 1,
    colorVar: "--shape-cylinder",
    faces: 2, edges: 2, vertices: 0,
    curvedFaces: 1,
    realWorld: "Can of soup, toilet roll, battery",
    eulerCheck: false,
    netAvailable: true,
    geometry: "CylinderGeometry",
    geometryArgs: [0.8, 0.8, 1.6, 32],
  },
  {
    id: "rectangular-prism",
    name: "Rectangular Prism",
    level: 1,
    colorVar: "--shape-rectangular-prism",
    faces: 6, edges: 12, vertices: 8,
    curvedFaces: 0,
    realWorld: "Brick, cereal box, book",
    eulerCheck: true,
    netAvailable: true,
    geometry: "BoxGeometry",
    geometryArgs: [2, 1.2, 1],
  },
  {
    id: "square-pyramid",
    name: "Square Pyramid",
    level: 1,
    colorVar: "--shape-square-pyramid",
    faces: 5, edges: 8, vertices: 5,
    curvedFaces: 0,
    realWorld: "Egyptian pyramid, roof",
    eulerCheck: true,
    netAvailable: true,
    geometry: "ConeGeometry",
    geometryArgs: [1, 1.6, 4],
  },
  {
    id: "triangular-prism",
    name: "Triangular Prism",
    level: 1,
    colorVar: "--shape-triangular-prism",
    faces: 5, edges: 9, vertices: 6,
    curvedFaces: 0,
    realWorld: "Toblerone box, tent, ramp",
    eulerCheck: true,
    netAvailable: true,
    geometry: "CylinderGeometry",
    geometryArgs: [0.9, 0.9, 1.6, 3],
  },

  // ── Level 2: Elementary (Grades 3–4) ─────────────────────────────────
  {
    id: "tetrahedron",
    name: "Tetrahedron",
    level: 2,
    colorVar: "--shape-tetrahedron",
    faces: 4, edges: 6, vertices: 4,
    curvedFaces: 0,
    realWorld: "D4 gaming die, molecular shapes",
    eulerCheck: true,
    netAvailable: true,
    geometry: "TetrahedronGeometry",
    geometryArgs: [1.2],
  },
  {
    id: "octahedron",
    name: "Octahedron",
    level: 2,
    colorVar: "--shape-octahedron",
    faces: 8, edges: 12, vertices: 6,
    curvedFaces: 0,
    realWorld: "D8 gaming die, diamond crystal",
    eulerCheck: true,
    netAvailable: true,
    geometry: "OctahedronGeometry",
    geometryArgs: [1.1],
  },
  {
    id: "pentagonal-prism",
    name: "Pentagonal Prism",
    level: 2,
    colorVar: "--shape-pentagonal-prism",
    faces: 7, edges: 15, vertices: 10,
    curvedFaces: 0,
    realWorld: "Some pencils, architectural columns",
    eulerCheck: true,
    netAvailable: true,
    geometry: "CylinderGeometry",
    geometryArgs: [0.9, 0.9, 1.6, 5],
  },
  {
    id: "hexagonal-prism",
    name: "Hexagonal Prism",
    level: 2,
    colorVar: "--shape-hexagonal-prism",
    faces: 8, edges: 18, vertices: 12,
    curvedFaces: 0,
    realWorld: "Honeycomb cell, bolt head",
    eulerCheck: true,
    netAvailable: true,
    geometry: "CylinderGeometry",
    geometryArgs: [0.9, 0.9, 1.6, 6],
  },
  {
    id: "pentagonal-pyramid",
    name: "Pentagonal Pyramid",
    level: 2,
    colorVar: "--shape-pentagonal-pyramid",
    faces: 6, edges: 10, vertices: 6,
    curvedFaces: 0,
    realWorld: "Some gemstone cuts",
    eulerCheck: true,
    netAvailable: true,
    geometry: "ConeGeometry",
    geometryArgs: [1, 1.6, 5],
  },
  {
    id: "hexagonal-pyramid",
    name: "Hexagonal Pyramid",
    level: 2,
    colorVar: "--shape-hexagonal-pyramid",
    faces: 7, edges: 12, vertices: 7,
    curvedFaces: 0,
    realWorld: "Some gemstone cuts, pencil tip",
    eulerCheck: true,
    netAvailable: true,
    geometry: "ConeGeometry",
    geometryArgs: [1, 1.6, 6],
  },

  // ── Level 3: Intermediate (Grades 5–6) ────────────────────────────────
  {
    id: "dodecahedron",
    name: "Dodecahedron",
    level: 3,
    colorVar: "--shape-dodecahedron",
    faces: 12, edges: 30, vertices: 20,
    curvedFaces: 0,
    realWorld: "D12 gaming die, some viruses",
    eulerCheck: true,
    netAvailable: true,
    geometry: "DodecahedronGeometry",
    geometryArgs: [1],
  },
  {
    id: "icosahedron",
    name: "Icosahedron",
    level: 3,
    colorVar: "--shape-icosahedron",
    faces: 20, edges: 30, vertices: 12,
    curvedFaces: 0,
    realWorld: "D20 gaming die, some viruses",
    eulerCheck: true,
    netAvailable: true,
    geometry: "IcosahedronGeometry",
    geometryArgs: [1],
  },
  {
    id: "torus",
    name: "Torus",
    level: 3,
    colorVar: "--shape-torus",
    faces: 0, edges: 0, vertices: 0,
    curvedFaces: 1,
    realWorld: "Doughnut, inner tube, life ring",
    eulerCheck: false,
    netAvailable: false,
    geometry: "TorusGeometry",
    geometryArgs: [0.7, 0.35, 16, 32],
  },
  {
    id: "ellipsoid",
    name: "Ellipsoid",
    level: 3,
    colorVar: "--shape-ellipsoid",
    faces: 0, edges: 0, vertices: 0,
    curvedFaces: 1,
    realWorld: "Rugby ball, egg, planet Earth",
    eulerCheck: false,
    netAvailable: false,
    geometry: "SphereGeometry",
    geometryArgs: [1, 32, 32],
    scale: [1.5, 1, 1],
  },
  {
    id: "frustum",
    name: "Frustum (Truncated Cone)",
    level: 3,
    colorVar: "--shape-frustum",
    faces: 2, edges: 2, vertices: 0,
    curvedFaces: 1,
    realWorld: "Bucket, lampshade, flower pot",
    eulerCheck: false,
    netAvailable: true,
    geometry: "CylinderGeometry",
    geometryArgs: [0.5, 1.1, 1.6, 32],
  },
  {
    id: "truncated-pyramid",
    name: "Truncated Pyramid",
    level: 3,
    colorVar: "--shape-truncated-pyramid",
    faces: 6, edges: 12, vertices: 8,
    curvedFaces: 0,
    realWorld: "Some buildings, step pyramid",
    eulerCheck: true,
    netAvailable: true,
    geometry: "CylinderGeometry",
    geometryArgs: [0.6, 1.2, 1.4, 4],
  },

  // ── Level 4: Advanced (Grades 7–9) ────────────────────────────────────
  {
    id: "cuboctahedron",
    name: "Cuboctahedron",
    level: 4,
    colorVar: "--shape-cuboctahedron",
    faces: 14, edges: 24, vertices: 12,
    curvedFaces: 0,
    realWorld: "Some crystal structures",
    eulerCheck: true,
    netAvailable: false,
    geometry: "IcosahedronGeometry",
    geometryArgs: [1, 1],
  },
  {
    id: "rhombicuboctahedron",
    name: "Rhombicuboctahedron",
    level: 4,
    colorVar: "--shape-rhombicuboctahedron",
    faces: 26, edges: 48, vertices: 24,
    curvedFaces: 0,
    realWorld: "Some architectural domes",
    eulerCheck: true,
    netAvailable: false,
    geometry: "IcosahedronGeometry",
    geometryArgs: [1, 2],
  },
  {
    id: "triangular-antiprism",
    name: "Triangular Antiprism",
    level: 4,
    colorVar: "--shape-triangular-antiprism",
    faces: 8, edges: 12, vertices: 6,
    curvedFaces: 0,
    realWorld: "Antiprism in molecular geometry",
    eulerCheck: true,
    netAvailable: false,
    geometry: "OctahedronGeometry",
    geometryArgs: [1],
  },
  {
    id: "square-antiprism",
    name: "Square Antiprism",
    level: 4,
    colorVar: "--shape-square-antiprism",
    faces: 10, edges: 16, vertices: 8,
    curvedFaces: 0,
    realWorld: "Some molecular structures",
    eulerCheck: true,
    netAvailable: false,
    geometry: "CylinderGeometry",
    geometryArgs: [0.9, 0.9, 1.2, 8],
  },
  {
    id: "truncated-tetrahedron",
    name: "Truncated Tetrahedron",
    level: 4,
    colorVar: "--shape-truncated-tetrahedron",
    faces: 8, edges: 18, vertices: 12,
    curvedFaces: 0,
    realWorld: "Archimedean solid",
    eulerCheck: true,
    netAvailable: false,
    geometry: "TetrahedronGeometry",
    geometryArgs: [1, 1],
  },
  {
    id: "truncated-cube",
    name: "Truncated Cube",
    level: 4,
    colorVar: "--shape-truncated-cube",
    faces: 14, edges: 36, vertices: 24,
    curvedFaces: 0,
    realWorld: "Archimedean solid",
    eulerCheck: true,
    netAvailable: false,
    geometry: "BoxGeometry",
    geometryArgs: [1.4, 1.4, 1.4],
  },

  // ── Level 5: Expert (Grades 10–12) ────────────────────────────────────
  {
    id: "truncated-octahedron",
    name: "Truncated Octahedron",
    level: 5,
    colorVar: "--shape-truncated-octahedron",
    faces: 14, edges: 36, vertices: 24,
    curvedFaces: 0,
    realWorld: "Space-filling polyhedron (Kelvin structure)",
    eulerCheck: true,
    netAvailable: false,
    geometry: "OctahedronGeometry",
    geometryArgs: [1, 1],
  },
  {
    id: "snub-cube",
    name: "Snub Cube",
    level: 5,
    colorVar: "--shape-snub-cube",
    faces: 38, edges: 60, vertices: 24,
    curvedFaces: 0,
    realWorld: "Chiral Archimedean solid",
    eulerCheck: true,
    netAvailable: false,
    geometry: "IcosahedronGeometry",
    geometryArgs: [1, 3],
  },
  {
    id: "rhombic-dodecahedron",
    name: "Rhombic Dodecahedron",
    level: 5,
    colorVar: "--shape-rhombic-dodecahedron",
    faces: 12, edges: 24, vertices: 14,
    curvedFaces: 0,
    realWorld: "Honeycomb cell (3D), garnet crystal",
    eulerCheck: true,
    netAvailable: false,
    geometry: "DodecahedronGeometry",
    geometryArgs: [1, 1],
  },
  {
    id: "small-stellated-dodecahedron",
    name: "Small Stellated Dodecahedron",
    level: 5,
    colorVar: "--shape-small-stellated-dodecahedron",
    faces: 12, edges: 30, vertices: 12,
    curvedFaces: 0,
    realWorld: "Kepler–Poinsot star polyhedron",
    eulerCheck: false,
    netAvailable: false,
    geometry: "DodecahedronGeometry",
    geometryArgs: [1],
    scale: [1, 1, 1],
  },
  {
    id: "compound-cube-octahedron",
    name: "Compound of Cube & Octahedron",
    level: 5,
    colorVar: "--shape-compound-cube-octahedron",
    faces: 14, edges: 24, vertices: 14,
    curvedFaces: 0,
    realWorld: "Polyhedral compound — two interpenetrating solids",
    eulerCheck: false,
    netAvailable: false,
    geometry: "OctahedronGeometry",
    geometryArgs: [1],
  },
];

export function getShapesByLevel(level) {
  return SHAPES.filter(s => s.level === level);
}

export function getShape(id) {
  return SHAPES.find(s => s.id === id);
}
```

**Step 2: Commit**

```bash
git add public/games/shape-explorer/game/shapes.js
git commit -m "feat: add shape-explorer shape data (30 shapes, 5 levels)"
```

---

## Task 4: CSS theme system

**Files:**
- Create: `public/games/shape-explorer/game/themes/clean.css`
- Create: `public/games/shape-explorer/game/themes/space.css`
- Create: `public/games/shape-explorer/game/style.css`

**Step 1: Create clean.css**

```css
/* themes/clean.css — default light theme */
:root {
  --color-bg: #ffffff;
  --color-surface: #f5f7fa;
  --color-surface-alt: #eef1f6;
  --color-border: #d1d9e6;
  --color-primary: #5b8dee;
  --color-primary-dark: #3a6fd8;
  --color-correct: #4caf7d;
  --color-wrong: #e05c5c;
  --color-text: #1a1a2e;
  --color-text-muted: #6b7280;
  --color-tab-active: #5b8dee;
  --color-tab-inactive: #9ca3af;
  --color-star: #f59e0b;

  /* Shape colors */
  --shape-cube: #7ec8e3;
  --shape-sphere: #f4a261;
  --shape-cone: #a78bfa;
  --shape-cylinder: #34d399;
  --shape-rectangular-prism: #60a5fa;
  --shape-square-pyramid: #fb923c;
  --shape-triangular-prism: #f472b6;
  --shape-tetrahedron: #a3e635;
  --shape-octahedron: #38bdf8;
  --shape-pentagonal-prism: #e879f9;
  --shape-hexagonal-prism: #4ade80;
  --shape-pentagonal-pyramid: #facc15;
  --shape-hexagonal-pyramid: #f87171;
  --shape-dodecahedron: #818cf8;
  --shape-icosahedron: #2dd4bf;
  --shape-torus: #fb7185;
  --shape-ellipsoid: #fbbf24;
  --shape-frustum: #a78bfa;
  --shape-truncated-pyramid: #6ee7b7;
  --shape-cuboctahedron: #93c5fd;
  --shape-rhombicuboctahedron: #fca5a5;
  --shape-triangular-antiprism: #86efac;
  --shape-square-antiprism: #fcd34d;
  --shape-truncated-tetrahedron: #c4b5fd;
  --shape-truncated-cube: #67e8f9;
  --shape-truncated-octahedron: #6d28d9;
  --shape-snub-cube: #dc2626;
  --shape-rhombic-dodecahedron: #059669;
  --shape-small-stellated-dodecahedron: #d97706;
  --shape-compound-cube-octahedron: #be185d;

  /* Typography */
  --font-body: system-ui, -apple-system, sans-serif;
  --font-size-base: 16px;
  --font-size-sm: 13px;
  --font-size-lg: 22px;
  --font-size-xl: 28px;

  /* Layout */
  --radius-card: 16px;
  --radius-btn: 12px;
  --spacing-gap: 16px;
  --header-height: 60px;
  --tab-height: 52px;
  --shelf-height: 120px;

  /* Three.js scene */
  --scene-bg: #e8eef7;
}
```

**Step 2: Create space.css**

```css
/* themes/space.css — space station theme (unlocked after all 5 levels) */
body.theme-space {
  --color-bg: #0d0d1a;
  --color-surface: #1a1a2e;
  --color-surface-alt: #16213e;
  --color-border: #2d3561;
  --color-primary: #7c9eff;
  --color-primary-dark: #4a6cf7;
  --color-text: #e0e8ff;
  --color-text-muted: #8892b0;
  --color-tab-active: #7c9eff;
  --color-tab-inactive: #4a5568;
  --scene-bg: #000814;
}
```

**Step 3: Create style.css (structural styles — theme-agnostic)**

```css
/* style.css — layout and component styles using CSS variables */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  background: var(--color-bg);
  color: var(--color-text);
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Header ─────────────────────────────────── */
#top-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-gap);
  padding: 0 16px;
  height: var(--header-height);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

#top-bar h1 {
  font-size: var(--font-size-lg);
  font-weight: 700;
  margin-right: auto;
}

#level-selector {
  display: flex;
  gap: 6px;
}

.level-btn {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  background: var(--color-surface-alt);
  color: var(--color-text-muted);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}

.level-btn.active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: #fff;
}

.level-btn.locked {
  opacity: 0.35;
  cursor: not-allowed;
}

#theme-btn {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  padding: 4px;
}

/* ── Tabs ───────────────────────────────────── */
#tabs {
  display: flex;
  height: var(--tab-height);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.tab-btn {
  flex: 1;
  border: none;
  background: none;
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-tab-inactive);
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.15s;
}

.tab-btn.active {
  color: var(--color-tab-active);
  border-bottom-color: var(--color-tab-active);
}

/* ── Main content ───────────────────────────── */
#content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--color-bg);
}

/* ── Collection shelf ───────────────────────── */
#collection-shelf {
  height: var(--shelf-height);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 8px 16px;
  flex-shrink: 0;
  overflow: hidden;
}

#collection-shelf h2 {
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin-bottom: 6px;
}

#collection-grid {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.collection-item {
  width: 64px; height: 64px;
  border-radius: var(--radius-card);
  background: var(--color-surface-alt);
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 10px;
  text-align: center;
  color: var(--color-text-muted);
  padding: 4px;
}

/* ── Shape card grid (Explore) ──────────────── */
.shape-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--spacing-gap);
  padding: var(--spacing-gap);
}

.shape-card {
  border-radius: var(--radius-card);
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  padding: 16px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  text-align: center;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.shape-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px #0002; }

.shape-card .shape-icon {
  width: 56px; height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.shape-card .shape-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text);
}

/* ── Explore detail view ────────────────────── */
#explore-detail {
  display: grid;
  grid-template-columns: 1fr 300px;
  height: 100%;
}

#scene-container {
  background: var(--scene-bg);
  cursor: grab;
}

#scene-container:active { cursor: grabbing; }

#shape-info-panel {
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);
}

.info-stat .label { color: var(--color-text-muted); font-size: var(--font-size-sm); }
.info-stat .value { font-weight: 700; font-size: var(--font-size-lg); }

.back-btn {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: var(--font-size-base);
  font-weight: 600;
  text-align: left;
  padding: 0;
  margin-bottom: 8px;
}

/* ── Quiz ───────────────────────────────────── */
#quiz-view {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
}

.quiz-progress {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.stars-row {
  display: flex;
  gap: 4px;
  font-size: 20px;
}

.quiz-question {
  font-size: var(--font-size-lg);
  font-weight: 700;
  margin-bottom: 24px;
  line-height: 1.4;
}

.quiz-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.quiz-option {
  padding: 16px;
  border-radius: var(--radius-btn);
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  font-weight: 500;
  min-height: 60px;
}

.quiz-option:hover { border-color: var(--color-primary); }
.quiz-option.correct { border-color: var(--color-correct); background: #4caf7d20; }
.quiz-option.wrong { border-color: var(--color-wrong); background: #e05c5c20; }

@keyframes shake {
  0%,100% { transform: translateX(0); }
  20%,60% { transform: translateX(-6px); }
  40%,80% { transform: translateX(6px); }
}

.shake { animation: shake 0.3s ease; }

/* ── Build ──────────────────────────────────── */
#build-view {
  padding: var(--spacing-gap);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-gap);
  height: 100%;
}

.build-shape-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
}

.build-shape-item {
  padding: 12px 16px;
  border-radius: var(--radius-btn);
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.15s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.build-shape-item.active { border-color: var(--color-primary); }
.build-shape-item.built::after { content: "✓"; color: var(--color-correct); }

.build-canvas-area {
  background: var(--scene-bg);
  border-radius: var(--radius-card);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;
}

.build-btn {
  padding: 14px 28px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-btn);
  font-size: var(--font-size-base);
  font-weight: 700;
  cursor: pointer;
}

/* ── Quiz results ───────────────────────────── */
.quiz-result {
  text-align: center;
  padding: 40px 24px;
}

.quiz-result h2 { font-size: var(--font-size-xl); margin-bottom: 16px; }
.quiz-result .stars-display { font-size: 48px; margin-bottom: 24px; }

.btn-primary {
  padding: 14px 32px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-btn);
  font-size: var(--font-size-base);
  font-weight: 700;
  cursor: pointer;
}

/* ── Responsive ─────────────────────────────── */
@media (max-width: 600px) {
  #explore-detail { grid-template-columns: 1fr; grid-template-rows: 55% 45%; }
  #shape-info-panel { border-left: none; border-top: 1px solid var(--color-border); }
  #build-view { grid-template-columns: 1fr; grid-template-rows: auto 1fr; }
  .quiz-options { grid-template-columns: 1fr; }
}
```

**Step 4: Commit**

```bash
git add public/games/shape-explorer/game/themes/ public/games/shape-explorer/game/style.css
git commit -m "feat: add shape-explorer CSS theme system and layout"
```

---

## Task 5: Three.js scene (Explore mode)

**Files:**
- Create: `public/games/shape-explorer/game/three-scene.js`

**Step 1: Create three-scene.js**

```js
// three-scene.js — Three.js scene for Explore mode
export class ShapeScene {
  constructor(container) {
    this.container = container;
    this.isDragging = false;
    this.prevMouse = { x: 0, y: 0 };
    this._init();
  }

  _init() {
    const { THREE } = window;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(
      getComputedStyle(document.documentElement).getPropertyValue('--scene-bg').trim() || '#e8eef7'
    );

    this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    this.camera.position.set(0, 0, 4);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 8, 5);
    this.scene.add(ambient, dirLight);

    this.mesh = null;
    this._bindEvents();
    this._animate();
  }

  loadShape(shapeData) {
    const { THREE } = window;
    if (this.mesh) { this.scene.remove(this.mesh); this.mesh.geometry.dispose(); }

    const GeomClass = THREE[shapeData.geometry];
    if (!GeomClass) return;

    const geo = new GeomClass(...(shapeData.geometryArgs || []));
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue(shapeData.colorVar).trim() || '#7ec8e3';

    const mat = new THREE.MeshPhongMaterial({ color, shininess: 60 });
    this.mesh = new THREE.Mesh(geo, mat);

    if (shapeData.scale) {
      this.mesh.scale.set(...shapeData.scale);
    }

    this.scene.add(this.mesh);
    this.mesh.rotation.set(0.3, 0.5, 0);
  }

  _animate() {
    this._raf = requestAnimationFrame(() => this._animate());
    if (this.mesh && !this.isDragging) {
      this.mesh.rotation.y += 0.005;
    }
    this.renderer.render(this.scene, this.camera);
  }

  _bindEvents() {
    const el = this.renderer.domElement;

    const start = (x, y) => { this.isDragging = true; this.prevMouse = { x, y }; };
    const move = (x, y) => {
      if (!this.isDragging || !this.mesh) return;
      const dx = x - this.prevMouse.x;
      const dy = y - this.prevMouse.y;
      this.mesh.rotation.y += dx * 0.01;
      this.mesh.rotation.x += dy * 0.01;
      this.prevMouse = { x, y };
    };
    const end = () => { this.isDragging = false; };

    el.addEventListener('mousedown', e => start(e.clientX, e.clientY));
    el.addEventListener('mousemove', e => move(e.clientX, e.clientY));
    el.addEventListener('mouseup', end);
    el.addEventListener('touchstart', e => { const t = e.touches[0]; start(t.clientX, t.clientY); }, { passive: true });
    el.addEventListener('touchmove', e => { const t = e.touches[0]; move(t.clientX, t.clientY); }, { passive: true });
    el.addEventListener('touchend', end);

    window.addEventListener('resize', () => {
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  destroy() {
    cancelAnimationFrame(this._raf);
    this.renderer.dispose();
    this.container.innerHTML = '';
  }
}
```

**Step 2: Commit**

```bash
git add public/games/shape-explorer/game/three-scene.js
git commit -m "feat: add Three.js scene for shape rotation"
```

---

## Task 6: Quiz engine

**Files:**
- Create: `public/games/shape-explorer/game/quiz.js`

**Step 1: Create quiz.js**

```js
// quiz.js — question generation and scoring

const QUESTION_TYPES = ['name', 'faces', 'edges', 'vertices', 'realWorld'];

function pick(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function pickWrong(shapes, correct, field, count) {
  const others = shapes.filter(s => s.id !== correct.id && s[field] !== correct[field]);
  return pick(others, count).map(s => s[field]);
}

export function generateQuestions(shapes, count = 10) {
  const pool = pick(shapes, Math.min(shapes.length, count));
  return pool.map(shape => {
    const type = pick(QUESTION_TYPES.filter(t => {
      if (t === 'vertices' && shape.geometry?.includes('Sphere')) return false;
      return true;
    }), 1)[0];
    return buildQuestion(shape, type, shapes);
  });
}

function buildQuestion(shape, type, allShapes) {
  switch (type) {
    case 'name': {
      const wrongs = pick(allShapes.filter(s => s.id !== shape.id), 3).map(s => s.name);
      return {
        text: `What is this shape called?`,
        shapeId: shape.id,
        answer: shape.name,
        options: shuffle([shape.name, ...wrongs]),
      };
    }
    case 'faces': {
      const correct = shape.faces + shape.curvedFaces;
      const wrongs = [correct - 1, correct + 1, correct + 2].filter(n => n >= 0 && n !== correct);
      return {
        text: `How many faces does a ${shape.name} have?`,
        shapeId: shape.id,
        answer: String(correct),
        options: shuffle([String(correct), ...wrongs.slice(0, 3).map(String)]),
      };
    }
    case 'edges': {
      const wrongs = [shape.edges - 1, shape.edges + 2, shape.edges + 4].filter(n => n >= 0 && n !== shape.edges);
      return {
        text: `How many edges does a ${shape.name} have?`,
        shapeId: shape.id,
        answer: String(shape.edges),
        options: shuffle([String(shape.edges), ...wrongs.slice(0, 3).map(String)]),
      };
    }
    case 'vertices': {
      const wrongs = [shape.vertices - 1, shape.vertices + 2, shape.vertices + 4].filter(n => n >= 0 && n !== shape.vertices);
      return {
        text: `How many vertices (corners) does a ${shape.name} have?`,
        shapeId: shape.id,
        answer: String(shape.vertices),
        options: shuffle([String(shape.vertices), ...wrongs.slice(0, 3).map(String)]),
      };
    }
    case 'realWorld': {
      const realWorlds = allShapes.filter(s => s.id !== shape.id).map(s => s.realWorld.split(',')[0].trim());
      const wrongs = pick(realWorlds, 3);
      const correct = shape.realWorld.split(',')[0].trim();
      return {
        text: `Which real-world object is a ${shape.name}?`,
        shapeId: shape.id,
        answer: correct,
        options: shuffle([correct, ...wrongs]),
      };
    }
  }
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function calcStars(correct, total) {
  const pct = correct / total;
  if (pct === 1) return 3;
  if (pct >= 0.7) return 2;
  if (pct >= 0.4) return 1;
  return 0;
}
```

**Step 2: Commit**

```bash
git add public/games/shape-explorer/game/quiz.js
git commit -m "feat: add quiz question engine"
```

---

## Task 7: State management

**Files:**
- Create: `public/games/shape-explorer/game/state.js`

**Step 1: Create state.js**

```js
// state.js — localStorage-backed game state

const KEY = 'shape-explorer-state';

const defaults = {
  stars: {},        // { "1": 3, "2": 2, ... }
  built: [],        // ["cube", "sphere", ...]
  unlockedThemes: [],
  currentTheme: 'clean',
};

export const state = {
  _data: null,

  load() {
    try {
      this._data = JSON.parse(localStorage.getItem(KEY)) || { ...defaults };
    } catch {
      this._data = { ...defaults };
    }
    return this;
  },

  save() {
    localStorage.setItem(KEY, JSON.stringify(this._data));
  },

  getStars(level) { return this._data.stars[level] ?? 0; },

  setStars(level, stars) {
    this._data.stars[level] = Math.max(this._data.stars[level] ?? 0, stars);
    this.save();
  },

  isLevelUnlocked(level) {
    if (level === 1) return true;
    return (this._data.stars[level - 1] ?? 0) >= 2;
  },

  isBuilt(shapeId) { return this._data.built.includes(shapeId); },

  markBuilt(shapeId) {
    if (!this.isBuilt(shapeId)) {
      this._data.built.push(shapeId);
      this.save();
    }
  },

  getCurrentTheme() { return this._data.currentTheme; },

  setTheme(name) {
    this._data.currentTheme = name;
    this.save();
  },

  isThemeUnlocked(name) {
    if (name === 'clean') return true;
    return this._data.unlockedThemes.includes(name);
  },

  unlockTheme(name) {
    if (!this._data.unlockedThemes.includes(name)) {
      this._data.unlockedThemes.push(name);
      this.save();
    }
  },

  checkSpaceUnlock() {
    // Space unlocks when all 5 levels have 2+ stars
    const allDone = [1,2,3,4,5].every(l => (this._data.stars[l] ?? 0) >= 2);
    if (allDone) this.unlockTheme('space');
  },
};
```

**Step 2: Commit**

```bash
git add public/games/shape-explorer/game/state.js
git commit -m "feat: add localStorage state management"
```

---

## Task 8: Main app bootstrap & Explore mode

**Files:**
- Create: `public/games/shape-explorer/game/main.js`

**Step 1: Create main.js**

```js
// main.js — app bootstrap, tab routing, Explore mode
import { SHAPES, getShapesByLevel } from './shapes.js';
import { ShapeScene } from './three-scene.js';
import { generateQuestions, calcStars } from './quiz.js';
import { state } from './state.js';

state.load();

let currentLevel = 1;
let currentTab = 'explore';
let scene = null;

// ── Theme ────────────────────────────────────────────────────────────────
function applyTheme(name) {
  document.body.className = name === 'clean' ? '' : `theme-${name}`;
  state.setTheme(name);
}

document.getElementById('theme-btn').addEventListener('click', () => {
  const themes = ['clean', 'space'].filter(t => state.isThemeUnlocked(t));
  const current = state.getCurrentTheme();
  const next = themes[(themes.indexOf(current) + 1) % themes.length];
  applyTheme(next);
});

applyTheme(state.getCurrentTheme());

// ── Level selector ───────────────────────────────────────────────────────
function renderLevelSelector() {
  const el = document.getElementById('level-selector');
  el.innerHTML = [1,2,3,4,5].map(l => {
    const locked = !state.isLevelUnlocked(l);
    const stars = state.getStars(l);
    return `<button class="level-btn ${l === currentLevel ? 'active' : ''} ${locked ? 'locked' : ''}"
      data-level="${l}" title="Level ${l} — ${stars}⭐">${l}</button>`;
  }).join('');

  el.querySelectorAll('.level-btn:not(.locked)').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLevel = Number(btn.dataset.level);
      renderLevelSelector();
      renderTab(currentTab);
    });
  });
}

// ── Tabs ─────────────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTab = btn.dataset.tab;
    renderTab(currentTab);
  });
});

function renderTab(tab) {
  if (scene) { scene.destroy(); scene = null; }
  const content = document.getElementById('content');
  content.innerHTML = '';
  if (tab === 'explore') renderExplore(content);
  else if (tab === 'quiz') renderQuiz(content);
  else if (tab === 'build') renderBuild(content);
}

// ── Explore mode ─────────────────────────────────────────────────────────
function renderExplore(container) {
  const shapes = getShapesByLevel(currentLevel);
  const grid = document.createElement('div');
  grid.className = 'shape-grid';

  shapes.forEach(shape => {
    const card = document.createElement('div');
    card.className = 'shape-card';
    const color = getComputedStyle(document.documentElement).getPropertyValue(shape.colorVar).trim();
    card.innerHTML = `
      <div class="shape-icon" style="background:${color}30; color:${color}">⬡</div>
      <div class="shape-name">${shape.name}</div>
      ${state.isBuilt(shape.id) ? '<div style="font-size:11px;color:var(--color-correct)">✓ Built</div>' : ''}
    `;
    card.addEventListener('click', () => openShapeDetail(shape, container));
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

function openShapeDetail(shape, container) {
  if (scene) { scene.destroy(); scene = null; }
  container.innerHTML = `
    <div id="explore-detail">
      <div id="scene-container"></div>
      <div id="shape-info-panel">
        <button class="back-btn">← Back</button>
        <h2 style="font-size:var(--font-size-lg);font-weight:700">${shape.name}</h2>
        <div class="info-stat"><span class="label">Level</span><span class="value">${shape.level}</span></div>
        <div class="info-stat"><span class="label">Faces</span><span class="value">${shape.faces + shape.curvedFaces}</span></div>
        <div class="info-stat"><span class="label">Edges</span><span class="value">${shape.edges}</span></div>
        <div class="info-stat"><span class="label">Vertices</span><span class="value">${shape.vertices}</span></div>
        ${shape.curvedFaces ? `<div class="info-stat"><span class="label">Curved faces</span><span class="value">${shape.curvedFaces}</span></div>` : ''}
        ${shape.eulerCheck ? `<div class="info-stat"><span class="label">Euler's formula</span><span class="value" style="font-size:13px">F−E+V = ${shape.faces}−${shape.edges}+${shape.vertices} = 2 ✓</span></div>` : ''}
        <div style="padding:8px 0;border-top:1px solid var(--color-border);color:var(--color-text-muted);font-size:var(--font-size-sm)">
          <strong>Real world:</strong> ${shape.realWorld}
        </div>
      </div>
    </div>
  `;

  container.querySelector('.back-btn').addEventListener('click', () => renderExplore(container));

  const sceneEl = container.querySelector('#scene-container');
  scene = new ShapeScene(sceneEl);
  scene.loadShape(shape);
}

// ── Quiz mode ─────────────────────────────────────────────────────────────
function renderQuiz(container) {
  const shapes = getShapesByLevel(currentLevel);
  const questions = generateQuestions(shapes, 10);
  let qIndex = 0;
  let correct = 0;

  function showQuestion() {
    if (qIndex >= questions.length) { showResult(); return; }
    const q = questions[qIndex];
    container.innerHTML = `
      <div id="quiz-view">
        <div class="quiz-progress">
          <span style="color:var(--color-text-muted);font-size:var(--font-size-sm)">Question ${qIndex + 1} / ${questions.length}</span>
          <span style="color:var(--color-text-muted);font-size:var(--font-size-sm)">✓ ${correct}</span>
        </div>
        <div class="quiz-question">${q.text}</div>
        <div class="quiz-options">
          ${q.options.map(opt => `<button class="quiz-option" data-val="${opt}">${opt}</button>`).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const chosen = btn.dataset.val;
        const isCorrect = chosen === q.answer;
        if (isCorrect) {
          correct++;
          btn.classList.add('correct');
        } else {
          btn.classList.add('wrong');
          container.querySelector(`[data-val="${q.answer}"]`)?.classList.add('correct');
        }
        container.querySelectorAll('.quiz-option').forEach(b => b.disabled = true);
        setTimeout(() => { qIndex++; showQuestion(); }, 1000);
      });
    });
  }

  function showResult() {
    const stars = calcStars(correct, questions.length);
    state.setStars(currentLevel, stars);
    state.checkSpaceUnlock();
    renderLevelSelector();

    container.innerHTML = `
      <div class="quiz-result">
        <h2>${correct}/${questions.length} correct!</h2>
        <div class="stars-display">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
        <p style="color:var(--color-text-muted);margin-bottom:24px">
          ${stars >= 2 ? 'Level unlocked!' : 'Score 70%+ to unlock the next level.'}
        </p>
        <button class="btn-primary">Try Again</button>
      </div>
    `;
    container.querySelector('.btn-primary').addEventListener('click', () => renderQuiz(container));
  }

  showQuestion();
}

// ── Build mode ────────────────────────────────────────────────────────────
function renderBuild(container) {
  const shapes = getShapesByLevel(currentLevel).filter(s => s.netAvailable || s.curvedFaces > 0);

  container.innerHTML = `
    <div id="build-view">
      <div class="build-shape-list">
        ${shapes.map(s => `
          <div class="build-shape-item ${state.isBuilt(s.id) ? 'built' : ''}" data-id="${s.id}">
            ${s.name}
          </div>
        `).join('')}
      </div>
      <div class="build-canvas-area" id="build-canvas">
        <p style="color:var(--color-text-muted)">Select a shape to build →</p>
      </div>
    </div>
  `;

  container.querySelectorAll('.build-shape-item').forEach(item => {
    item.addEventListener('click', () => {
      container.querySelectorAll('.build-shape-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      openBuildShape(getShapesByLevel(currentLevel).find(s => s.id === item.dataset.id), container.querySelector('#build-canvas'));
    });
  });
}

function openBuildShape(shape, canvas) {
  canvas.innerHTML = `
    <div style="text-align:center;padding:24px">
      <h3 style="font-size:var(--font-size-lg);margin-bottom:12px">Build a ${shape.name}</h3>
      <p style="color:var(--color-text-muted);margin-bottom:24px;font-size:var(--font-size-sm)">
        ${shape.netAvailable
          ? `This shape has ${shape.faces + shape.curvedFaces} face(s), ${shape.edges} edges, and ${shape.vertices} vertices.`
          : `This is a curved shape with ${shape.curvedFaces} curved surface(s).`
        }
      </p>
      <div style="font-size:48px;margin-bottom:24px">🔨</div>
      <button class="build-btn" id="do-build">Assemble Shape!</button>
    </div>
  `;

  canvas.querySelector('#do-build').addEventListener('click', () => {
    state.markBuilt(shape.id);
    renderCollection();

    canvas.innerHTML = `
      <div style="text-align:center;padding:24px">
        <div style="font-size:64px">🎉</div>
        <h3 style="font-size:var(--font-size-lg);margin:16px 0">${shape.name} built!</h3>
        <p style="color:var(--color-text-muted)">Added to your collection.</p>
      </div>
    `;
  });
}

// ── Collection shelf ──────────────────────────────────────────────────────
function renderCollection() {
  const grid = document.getElementById('collection-grid');
  const built = SHAPES.filter(s => state.isBuilt(s.id));
  grid.innerHTML = built.length === 0
    ? '<span style="color:var(--color-text-muted);font-size:13px">No shapes built yet — try Build mode!</span>'
    : built.map(s => {
        const color = getComputedStyle(document.documentElement).getPropertyValue(s.colorVar).trim();
        return `<div class="collection-item" style="border-color:${color};color:${color}">${s.name}</div>`;
      }).join('');
}

// ── Init ──────────────────────────────────────────────────────────────────
renderLevelSelector();
renderTab('explore');
renderCollection();
```

**Step 2: Verify game runs locally**

```bash
npm run dev
```

Open http://localhost:4321/games/shape-explorer/play — confirm:
- Three tabs render
- Level selector shows 5 buttons (only L1 active)
- Explore grid shows 7 shapes
- Clicking a shape shows the 3D scene with rotation
- Quiz generates 10 questions with multiple choice
- Build mode lists available shapes and shows "assembled" confirmation

**Step 3: Run tests**

```bash
npm test
```

Expected: all tests pass.

**Step 4: Commit**

```bash
git add public/games/shape-explorer/game/main.js
git commit -m "feat: add shape-explorer main app (Explore, Quiz, Build modes)"
```

---

## Task 9: Final verification & deploy

**Step 1: Run full test suite**

```bash
npm test
```

Expected: all tests pass.

**Step 2: Build for production**

```bash
npm run build
```

Expected: no errors.

**Step 3: Manual smoke test (dev server)**

```bash
npm run dev
```

Checklist:
- [ ] http://localhost:4321 — shape-explorer card appears in portal
- [ ] http://localhost:4321/games/shape-explorer — detail page loads, thumbnail visible
- [ ] http://localhost:4321/games/shape-explorer/play — iframe plays the game
- [ ] Explore: click any L1 shape → 3D model rotates → info panel shows correct stats
- [ ] Quiz: complete a quiz → stars awarded → Level 2 unlocks at 2+ stars
- [ ] Build: select a shape → click Assemble → appears in collection shelf
- [ ] Theme button cycles Clean → Space (after unlocking)
- [ ] Refresh page → state persists (stars, collection)

**Step 4: Push to deploy**

```bash
git push
```

---
