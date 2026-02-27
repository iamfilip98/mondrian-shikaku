interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

export default function Skeleton({
  width = '100%',
  height = '20px',
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`skeleton-pulse ${className}`}
      style={{
        width,
        height,
        backgroundColor: 'var(--color-surface-2)',
        border: '2px solid var(--color-border-muted)',
      }}
    />
  );
}

export function SkeletonRow({ cols = 3 }: { cols?: number }) {
  return (
    <div className="flex gap-3">
      {Array.from({ length: cols }, (_, i) => (
        <Skeleton key={i} height="48px" />
      ))}
    </div>
  );
}

export function SkeletonBoard() {
  return (
    <div className="flex flex-col gap-2 items-center py-8">
      <Skeleton width="200px" height="14px" className="mb-2" />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '2px',
          width: '200px',
          height: '200px',
        }}
      >
        {Array.from({ length: 25 }, (_, i) => {
          const colors = ['var(--color-red)', 'var(--color-blue)', 'var(--color-yellow)', 'var(--color-surface-2)'];
          return (
            <div
              key={i}
              className="skeleton-pulse"
              style={{
                backgroundColor: colors[i % colors.length],
                opacity: 0.3,
                border: '1px solid var(--color-border-muted)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
