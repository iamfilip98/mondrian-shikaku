import { motion } from 'framer-motion';
import type { ReactNode, ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-red)] text-[var(--color-white)] border-2 border-[var(--color-border)]',
  secondary:
    'bg-[var(--color-surface)] text-[var(--color-text)] border-2 border-[var(--color-border)]',
  outline:
    'bg-transparent text-[var(--color-text)] border-2 border-[var(--color-border)]',
  danger:
    'bg-[var(--color-red)] text-[var(--color-white)] border-2 border-[var(--color-border)]',
  ghost:
    'bg-transparent text-[var(--color-text)] border-2 border-transparent',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-[var(--text-sm)] min-w-[80px]',
  md: 'px-7 py-3 text-[var(--text-base)] min-w-[120px]',
  lg: 'px-9 py-4 text-[var(--text-lg)] min-w-[160px]',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <motion.button
      className={`
        inline-flex items-center justify-center
        font-[var(--font-body)] font-medium
        cursor-pointer select-none
        shadow-sharp
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        ${className}
      `}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { y: 1 }}
      style={{
        boxShadow: disabled
          ? 'none'
          : '4px 4px 0px 0px var(--color-border)',
      }}
      onHoverStart={() => {}}
      disabled={disabled}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}

export function IconButton({
  children,
  disabled,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <motion.button
      className={`
        inline-flex items-center justify-center
        w-[48px] h-[48px]
        border-2 border-[var(--color-border)]
        bg-[var(--color-surface)]
        text-[var(--color-text)]
        cursor-pointer select-none
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        ${className}
      `}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { y: 1 }}
      disabled={disabled}
      {...(props as any)}
    >
      {children}
    </motion.button>
  );
}
