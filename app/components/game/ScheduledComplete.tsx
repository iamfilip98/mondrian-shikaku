import { Link } from 'react-router';
import Button from '~/components/ui/Button';
import Countdown from '~/components/ui/Countdown';

interface ScheduledCompleteProps {
  solveTime: number;
  hintsUsed: number;
  nextPuzzleMs: number;
  nextLabel: string;
}

function formatSolveTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ScheduledComplete({
  solveTime,
  hintsUsed,
  nextPuzzleMs,
  nextLabel,
}: ScheduledCompleteProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-6 px-6"
      style={{ minHeight: '60vh' }}
    >
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          color: 'var(--color-text)',
        }}
      >
        Already Solved
      </span>

      <div className="flex gap-8">
        <div className="flex flex-col items-center">
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Time
          </span>
          <span
            className="tabular-nums"
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: 'var(--text-2xl)',
              color: 'var(--color-text)',
            }}
          >
            {formatSolveTime(solveTime)}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Hints
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: 'var(--text-2xl)',
              color: 'var(--color-text)',
            }}
          >
            {hintsUsed}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {nextLabel}
        </span>
        <Countdown targetMs={nextPuzzleMs} />
      </div>

      <Link to="/play">
        <Button variant="outline" size="md">
          Free Play
        </Button>
      </Link>
    </div>
  );
}
