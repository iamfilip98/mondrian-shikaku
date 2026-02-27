import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { getTimeUntilFirstOfMonth } from '~/lib/puzzle/scheduled';
import { generatePuzzleAsync } from '~/lib/puzzle/generateAsync';
import type { Puzzle } from '~/lib/puzzle/types';
import Countdown from '~/components/ui/Countdown';
import GamePage from '~/components/game/GamePage';
import ScheduledComplete from '~/components/game/ScheduledComplete';
import { useAuth } from '~/lib/hooks/useAuth';
import { getUserSolveForSeed, type SolveResult } from '~/lib/supabase/queries';

export function meta() {
  const now = new Date();
  const monthStr = now.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
  return [
    { title: `Monthly Puzzle — ${monthStr} — Mondrian Shikaku` },
    {
      name: 'description',
      content: `The monthly Nightmare puzzle. A massive 40×40 grid. Only the best will finish.`,
    },
    { property: 'og:title', content: `Monthly Puzzle — Mondrian Shikaku` },
    { property: 'og:image', content: 'https://mondrianshikaku.com/og-image.png' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:image', content: 'https://mondrianshikaku.com/og-image.png' },
  ];
}

export default function Monthly() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [error, setError] = useState(false);
  const [monthStr, setMonthStr] = useState('');
  const [seedStr, setSeedStr] = useState('');
  const [existingSolve, setExistingSolve] = useState<SolveResult | null>(null);
  const [solveChecked, setSolveChecked] = useState(false);

  useEffect(() => {
    const now = new Date();
    const seed = `monthly-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setSeedStr(seed);
    setMonthStr(
      now.toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      })
    );

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
      width: 40,
      height: 40,
      difficulty: 'nightmare',
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
          {monthStr}
        </h1>
        <div className="flex items-center justify-between mt-1">
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
            }}
          >
            Monthly Puzzle · 40×40
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
            <Countdown targetMs={getTimeUntilFirstOfMonth()} />
          </div>
        </div>
      </div>
      {existingSolve ? (
        <ScheduledComplete
          solveTime={existingSolve.solve_time_seconds}
          hintsUsed={existingSolve.hints_used}
          nextPuzzleMs={getTimeUntilFirstOfMonth()}
          nextLabel="Next monthly in"
        />
      ) : (
        <GamePage
          puzzle={puzzle!}
          difficulty="nightmare"
          puzzleType="Monthly"
          puzzleSeed={seedStr}
          onNextPuzzle={handleNextPuzzle}
        />
      )}
    </div>
  );
}
