import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { Puzzle, Difficulty } from '~/lib/puzzle/types';
import type { GridRect } from '~/lib/puzzle/types';
import { useGameState } from '~/lib/hooks/useGameState';
import { useSound } from '~/lib/hooks/useSound';
import GameBoard from './GameBoard';
import GameControls from './GameControls';
import SettingsDrawer from './SettingsDrawer';
import WinModal from './WinModal';
import WinConfetti from './WinConfetti';
import IntroAnimation from './IntroAnimation';

interface GamePageProps {
  puzzle: Puzzle;
  difficulty: Difficulty;
  puzzleType: string;
  onNextPuzzle?: () => void;
}

export default function GamePage({
  puzzle,
  difficulty,
  puzzleType,
  onNextPuzzle,
}: GamePageProps) {
  const [blindMode, setBlindMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('blindMode') === 'true';
  });
  const [showDragCounter, setShowDragCounter] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('showDragCounter') !== 'false';
  });

  const gameState = useGameState(puzzle, blindMode);
  const sound = useSound();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [introComplete, setIntroComplete] = useState(
    typeof window !== 'undefined' && sessionStorage.getItem('introPlayed') === '1'
  );
  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Dual input mode state
  const pointerStartRef = useRef<{ row: number; col: number; x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragCellRef = useRef<{ row: number; col: number } | null>(null);

  // Remove confirmation state
  const [removeHighlight, setRemoveHighlight] = useState<number | null>(null);
  const removeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Multi-pointer / pinch tracking
  const activePointersRef = useRef(new Set<number>());
  const isPinchingRef = useRef(false);
  const pinchCooldownRef = useRef(false);
  const pendingRemovalRef = useRef<{ index: number; x: number; y: number } | null>(null);

  // Calculate cell size
  const cellSize = useMemo(() => {
    if (typeof window === 'undefined') return 48;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return Math.max(
      Math.min(
        Math.floor((vw * 0.92) / puzzle.width),
        Math.floor((vh * 0.75) / puzzle.height),
        64
      ),
      32
    );
  }, [puzzle.width, puzzle.height]);

  const needsZoom = cellSize * puzzle.width > (typeof window !== 'undefined' ? window.innerWidth * 0.9 : 800);

  // Win detection
  const prevCompleteRef = useRef(false);
  if (gameState.isComplete && !prevCompleteRef.current) {
    prevCompleteRef.current = true;
    // Schedule win sequence
    setTimeout(() => setShowConfetti(true), 500);
    setTimeout(() => {
      setShowWinModal(true);
      sound.playWinChord();
    }, 800);
  }

  // Cancel any in-progress game interaction
  const cancelInteraction = useCallback(() => {
    pointerStartRef.current = null;
    isDraggingRef.current = false;
    dragCellRef.current = null;
    pendingRemovalRef.current = null;
    gameState.setPreviewRect(null);
  }, [gameState]);

  // Global pointer cleanup for edge cases (pointercancel, pointerup outside SVG)
  useEffect(() => {
    const cleanupPointer = (e: PointerEvent) => {
      activePointersRef.current.delete(e.pointerId);
      if (activePointersRef.current.size === 0 && isPinchingRef.current) {
        pinchCooldownRef.current = true;
        setTimeout(() => {
          isPinchingRef.current = false;
          pinchCooldownRef.current = false;
        }, 100);
      }
    };
    const handlePointerCancel = (e: PointerEvent) => {
      cleanupPointer(e);
      cancelInteraction();
    };
    document.addEventListener('pointerup', cleanupPointer);
    document.addEventListener('pointercancel', handlePointerCancel);
    return () => {
      document.removeEventListener('pointerup', cleanupPointer);
      document.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [cancelInteraction]);

  const handleCellPointerDown = useCallback(
    (row: number, col: number, e: React.PointerEvent) => {
      if (gameState.isComplete) return;

      // Multi-pointer tracking
      activePointersRef.current.add(e.pointerId);
      if (activePointersRef.current.size >= 2) {
        isPinchingRef.current = true;
        cancelInteraction();
        return;
      }
      if (isPinchingRef.current || pinchCooldownRef.current) return;

      // Check if there's a placed rect — defer removal to pointerUp
      const existing = gameState.getRectAtCell(row, col);
      if (existing) {
        pendingRemovalRef.current = { index: existing.index, x: e.clientX, y: e.clientY };
        return;
      }

      pointerStartRef.current = { row, col, x: e.clientX, y: e.clientY };
      isDraggingRef.current = false;
      dragCellRef.current = { row, col };
    },
    [gameState, cancelInteraction]
  );

  const handleCellPointerMove = useCallback(
    (row: number, col: number) => {
      if (!pointerStartRef.current || gameState.isComplete) return;
      if (isPinchingRef.current || pinchCooldownRef.current) return;

      const start = pointerStartRef.current;

      if (!isDraggingRef.current) {
        // Check if we've moved beyond the 8px threshold via grid cells
        if (row !== start.row || col !== start.col) {
          isDraggingRef.current = true;
          // Cancel any tap mode start cell
          gameState.setStartCell(null);
        }
      }

      if (isDraggingRef.current) {
        dragCellRef.current = { row, col };
        const minRow = Math.min(start.row, row);
        const maxRow = Math.max(start.row, row);
        const minCol = Math.min(start.col, col);
        const maxCol = Math.max(start.col, col);
        gameState.setPreviewRect({
          row: minRow,
          col: minCol,
          width: maxCol - minCol + 1,
          height: maxRow - minRow + 1,
        });
      }
    },
    [gameState]
  );

  const handleCellPointerUp = useCallback(
    (row: number, col: number, e: React.PointerEvent) => {
      if (gameState.isComplete) return;

      // Multi-pointer tracking
      activePointersRef.current.delete(e.pointerId);
      if (isPinchingRef.current || pinchCooldownRef.current) {
        cancelInteraction();
        if (activePointersRef.current.size === 0 && isPinchingRef.current) {
          pinchCooldownRef.current = true;
          setTimeout(() => {
            isPinchingRef.current = false;
            pinchCooldownRef.current = false;
          }, 100);
        }
        return;
      }

      // Handle deferred rectangle removal
      if (pendingRemovalRef.current) {
        const pr = pendingRemovalRef.current;
        pendingRemovalRef.current = null;
        const dx = e.clientX - pr.x;
        const dy = e.clientY - pr.y;
        if (Math.hypot(dx, dy) < 10) {
          const percent = gameState.completionPercent;
          if (percent < 0.5) {
            gameState.removeRect(pr.index);
          } else {
            if (removeHighlight === pr.index) {
              gameState.removeRect(pr.index);
              setRemoveHighlight(null);
              if (removeTimerRef.current) clearTimeout(removeTimerRef.current);
            } else {
              setRemoveHighlight(pr.index);
              if (removeTimerRef.current) clearTimeout(removeTimerRef.current);
              removeTimerRef.current = setTimeout(() => setRemoveHighlight(null), 2000);
            }
          }
        }
        return;
      }

      if (isDraggingRef.current && pointerStartRef.current) {
        // Drag mode: lock the rectangle
        const start = pointerStartRef.current;
        const minRow = Math.min(start.row, row);
        const maxRow = Math.max(start.row, row);
        const minCol = Math.min(start.col, col);
        const maxCol = Math.max(start.col, col);

        const rect: GridRect = {
          row: minRow,
          col: minCol,
          width: maxCol - minCol + 1,
          height: maxRow - minRow + 1,
        };

        const placed = gameState.placeRect(rect);
        if (placed) {
          if ((placed as any)._actuallyCorrect ?? placed.isCorrect) {
            sound.playThunk();
          } else {
            sound.playBuzz();
          }
        }
      } else if (pointerStartRef.current) {
        // Tap mode — check pixel threshold for wobble protection
        const start = pointerStartRef.current;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        if (Math.hypot(dx, dy) < 10) {
          if (row === start.row && col === start.col) {
            if (gameState.startCell) {
              if (gameState.startCell.row === row && gameState.startCell.col === col) {
                gameState.setStartCell(null);
                gameState.setPreviewRect(null);
              } else {
                const sc = gameState.startCell;
                const minRow = Math.min(sc.row, row);
                const maxRow = Math.max(sc.row, row);
                const minCol = Math.min(sc.col, col);
                const maxCol = Math.max(sc.col, col);

                const rect: GridRect = {
                  row: minRow,
                  col: minCol,
                  width: maxCol - minCol + 1,
                  height: maxRow - minRow + 1,
                };

                const placed = gameState.placeRect(rect);
                if (placed) {
                  if ((placed as any)._actuallyCorrect ?? placed.isCorrect) {
                    sound.playThunk();
                  } else {
                    sound.playBuzz();
                  }
                }
              }
            } else {
              gameState.setStartCell({ row, col });
            }
          }
        }
      }

      pointerStartRef.current = null;
      isDraggingRef.current = false;
      dragCellRef.current = null;
    },
    [gameState, sound, removeHighlight, cancelInteraction]
  );

  // Rectangle removal is now handled via pointerDown/pointerUp with threshold
  const handleRectClick = useCallback(() => {}, []);

  const handleHint = useCallback(() => {
    const hinted = gameState.hint();
    if (hinted) sound.playThunk();
  }, [gameState, sound]);

  const handleShare = useCallback(async () => {
    const text = `MONDRIAN SHIKAKU · ${puzzleType} · ${difficulty} · ${Math.floor(gameState.elapsedSeconds / 60)}:${String(gameState.elapsedSeconds % 60).padStart(2, '0')}`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch {}
  }, [puzzleType, difficulty, gameState.elapsedSeconds]);

  const svgWidth = cellSize * puzzle.width;
  const svgHeight = cellSize * puzzle.height;

  const boardContent = (
    <div className="game-board-container relative" style={{ width: svgWidth, height: svgHeight }}>
      {!introComplete && (
        <IntroAnimation onComplete={handleIntroComplete} />
      )}
      <GameBoard
        puzzle={puzzle}
        placed={gameState.placed}
        startCell={gameState.startCell}
        previewRect={gameState.previewRect}
        isComplete={gameState.isComplete}
        onCellPointerDown={handleCellPointerDown}
        onCellPointerMove={handleCellPointerMove}
        onCellPointerUp={handleCellPointerUp}
        onRectClick={handleRectClick}
        cellSize={cellSize}
        showDragCounter={showDragCounter}
      />
      <WinConfetti
        width={svgWidth}
        height={svgHeight}
        originX={svgWidth / 2}
        originY={svgHeight / 2}
        active={showConfetti}
      />
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4 py-4 px-4">
      {/* Controls */}
      <div style={{ width: svgWidth }}>
        <GameControls
          canUndo={gameState.canUndo}
          canRedo={gameState.canRedo}
          onUndo={gameState.undo}
          onRedo={gameState.redo}
          elapsedSeconds={gameState.elapsedSeconds}
          showTimer={gameState.showTimer}
          hintsRemaining={gameState.hintsRemaining}
          onHint={handleHint}
          onClear={gameState.clearAll}
          onSettings={() => setSettingsOpen(true)}
        />
      </div>

      {/* Game board */}
      {needsZoom ? (
        <TransformWrapper
          initialScale={1}
          minScale={0.3}
          maxScale={3}
          centerOnInit
          doubleClick={{ disabled: true }}
          onPinchingStart={() => {
            isPinchingRef.current = true;
            cancelInteraction();
          }}
          onPinchingStop={() => {
            pinchCooldownRef.current = true;
            setTimeout(() => {
              isPinchingRef.current = false;
              pinchCooldownRef.current = false;
            }, 100);
          }}
        >
          <TransformComponent>
            {boardContent}
          </TransformComponent>
        </TransformWrapper>
      ) : (
        boardContent
      )}

      {/* Settings drawer */}
      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        blindMode={blindMode}
        onBlindModeChange={(v) => {
          setBlindMode(v);
          localStorage.setItem('blindMode', String(v));
        }}
        soundEnabled={sound.enabled}
        onSoundChange={sound.toggleSound}
        showTimer={gameState.showTimer}
        onShowTimerChange={gameState.setShowTimer}
        showDragCounter={showDragCounter}
        onShowDragCounterChange={(v) => {
          setShowDragCounter(v);
          localStorage.setItem('showDragCounter', String(v));
        }}
      />

      {/* Win modal */}
      <WinModal
        isOpen={showWinModal}
        solveTimeSeconds={gameState.elapsedSeconds}
        difficulty={difficulty}
        hintsUsed={gameState.hintsUsed}
        blindMode={blindMode}
        puzzleType={puzzleType}
        onNextPuzzle={onNextPuzzle || (() => window.location.reload())}
        onShare={handleShare}
        onClose={() => setShowWinModal(false)}
      />
    </div>
  );
}
