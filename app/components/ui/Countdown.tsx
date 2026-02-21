import { useState, useEffect } from 'react';

interface CountdownProps {
  targetMs: number;
  className?: string;
}

function formatTime(ms: number): string {
  if (ms <= 0) return '00:00:00';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function Countdown({ targetMs, className = '' }: CountdownProps) {
  const [remaining, setRemaining] = useState(targetMs);

  useEffect(() => {
    setRemaining(targetMs);
    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetMs]);

  return (
    <span
      className={`tabular-nums font-bold inline-block ${className}`}
      style={{
        fontFamily: 'var(--font-body)',
        fontVariantNumeric: 'tabular-nums',
        width: '8ch',
        textAlign: 'center',
      }}
    >
      {formatTime(remaining)}
    </span>
  );
}

export function GameTimer({
  seconds,
  className = '',
}: {
  seconds: number;
  className?: string;
}) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <span
      className={`tabular-nums font-bold inline-block ${className}`}
      style={{
        fontFamily: 'var(--font-body)',
        fontVariantNumeric: 'tabular-nums',
        width: '7ch',
        textAlign: 'center',
      }}
    >
      {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  );
}
