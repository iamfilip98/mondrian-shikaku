import { useState, useCallback, useRef, useEffect } from 'react';
import { setSettingItem } from '~/lib/utils/settingStorage';
import type { Puzzle, GridRect, PlacedRect } from '~/lib/puzzle/types';
import { assignColors, colorSingleRect, getUnlockedColors } from '~/lib/puzzle/graphColor';
import { validateRect, rectsOverlap, checkComplete } from '~/lib/puzzle/gameLogic';

export type { PlacedRect } from '~/lib/puzzle/types';

interface GameHistory {
  placed: PlacedRect[];
}

export interface GameState {
  puzzle: Puzzle;
  placed: PlacedRect[];
  history: GameHistory[];
  historyIndex: number;
  startCell: { row: number; col: number } | null;
  previewRect: GridRect | null;
  isComplete: boolean;
  hintsUsed: number;
  hintsRemaining: number;
  elapsedSeconds: number;
  blindMode: boolean;
}

const SAVE_KEY_PREFIX = 'shikaku_save_';
const MAX_SAVED_PUZZLES = 5;

function getSaveKey(seed: string) {
  return `${SAVE_KEY_PREFIX}${seed}`;
}

function loadSavedState(seed: string | undefined): PlacedRect[] | null {
  if (!seed || typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getSaveKey(seed));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {}
  return null;
}

function saveState(seed: string | undefined, placed: PlacedRect[]) {
  if (!seed || typeof window === 'undefined') return;
  try {
    if (placed.length === 0) {
      localStorage.removeItem(getSaveKey(seed));
      return;
    }
    localStorage.setItem(getSaveKey(seed), JSON.stringify(placed));
    // Evict oldest saved puzzles if over the cap
    const allKeys: { key: string; time: number }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(SAVE_KEY_PREFIX)) {
        allKeys.push({ key, time: i });
      }
    }
    if (allKeys.length > MAX_SAVED_PUZZLES) {
      // Remove oldest entries (earliest in the list = oldest stored)
      allKeys.slice(0, allKeys.length - MAX_SAVED_PUZZLES).forEach(({ key }) => {
        localStorage.removeItem(key);
      });
    }
  } catch {}
}

function clearSave(seed: string | undefined) {
  if (!seed || typeof window === 'undefined') return;
  try {
    localStorage.removeItem(getSaveKey(seed));
  } catch {}
}

export function useGameState(puzzle: Puzzle, blindMode = false, puzzleSeed?: string) {
  const [placed, setPlaced] = useState<PlacedRect[]>([]);
  const [history, setHistory] = useState<GameHistory[]>([{ placed: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [startCell, setStartCell] = useState<{ row: number; col: number } | null>(null);
  const [previewRect, setPreviewRect] = useState<GridRect | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showTimer, setShowTimerState] = useState(() => {
    try {
      const stored = localStorage.getItem('showTimer');
      return stored !== null ? stored !== 'false' : true;
    } catch { return true; }
  });
  const setShowTimer = useCallback((value: boolean) => {
    setShowTimerState(value);
    try { setSettingItem('showTimer', String(value)); } catch {}
  }, []);
  const startTimestampRef = useRef<number>(Date.now());
  const frozenTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const unlockedColors = getUnlockedColors();

  // Wall-clock timer: uses Date.now() instead of setInterval counting
  useEffect(() => {
    if (isComplete) {
      // Freeze the elapsed time when puzzle is completed
      if (frozenTimeRef.current === null) {
        frozenTimeRef.current = Math.max(1, Math.floor((Date.now() - startTimestampRef.current) / 1000));
        setElapsedSeconds(frozenTimeRef.current);
      }
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
      };
    }

    // If we un-complete (undo after win), resume from frozen time
    if (frozenTimeRef.current !== null) {
      startTimestampRef.current = Date.now() - frozenTimeRef.current * 1000;
      frozenTimeRef.current = null;
    }

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimestampRef.current) / 1000));
    }, 500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [isComplete]);

  // Restore saved state on mount
  const restoredRef = useRef(false);
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const saved = loadSavedState(puzzleSeed);
    if (saved && saved.length > 0) {
      setPlaced(saved);
      setHistory([{ placed: [] }, { placed: saved }]);
      setHistoryIndex(1);
      setRestored(true);
    }
  }, [puzzleSeed]);

  // Auto-save on every move
  useEffect(() => {
    if (isComplete) {
      clearSave(puzzleSeed);
    } else {
      saveState(puzzleSeed, placed);
    }
  }, [placed, isComplete, puzzleSeed]);

  const recolorAll = useCallback(
    (rects: PlacedRect[]): PlacedRect[] => {
      if (rects.length === 0) return rects;

      // Graph-color correct rects; in blind mode, all rects get colored
      // but wrong ones get a neutral color so the player can't tell
      const coloredIndices: number[] = [];
      const coloredGridRects: GridRect[] = [];
      rects.forEach((r, i) => {
        if ((r._actuallyCorrect ?? r.isCorrect) || blindMode) {
          coloredIndices.push(i);
          coloredGridRects.push({ row: r.row, col: r.col, width: r.width, height: r.height });
        }
      });

      const colorMap = assignColors(coloredGridRects, unlockedColors);

      return rects.map((r, i) => {
        const idx = coloredIndices.indexOf(i);
        if (idx !== -1) {
          if (blindMode && !(r._actuallyCorrect ?? r.isCorrect)) {
            // Wrong rect in blind mode: use neutral color so it looks the same
            return { ...r, color: 'var(--color-surface-2)' };
          }
          return { ...r, color: colorMap.get(idx) || unlockedColors[0] };
        }
        return { ...r, color: 'var(--color-wrong)' };
      });
    },
    [unlockedColors, blindMode]
  );

  // Push to history with cap at 100 entries
  const pushHistory = useCallback(
    (newPlaced: PlacedRect[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ placed: newPlaced });
      if (newHistory.length > 100) newHistory.splice(0, newHistory.length - 100);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  const placeRect = useCallback(
    (rect: GridRect): PlacedRect | null => {
      // Check overlaps with existing
      const nonOverlapping = placed.filter((p) => !rectsOverlap(p, rect));
      const removedOverlaps = placed.length - nonOverlapping.length;

      const { isCorrect, clueIndex } = validateRect(rect, puzzle.clues, puzzle.width, puzzle.height);

      const newRect: PlacedRect = {
        ...rect,
        color: '',
        isCorrect: blindMode ? true : isCorrect,
        clueIndex,
      };

      // Store actual correctness for win detection in blind mode
      newRect._actuallyCorrect = isCorrect;

      // Optimize: if no overlapping rects were removed, assign color to just the new rect
      let newPlaced: PlacedRect[];
      if (removedOverlaps === 0 && nonOverlapping.length > 0) {
        const shouldColor = (newRect._actuallyCorrect ?? newRect.isCorrect) || blindMode;
        if (shouldColor) {
          const existingGridRects = nonOverlapping
            .filter((r) => (r._actuallyCorrect ?? r.isCorrect) || blindMode)
            .map((r) => ({ row: r.row, col: r.col, width: r.width, height: r.height }));
          const existingColors = nonOverlapping
            .filter((r) => (r._actuallyCorrect ?? r.isCorrect) || blindMode)
            .map((r) => r.color);
          const gridRect = { row: rect.row, col: rect.col, width: rect.width, height: rect.height };

          if (blindMode && !(newRect._actuallyCorrect ?? newRect.isCorrect)) {
            newRect.color = 'var(--color-surface-2)';
          } else {
            newRect.color = colorSingleRect(gridRect, existingGridRects, existingColors, unlockedColors);
          }
        } else {
          newRect.color = 'var(--color-wrong)';
        }
        newPlaced = [...nonOverlapping, newRect];
      } else {
        newPlaced = recolorAll([...nonOverlapping, newRect]);
      }

      setPlaced(newPlaced);
      pushHistory(newPlaced);

      // Check completion
      const complete = checkComplete(
        newPlaced.map((p) => ({
          ...p,
          isCorrect: p._actuallyCorrect ?? p.isCorrect,
        })),
        puzzle
      );
      if (complete) setIsComplete(true);

      setStartCell(null);
      setPreviewRect(null);

      return newRect;
    },
    [placed, puzzle, pushHistory, recolorAll, blindMode]
  );

  const removeRect = useCallback(
    (index: number) => {
      const newPlaced = recolorAll(placed.filter((_, i) => i !== index));
      setPlaced(newPlaced);
      pushHistory(newPlaced);
    },
    [placed, pushHistory, recolorAll]
  );

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    const restored = recolorAll(history[newIndex].placed);
    setPlaced(restored);
    setIsComplete(false);
  }, [historyIndex, history, recolorAll]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    const restored = recolorAll(history[newIndex].placed);
    setPlaced(restored);
    // Re-check completion on the restored state
    const complete = checkComplete(
      restored.map((p) => ({
        ...p,
        isCorrect: p._actuallyCorrect ?? p.isCorrect,
      })),
      puzzle
    );
    setIsComplete(complete);
  }, [historyIndex, history, recolorAll, puzzle]);

  const clearAll = useCallback(() => {
    setPlaced([]);
    pushHistory([]);
    setStartCell(null);
    setPreviewRect(null);
  }, [pushHistory]);

  const hint = useCallback(() => {
    if (hintsUsed >= 3) return null;

    // Find an unplaced correct rectangle from the solution
    for (const solRect of puzzle.solution) {
      const alreadyPlaced = placed.some(
        (p) =>
          p.row === solRect.row &&
          p.col === solRect.col &&
          p.width === solRect.width &&
          p.height === solRect.height &&
          (p._actuallyCorrect ?? p.isCorrect)
      );
      if (!alreadyPlaced) {
        // Check if any correctly placed rects overlap — skip if so
        const blockedByCorrect = placed.some(
          (p) => (p._actuallyCorrect ?? p.isCorrect) && rectsOverlap(p, solRect)
        );
        if (blockedByCorrect) continue;

        // Remove any wrong rects that overlap with this hint
        const remaining = placed.filter(
          (p) => !rectsOverlap(p, solRect) || (p._actuallyCorrect ?? p.isCorrect)
        );

        const { clueIndex } = validateRect(solRect, puzzle.clues);
        const newRect: PlacedRect = {
          ...solRect,
          color: '',
          isCorrect: true,
          clueIndex,
        };
        newRect._actuallyCorrect = true;

        const newPlaced = recolorAll([...remaining, newRect]);
        setPlaced(newPlaced);
        setHintsUsed((h) => h + 1);
        pushHistory(newPlaced);

        const complete = checkComplete(
          newPlaced.map((p) => ({
            ...p,
            isCorrect: p._actuallyCorrect ?? p.isCorrect,
          })),
          puzzle
        );
        if (complete) setIsComplete(true);

        return newRect;
      }
    }
    return null;
  }, [placed, puzzle, pushHistory, recolorAll, hintsUsed]);

  const getRectAtCell = useCallback(
    (row: number, col: number): { rect: PlacedRect; index: number } | null => {
      for (let i = placed.length - 1; i >= 0; i--) {
        const p = placed[i];
        if (
          row >= p.row &&
          row < p.row + p.height &&
          col >= p.col &&
          col < p.col + p.width
        ) {
          return { rect: p, index: i };
        }
      }
      return null;
    },
    [placed]
  );

  const completionPercent = placed.length > 0
    ? placed.reduce((sum, r) => sum + r.width * r.height, 0) / (puzzle.width * puzzle.height)
    : 0;

  return {
    placed,
    startCell,
    setStartCell,
    previewRect,
    setPreviewRect,
    isComplete,
    hintsUsed,
    hintsRemaining: 3 - hintsUsed,
    elapsedSeconds,
    showTimer,
    setShowTimer,
    placeRect,
    removeRect,
    undo,
    redo,
    clearAll,
    hint,
    getRectAtCell,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    completionPercent,
    unlockedColors,
    restored,
  };
}
