import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { getISOWeek } from 'date-fns';
import { getTimeUntilMondayUTC } from '~/lib/puzzle/scheduled';
import { generatePuzzleAsync } from '~/lib/puzzle/generateAsync';
import type { Puzzle } from '~/lib/puzzle/types';
import Countdown from '~/components/ui/Countdown';
import GamePage from '~/components/game/GamePage';
import ScheduledComplete from '~/components/game/ScheduledComplete';
import { useAuth } from '~/lib/hooks/useAuth';
import { getUserSolveForSeed, type SolveResult } from '~/lib/supabase/queries';

export function meta() {
  const now = new Date();
  return [
    { title: `Weekly Puzzle — Week ${getISOWeek(now)} — Mondrian Shikaku` },
    {
      name: 'description',
      content: `This week's Shikaku challenge. A 20×20 Expert grid resets every Monday.`,
    },
    { property: 'og:title', content: `Weekly Puzzle — Mondrian Shikaku` },
  ];
}

export default function Weekly() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [error, setError] = useState(false);
  const [week, setWeek] = useState(0);
  const [year, setYear] = useState(0);
  const [existingSolve, setExistingSolve] = useState<SolveResult | null>(null);
  const [solveChecked, setSolveChecked] = useState(false);

  useEffect(() => {
    const now = new Date();
    const w = getISOWeek(now);
    const y = now.getFullYear();
    setWeek(w);
    setYear(y);

    const seed = `weekly-${y}-W${String(w).padStart(2, '0')}`;

    if (user) {
      getUserSolveForSeed(user.id, seed).then((solve) => {
        setExistingSolve(solve);
        setSolveChecked(true);
      });
    } else {
      setSolveChecked(true);
    }

    let cancelled = false;
    generatePuzzleAsync({
      width: 20,
      height: 20,
      difficulty: 'expert',
      seed,
    })
      .then((p) => { if (!cancelled) setPuzzle(p); })
      .catch(() => { if (!cancelled) setError(true); });

    return () => { cancelled = true; };
  }, [user]);

  const handleNextPuzzle = useCallback(() => navigate('/play'), [navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4" style={{ height: '60vh' }}>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-muted)',
          }}
        >
          Failed to generate puzzle. Please refresh the page.
        </span>
        <button
          onClick={() => window.location.reload()}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            padding: '8px 20px',
            border: '2px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!solveChecked || (!existingSolve && !puzzle)) {
    return (
      <div className="flex items-center justify-center" style={{ height: '60vh' }}>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-muted)',
          }}
        >
          {existingSolve ? '' : 'Generating puzzle...'}
        </span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col px-6 py-6 border-b-2 border-[var(--color-border)]">
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            color: 'var(--color-text)',
          }}
        >
          Week {week}, {year}
        </h1>
        <div className="flex items-center justify-between mt-1">
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
            }}
          >
            Weekly Puzzle · 20×20
          </p>
          <div className="flex items-center gap-2">
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Resets in
            </span>
            <Countdown targetMs={getTimeUntilMondayUTC()} />
          </div>
        </div>
      </div>
      {existingSolve ? (
        <ScheduledComplete
          solveTime={existingSolve.solve_time_seconds}
          hintsUsed={existingSolve.hints_used}
          nextPuzzleMs={getTimeUntilMondayUTC()}
          nextLabel="Next weekly in"
        />
      ) : (
        <GamePage
          puzzle={puzzle!}
          difficulty="expert"
          puzzleType="Weekly"
          puzzleSeed={`weekly-${year}-W${String(week).padStart(2, '0')}`}
          onNextPuzzle={handleNextPuzzle}
        />
      )}
    </div>
  );
}
