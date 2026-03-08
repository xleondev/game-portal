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
