# 2048 Game Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a classic 2048 sliding tile puzzle to the game portal as a standalone vanilla JS game.

**Architecture:** Split into `logic.js` (pure functions, fully testable with Vitest) and `game.js` (DOM rendering + input handling, imports logic). This separation lets us TDD the merge/move algorithms without a browser.

**Tech Stack:** Vanilla HTML/CSS/JS. No frameworks, no CDN libraries. Vitest for unit tests.

---

## File Map (create all of these)

```
public/games/2048/
  game/
    index.html          ← required entry point
    style.css           ← board layout, tile colors, animations
    logic.js            ← pure game logic (testable)
    logic.test.js       ← Vitest unit tests for logic
    game.js             ← DOM rendering + input, imports logic
  thumbnail.svg         ← SVG board preview
```

Modify:
- `src/data/games.json` ← add 2048 entry

---

## Task 1: Create directory structure and index.html

**Files:**
- Create: `public/games/2048/game/index.html`

**Step 1: Create the HTML shell**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <title>2048</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Clear+Sans:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="app">
    <div id="header">
      <h1>2048</h1>
      <div id="score-container">
        <div class="score-box">
          <span class="score-label">SCORE</span>
          <span id="score">0</span>
        </div>
      </div>
    </div>
    <div id="controls">
      <button id="new-game-btn">New Game</button>
    </div>
    <div id="board-container">
      <div id="board"></div>
    </div>
    <div id="overlay" class="hidden">
      <div id="overlay-content">
        <h2 id="overlay-title"></h2>
        <button id="overlay-btn">New Game</button>
      </div>
    </div>
  </div>
  <script type="module" src="game.js"></script>
</body>
</html>
```

**Step 2: Commit**

```bash
git add public/games/2048/game/index.html
git commit -m "feat(2048): add HTML shell"
```

---

## Task 2: Core merge logic (TDD)

**Files:**
- Create: `public/games/2048/game/logic.test.js`
- Create: `public/games/2048/game/logic.js`

**Step 1: Write the failing tests first**

Create `public/games/2048/game/logic.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { slideRow, moveBoard, addRandomTile, checkWin, checkGameOver, createBoard } from './logic.js';

describe('slideRow', () => {
  it('slides tiles left, fills right with zeros', () => {
    expect(slideRow([0, 2, 0, 2])).toEqual({ row: [4, 0, 0, 0], score: 4 });
  });

  it('merges equal tiles only once per move', () => {
    expect(slideRow([2, 2, 2, 2])).toEqual({ row: [4, 4, 0, 0], score: 8 });
  });

  it('does not merge different tiles', () => {
    expect(slideRow([2, 4, 2, 4])).toEqual({ row: [2, 4, 2, 4], score: 0 });
  });

  it('handles already-merged tile not re-merging', () => {
    expect(slideRow([4, 2, 2, 0])).toEqual({ row: [4, 4, 0, 0], score: 4 });
  });

  it('returns same row when no moves possible', () => {
    expect(slideRow([2, 4, 8, 16])).toEqual({ row: [2, 4, 8, 16], score: 0 });
  });

  it('slides all tiles left', () => {
    expect(slideRow([0, 0, 0, 4])).toEqual({ row: [4, 0, 0, 0], score: 0 });
  });
});

describe('moveBoard', () => {
  it('moves left correctly', () => {
    const board = [2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const result = moveBoard(board, 'left');
    expect(result.board[0]).toBe(4);
    expect(result.board[1]).toBe(0);
    expect(result.score).toBe(4);
  });

  it('moves right correctly', () => {
    const board = [2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const result = moveBoard(board, 'right');
    expect(result.board[3]).toBe(4);
    expect(result.board[2]).toBe(0);
  });

  it('moves up correctly', () => {
    const board = [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0];
    const result = moveBoard(board, 'up');
    expect(result.board[0]).toBe(4); // col 0, row 0
  });

  it('moves down correctly', () => {
    const board = [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0];
    const result = moveBoard(board, 'down');
    expect(result.board[12]).toBe(4); // col 0, row 3
  });

  it('returns unchanged=true when no movement possible', () => {
    const board = [2, 4, 8, 16, 4, 8, 16, 32, 8, 16, 32, 64, 16, 32, 64, 128];
    const result = moveBoard(board, 'left');
    expect(result.unchanged).toBe(true);
  });
});

describe('addRandomTile', () => {
  it('places a tile on an empty cell', () => {
    const board = Array(16).fill(0);
    board[0] = 2;
    const result = addRandomTile(board);
    const nonZero = result.filter(v => v !== 0);
    expect(nonZero.length).toBe(2);
  });

  it('places only 2 or 4', () => {
    const board = Array(16).fill(0);
    const result = addRandomTile(board);
    const newVal = result.find(v => v !== 0);
    expect([2, 4]).toContain(newVal);
  });

  it('does not modify a full board', () => {
    const board = Array(16).fill(2);
    const result = addRandomTile(board);
    expect(result).toEqual(board);
  });
});

describe('checkWin', () => {
  it('returns true when 2048 is present', () => {
    const board = Array(16).fill(0);
    board[5] = 2048;
    expect(checkWin(board)).toBe(true);
  });

  it('returns false when no 2048', () => {
    const board = Array(16).fill(0);
    board[5] = 1024;
    expect(checkWin(board)).toBe(false);
  });
});

describe('checkGameOver', () => {
  it('returns false when empty cells exist', () => {
    const board = Array(16).fill(2);
    board[0] = 0;
    expect(checkGameOver(board)).toBe(false);
  });

  it('returns false when adjacent merges are possible', () => {
    // Row of 2,2,4,8 — 2 and 2 can merge
    const board = [2, 2, 4, 8, 4, 8, 16, 32, 8, 16, 32, 64, 16, 32, 64, 128];
    expect(checkGameOver(board)).toBe(false);
  });

  it('returns true when no moves remain', () => {
    const board = [2, 4, 8, 16, 4, 8, 16, 32, 8, 16, 32, 64, 16, 32, 64, 128];
    expect(checkGameOver(board)).toBe(true);
  });
});

describe('createBoard', () => {
  it('returns a 16-element array', () => {
    expect(createBoard().length).toBe(16);
  });

  it('starts with exactly 2 tiles', () => {
    const board = createBoard();
    const nonZero = board.filter(v => v !== 0);
    expect(nonZero.length).toBe(2);
  });
});
```

**Step 2: Run the tests to verify they fail**

```bash
npm test
```

Expected: FAIL — module not found / functions not defined.

**Step 3: Implement logic.js**

Create `public/games/2048/game/logic.js`:

```js
export const SIZE = 4;

/** Slide a single row left, merging equal adjacent tiles. Returns { row, score }. */
export function slideRow(row) {
  // Remove zeros, compact left
  const tiles = row.filter(v => v !== 0);
  let score = 0;
  for (let i = 0; i < tiles.length - 1; i++) {
    if (tiles[i] === tiles[i + 1]) {
      tiles[i] *= 2;
      score += tiles[i];
      tiles.splice(i + 1, 1);
    }
  }
  // Pad right with zeros
  while (tiles.length < SIZE) tiles.push(0);
  return { row: tiles, score };
}

/** Rotate board 90° clockwise. Used to reuse slideRow for all directions. */
function rotateCW(board) {
  const out = Array(16).fill(0);
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++)
      out[c * SIZE + (SIZE - 1 - r)] = board[r * SIZE + c];
  return out;
}

/** Apply moveBoard in 'left' direction, rotate board to handle other directions. */
export function moveBoard(board, direction) {
  // Rotate so we always process "left"
  const rotations = { left: 0, up: 1, right: 2, down: 3 };
  let b = [...board];
  const times = rotations[direction];
  for (let i = 0; i < times; i++) b = rotateCW(b);

  let totalScore = 0;
  const newB = [];
  for (let r = 0; r < SIZE; r++) {
    const row = b.slice(r * SIZE, r * SIZE + SIZE);
    const { row: slid, score } = slideRow(row);
    newB.push(...slid);
    totalScore += score;
  }

  // Rotate back
  const backTimes = (4 - times) % 4;
  let result = newB;
  for (let i = 0; i < backTimes; i++) result = rotateCW(result);

  const unchanged = result.every((v, i) => v === board[i]);
  return { board: result, score: totalScore, unchanged };
}

/** Place a 2 (90%) or 4 (10%) on a random empty cell. Returns new board. */
export function addRandomTile(board) {
  const empty = board.map((v, i) => v === 0 ? i : -1).filter(i => i !== -1);
  if (empty.length === 0) return board;
  const idx = empty[Math.floor(Math.random() * empty.length)];
  const val = Math.random() < 0.9 ? 2 : 4;
  const next = [...board];
  next[idx] = val;
  return next;
}

/** Returns true if any tile equals 2048. */
export function checkWin(board) {
  return board.includes(2048);
}

/** Returns true when no empty cells and no adjacent merges are possible. */
export function checkGameOver(board) {
  if (board.includes(0)) return false;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = board[r * SIZE + c];
      if (c < SIZE - 1 && board[r * SIZE + c + 1] === v) return false; // right
      if (r < SIZE - 1 && board[(r + 1) * SIZE + c] === v) return false; // down
    }
  }
  return true;
}

/** Create a fresh board with 2 random starting tiles. */
export function createBoard() {
  let board = Array(16).fill(0);
  board = addRandomTile(board);
  board = addRandomTile(board);
  return board;
}
```

**Step 4: Run tests to verify they pass**

```bash
npm test
```

Expected: All tests PASS.

**Step 5: Commit**

```bash
git add public/games/2048/game/logic.js public/games/2048/game/logic.test.js
git commit -m "feat(2048): add core game logic with tests"
```

---

## Task 3: DOM rendering (game.js)

**Files:**
- Create: `public/games/2048/game/game.js`

**Step 1: Create game.js with state and render**

```js
import { createBoard, moveBoard, addRandomTile, checkWin, checkGameOver } from './logic.js';

// ─── State ───────────────────────────────────────────────────────────────────
let board = [];
let score = 0;
let gameOver = false;
let won = false;
let keepPlaying = false;

// ─── DOM refs ────────────────────────────────────────────────────────────────
const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const overlayEl = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayBtn = document.getElementById('overlay-btn');
const newGameBtn = document.getElementById('new-game-btn');

// ─── Tile colors ─────────────────────────────────────────────────────────────
const TILE_COLORS = {
  2:    { bg: '#eee4da', fg: '#776e65' },
  4:    { bg: '#ede0c8', fg: '#776e65' },
  8:    { bg: '#f2b179', fg: '#f9f6f2' },
  16:   { bg: '#f59563', fg: '#f9f6f2' },
  32:   { bg: '#f67c5f', fg: '#f9f6f2' },
  64:   { bg: '#f65e3b', fg: '#f9f6f2' },
  128:  { bg: '#edcf72', fg: '#f9f6f2' },
  256:  { bg: '#edcc61', fg: '#f9f6f2' },
  512:  { bg: '#edc850', fg: '#f9f6f2' },
  1024: { bg: '#edc53f', fg: '#f9f6f2' },
  2048: { bg: '#edc22e', fg: '#f9f6f2' },
};

// ─── Render ───────────────────────────────────────────────────────────────────
function render() {
  boardEl.innerHTML = '';
  board.forEach((val) => {
    const cell = document.createElement('div');
    cell.className = 'tile' + (val ? ' tile-' + val : ' tile-empty');
    if (val) {
      cell.textContent = val;
      const colors = TILE_COLORS[val] || { bg: '#3c3a32', fg: '#f9f6f2' };
      cell.style.background = colors.bg;
      cell.style.color = colors.fg;
      cell.style.fontSize = val >= 1000 ? (val >= 10000 ? '1.1rem' : '1.4rem') : '1.8rem';
    }
    boardEl.appendChild(cell);
  });
  scoreEl.textContent = score;
}

// ─── Move ────────────────────────────────────────────────────────────────────
function handleMove(direction) {
  if (gameOver) return;
  if (won && !keepPlaying) return;

  const result = moveBoard(board, direction);
  if (result.unchanged) return;

  board = addRandomTile(result.board);
  score += result.score;

  render();

  if (!won && checkWin(board)) {
    won = true;
    showOverlay('You reached 2048!', 'Keep Playing');
    overlayBtn.onclick = () => {
      keepPlaying = true;
      hideOverlay();
    };
    // Add a "New Game" link too
    return;
  }

  if (checkGameOver(board)) {
    gameOver = true;
    showOverlay('Game Over!', 'New Game');
    overlayBtn.onclick = newGame;
  }
}

// ─── Overlay ─────────────────────────────────────────────────────────────────
function showOverlay(title, btnText) {
  overlayTitle.textContent = title;
  overlayBtn.textContent = btnText;
  overlayEl.classList.remove('hidden');
}

function hideOverlay() {
  overlayEl.classList.add('hidden');
}

// ─── New Game ────────────────────────────────────────────────────────────────
function newGame() {
  board = createBoard();
  score = 0;
  gameOver = false;
  won = false;
  keepPlaying = false;
  hideOverlay();
  render();
}

// ─── Init ────────────────────────────────────────────────────────────────────
newGameBtn.addEventListener('click', newGame);
overlayBtn.addEventListener('click', newGame);

newGame();
```

**Step 2: Manually verify in browser**

```bash
npm run dev
```

Open `http://localhost:4321` → navigate to `http://localhost:4321/games/2048/game/index.html` directly.

Expected: Board renders with 2 tiles, score shows 0, layout is broken (CSS not written yet).

**Step 3: Commit**

```bash
git add public/games/2048/game/game.js
git commit -m "feat(2048): add DOM rendering and game state"
```

---

## Task 4: CSS styling

**Files:**
- Create: `public/games/2048/game/style.css`

**Step 1: Write the stylesheet**

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Clear Sans', 'Helvetica Neue', Arial, sans-serif;
  background: #faf8ef;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 16px;
  touch-action: none;
}

#app {
  width: 100%;
  max-width: 420px;
  position: relative;
}

#header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

h1 {
  font-size: 3rem;
  font-weight: 700;
  color: #776e65;
}

.score-box {
  background: #bbada0;
  border-radius: 6px;
  padding: 8px 16px;
  text-align: center;
  min-width: 80px;
}

.score-label {
  display: block;
  font-size: 0.65rem;
  font-weight: 700;
  color: #eee4da;
  letter-spacing: 0.05em;
}

#score {
  display: block;
  font-size: 1.4rem;
  font-weight: 700;
  color: #fff;
}

#controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

#new-game-btn {
  background: #8f7a66;
  color: #f9f6f2;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

#new-game-btn:hover { background: #7a6856; }

/* ─── Board ──────────────────────────────────────────────────────────────── */
#board-container {
  position: relative;
  background: #bbada0;
  border-radius: 10px;
  padding: 10px;
}

#board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.tile {
  aspect-ratio: 1;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.8rem;
  transition: transform 0.1s ease;
  animation: tile-appear 0.1s ease;
}

.tile-empty {
  background: rgba(238, 228, 218, 0.35);
}

@keyframes tile-appear {
  0%   { transform: scale(0); }
  50%  { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* ─── Overlay ──────────────────────────────────────────────────────────────── */
#overlay {
  position: absolute;
  inset: 0;
  background: rgba(238, 228, 218, 0.75);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

#overlay.hidden { display: none; }

#overlay-content {
  text-align: center;
  padding: 24px;
}

#overlay-title {
  font-size: 2rem;
  font-weight: 700;
  color: #776e65;
  margin-bottom: 16px;
}

#overlay-btn {
  background: #8f7a66;
  color: #f9f6f2;
  border: none;
  border-radius: 6px;
  padding: 12px 28px;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
}

#overlay-btn:hover { background: #7a6856; }

/* ─── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 480px) {
  h1 { font-size: 2rem; }
  .tile { font-size: 1.4rem; }
}
```

**Step 2: Verify in browser**

```bash
npm run dev
```

Open `http://localhost:4321/games/2048/game/index.html`.
Expected: Clean board with warm beige colors, tiles visible, score counter works.

**Step 3: Commit**

```bash
git add public/games/2048/game/style.css
git commit -m "feat(2048): add CSS board layout and tile colors"
```

---

## Task 5: Input handling

**Files:**
- Modify: `public/games/2048/game/game.js` (add event listeners after `newGame()` call)

**Step 1: Add keyboard and touch input to game.js**

Append this block at the end of `game.js`, after the `newGame()` call:

```js
// ─── Keyboard input ─────────────────────────────────────────────────────────
const KEY_MAP = {
  ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
  a: 'left', d: 'right', w: 'up', s: 'down',
};

document.addEventListener('keydown', (e) => {
  const dir = KEY_MAP[e.key];
  if (dir) {
    e.preventDefault();
    handleMove(dir);
  }
});

// ─── Touch / swipe input ────────────────────────────────────────────────────
let touchStartX = 0;
let touchStartY = 0;
const MIN_SWIPE = 30;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) < MIN_SWIPE && Math.abs(dy) < MIN_SWIPE) return;
  if (Math.abs(dx) > Math.abs(dy)) {
    handleMove(dx > 0 ? 'right' : 'left');
  } else {
    handleMove(dy > 0 ? 'down' : 'up');
  }
});
```

**Step 2: Verify in browser**

- Arrow keys should slide tiles
- On mobile (DevTools device toolbar): swipe should move tiles
- Win: manually set a tile to 2048 in DevTools console: `board[0]=2048; board[1]=2048; handleMove('left'); ` — overlay should appear.

**Step 3: Commit**

```bash
git add public/games/2048/game/game.js
git commit -m "feat(2048): add keyboard and touch input"
```

---

## Task 6: Create the SVG thumbnail

**Files:**
- Create: `public/games/2048/thumbnail.svg`

**Step 1: Create the SVG**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <!-- Background -->
  <rect width="400" height="300" fill="#faf8ef"/>

  <!-- Title -->
  <text x="200" y="38" font-family="'Helvetica Neue', Arial, sans-serif"
        font-size="36" font-weight="700" fill="#776e65" text-anchor="middle">2048</text>

  <!-- Board background -->
  <rect x="60" y="52" width="280" height="220" rx="10" fill="#bbada0"/>

  <!-- Empty cells -->
  <rect x="72" y="64" width="56" height="56" rx="5" fill="rgba(238,228,218,0.35)"/>
  <rect x="138" y="64" width="56" height="56" rx="5" fill="rgba(238,228,218,0.35)"/>
  <rect x="204" y="64" width="56" height="56" rx="5" fill="rgba(238,228,218,0.35)"/>
  <rect x="72" y="130" width="56" height="56" rx="5" fill="rgba(238,228,218,0.35)"/>
  <rect x="138" y="130" width="56" height="56" rx="5" fill="rgba(238,228,218,0.35)"/>
  <rect x="72" y="196" width="56" height="56" rx="5" fill="rgba(238,228,218,0.35)"/>
  <rect x="138" y="196" width="56" height="56" rx="5" fill="rgba(238,228,218,0.35)"/>
  <rect x="204" y="196" width="56" height="56" rx="5" fill="rgba(238,228,218,0.35)"/>

  <!-- 256 tile -->
  <rect x="270" y="64" width="56" height="56" rx="5" fill="#edcc61"/>
  <text x="298" y="99" font-family="'Helvetica Neue', Arial, sans-serif"
        font-size="18" font-weight="700" fill="#f9f6f2" text-anchor="middle">256</text>

  <!-- 512 tile -->
  <rect x="204" y="130" width="56" height="56" rx="5" fill="#edc850"/>
  <text x="232" y="165" font-family="'Helvetica Neue', Arial, sans-serif"
        font-size="18" font-weight="700" fill="#f9f6f2" text-anchor="middle">512</text>

  <!-- 1024 tile -->
  <rect x="270" y="130" width="56" height="56" rx="5" fill="#edc53f"/>
  <text x="298" y="165" font-family="'Helvetica Neue', Arial, sans-serif"
        font-size="15" font-weight="700" fill="#f9f6f2" text-anchor="middle">1024</text>

  <!-- 2048 tile (golden, bottom-right) -->
  <rect x="270" y="196" width="56" height="56" rx="5" fill="#edc22e"/>
  <text x="298" y="231" font-family="'Helvetica Neue', Arial, sans-serif"
        font-size="15" font-weight="700" fill="#f9f6f2" text-anchor="middle">2048</text>
</svg>
```

**Step 2: Commit**

```bash
git add public/games/2048/thumbnail.svg
git commit -m "feat(2048): add SVG thumbnail"
```

---

## Task 7: Register game in games.json and run all tests

**Files:**
- Modify: `src/data/games.json`

**Step 1: Add the 2048 entry**

Add this entry to `src/data/games.json` (append to the array):

```json
{
  "slug": "2048",
  "title": "2048",
  "description": "Slide tiles on a 4×4 grid to merge matching numbers. Reach the 2048 tile to win!",
  "thumbnail": "/games/2048/thumbnail.svg",
  "tags": ["puzzle", "casual", "strategy"],
  "featured": false,
  "publishedAt": "2026-03-08"
}
```

**Step 2: Run all tests**

```bash
npm test
```

Expected: All tests PASS (games.test.ts + logic.test.js). Confirm the new 2048 entry validates correctly.

**Step 3: Commit**

```bash
git add src/data/games.json
git commit -m "feat(2048): register game in portal"
```

---

## Task 8: Final verification and deploy

**Step 1: Full build check**

```bash
npm run build
```

Expected: No errors. `dist/` generated.

**Step 2: End-to-end game check via dev server**

```bash
npm run dev
```

- `http://localhost:4321` — 2048 appears in game list with thumbnail
- Click the game card → detail page loads
- Click "Play Now" → iframe loads the game
- Verify: arrow keys work, tiles merge, score increments, win/lose overlays appear

**Step 3: Push to deploy**

Only push after confirming all of the above work:

```bash
git push
```

Expected: Netlify auto-deploys. Game live at `https://games.xleon.dev`.
