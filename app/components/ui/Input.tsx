import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({
  label,
  error,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={inputId}
        className="text-[var(--text-sm)] font-medium"
        style={{
          fontFamily: 'var(--font-body)',
          color: error ? 'var(--color-red)' : 'var(--color-text)',
        }}
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`
          w-full h-[48px] px-4
          bg-[var(--color-surface)]
          text-[var(--color-text)]
          border-2
          outline-none
          text-[var(--text-base)]
          ${className}
        `}
        style={{
          fontFamily: 'var(--font-body)',
          borderColor: error
            ? 'var(--color-red)'
            : 'var(--color-border-muted)',
          boxShadow: error
            ? '3px 3px 0px 0px var(--color-red)'
            : 'none',
        }}
        onFocus={(e) => {
          if (!error) {
            e.target.style.borderColor = 'var(--color-blue)';
            e.target.style.boxShadow =
              '3px 3px 0px 0px var(--color-blue)';
          }
        }}
        onBlur={(e) => {
          if (!error) {
            e.target.style.borderColor = 'var(--color-border-muted)';
            e.target.style.boxShadow = 'none';
          }
        }}
        {...props}
      />
      {error && (
        <span
          id={`${inputId}-error`}
          role="alert"
          className="text-[var(--text-xs)]"
          style={{ color: 'var(--color-red)', fontFamily: 'var(--font-body)' }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
