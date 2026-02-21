import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  accent?: string;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  accent = 'var(--color-red)',
  className = '',
  hoverable = false,
  onClick,
}: CardProps) {
  return (
    <motion.div
      className={`
        bg-[var(--color-surface)]
        border-2 border-[var(--color-border)]
        shadow-sharp
        ${className}
      `}
      style={{
        borderLeftWidth: '6px',
        borderLeftColor: accent,
      }}
      whileHover={
        hoverable
          ? {
              y: -2,
              boxShadow: '6px 6px 0px 0px var(--color-border)',
            }
          : undefined
      }
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
