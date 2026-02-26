import type { Puzzle, GridRect, Clue } from './types';

export interface SolverResult {
  solution: GridRect[] | null;
  backtracks: number;
  isUnique: boolean;
}

interface SolverState {
  grid: number[][]; // -1 = uncovered, >= 0 = index of covering rect
  placed: GridRect[];
  clueResolved: boolean[];
  backtracks: number;
}

function getFactorPairs(n: number): [number, number][] {
  const pairs: [number, number][] = [];
  for (let w = 1; w <= n; w++) {
    if (n % w === 0) {
      const h = n / w;
      pairs.push([w, h]);
    }
  }
  return pairs;
}

function getCandidates(
  clue: Clue,
  puzzleWidth: number,
  puzzleHeight: number,
  grid: number[][]
): GridRect[] {
  const candidates: GridRect[] = [];
  const pairs = getFactorPairs(clue.value);

  for (const [w, h] of pairs) {
    // All possible positions where this rect would contain the clue cell
    for (let row = clue.row - h + 1; row <= clue.row; row++) {
      for (let col = clue.col - w + 1; col <= clue.col; col++) {
        if (row < 0 || col < 0 || row + h > puzzleHeight || col + w > puzzleWidth) {
          continue;
        }

        // Check if any cell in this rect is already covered
        let overlaps = false;
        for (let r = row; r < row + h && !overlaps; r++) {
          for (let c = col; c < col + w && !overlaps; c++) {
            if (grid[r][c] !== -1) {
              overlaps = true;
            }
          }
        }

        if (!overlaps) {
          // Check that no other clue is inside this rect (besides the current one)
          // This is checked during the actual solving step
          candidates.push({ row, col, width: w, height: h });
        }
      }
    }
  }

  return candidates;
}

interface GridChange {
  r: number;
  c: number;
  oldVal: number;
}

function placeRect(grid: number[][], rect: GridRect, index: number): GridChange[] {
  const changes: GridChange[] = [];
  for (let r = rect.row; r < rect.row + rect.height; r++) {
    for (let c = rect.col; c < rect.col + rect.width; c++) {
      changes.push({ r, c, oldVal: grid[r][c] });
      grid[r][c] = index;
    }
  }
  return changes;
}

function restoreChanges(grid: number[][], changes: GridChange[]): void {
  for (let i = changes.length - 1; i >= 0; i--) {
    const ch = changes[i];
    grid[ch.r][ch.c] = ch.oldVal;
  }
}

function rectContainsClue(rect: GridRect, clue: Clue): boolean {
  return (
    clue.row >= rect.row &&
    clue.row < rect.row + rect.height &&
    clue.col >= rect.col &&
    clue.col < rect.col + rect.width
  );
}

export function solve(puzzle: Puzzle, findAll = true, maxNodes = 50000): SolverResult {
  const { width, height, clues } = puzzle;

  // Initialize grid
  const grid: number[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => -1)
  );

  const state: SolverState = {
    grid,
    placed: [],
    clueResolved: new Array(clues.length).fill(false),
    backtracks: 0,
  };

  let nodeCount = 0;
  const solutions: GridRect[][] = [];
  const maxSolutions = findAll ? 2 : 1;

  function backtrack(depth = 0): void {
    nodeCount++;
    if (depth > 500 || nodeCount > maxNodes) return;

    // Save state for restore
    const savedPlacedLen = state.placed.length;
    const savedResolved = [...state.clueResolved];
    const allChanges: GridChange[] = [];

    // Propagate forced moves — track all grid changes
    const origPropagatePlaceRect = (rect: GridRect, index: number) => {
      const changes = placeRect(state.grid, rect, index);
      allChanges.push(...changes);
    };

    // Inline propagation with change tracking
    let ok = true;
    let progress = true;
    while (progress) {
      progress = false;
      for (let i = 0; i < clues.length; i++) {
        if (state.clueResolved[i]) continue;

        const candidates = getCandidates(clues[i], width, height, state.grid);
        const validCandidates = candidates.filter((rect) => {
          for (let j = 0; j < clues.length; j++) {
            if (j === i) continue;
            if (state.clueResolved[j]) continue;
            if (rectContainsClue(rect, clues[j])) return false;
          }
          return true;
        });

        if (validCandidates.length === 0) { ok = false; break; }
        if (validCandidates.length === 1) {
          const rect = validCandidates[0];
          origPropagatePlaceRect(rect, state.placed.length);
          state.placed.push(rect);
          state.clueResolved[i] = true;
          progress = true;
        }
      }
      if (!ok) break;
    }

    if (!ok) {
      // Restore state
      state.placed.length = savedPlacedLen;
      state.clueResolved = savedResolved;
      restoreChanges(state.grid, allChanges);
      state.backtracks++;
      return;
    }

    // Check if all clues resolved
    if (state.clueResolved.every(Boolean)) {
      solutions.push([...state.placed]);
      // Restore for further search
      state.placed.length = savedPlacedLen;
      state.clueResolved = savedResolved;
      restoreChanges(state.grid, allChanges);
      return;
    }

    // Pick most constrained unresolved clue
    let bestIdx = -1;
    let bestCount = Infinity;
    for (let i = 0; i < clues.length; i++) {
      if (state.clueResolved[i]) continue;
      const candidates = getCandidates(clues[i], width, height, state.grid).filter((rect) => {
        for (let j = 0; j < clues.length; j++) {
          if (j === i || state.clueResolved[j]) continue;
          if (rectContainsClue(rect, clues[j])) return false;
        }
        return true;
      });
      if (candidates.length < bestCount) {
        bestCount = candidates.length;
        bestIdx = i;
      }
    }

    if (bestIdx === -1 || bestCount === 0) {
      // Restore
      state.placed.length = savedPlacedLen;
      state.clueResolved = savedResolved;
      restoreChanges(state.grid, allChanges);
      state.backtracks++;
      return;
    }

    const candidates = getCandidates(clues[bestIdx], width, height, state.grid).filter((rect) => {
      for (let j = 0; j < clues.length; j++) {
        if (j === bestIdx || state.clueResolved[j]) continue;
        if (rectContainsClue(rect, clues[j])) return false;
      }
      return true;
    });

    for (const candidate of candidates) {
      if (solutions.length >= maxSolutions || nodeCount > maxNodes) break;

      // Save state before trying
      const innerSavedLen = state.placed.length;
      const innerSavedResolved = [...state.clueResolved];

      const innerChanges = placeRect(state.grid, candidate, state.placed.length);
      state.placed.push(candidate);
      state.clueResolved[bestIdx] = true;

      backtrack(depth + 1);

      // Restore after trying this candidate
      state.placed.length = innerSavedLen;
      state.clueResolved = innerSavedResolved;
      restoreChanges(state.grid, innerChanges);

      if (!findAll && solutions.length >= 1) break;
    }

    // Final restore for this level
    state.placed.length = savedPlacedLen;
    state.clueResolved = savedResolved;
    restoreChanges(state.grid, allChanges);

    if (candidates.length > 1) {
      state.backtracks++;
    }
  }

  backtrack();

  return {
    solution: solutions.length > 0 ? solutions[0] : null,
    backtracks: state.backtracks,
    isUnique: solutions.length === 1,
  };
}
