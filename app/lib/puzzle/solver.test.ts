import { describe, it, expect } from 'vitest';
import { solve } from './solver';
import type { Puzzle } from './types';

describe('solver', () => {
  it('solves a trivial 2x2 puzzle with one clue', () => {
    const puzzle: Puzzle = {
      width: 2,
      height: 2,
      clues: [{ row: 0, col: 0, value: 4 }],
      solution: [{ row: 0, col: 0, width: 2, height: 2 }],
    };

    const result = solve(puzzle);
    expect(result.solution).not.toBeNull();
    expect(result.solution).toHaveLength(1);
    expect(result.solution![0]).toEqual({ row: 0, col: 0, width: 2, height: 2 });
    expect(result.isUnique).toBe(true);
  });

  it('solves a 4x4 puzzle with four 2x2 clues', () => {
    const puzzle: Puzzle = {
      width: 4,
      height: 4,
      clues: [
        { row: 0, col: 0, value: 4 },
        { row: 0, col: 2, value: 4 },
        { row: 2, col: 0, value: 4 },
        { row: 2, col: 2, value: 4 },
      ],
      solution: [
        { row: 0, col: 0, width: 2, height: 2 },
        { row: 0, col: 2, width: 2, height: 2 },
        { row: 2, col: 0, width: 2, height: 2 },
        { row: 2, col: 2, width: 2, height: 2 },
      ],
    };

    const result = solve(puzzle);
    expect(result.solution).not.toBeNull();
    expect(result.solution).toHaveLength(4);
    expect(result.isUnique).toBe(true);
  });

  it('returns null for an unsolvable puzzle', () => {
    // 2x2 grid with clue of 3 — no 3-area rectangle fits in a 2x2 grid
    const puzzle: Puzzle = {
      width: 2,
      height: 2,
      clues: [{ row: 0, col: 0, value: 3 }],
      solution: [],
    };

    const result = solve(puzzle);
    expect(result.solution).toBeNull();
  });

  it('detects non-unique puzzles', () => {
    // 2x4 grid with two clues of 4 — can be split 2x2+2x2 or 1x4+1x4 etc.
    const puzzle: Puzzle = {
      width: 4,
      height: 2,
      clues: [
        { row: 0, col: 1, value: 4 },
        { row: 1, col: 2, value: 4 },
      ],
      solution: [],
    };

    const result = solve(puzzle, true);
    expect(result.solution).not.toBeNull();
    // If the puzzle has multiple solutions, isUnique should be false
    // (this specific puzzle does have multiple solutions)
    expect(result.isUnique).toBe(false);
  });
});
