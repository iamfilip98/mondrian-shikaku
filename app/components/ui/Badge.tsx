import type { Difficulty } from '~/lib/puzzle/types';

const badgeColors: Record<Difficulty, { bg: string; text: string }> = {
  primer: { bg: 'var(--color-surface-2)', text: 'var(--color-text)' },
  easy: { bg: 'var(--color-yellow)', text: 'var(--color-black)' },
  medium: { bg: 'var(--color-blue)', text: 'var(--color-white)' },
  hard: { bg: 'var(--color-red)', text: 'var(--color-white)' },
  expert: { bg: 'var(--color-black)', text: 'var(--color-white)' },
  nightmare: { bg: 'var(--color-red)', text: 'var(--color-white)' },
};

interface BadgeProps {
  difficulty: Difficulty;
  className?: string;
}

export default function Badge({ difficulty, className = '' }: BadgeProps) {
  const { bg, text } = badgeColors[difficulty];

  return (
    <span
      className={`
        inline-flex items-center
        px-3 py-1
        text-[var(--text-xs)] font-bold uppercase
        tracking-wider
        border-2 border-[var(--color-border)]
        ${className}
      `}
      style={{
        fontFamily: 'var(--font-body)',
        backgroundColor: bg,
        color: text,
      }}
    >
      {difficulty}
    </span>
  );
}
