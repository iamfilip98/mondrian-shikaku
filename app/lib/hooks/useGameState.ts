import { useState, useCallback, useRef, useEffect } from 'react';
import type { Puzzle, GridRect, PlacedRect } from '~/lib/puzzle/types';
import { assignColors, getUnlockedColors } from '~/lib/puzzle/graphColor';
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

export function useGameState(puzzle: Puzzle, blindMode = false) {
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
    try { localStorage.setItem('showTimer', String(value)); } catch {}
  }, []);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const unlockedColors = getUnlockedColors();

  // Timer
  useEffect(() => {
    if (isComplete) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    const handleVisibility = () => {
      if (document.hidden) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
      } else if (!isComplete) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setElapsedSeconds((s) => s + 1);
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isComplete]);

  const getColorForRect = useCallback(
    (rect: GridRect, currentPlaced: PlacedRect[], isCorrect: boolean): string => {
      if (!isCorrect && !blindMode) return 'var(--color-wrong)';

      // Graph coloring
      const allRects = [...currentPlaced.map((p) => ({ row: p.row, col: p.col, width: p.width, height: p.height })), rect];
      const colors = assignColors(allRects, unlockedColors);
      return colors.get(allRects.length - 1) || unlockedColors[0];
    },
    [unlockedColors, blindMode]
  );

  const placeRect = useCallback(
    (rect: GridRect): PlacedRect | null => {
      // Check overlaps with existing
      const nonOverlapping = placed.filter((p) => !rectsOverlap(p, rect));
      const removedCount = placed.length - nonOverlapping.length;

      const { isCorrect, clueIndex } = validateRect(rect, puzzle.clues);
      const color = getColorForRect(rect, nonOverlapping, isCorrect);

      const newRect: PlacedRect = {
        ...rect,
        color,
        isCorrect: blindMode ? true : isCorrect,
        clueIndex,
      };

      // Store actual correctness for win detection in blind mode
      newRect._actuallyCorrect = isCorrect;

      const newPlaced = [...nonOverlapping, newRect];
      setPlaced(newPlaced);

      // Update history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ placed: newPlaced });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

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
    [placed, puzzle, history, historyIndex, getColorForRect, blindMode]
  );

  const removeRect = useCallback(
    (index: number) => {
      const newPlaced = placed.filter((_, i) => i !== index);
      setPlaced(newPlaced);

      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ placed: newPlaced });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [placed, history, historyIndex]
  );

  const undo = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setPlaced(history[newIndex].placed);
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setPlaced(history[newIndex].placed);
  }, [historyIndex, history]);

  const clearAll = useCallback(() => {
    setPlaced([]);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ placed: [] });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setStartCell(null);
    setPreviewRect(null);
  }, [history, historyIndex]);

  const hint = useCallback(() => {
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
        // Check no overlap with correctly placed rects
        const hasOverlap = placed.some((p) => rectsOverlap(p, solRect));
        if (!hasOverlap) {
          const { isCorrect, clueIndex } = validateRect(solRect, puzzle.clues);
          const color = getColorForRect(solRect, placed, true);
          const newRect: PlacedRect = {
            ...solRect,
            color,
            isCorrect: true,
            clueIndex,
          };
          newRect._actuallyCorrect = true;

          const newPlaced = [...placed, newRect];
          setPlaced(newPlaced);
          setHintsUsed((h) => h + 1);

          const newHistory = history.slice(0, historyIndex + 1);
          newHistory.push({ placed: newPlaced });
          setHistory(newHistory);
          setHistoryIndex(newHistory.length - 1);

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
    }
    return null;
  }, [placed, puzzle, history, historyIndex, getColorForRect]);

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
  };
}
