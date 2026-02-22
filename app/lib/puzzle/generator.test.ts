import { describe, it, expect } from 'vitest';
import { generatePuzzle } from './generator';
import { solve } from './solver';
import type { Difficulty } from './types';

describe('generatePuzzle', () => {
  it('is deterministic — same seed produces same puzzle', () => {
    const p1 = generatePuzzle({ seed: 'det-test', width: 6, height: 6, difficulty: 'easy' });
    const p2 = generatePuzzle({ seed: 'det-test', width: 6, height: 6, difficulty: 'easy' });
    expect(p1.clues).toEqual(p2.clues);
    expect(p1.solution).toEqual(p2.solution);
  });

  it('covers the entire grid (no gaps)', () => {
    const puzzle = generatePuzzle({ seed: 'coverage-test', width: 8, height: 8, difficulty: 'medium' });
    const totalArea = puzzle.solution.reduce((sum, r) => sum + r.width * r.height, 0);
    expect(totalArea).toBe(puzzle.width * puzzle.height);
  });

  it('produces no area-1 rectangles', () => {
    // Test across multiple seeds and difficulties
    const difficulties: Difficulty[] = ['primer', 'easy', 'medium', 'hard'];
    for (const diff of difficulties) {
      for (let i = 0; i < 5; i++) {
        const puzzle = generatePuzzle({ seed: `no1-${diff}-${i}`, width: 0, height: 0, difficulty: diff });
        for (const rect of puzzle.solution) {
          expect(rect.width * rect.height).toBeGreaterThanOrEqual(2);
        }
      }
    }
  });

  it('has one clue per solution rectangle', () => {
    const puzzle = generatePuzzle({ seed: 'clue-count', width: 6, height: 6, difficulty: 'easy' });
    expect(puzzle.clues.length).toBe(puzzle.solution.length);
  });

  it('places each clue inside its rectangle', () => {
    const puzzle = generatePuzzle({ seed: 'clue-inside', width: 8, height: 8, difficulty: 'medium' });
    for (let i = 0; i < puzzle.clues.length; i++) {
      const clue = puzzle.clues[i];
      const rect = puzzle.solution[i];
      expect(clue.row).toBeGreaterThanOrEqual(rect.row);
      expect(clue.row).toBeLessThan(rect.row + rect.height);
      expect(clue.col).toBeGreaterThanOrEqual(rect.col);
      expect(clue.col).toBeLessThan(rect.col + rect.width);
    }
  });

  it('clue values match rectangle areas', () => {
    const puzzle = generatePuzzle({ seed: 'clue-area', width: 6, height: 6, difficulty: 'easy' });
    for (let i = 0; i < puzzle.clues.length; i++) {
      expect(puzzle.clues[i].value).toBe(puzzle.solution[i].width * puzzle.solution[i].height);
    }
  });

  it('generates solvable small puzzles', () => {
    const puzzle = generatePuzzle({ seed: 'solvable-test', width: 6, height: 6, difficulty: 'easy' });
    const result = solve(puzzle, false);
    expect(result.solution).not.toBeNull();
  });
});
