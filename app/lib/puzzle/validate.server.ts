import type { GridRect, Clue } from './types';
import { generatePuzzle } from './generator';

interface PlacedRectPayload {
  row: number;
  col: number;
  width: number;
  height: number;
}

/**
 * Server-side validation of a puzzle solve.
 * Regenerates the puzzle from seed and validates the placed rectangles.
 */
export function validateSolve(
  placedRects: PlacedRectPayload[],
  puzzleSeed: string,
  difficulty: string,
  gridWidth: number,
  gridHeight: number,
): { valid: boolean; reason?: string } {
  // Regenerate puzzle from seed to get canonical clues
  let clues: Clue[];
  try {
    const puzzle = generatePuzzle({
      width: gridWidth,
      height: gridHeight,
      difficulty: difficulty as any,
      seed: puzzleSeed,
    });
    clues = puzzle.clues;
  } catch {
    return { valid: false, reason: 'Failed to regenerate puzzle' };
  }

  // Validate each rect has integer fields in bounds
  for (const rect of placedRects) {
    if (
      typeof rect.row !== 'number' || typeof rect.col !== 'number' ||
      typeof rect.width !== 'number' || typeof rect.height !== 'number' ||
      !Number.isInteger(rect.row) || !Number.isInteger(rect.col) ||
      !Number.isInteger(rect.width) || !Number.isInteger(rect.height) ||
      rect.row < 0 || rect.col < 0 || rect.width < 1 || rect.height < 1 ||
      rect.row + rect.height > gridHeight || rect.col + rect.width > gridWidth
    ) {
      return { valid: false, reason: 'Invalid rectangle bounds' };
    }
  }

  // Build coverage grid — every cell must be covered exactly once
  const grid = Array.from({ length: gridHeight }, () =>
    new Uint8Array(gridWidth)
  );

  for (const rect of placedRects) {
    for (let r = rect.row; r < rect.row + rect.height; r++) {
      for (let c = rect.col; c < rect.col + rect.width; c++) {
        if (grid[r][c] !== 0) {
          return { valid: false, reason: 'Overlapping rectangles' };
        }
        grid[r][c] = 1;
      }
    }
  }

  // Check full coverage
  for (let r = 0; r < gridHeight; r++) {
    for (let c = 0; c < gridWidth; c++) {
      if (grid[r][c] === 0) {
        return { valid: false, reason: 'Grid not fully covered' };
      }
    }
  }

  // Each rect must contain exactly one clue, and the clue value must match the rect area
  const clueUsed = new Uint8Array(clues.length);

  for (const rect of placedRects) {
    const area = rect.width * rect.height;
    let matchedClueIndex = -1;

    for (let i = 0; i < clues.length; i++) {
      const clue = clues[i];
      if (
        clue.row >= rect.row &&
        clue.row < rect.row + rect.height &&
        clue.col >= rect.col &&
        clue.col < rect.col + rect.width
      ) {
        if (matchedClueIndex !== -1) {
          return { valid: false, reason: 'Rectangle contains multiple clues' };
        }
        matchedClueIndex = i;
      }
    }

    if (matchedClueIndex === -1) {
      return { valid: false, reason: 'Rectangle contains no clue' };
    }

    if (clues[matchedClueIndex].value !== area) {
      return { valid: false, reason: 'Rectangle area does not match clue value' };
    }

    if (clueUsed[matchedClueIndex]) {
      return { valid: false, reason: 'Clue used by multiple rectangles' };
    }
    clueUsed[matchedClueIndex] = 1;
  }

  // Every clue must be covered
  for (let i = 0; i < clues.length; i++) {
    if (!clueUsed[i]) {
      return { valid: false, reason: 'Not all clues covered' };
    }
  }

  return { valid: true };
}
