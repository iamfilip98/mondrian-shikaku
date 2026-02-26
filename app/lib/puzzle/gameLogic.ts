import type { GridRect, Clue, PlacedRect, Puzzle } from './types';

export function validateRect(
  rect: GridRect,
  clues: Clue[],
  puzzleWidth?: number,
  puzzleHeight?: number,
): { isCorrect: boolean; clueIndex: number } {
  // Bounds check if puzzle dimensions are provided
  if (puzzleWidth !== undefined && puzzleHeight !== undefined) {
    if (rect.row < 0 || rect.col < 0 ||
        rect.row + rect.height > puzzleHeight ||
        rect.col + rect.width > puzzleWidth) {
      return { isCorrect: false, clueIndex: -1 };
    }
  }

  const area = rect.width * rect.height;
  const containedClues: { clue: Clue; index: number }[] = [];

  for (let i = 0; i < clues.length; i++) {
    const c = clues[i];
    if (
      c.row >= rect.row &&
      c.row < rect.row + rect.height &&
      c.col >= rect.col &&
      c.col < rect.col + rect.width
    ) {
      containedClues.push({ clue: c, index: i });
    }
  }

  if (containedClues.length === 1 && containedClues[0].clue.value === area) {
    return { isCorrect: true, clueIndex: containedClues[0].index };
  }

  return { isCorrect: false, clueIndex: containedClues.length === 1 ? containedClues[0].index : -1 };
}

export function rectsOverlap(a: GridRect, b: GridRect): boolean {
  return !(
    a.col + a.width <= b.col ||
    b.col + b.width <= a.col ||
    a.row + a.height <= b.row ||
    b.row + b.height <= a.row
  );
}

export function checkComplete(placed: PlacedRect[], puzzle: Puzzle): boolean {
  const grid = Array.from({ length: puzzle.height }, () =>
    Array.from({ length: puzzle.width }, () => false)
  );

  for (const rect of placed) {
    if (!rect.isCorrect) return false;
    for (let r = rect.row; r < rect.row + rect.height; r++) {
      for (let c = rect.col; c < rect.col + rect.width; c++) {
        if (r < 0 || r >= puzzle.height || c < 0 || c >= puzzle.width) continue;
        grid[r][c] = true;
      }
    }
  }

  return grid.every((row) => row.every(Boolean));
}
