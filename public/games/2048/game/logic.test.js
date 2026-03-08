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
