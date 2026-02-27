interface EmptyStateProps {
  message: string;
  className?: string;
}

function MondrianMini() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true" style={{ display: 'block', margin: '0 auto 12px' }}>
      <rect width="120" height="120" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="3" />
      <rect x="3" y="3" width="50" height="40" fill="var(--color-red)" opacity="0.3" />
      <rect x="53" y="3" width="64" height="25" fill="var(--color-blue)" opacity="0.3" />
      <rect x="53" y="28" width="30" height="45" fill="var(--color-yellow)" opacity="0.3" />
      <rect x="83" y="28" width="34" height="45" fill="var(--color-surface-2)" />
      <rect x="3" y="43" width="50" height="30" fill="var(--color-surface-2)" />
      <rect x="3" y="73" width="80" height="44" fill="var(--color-yellow)" opacity="0.3" />
      <rect x="83" y="73" width="34" height="44" fill="var(--color-red)" opacity="0.3" />
      {/* Grid lines */}
      <line x1="53" y1="0" x2="53" y2="120" stroke="var(--color-border)" strokeWidth="2" />
      <line x1="83" y1="0" x2="83" y2="120" stroke="var(--color-border)" strokeWidth="2" />
      <line x1="0" y1="43" x2="120" y2="43" stroke="var(--color-border)" strokeWidth="2" />
      <line x1="0" y1="73" x2="120" y2="73" stroke="var(--color-border)" strokeWidth="2" />
      <line x1="0" y1="28" x2="120" y2="28" stroke="var(--color-border-muted)" strokeWidth="1" />
    </svg>
  );
}

export default function EmptyState({ message, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-8 ${className}`}
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-muted)',
      }}
    >
      <MondrianMini />
      {message}
    </div>
  );
}
