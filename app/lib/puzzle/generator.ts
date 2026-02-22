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

function partition(
  region: Region,
  difficulty: Difficulty,
  rng: () => number
): GridRect[] {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const area = region.width * region.height;

  // Base case: region meets minArea and is within maxArea — random chance to stop splitting
  if (area <= config.maxArea && area >= config.minArea && rng() > config.splitProbability) {
    return [region];
  }

  // Can't split if it would create sub-minArea regions
  if (area < config.minArea * 2) {
    return [region];
  }

  // Elongated bias: carve a 1-wide strip from the edge instead of binary split
  if (config.elongatedBias > 0 && rng() < config.elongatedBias) {
    const stripResult = tryElongatedStrip(region, config.minArea, rng);
    if (stripResult) {
      const [strip, remainder] = stripResult;
      return [strip, ...partition(remainder, difficulty, rng)];
    }
  }

  // Choose axis: 80% longer dimension, 20% shorter (creates elongated children)
  let splitVertical: boolean;
  if (region.width === region.height) {
    splitVertical = rng() > 0.5;
  } else {
    const preferLonger = region.width > region.height;
    splitVertical = rng() < 0.8 ? preferLonger : !preferLonger;
  }

  const length = splitVertical ? region.width : region.height;

  // Multi-strategy split position
  for (let attempt = 0; attempt < 5; attempt++) {
    let splitPos: number;
    const roll = rng();

    if (roll < 0.15) {
      // Edge-biased: position 1 or length-1
      splitPos = rng() < 0.5 ? 1 : length - 1;
    } else if (roll < 0.40) {
      // Wide range: 10–90%
      splitPos = Math.floor(length * (0.1 + rng() * 0.8));
    } else {
      // Center-biased: 30–70%
      splitPos = Math.floor(length * (0.3 + rng() * 0.4));
    }

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

    // HARD CONSTRAINT: no regions below minArea (and absolute minimum of 2)
    const minAllowed = Math.max(config.minArea, 2);
    if (half1.width * half1.height < minAllowed || half2.width * half2.height < minAllowed) {
      continue;
    }

    return [...partition(half1, difficulty, rng), ...partition(half2, difficulty, rng)];
  }

  // Failed to split — return region as-is
  return [region];
}

function tryElongatedStrip(
  region: Region,
  minArea: number,
  rng: () => number
): [Region, Region] | null {
  // Try to carve a 1-wide strip from a random edge
  const candidates: [Region, Region][] = [];
  const minAllowed = Math.max(minArea, 2);

  // Top strip (1 x width)
  if (region.width >= minAllowed && (region.height - 1) * region.width >= minAllowed) {
    candidates.push([
      { row: region.row, col: region.col, width: region.width, height: 1 },
      { row: region.row + 1, col: region.col, width: region.width, height: region.height - 1 },
    ]);
  }

  // Bottom strip
  if (region.width >= minAllowed && (region.height - 1) * region.width >= minAllowed) {
    candidates.push([
      { row: region.row + region.height - 1, col: region.col, width: region.width, height: 1 },
      { row: region.row, col: region.col, width: region.width, height: region.height - 1 },
    ]);
  }

  // Left strip (height x 1)
  if (region.height >= minAllowed && region.height * (region.width - 1) >= minAllowed) {
    candidates.push([
      { row: region.row, col: region.col, width: 1, height: region.height },
      { row: region.row, col: region.col + 1, width: region.width - 1, height: region.height },
    ]);
  }

  // Right strip
  if (region.height >= minAllowed && region.height * (region.width - 1) >= minAllowed) {
    candidates.push([
      { row: region.row, col: region.col + region.width - 1, width: 1, height: region.height },
      { row: region.row, col: region.col, width: region.width - 1, height: region.height },
    ]);
  }

  if (candidates.length === 0) return null;
  return candidates[Math.floor(rng() * candidates.length)];
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
