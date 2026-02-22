import type { Puzzle, PuzzleConfig, GridRect, Clue, Difficulty } from './types';
import { DIFFICULTY_CONFIGS } from './types';
import { mulberry32, seededRandInt } from './prng';
import { solve } from './solver';

interface Region {
  row: number;
  col: number;
  width: number;
  height: number;
}

function maxArea(difficulty: Difficulty): number {
  return DIFFICULTY_CONFIGS[difficulty].maxArea;
}

function splitProbability(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'primer':
      return 0.3;
    case 'easy':
      return 0.35;
    case 'medium':
      return 0.4;
    case 'hard':
      return 0.45;
    case 'expert':
      return 0.5;
    case 'nightmare':
      return 0.55;
  }
}

function partition(
  region: Region,
  difficulty: Difficulty,
  rng: () => number
): GridRect[] {
  const area = region.width * region.height;

  // Base case: region is small enough and random says stop
  if (area <= maxArea(difficulty) && area >= 2 && rng() > splitProbability(difficulty)) {
    return [region];
  }

  // If area is 2 or 3, can't split without creating area=1
  if (area <= 3) {
    return [region];
  }

  // Choose axis: split along longer dimension
  const splitVertical =
    region.width > region.height
      ? true
      : region.width < region.height
        ? false
        : rng() > 0.5;

  const length = splitVertical ? region.width : region.height;

  // Try splitting with bias toward center
  for (let attempt = 0; attempt < 5; attempt++) {
    const splitPos =
      attempt === 0
        ? Math.floor(length * (0.35 + rng() * 0.3))
        : Math.floor(length * (0.2 + rng() * 0.6));

    if (splitPos < 1 || splitPos >= length) continue;

    let half1: Region;
    let half2: Region;

    if (splitVertical) {
      half1 = { row: region.row, col: region.col, width: splitPos, height: region.height };
      half2 = {
        row: region.row,
        col: region.col + splitPos,
        width: region.width - splitPos,
        height: region.height,
      };
    } else {
      half1 = { row: region.row, col: region.col, width: region.width, height: splitPos };
      half2 = {
        row: region.row + splitPos,
        col: region.col,
        width: region.width,
        height: region.height - splitPos,
      };
    }

    // HARD CONSTRAINT: no 1×1 regions
    if (half1.width * half1.height < 2 || half2.width * half2.height < 2) {
      continue;
    }

    return [...partition(half1, difficulty, rng), ...partition(half2, difficulty, rng)];
  }

  // Failed to split — return region as-is (guaranteed area >= 2 from earlier check)
  return [region];
}

function placeClues(rects: GridRect[], rng: () => number): Clue[] {
  const clues: Clue[] = [];

  for (const rect of rects) {
    const candidates: { row: number; col: number }[] = [];
    for (let r = rect.row; r < rect.row + rect.height; r++) {
      for (let c = rect.col; c < rect.col + rect.width; c++) {
        candidates.push({ row: r, col: c });
      }
    }

    // Pick a random cell for the clue
    const idx = Math.floor(rng() * candidates.length);
    const cell = candidates[idx];

    clues.push({
      row: cell.row,
      col: cell.col,
      value: rect.width * rect.height,
    });
  }

  return clues;
}

export function generatePuzzle(config: PuzzleConfig): Puzzle {
  const diffConfig = DIFFICULTY_CONFIGS[config.difficulty];
  const rng = mulberry32(config.seed);

  // Determine grid size within difficulty range
  const width =
    config.width || seededRandInt(diffConfig.minGrid, diffConfig.maxGrid, rng);
  const height =
    config.height || seededRandInt(diffConfig.minGrid, diffConfig.maxGrid, rng);

  const totalCells = width * height;
  const isLargeGrid = totalCells > 300;

  let bestPuzzle: Puzzle | null = null;
  let attempts = 0;
  const maxAttempts = isLargeGrid ? 4 : 8;
  let relaxFactor = isLargeGrid ? 1.5 : 1.0;

  // For large grids, skip uniqueness check (too expensive) and use lower node cap
  const checkUniqueness = !isLargeGrid;
  const solverNodeCap = isLargeGrid ? 10000 : 50000;

  while (attempts < maxAttempts) {
    const seedSuffix = attempts > 0 ? `+${attempts}` : '';
    const attemptRng = mulberry32(config.seed + seedSuffix);

    // Burn the same number of values for grid size when using config dimensions
    if (config.width) attemptRng();
    if (config.height) attemptRng();

    // Step 1: Partition
    const fullRegion: Region = { row: 0, col: 0, width, height };
    const rects = partition(fullRegion, config.difficulty, attemptRng);

    // Validate: no area-1 rectangles
    const hasArea1 = rects.some((r) => r.width * r.height < 2);
    if (hasArea1) {
      attempts++;
      continue;
    }

    // Validate: all cells covered
    const totalArea = rects.reduce((sum, r) => sum + r.width * r.height, 0);
    if (totalArea !== width * height) {
      attempts++;
      continue;
    }

    // Step 2: Place clues
    const clues = placeClues(rects, attemptRng);
    const puzzle: Puzzle = { width, height, clues, solution: rects };

    // For large grids, skip solver — partition guarantees a valid solution
    if (isLargeGrid) {
      return puzzle;
    }

    // Step 3: Verify solvability and uniqueness for smaller grids
    const result = solve(puzzle, checkUniqueness, solverNodeCap);

    if (!result.solution) {
      attempts++;
      continue;
    }

    // Check backtrack count is in acceptable range
    const targetMin = diffConfig.backtrackMin;
    const targetMax = diffConfig.backtrackMax * relaxFactor;

    if (result.backtracks >= targetMin && result.backtracks <= targetMax) {
      if (result.isUnique) {
        return puzzle;
      }
    }

    // Store as fallback
    if (result.isUnique && (!bestPuzzle || Math.abs(result.backtracks - targetMin) < 30)) {
      bestPuzzle = puzzle;
    }

    attempts++;
    if (attempts >= 3) relaxFactor = 1.5;
  }

  // Return best attempt or generate a simple fallback
  if (bestPuzzle) return bestPuzzle;

  // Ultimate fallback: simple partition with the original seed
  const fallbackRng = mulberry32(config.seed + '_fallback');
  const fullRegion: Region = { row: 0, col: 0, width, height };
  const rects = partition(fullRegion, config.difficulty, fallbackRng);
  const clues = placeClues(rects, fallbackRng);
  return { width, height, clues, solution: rects };
}
