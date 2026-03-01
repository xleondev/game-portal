# Shape Explorer — Game Design Document

**Date:** 2026-03-01
**Target:** Ages 6–9 (Grades 1–4 core), content spans Grades 1–12
**Stack:** Vanilla HTML/CSS/JS, Three.js r165 (CDN), no build step

---

## Overview

A browser-based 3D shapes learning game with three interactive modes — Explore, Quiz, and Build — covering ~30 shapes across 5 difficulty levels (Grade 1–12 curriculum). Clean educational aesthetic by default; Space Station theme unlocks after completing all levels.

---

## Shapes & Levels

### Level 1 — Basic (Grades 1–2)
Cube, Sphere, Cone, Cylinder, Rectangular Prism, Square Pyramid, Triangular Prism

### Level 2 — Elementary (Grades 3–4)
Tetrahedron, Octahedron, Pentagonal Prism, Hexagonal Prism, Pentagonal Pyramid, Hexagonal Pyramid

### Level 3 — Intermediate (Grades 5–6)
Dodecahedron, Icosahedron, Torus, Ellipsoid, Frustum (Truncated Cone), Truncated Pyramid

### Level 4 — Advanced (Grades 7–9)
Cuboctahedron, Rhombicuboctahedron, Triangular Antiprism, Square Antiprism, Truncated Tetrahedron, Truncated Cube

### Level 5 — Expert (Grades 10–12)
Truncated Octahedron, Snub Cube, Rhombic Dodecahedron, Small Stellated Dodecahedron, Compound of Cube & Octahedron

**Level gating:** Level 1 always unlocked. Each subsequent level requires 2+ stars on the previous level's Quiz.

### Properties by Level
- **L1–L2:** Name, faces, edges, vertices, real-world example
- **L3–L4:** Adds flat vs. curved surfaces, net preview, Euler's formula (F − E + V = 2)
- **L5:** Adds stellations, dual polyhedra, non-convex properties

---

## Game Architecture

Single HTML page, three always-visible tabs. Level selector (1–5) at the top. Shape grid shows all shapes in the selected level.

### Tab 1 — Explore
- Shape rendered in Three.js center stage; click-drag to rotate freely
- Hotspots on faces/edges/vertices — tap to see label pop-up
- Info panel: name, face count, edge count, vertex count, real-world example
- L3+: "Show Net" button, Euler's formula display
- No scoring — pure curiosity mode

### Tab 2 — Quiz
- 10 questions per session, randomly drawn from current level
- Question types: name the shape, count faces/edges/vertices, odd-one-out, match to real-world object
- Multiple-choice (4 options) — no typing
- Immediate feedback: green flash + sound on correct; red shake + correct answer shown on wrong
- Stars: 10/10 = 3 stars, 7–9 = 2 stars, 4–6 = 1 star (stored in localStorage per level)
- 2+ stars unlocks next level

### Tab 3 — Build
- Polyhedra: presented as a flat net; kid clicks segments to fold
- Curved shapes: drag-and-drop assembly of pieces
- Completion: shape snaps together with pop + confetti burst
- Built shapes added to persistent "Collection" shelf at the bottom
- Each built shape earns a badge on its Explore card

### Themed Mode — Space Station (unlocked after all 5 levels)
Same three tabs and mechanics; shapes rendered as metallic station modules; star-field background. Purely cosmetic.

---

## Theme System

All visual decisions live in CSS custom properties. Switching themes = swapping a CSS file; zero JS changes required.

```css
:root {
  /* Colors */
  --color-bg: #ffffff;
  --color-surface: #f5f7fa;
  --color-primary: #5b8dee;
  --color-correct: #4caf7d;
  --color-wrong: #e05c5c;
  --color-text: #1a1a2e;
  --color-text-muted: #6b7280;

  /* Shape palette */
  --shape-cube: #7ec8e3;
  --shape-sphere: #f4a261;
  /* one token per shape */

  /* Typography */
  --font-body: system-ui, sans-serif;
  --font-size-base: 18px;
  --font-size-lg: 24px;

  /* Radii & spacing */
  --radius-card: 16px;
  --radius-btn: 12px;
  --spacing-gap: 20px;

  /* Three.js scene */
  --scene-bg: #e8eef7;
  --scene-ambient: #ffffff;
  --scene-light: #ffffff;
}

body.theme-space {
  --color-bg: #0d0d1a;
  --color-surface: #1a1a2e;
  --color-text: #e0e8ff;
  --scene-bg: #000010;
}
```

Themes are registered as CSS files in `game/themes/`. A palette icon in the top-right switches between available themes. Adding a new theme requires only a new CSS file — no JS changes.

---

## UI Design

```
┌─────────────────────────────────────────┐
│  Shape Explorer        Level: [1][2][3][4][5] │
├─────────────────────────────────────────┤
│  [Explore]  [Quiz]  [Build]             │
├─────────────────────────────────────────┤
│                                         │
│           (mode content)                │
│                                         │
├─────────────────────────────────────────┤
│  Collection shelf (built shapes)        │
└─────────────────────────────────────────┘
```

- White background, clean sans-serif
- Each shape has a consistent pastel color used across all modes
- Minimum 44px tap targets
- Feedback: green flash / red shake (color + icon, never color alone)
- Level unlock: shine animation on newly unlocked badge
- Build completion: pop + confetti burst

---

## Technical Implementation

### File Structure
```
public/games/shape-explorer/
  game/
    index.html          ← entry point
    main.js             ← app bootstrap, tab routing
    shapes.js           ← shape data (all 30 shapes, all levels)
    three-scene.js      ← Three.js setup, rotation, hotspots
    quiz.js             ← question engine, scoring
    build.js            ← net/assembly mode
    themes/
      clean.css         ← default theme tokens
      space.css         ← space station theme tokens
    assets/
      sounds/           ← correct.mp3, wrong.mp3, complete.mp3
  thumbnail.svg
```

### Shape Data Format
```js
{
  id: "cube",
  name: "Cube",
  level: 1,
  color: "--shape-cube",
  faces: 6, edges: 12, vertices: 8,
  curvedFaces: 0,
  realWorld: "Dice, building blocks",
  eulerCheck: true,
  netAvailable: true,
  geometry: "BoxGeometry",
  geometryArgs: [1, 1, 1]
}
```

### localStorage State
```js
{
  stars: { 1: 3, 2: 2 },
  built: ["cube", "sphere"],
  unlockedThemes: ["space"],
  currentTheme: "clean"
}
```

### Dependencies
- `three.js` r165 (CDN) — 3D rendering
- Vanilla JS throughout — no bundler, no framework

---

## Accessibility
- All text ≥ 16px
- Color never the sole feedback indicator (icon + color)
- Keyboard-navigable tabs and quiz choices
