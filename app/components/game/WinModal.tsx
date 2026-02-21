import { motion, AnimatePresence } from 'framer-motion';
import Button from '~/components/ui/Button';
import Badge from '~/components/ui/Badge';
import type { Difficulty } from '~/lib/puzzle/types';

interface WinModalProps {
  isOpen: boolean;
  solveTimeSeconds: number;
  difficulty: Difficulty;
  hintsUsed: number;
  blindMode: boolean;
  puzzleType: string;
  onNextPuzzle: () => void;
  onShare: () => void;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function WinModal({
  isOpen,
  solveTimeSeconds,
  difficulty,
  hintsUsed,
  blindMode,
  puzzleType,
  onNextPuzzle,
  onShare,
  onClose,
}: WinModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed z-50 bg-[var(--color-bg)] border-2 border-[var(--color-border)] shadow-sharp-xl"
            style={{
              top: '50%',
              left: '50%',
              width: 'min(420px, 90vw)',
            }}
            initial={{ opacity: 0, scale: 0.96, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.96, x: '-50%', y: '-50%' }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Header accent */}
            <div
              style={{
                height: '6px',
                backgroundColor: 'var(--color-red)',
              }}
            />

            <div className="px-8 py-6">
              {/* Solve time */}
              <div className="text-center mb-6">
                <span
                  className="block mb-1"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  Solve Time
                </span>
                <span
                  className="block shadow-sharp-lg inline-block px-6 py-3 border-2 border-[var(--color-border)]"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-4xl)',
                    color: 'var(--color-text)',
                    lineHeight: 'var(--leading-tight)',
                  }}
                >
                  {formatTime(solveTimeSeconds)}
                </span>
              </div>

              {/* Badges row */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <Badge difficulty={difficulty} />
                {hintsUsed > 0 && (
                  <span
                    className="inline-flex items-center px-3 py-1 border-2 border-[var(--color-border)]"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {hintsUsed} hint{hintsUsed !== 1 ? 's' : ''} used
                  </span>
                )}
                {blindMode && (
                  <span
                    className="inline-flex items-center px-3 py-1 border-2 border-[var(--color-border)]"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-xs)',
                      backgroundColor: 'var(--color-blue)',
                      color: 'var(--color-white)',
                    }}
                  >
                    Blind Mode
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Button variant="primary" size="lg" fullWidth onClick={onShare}>
                  Share Result
                </Button>
                <Button variant="outline" size="lg" fullWidth onClick={onNextPuzzle}>
                  Next Puzzle
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
