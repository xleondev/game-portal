# 2048 Animation System — Design Doc

**Date:** 2026-03-08
**Status:** Approved

## Problem

The current `render()` destroys and recreates all 16 tiles on every move. Tiles cannot slide — they teleport to new positions. There are no merge or spawn animations.

## Approach

Tile identity tracking + absolute positioning. Tile DOM elements persist across moves and are repositioned via CSS transitions.

## Architecture

### Two-layer board

```
#board-container (position: relative)
  #board               ← 16 static .cell-bg divs (CSS grid background)
  #tile-layer          ← tile elements, position: absolute, inset: 0
```

### Tile positioning

Each tile is absolutely positioned using CSS custom properties:

```css
.tile {
  position: absolute;
  width: calc((100% - 50px) / 4);
  height: calc((100% - 50px) / 4);
  left: calc(10px + var(--c) * ((100% - 50px) / 4 + 10px));
  top:  calc(10px + var(--r) * ((100% - 50px) / 4 + 10px));
  transition: left 0.12s ease, top 0.12s ease;
}
```

Updating `--r` / `--c` triggers a CSS-driven slide.

### State model

| Variable | Type | Description |
|---|---|---|
| `tileMap` | `Map<id, {value, row, col, el}>` | Live tile registry |
| `idBoard` | `number\|null[]` (16) | Tile ID at each cell |
| `valueBoard` | `number[]` (16) | Tile value at each cell |
| `moving` | `boolean` | Input lock during animation |

### Move computation: `doMove(direction)`

Replaces the imported `moveBoard`. Computes:
- New `idBoard` + `valueBoard`
- `moves[]` — `{id, toRow, toCol, mergedFrom?}` for each tile
- `toRemove[]` — IDs of loser tiles (slide to winner position, then disappear)

### Animation sequence in `handleMove`

```
1. doMove(direction)         → get moves, toRemove
2. moveTile(id, r, c)        → for all moves (CSS transitions fire)
3. await 120ms
4. removeTile(loser ids)
5. triggerMergeAnim(winner)  → update value + play bounce keyframe
6. update score display
7. await 30ms
8. spawnRandomTile()         → with pop-in animation
9. moving = false
10. checkWin / checkGameOver
```

### Animations

| Event | CSS | Easing | Duration |
|---|---|---|---|
| Tile slide | `left` + `top` transition | `ease` | 120ms |
| Merge bounce | `@keyframes tile-pop` (scale 1→0.8→1) | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 250ms |
| New tile spawn | `@keyframes tile-appear` (scale 0→1) | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 200ms |

Spring easing `cubic-bezier(0.34, 1.56, 0.64, 1)` produces a natural overshoot-bounce without explicit multi-keyframe percentages.

## Files Changed

| File | Change |
|---|---|
| `index.html` | Add `<div id="tile-layer"></div>` inside `#board-container` |
| `style.css` | Add `.cell-bg`, `#tile-layer`; update `.tile` for absolute positioning; replace old animations with new keyframes |
| `game.js` | Complete rewrite of state/render/move. Import only `checkWin` + `checkGameOver` from `logic.js` |

## Files Unchanged

- `logic.js` — pure functions, all tests still pass
- `logic.test.js` — no changes needed
- `games.json` — no changes needed
