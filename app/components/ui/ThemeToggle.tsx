import { useTheme, type Theme } from '~/lib/hooks/useTheme';
import { motion } from 'framer-motion';

const options: { value: Theme; label: string }[] = [
  { value: 'light', label: '☀' },
  { value: 'dark', label: '●' },
  { value: 'system', label: 'A' },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="flex items-center border-2 border-[var(--color-border)]"
      style={{ height: '32px' }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className="relative flex items-center justify-center cursor-pointer"
          style={{
            width: '32px',
            height: '28px',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color:
              theme === opt.value
                ? 'var(--color-text-inverse)'
                : 'var(--color-text)',
            borderRight:
              opt.value !== 'system'
                ? '1px solid var(--color-border)'
                : 'none',
          }}
          aria-label={`Set theme to ${opt.value}`}
        >
          {theme === opt.value && (
            <motion.div
              layoutId="theme-active"
              className="absolute inset-0"
              style={{ backgroundColor: 'var(--color-border)' }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 35,
              }}
            />
          )}
          <span className="relative z-10">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
