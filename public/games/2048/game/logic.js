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
  // up=3CW (CCW) maps column top-to-bottom → row left-to-right
  // down=1CW maps column bottom-to-top → row left-to-right
  const rotations = { left: 0, up: 3, right: 2, down: 1 };
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
