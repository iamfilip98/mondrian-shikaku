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
  onSettings: () => void;
  isComplete?: boolean;
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
  onSettings,
  isComplete = false,
}: GameControlsProps) {
  const undoEnabled = canUndo && !isComplete;
  const redoEnabled = canRedo && !isComplete;
  const hintEnabled = hintsRemaining > 0 && !isComplete;

  return (
    <div
      className="w-full border-2 border-[var(--color-border)] bg-[var(--color-surface)]"
      style={{
        height: '48px',
        display: 'grid',
        gridTemplateColumns: '48px 48px 1fr auto 44px',
        alignItems: 'center',
      }}
    >
      {/* Undo */}
      <motion.button
        className="flex items-center justify-center h-full border-r-2 border-[var(--color-border)] cursor-pointer"
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 500,
          fontSize: 'var(--text-sm)',
          color: undoEnabled ? 'var(--color-text)' : 'var(--color-text-muted)',
          backgroundColor: 'transparent',
          opacity: undoEnabled ? 1 : 0.4,
        }}
        whileHover={undoEnabled ? { backgroundColor: 'var(--color-surface-2)' } : undefined}
        whileTap={undoEnabled ? { scale: 0.95 } : undefined}
        onClick={onUndo}
        disabled={!undoEnabled}
        aria-label="Undo"
      >
        ←
      </motion.button>

      {/* Redo */}
      <motion.button
        className="flex items-center justify-center h-full border-r-2 border-[var(--color-border)] cursor-pointer"
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 500,
          fontSize: 'var(--text-sm)',
          color: redoEnabled ? 'var(--color-text)' : 'var(--color-text-muted)',
          backgroundColor: 'transparent',
          opacity: redoEnabled ? 1 : 0.4,
        }}
        whileHover={redoEnabled ? { backgroundColor: 'var(--color-surface-2)' } : undefined}
        whileTap={redoEnabled ? { scale: 0.95 } : undefined}
        onClick={onRedo}
        disabled={!redoEnabled}
        aria-label="Redo"
      >
        →
      </motion.button>

      {/* Timer */}
      <div
        className="flex items-center justify-center h-full border-r-2 border-[var(--color-border)]"
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 500,
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
        className="flex items-center justify-center h-full border-r-2 border-[var(--color-border)] cursor-pointer gap-1 px-3"
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 500,
          fontSize: 'var(--text-sm)',
          color: hintEnabled ? 'var(--color-text)' : 'var(--color-text-muted)',
          backgroundColor: 'transparent',
          opacity: hintEnabled ? 1 : 0.4,
        }}
        whileHover={
          hintEnabled
            ? { backgroundColor: 'var(--color-surface-2)' }
            : undefined
        }
        onClick={onHint}
        disabled={!hintEnabled}
        aria-label={`Use hint. ${hintsRemaining} remaining`}
      >
        Hint ({hintsRemaining})
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
