import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, type Theme } from '~/lib/hooks/useTheme';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  blindMode: boolean;
  onBlindModeChange: (value: boolean) => void;
  soundEnabled: boolean;
  onSoundChange: (value: boolean) => void;
  showTimer: boolean;
  onShowTimerChange: (value: boolean) => void;
  unlockedColors: string[];
}

function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex items-center justify-between w-full py-3 cursor-pointer"
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text)',
        background: 'none',
        border: 'none',
      }}
    >
      <span>{label}</span>
      <div
        className="relative border-2 border-[var(--color-border)]"
        style={{
          width: '44px',
          height: '24px',
          backgroundColor: value ? 'var(--color-blue)' : 'var(--color-surface-2)',
        }}
      >
        <motion.div
          className="absolute top-0"
          style={{
            width: '18px',
            height: '18px',
            backgroundColor: 'var(--color-text)',
            top: '1px',
          }}
          animate={{ left: value ? '21px' : '1px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  );
}

export default function SettingsDrawer({
  isOpen,
  onClose,
  blindMode,
  onBlindModeChange,
  soundEnabled,
  onSoundChange,
  showTimer,
  onShowTimerChange,
  unlockedColors,
}: SettingsDrawerProps) {
  const { theme, setTheme } = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 z-50 bg-[var(--color-bg)] border-l-2 border-[var(--color-border)] shadow-sharp-xl overflow-y-auto"
            style={{ width: 'min(320px, 100vw)' }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 border-b-2 border-[var(--color-border)]"
              style={{ height: '56px' }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-xl)',
                  color: 'var(--color-text)',
                }}
              >
                Settings
              </span>
              <button
                onClick={onClose}
                className="flex items-center justify-center cursor-pointer"
                style={{
                  width: '32px',
                  height: '32px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-lg)',
                  color: 'var(--color-text)',
                  background: 'none',
                  border: 'none',
                }}
                aria-label="Close settings"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              {/* Theme */}
              <div className="mb-6">
                <span
                  className="block mb-2"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 500,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Theme
                </span>
                <div className="flex border-2 border-[var(--color-border)]">
                  {(['light', 'dark', 'system'] as Theme[]).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setTheme(opt)}
                      className="flex-1 flex items-center justify-center cursor-pointer relative"
                      style={{
                        height: '40px',
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        color:
                          theme === opt
                            ? 'var(--color-text-inverse)'
                            : 'var(--color-text)',
                        borderRight:
                          opt !== 'system'
                            ? '2px solid var(--color-border)'
                            : 'none',
                        background: 'none',
                        border: 'none',
                        borderRightWidth: opt !== 'system' ? '2px' : '0',
                        borderRightStyle: 'solid',
                        borderRightColor: 'var(--color-border)',
                      }}
                    >
                      {theme === opt && (
                        <motion.div
                          layoutId="settings-theme"
                          className="absolute inset-0"
                          style={{ backgroundColor: 'var(--color-border)' }}
                        />
                      )}
                      <span className="relative z-10 capitalize">{opt}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="border-t border-[var(--color-border-muted)] pt-4">
                <Toggle
                  value={blindMode}
                  onChange={onBlindModeChange}
                  label="Colour all rectangles"
                />
                <Toggle
                  value={soundEnabled}
                  onChange={onSoundChange}
                  label="Sound effects"
                />
                <Toggle
                  value={showTimer}
                  onChange={onShowTimerChange}
                  label="Show timer"
                />
              </div>

              {/* Unlocked colours */}
              <div className="mt-6 border-t border-[var(--color-border-muted)] pt-4">
                <span
                  className="block mb-2"
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 500,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Unlocked Colours
                </span>
                <div className="flex gap-2">
                  {['var(--color-red)', 'var(--color-yellow)', 'var(--color-blue)'].map(
                    (color, i) => {
                      const isUnlocked = unlockedColors.includes(color);
                      return (
                        <div
                          key={color}
                          style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: isUnlocked ? color : 'var(--color-surface-2)',
                            border: '2px solid var(--color-border)',
                            opacity: isUnlocked ? 1 : 0.3,
                          }}
                        />
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
