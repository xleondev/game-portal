import { checkWin, checkGameOver } from './logic.js';

const SIZE = 4;
const SLIDE_MS = 120; // must match CSS transition duration

// ─── State ───────────────────────────────────────────────────────────────────
const tileMap = new Map();  // id -> { value, row, col, el }
let nextId = 0;
let idBoard    = Array(SIZE * SIZE).fill(null);  // tile ID at each cell
let valueBoard = Array(SIZE * SIZE).fill(0);     // tile value at each cell
let score = 0;
let gameOver = false;
let won = false;
let keepPlaying = false;
let moving = false;  // block input during animation

// ─── DOM refs ────────────────────────────────────────────────────────────────
const boardEl      = document.getElementById('board');
const tileLayerEl  = document.getElementById('tile-layer');
const scoreEl      = document.getElementById('score');
const overlayEl    = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayBtn   = document.getElementById('overlay-btn');
const newGameBtn   = document.getElementById('new-game-btn');

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

function applyColors(el, value) {
  const c = TILE_COLORS[value] || { bg: '#3c3a32', fg: '#f9f6f2' };
  el.style.background = c.bg;
  el.style.color = c.fg;
  el.style.fontSize = value >= 10000 ? '1.1rem' : value >= 1000 ? '1.4rem' : '1.8rem';
}

// ─── Tile management ─────────────────────────────────────────────────────────
function createTile(value, row, col, animate = true) {
  const id = nextId++;
  const el = document.createElement('div');
  el.className = 'tile';
  el.style.setProperty('--r', row);
  el.style.setProperty('--c', col);
  el.textContent = value;
  applyColors(el, value);
  tileLayerEl.appendChild(el);
  // Force reflow so CSS vars are committed before adding animation class
  if (animate) {
    void el.offsetWidth;
    el.classList.add('tile-new');
  }
  tileMap.set(id, { value, row, col, el });
  idBoard[row * SIZE + col] = id;
  valueBoard[row * SIZE + col] = value;
  return id;
}

function moveTile(id, toRow, toCol) {
  const t = tileMap.get(id);
  if (!t) return;
  t.row = toRow;
  t.col = toCol;
  t.el.style.setProperty('--r', toRow);
  t.el.style.setProperty('--c', toCol);
}

function removeTile(id) {
  const t = tileMap.get(id);
  if (!t) return;
  t.el.remove();
  tileMap.delete(id);
}

function triggerMergeAnim(id, newValue) {
  const t = tileMap.get(id);
  if (!t) return;
  t.value = newValue;
  t.el.textContent = newValue;
  applyColors(t.el, newValue);
  t.el.classList.remove('tile-new', 'tile-merged');
  void t.el.offsetWidth;  // retrigger animation
  t.el.classList.add('tile-merged');
}

// ─── Background grid ─────────────────────────────────────────────────────────
function initBgGrid() {
  boardEl.innerHTML = '';
  for (let i = 0; i < SIZE * SIZE; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell-bg';
    boardEl.appendChild(cell);
  }
}

// ─── Move logic with tracking ─────────────────────────────────────────────────
function linePos(dir, line, pos) {
  if (dir === 'left')  return [line, pos];
  if (dir === 'right') return [line, SIZE - 1 - pos];
  if (dir === 'up')    return [pos,  line];
  /* down */           return [SIZE - 1 - pos, line];
}

function doMove(direction) {
  let totalScore = 0;
  let changed = false;
  const moves = [];     // { id, toRow, toCol, mergedFrom, remove }
  const toRemove = [];
  const newIdBoard    = Array(SIZE * SIZE).fill(null);
  const newValueBoard = Array(SIZE * SIZE).fill(0);

  for (let line = 0; line < SIZE; line++) {
    // Collect non-empty cells in slide direction order
    const cells = [];
    for (let pos = 0; pos < SIZE; pos++) {
      const [r, c] = linePos(direction, line, pos);
      const id = idBoard[r * SIZE + c];
      if (id !== null) cells.push({ id, value: valueBoard[r * SIZE + c], r, c });
    }

    // Slide and merge
    const slots = [];
    for (let i = 0; i < cells.length;) {
      if (i + 1 < cells.length && cells[i].value === cells[i + 1].value) {
        const newVal = cells[i].value * 2;
        totalScore += newVal;
        slots.push({ id: cells[i].id, value: newVal, mergedFrom: cells[i + 1].id });
        i += 2;
      } else {
        slots.push({ id: cells[i].id, value: cells[i].value, mergedFrom: null });
        i++;
      }
    }

    // Map slots back to board positions
    for (let pos = 0; pos < SIZE; pos++) {
      const [r, c] = linePos(direction, line, pos);
      const slot = slots[pos];
      if (!slot) continue;

      newIdBoard[r * SIZE + c] = slot.id;
      newValueBoard[r * SIZE + c] = slot.value;

      const orig = cells.find(cl => cl.id === slot.id);
      if (orig && (orig.r !== r || orig.c !== c)) changed = true;

      moves.push({ id: slot.id, toRow: r, toCol: c, mergedFrom: slot.mergedFrom, remove: false });

      if (slot.mergedFrom) {
        changed = true;
        // Loser tile slides to winner position then disappears
        moves.push({ id: slot.mergedFrom, toRow: r, toCol: c, mergedFrom: null, remove: true });
        toRemove.push(slot.mergedFrom);
      }
    }
  }

  if (changed) {
    idBoard = newIdBoard;
    valueBoard = newValueBoard;
  }

  return { changed, score: totalScore, moves, toRemove };
}

// ─── Spawn ───────────────────────────────────────────────────────────────────
function spawnRandomTile() {
  const empty = idBoard.map((id, i) => id === null ? i : -1).filter(i => i !== -1);
  if (!empty.length) return;
  const i = empty[Math.floor(Math.random() * empty.length)];
  createTile(Math.random() < 0.9 ? 2 : 4, Math.floor(i / SIZE), i % SIZE, true);
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
  for (const id of [...tileMap.keys()]) removeTile(id);
  idBoard    = Array(SIZE * SIZE).fill(null);
  valueBoard = Array(SIZE * SIZE).fill(0);
  score = 0;
  gameOver = false;
  won = false;
  keepPlaying = false;
  moving = false;
  scoreEl.textContent = 0;
  hideOverlay();
  spawnRandomTile();
  spawnRandomTile();
}

// ─── Move handler ─────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function handleMove(direction) {
  if (moving || gameOver || (won && !keepPlaying)) return;

  const { changed, score: gained, moves, toRemove } = doMove(direction);
  if (!changed) return;

  moving = true;
  score += gained;

  // Phase 1: slide all tiles simultaneously (CSS transitions handle it)
  for (const m of moves) moveTile(m.id, m.toRow, m.toCol);

  await sleep(SLIDE_MS);

  // Phase 2: remove losers, trigger merge bounce on winners
  for (const id of toRemove) removeTile(id);
  for (const m of moves) {
    if (!m.remove && m.mergedFrom) {
      triggerMergeAnim(m.id, valueBoard[m.toRow * SIZE + m.toCol]);
    }
  }

  scoreEl.textContent = score;

  // Phase 3: spawn new tile after a brief pause
  await sleep(30);
  spawnRandomTile();
  moving = false;

  if (!won && checkWin(valueBoard)) {
    won = true;
    showOverlay('You reached 2048!', 'Keep Playing');
    overlayBtn.onclick = () => { keepPlaying = true; hideOverlay(); };
    return;
  }
  if (checkGameOver(valueBoard)) {
    gameOver = true;
    showOverlay('Game Over!', 'New Game');
    overlayBtn.onclick = newGame;
  }
}

// ─── Input ───────────────────────────────────────────────────────────────────
const KEY_MAP = {
  ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down',
  a: 'left', d: 'right', w: 'up', s: 'down',
};

document.addEventListener('keydown', (e) => {
  const dir = KEY_MAP[e.key];
  if (dir) { e.preventDefault(); handleMove(dir); }
});

let touchStartX = 0, touchStartY = 0;
const MIN_SWIPE = 30;

document.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) < MIN_SWIPE && Math.abs(dy) < MIN_SWIPE) return;
  handleMove(Math.abs(dx) > Math.abs(dy)
    ? (dx > 0 ? 'right' : 'left')
    : (dy > 0 ? 'down' : 'up'));
});

// ─── Init ────────────────────────────────────────────────────────────────────
// overlayBtn behavior managed contextually via .onclick in handleMove
newGameBtn.addEventListener('click', newGame);
overlayBtn.onclick = newGame;

initBgGrid();
newGame();
