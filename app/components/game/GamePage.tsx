import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import type { Puzzle, Difficulty } from '~/lib/puzzle/types';
import type { GridRect } from '~/lib/puzzle/types';
import { useGameState } from '~/lib/hooks/useGameState';
import { useSound } from '~/lib/hooks/useSound';
import { useAuth } from '~/lib/hooks/useAuth';
import { useToast } from '~/lib/hooks/useToast';
import { trackEvent } from '~/lib/analytics';
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
  puzzleSeed?: string;
  onNextPuzzle?: () => void;
}

export default function GamePage({
  puzzle,
  difficulty,
  puzzleType,
  puzzleSeed,
  onNextPuzzle,
}: GamePageProps) {
  const [blindMode, setBlindMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    try { return localStorage.getItem('blindMode') === 'true'; } catch { return false; }
  });
  const [showDragCounter, setShowDragCounter] = useState(() => {
    if (typeof window === 'undefined') return true;
    try { return localStorage.getItem('showDragCounter') !== 'false'; } catch { return true; }
  });

  const gameState = useGameState(puzzle, blindMode);
  const sound = useSound();
  const { user, profile, refreshProfile, getToken } = useAuth();
  const { addToast } = useToast();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [introComplete, setIntroComplete] = useState(() => {
    if (typeof window === 'undefined') return false;
    try { return sessionStorage.getItem('introPlayed') === '1'; } catch { return false; }
  });
  const handleIntroComplete = useCallback(() => setIntroComplete(true), []);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Dual input mode state
  const pointerStartRef = useRef<{ row: number; col: number; x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragCellRef = useRef<{ row: number; col: number } | null>(null);

  // (removal is now single-tap; undo is the safety net)

  // Multi-pointer / pinch tracking
  const activePointersRef = useRef(new Set<number>());
  const isPinchingRef = useRef(false);
  const pinchCooldownRef = useRef(false);
  const isPanningRef = useRef(false);
  const panCooldownRef = useRef(false);
  const pendingRemovalRef = useRef<{ index: number; x: number; y: number } | null>(null);

  // Solve submission guard
  const solveSubmittedRef = useRef(false);

  // Track puzzle_started once per puzzle
  const puzzleTrackedRef = useRef(false);
  useEffect(() => {
    if (puzzleTrackedRef.current) return;
    puzzleTrackedRef.current = true;
    trackEvent('puzzle_started', {
      puzzle_type: puzzleType,
      difficulty,
      grid_size: `${puzzle.width}x${puzzle.height}`,
      seed: puzzleSeed,
    });
  }, []);

  // Streak state for WinModal
  const [winStreak, setWinStreak] = useState<number | null>(null);

  // Calculate cell size
  const cellSize = useMemo(() => {
    if (typeof window === 'undefined') return 48;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return Math.min(
      Math.floor((vw * 0.92) / puzzle.width),
      Math.floor((vh * 0.75) / puzzle.height),
      64
    );
  }, [puzzle.width, puzzle.height]);

  const needsZoom = useMemo(
    () => cellSize < 28,
    [cellSize]
  );

  // Win detection
  const prevCompleteRef = useRef(false);
  if (gameState.isComplete && !prevCompleteRef.current) {
    prevCompleteRef.current = true;
    trackEvent('puzzle_completed', {
      puzzle_type: puzzleType,
      difficulty,
      solve_time_seconds: gameState.elapsedSeconds,
      hints_used: gameState.hintsUsed,
      blind_mode: blindMode,
    });
    // Schedule win sequence
    setTimeout(() => setShowConfetti(true), 500);
    setTimeout(() => {
      setShowWinModal(true);
      sound.playWinChord();
    }, 800);
  }
  // Reset win detection when isComplete goes from true → false (undo after win)
  if (!gameState.isComplete && prevCompleteRef.current) {
    prevCompleteRef.current = false;
  }

  // Submit solve when game completes (with retry)
  useEffect(() => {
    if (!gameState.isComplete || solveSubmittedRef.current || !user || !puzzleSeed) return;
    solveSubmittedRef.current = true;

    const puzzleTypeKey = puzzleType === 'Daily' ? 'daily'
      : puzzleType === 'Weekly' ? 'weekly'
      : puzzleType === 'Monthly' ? 'monthly'
      : 'free';

    (async () => {
      const token = await getToken();
      if (!token) {
        addToast('Could not save your solve. Please sign in again.', 'error');
        solveSubmittedRef.current = false;
        return;
      }

      const payload = {
        puzzleType: puzzleTypeKey,
        puzzleSeed,
        difficulty,
        gridWidth: puzzle.width,
        gridHeight: puzzle.height,
        solveTimeSeconds: gameState.elapsedSeconds,
        hintsUsed: gameState.hintsUsed,
        blindModeOn: blindMode,
      };

      let lastError = '';
      const delays = [0, 1000, 2000];
      for (let attempt = 0; attempt < delays.length; attempt++) {
        if (attempt > 0) await new Promise((r) => setTimeout(r, delays[attempt]));
        try {
          const res = await fetch('/api/solve', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            const data = await res.json();
            if (puzzleTypeKey === 'daily' && data.streak) {
              setWinStreak(data.streak);
            }
            addToast('Solve saved!', 'success');
            await refreshProfile();
            return;
          }

          // Don't retry 4xx errors — they won't succeed on retry
          const errBody = await res.json().catch(() => ({}));
          lastError = errBody.error || `${res.status}`;
          if (res.status >= 400 && res.status < 500) break;
        } catch {
          lastError = 'Network error';
        }
      }
      addToast(`Could not save solve: ${lastError}`, 'error');
      solveSubmittedRef.current = false;
    })();
  }, [gameState.isComplete, user, puzzleSeed, puzzleType, difficulty, puzzle.width, puzzle.height, gameState.elapsedSeconds, gameState.hintsUsed, blindMode, refreshProfile, getToken, addToast]);

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
        }, 50);
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
      if (isPinchingRef.current || pinchCooldownRef.current || isPanningRef.current || panCooldownRef.current) return;

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
      if (isPinchingRef.current || pinchCooldownRef.current || isPanningRef.current || panCooldownRef.current) return;

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
      if (isPinchingRef.current || pinchCooldownRef.current || isPanningRef.current || panCooldownRef.current) {
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

      // Handle deferred rectangle removal (single tap)
      if (pendingRemovalRef.current) {
        const pr = pendingRemovalRef.current;
        pendingRemovalRef.current = null;
        const dx = e.clientX - pr.x;
        const dy = e.clientY - pr.y;
        if (Math.hypot(dx, dy) < Math.max(cellSize * 0.6, 16)) {
          gameState.removeRect(pr.index);
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
          if (placed._actuallyCorrect ?? placed.isCorrect) {
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
        if (Math.hypot(dx, dy) < Math.max(cellSize * 0.5, 10)) {
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
                  if (placed._actuallyCorrect ?? placed.isCorrect) {
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
    [gameState, sound, cancelInteraction]
  );

  // Rectangle removal is now handled via pointerDown/pointerUp with threshold
  const handleRectClick = useCallback(() => {}, []);

  const handleHint = useCallback(() => {
    const hinted = gameState.hint();
    if (hinted) {
      sound.playThunk();
      trackEvent('hint_used', {
        hints_remaining: gameState.hintsRemaining - 1,
        elapsed_time: gameState.elapsedSeconds,
        difficulty,
      });
    }
  }, [gameState, sound, difficulty]);

  const handleShare = useCallback(async () => {
    const text = `MONDRIAN SHIKAKU · ${puzzleType} · ${difficulty} · ${Math.floor(gameState.elapsedSeconds / 60)}:${String(gameState.elapsedSeconds % 60).padStart(2, '0')}`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
        trackEvent('share_result', { method: 'native_share' });
      } else {
        await navigator.clipboard.writeText(text);
        trackEvent('share_result', { method: 'clipboard' });
        addToast('Copied to clipboard!', 'success');
      }
    } catch {
      addToast('Could not share. Please try again.', 'error');
    }
  }, [puzzleType, difficulty, gameState.elapsedSeconds, addToast]);

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
          onSettings={() => setSettingsOpen(true)}
        />
      </div>

      {/* Game board */}
      {needsZoom ? (
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={Math.max(3, Math.ceil(28 / cellSize))}
          centerOnInit={true}
          limitToBounds={true}
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
          onPanningStart={() => {
            isPanningRef.current = true;
            cancelInteraction();
          }}
          onPanningStop={() => {
            panCooldownRef.current = true;
            setTimeout(() => {
              isPanningRef.current = false;
              panCooldownRef.current = false;
            }, 100);
          }}
        >
          <TransformComponent
            wrapperStyle={{
              maxHeight: typeof window !== 'undefined' ? `${Math.floor(window.innerHeight * 0.7)}px` : undefined,
              width: '100%',
              touchAction: 'none',
            }}
          >
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
          try { localStorage.setItem('blindMode', String(v)); } catch {}
        }}
        soundEnabled={sound.enabled}
        onSoundChange={sound.toggleSound}
        showTimer={gameState.showTimer}
        onShowTimerChange={gameState.setShowTimer}
        showDragCounter={showDragCounter}
        onShowDragCounterChange={(v) => {
          setShowDragCounter(v);
          try { localStorage.setItem('showDragCounter', String(v)); } catch {}
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
        isLoggedIn={!!user}
        streak={puzzleType === 'Daily' ? winStreak : undefined}
        onNextPuzzle={onNextPuzzle || (() => window.location.reload())}
        onShare={handleShare}
        onClose={() => setShowWinModal(false)}
      />
    </div>
  );
}
