import { describe, it, expect } from 'vitest';
import { validateRect, rectsOverlap, checkComplete } from './gameLogic';
import type { Clue, PlacedRect, Puzzle } from './types';

describe('validateRect', () => {
  const clues: Clue[] = [
    { row: 0, col: 0, value: 4 },
    { row: 2, col: 2, value: 6 },
  ];

  it('returns correct when rect contains exactly one clue with matching area', () => {
    const result = validateRect({ row: 0, col: 0, width: 2, height: 2 }, clues);
    expect(result.isCorrect).toBe(true);
    expect(result.clueIndex).toBe(0);
  });

  it('returns incorrect when area does not match clue value', () => {
    const result = validateRect({ row: 0, col: 0, width: 3, height: 2 }, clues);
    expect(result.isCorrect).toBe(false);
  });

  it('returns incorrect when rect contains no clues', () => {
    const result = validateRect({ row: 1, col: 0, width: 1, height: 1 }, clues);
    expect(result.isCorrect).toBe(false);
    expect(result.clueIndex).toBe(-1);
  });

  it('returns incorrect when rect contains multiple clues', () => {
    const result = validateRect({ row: 0, col: 0, width: 4, height: 4 }, clues);
    expect(result.isCorrect).toBe(false);
    expect(result.clueIndex).toBe(-1);
  });

  it('correctly identifies clue at edge of rect', () => {
    // Clue at (2,2), rect from (2,2) with size 3x2 = area 6
    const result = validateRect({ row: 2, col: 2, width: 3, height: 2 }, clues);
    expect(result.isCorrect).toBe(true);
    expect(result.clueIndex).toBe(1);
  });
});

describe('rectsOverlap', () => {
  it('detects overlapping rectangles', () => {
    const a = { row: 0, col: 0, width: 3, height: 3 };
    const b = { row: 2, col: 2, width: 2, height: 2 };
    expect(rectsOverlap(a, b)).toBe(true);
  });

  it('returns false for adjacent non-overlapping rectangles', () => {
    const a = { row: 0, col: 0, width: 2, height: 2 };
    const b = { row: 0, col: 2, width: 2, height: 2 };
    expect(rectsOverlap(a, b)).toBe(false);
  });

  it('returns false for diagonally positioned rectangles', () => {
    const a = { row: 0, col: 0, width: 2, height: 2 };
    const b = { row: 2, col: 2, width: 2, height: 2 };
    expect(rectsOverlap(a, b)).toBe(false);
  });

  it('detects partial overlap on single row', () => {
    const a = { row: 0, col: 0, width: 3, height: 1 };
    const b = { row: 0, col: 2, width: 2, height: 1 };
    expect(rectsOverlap(a, b)).toBe(true);
  });

  it('returns false for vertically adjacent rectangles', () => {
    const a = { row: 0, col: 0, width: 2, height: 2 };
    const b = { row: 2, col: 0, width: 2, height: 2 };
    expect(rectsOverlap(a, b)).toBe(false);
  });
});

describe('checkComplete', () => {
  const puzzle: Puzzle = {
    width: 4,
    height: 2,
    clues: [
      { row: 0, col: 0, value: 4 },
      { row: 0, col: 2, value: 4 },
    ],
    solution: [],
  };

  const makePlaced = (row: number, col: number, w: number, h: number, correct: boolean): PlacedRect => ({
    row, col, width: w, height: h,
    color: 'red', isCorrect: correct, clueIndex: 0,
  });

  it('returns true when all cells covered by correct rects', () => {
    const placed: PlacedRect[] = [
      makePlaced(0, 0, 2, 2, true),
      makePlaced(0, 2, 2, 2, true),
    ];
    expect(checkComplete(placed, puzzle)).toBe(true);
  });

  it('returns false when cells are missing coverage', () => {
    const placed: PlacedRect[] = [
      makePlaced(0, 0, 2, 2, true),
    ];
    expect(checkComplete(placed, puzzle)).toBe(false);
  });

  it('returns false when any rect is incorrect', () => {
    const placed: PlacedRect[] = [
      makePlaced(0, 0, 2, 2, true),
      makePlaced(0, 2, 2, 2, false),
    ];
    expect(checkComplete(placed, puzzle)).toBe(false);
  });

  it('returns false for empty placement array', () => {
    expect(checkComplete([], puzzle)).toBe(false);
  });
});
