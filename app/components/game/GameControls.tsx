import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GameTimer } from '~/components/ui/Countdown';

interface GameControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  elapsedSeconds: number;
  showTimer: boolean;
  hintsRemaining: number;
  onHint: () => void;
  onClear: () => void;
  onSettings: () => void;
}

export default function GameControls({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  elapsedSeconds,
  showTimer,
  hintsRemaining,
  onHint,
  onClear,
  onSettings,
}: GameControlsProps) {
  const [clearPending, setClearPending] = useState(false);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClear = useCallback(() => {
    if (clearPending) {
      // Second press — confirm clear
      setClearPending(false);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      onClear();
    } else {
      // First press — start confirmation
      setClearPending(true);
      clearTimerRef.current = setTimeout(() => {
        setClearPending(false);
      }, 2000);
    }
  }, [clearPending, onClear]);

  return (
    <div
      className="w-full border-2 border-[var(--color-border)] bg-[var(--color-surface)]"
      style={{
        height: '56px',
        display: 'grid',
        gridTemplateColumns: '56px 56px 1fr 80px 80px 48px',
        alignItems: 'center',
      }}
    >
      {/* Undo */}
      <motion.button
        className="flex items-center justify-center h-full border-r-2 border-[var(--color-border)] cursor-pointer"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: canUndo ? 'var(--color-text)' : 'var(--color-text-muted)',
          backgroundColor: 'transparent',
          opacity: canUndo ? 1 : 0.4,
        }}
        whileHover={canUndo ? { backgroundColor: 'var(--color-surface-2)' } : undefined}
        whileTap={canUndo ? { scale: 0.95 } : undefined}
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Undo"
      >
        ←
      </motion.button>

      {/* Redo */}
      <motion.button
        className="flex items-center justify-center h-full border-r-2 border-[var(--color-border)] cursor-pointer"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: canRedo ? 'var(--color-text)' : 'var(--color-text-muted)',
          backgroundColor: 'transparent',
          opacity: canRedo ? 1 : 0.4,
        }}
        whileHover={canRedo ? { backgroundColor: 'var(--color-surface-2)' } : undefined}
        whileTap={canRedo ? { scale: 0.95 } : undefined}
        onClick={onRedo}
        disabled={!canRedo}
        aria-label="Redo"
      >
        →
      </motion.button>

      {/* Timer */}
      <div
        className="flex items-center justify-center h-full border-r-2 border-[var(--color-border)]"
        style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text)',
        }}
      >
        {showTimer ? (
          <GameTimer seconds={elapsedSeconds} />
        ) : (
          <span
            style={{
              width: '7ch',
              textAlign: 'center',
              fontVariantNumeric: 'tabular-nums',
              color: 'var(--color-text-muted)',
            }}
          >
            --:--
          </span>
        )}
      </div>

      {/* Hint */}
      <motion.button
        className="flex items-center justify-center h-full border-r-2 border-[var(--color-border)] cursor-pointer gap-1"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: hintsRemaining > 0 ? 'var(--color-text)' : 'var(--color-text-muted)',
          backgroundColor: 'transparent',
          opacity: hintsRemaining > 0 ? 1 : 0.4,
        }}
        whileHover={
          hintsRemaining > 0
            ? { backgroundColor: 'var(--color-surface-2)' }
            : undefined
        }
        onClick={onHint}
        disabled={hintsRemaining <= 0}
        aria-label={`Use hint. ${hintsRemaining} remaining`}
      >
        Hint ({hintsRemaining})
      </motion.button>

      {/* Clear */}
      <motion.button
        className="flex items-center justify-center h-full border-r-2 border-[var(--color-border)] cursor-pointer"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text)',
          backgroundColor: clearPending ? 'var(--color-yellow)' : 'transparent',
        }}
        whileHover={{ backgroundColor: clearPending ? 'var(--color-yellow)' : 'var(--color-surface-2)' }}
        onClick={handleClear}
        aria-label={clearPending ? 'Press again to clear all' : 'Clear all rectangles'}
      >
        {clearPending ? 'Sure?' : '✕ Clear'}
      </motion.button>

      {/* Settings */}
      <motion.button
        className="flex items-center justify-center h-full cursor-pointer"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          color: 'var(--color-text)',
          backgroundColor: 'transparent',
        }}
        whileHover={{ backgroundColor: 'var(--color-surface-2)' }}
        onClick={onSettings}
        aria-label="Open settings"
      >
        ⚙
      </motion.button>
    </div>
  );
}
