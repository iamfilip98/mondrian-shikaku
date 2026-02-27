import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router';
import Button from '~/components/ui/Button';
import Badge from '~/components/ui/Badge';
import { useFocusTrap } from '~/lib/hooks/useFocusTrap';
import { BADGE_MAP } from '~/lib/achievements/badges';
import type { Difficulty } from '~/lib/puzzle/types';

interface WinModalProps {
  isOpen: boolean;
  solveTimeSeconds: number;
  difficulty: Difficulty;
  hintsUsed: number;
  blindMode: boolean;
  puzzleType: string;
  isLoggedIn?: boolean;
  streak?: number | null;
  newBadges?: string[];
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
  isLoggedIn,
  streak,
  newBadges,
  onNextPuzzle,
  onShare,
  onClose,
}: WinModalProps) {
  const focusTrapRef = useFocusTrap(isOpen, onClose);
  const reducedMotion = useReducedMotion();
  const dur = reducedMotion ? 0 : 0.2;

  // Track anonymous session solve count
  const anonSolveCount = (() => {
    if (isLoggedIn !== false || !isOpen) return 0;
    try {
      const current = parseInt(sessionStorage.getItem('anonSolves') || '0', 10);
      return current;
    } catch { return 0; }
  })();

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
            transition={{ duration: dur }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            ref={focusTrapRef}
            role="dialog"
            aria-modal="true"
            aria-label="Puzzle completed"
            className="fixed z-50 bg-[var(--color-bg)] border-2 border-[var(--color-border)] shadow-sharp-xl"
            style={{
              top: '50%',
              left: '50%',
              width: 'min(420px, 90vw)',
            }}
            initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.96, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.96, x: '-50%', y: '-50%' }}
            transition={{ duration: dur, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Header accent */}
            <div
              style={{
                height: '6px',
                backgroundColor: 'var(--color-red)',
              }}
            />
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '44px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-base)',
              }}
            >
              ✕
            </button>

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
              <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
                {!['Daily', 'Weekly', 'Monthly'].includes(puzzleType) && (
                  <Badge difficulty={difficulty} />
                )}
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
                {streak != null && streak > 0 && (
                  <span
                    className="inline-flex items-center px-3 py-1 border-2 border-[var(--color-border)]"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-xs)',
                      backgroundColor: 'var(--color-yellow)',
                      color: 'var(--color-black)',
                      fontWeight: 500,
                    }}
                  >
                    {streak} day streak
                  </span>
                )}
              </div>

              {/* New badges */}
              {newBadges && newBadges.length > 0 && (
                <div className="mb-4 border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                  <span
                    className="block mb-2 text-center"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontWeight: 500,
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    New Achievement{newBadges.length > 1 ? 's' : ''}!
                  </span>
                  <div className="flex flex-col gap-1">
                    {newBadges.map(key => {
                      const badge = BADGE_MAP.get(key);
                      if (!badge) return null;
                      return (
                        <div
                          key={key}
                          className="flex items-center gap-2 px-2 py-1"
                          style={{ borderLeft: `4px solid ${badge.color}` }}
                        >
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text)' }}>
                            {badge.name}
                          </span>
                          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                            — {badge.description}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Button variant="primary" size="lg" fullWidth onClick={onShare}>
                  Share Result
                </Button>
                <Button variant="outline" size="lg" fullWidth onClick={onNextPuzzle}>
                  Next Puzzle
                </Button>
              </div>

              {/* Sign in prompt */}
              {isLoggedIn === false && (
                <div
                  className="mt-4 text-center border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                  style={{ borderLeftWidth: '4px', borderLeftColor: 'var(--color-yellow)' }}
                >
                  {anonSolveCount > 0 && (
                    <span
                      className="block mb-1"
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontWeight: 500,
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text)',
                      }}
                    >
                      You've solved {anonSolveCount} puzzle{anonSolveCount !== 1 ? 's' : ''} this session.
                    </span>
                  )}
                  <Link
                    to="/login"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    Sign in to save your stats and appear on leaderboards
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
