import { useCallback, useState, useEffect } from 'react';
import { useNavigate, useLoaderData } from 'react-router';
import { getDailyPuzzle, getTimeUntilMidnightUTC } from '~/lib/puzzle/scheduled';

import Countdown from '~/components/ui/Countdown';
import GamePage from '~/components/game/GamePage';
import ScheduledComplete from '~/components/game/ScheduledComplete';
import { useAuth } from '~/lib/hooks/useAuth';
import { getUserSolveForSeed, type SolveResult } from '~/lib/supabase/queries';

export function meta() {
  const today = new Date().toISOString().slice(0, 10);
  return [
    { title: `Daily Puzzle — ${today} — Mondrian Shikaku` },
    {
      name: 'description',
      content: `Today's Shikaku puzzle. A fresh 10×10 Medium grid every day. Compete on the daily leaderboard.`,
    },
    { property: 'og:title', content: `Daily Puzzle — Mondrian Shikaku` },
    { property: 'og:image', content: 'https://mondrianshikaku.com/og-image.png' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:image', content: 'https://mondrianshikaku.com/og-image.png' },
  ];
}

export function loader() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  return { puzzle: getDailyPuzzle(today), dateStr };
}

export default function Daily() {
  const navigate = useNavigate();
  const { puzzle, dateStr } = useLoaderData<typeof loader>();
  const { user } = useAuth();
  const [existingSolve, setExistingSolve] = useState<SolveResult | null>(null);
  const [checked, setChecked] = useState(false);

  const seed = `daily-${dateStr}`;

  useEffect(() => {
    if (!user) {
      setChecked(true);
      return;
    }
    getUserSolveForSeed(user.id, seed).then((solve) => {
      setExistingSolve(solve);
      setChecked(true);
    });
  }, [user, seed]);

  const handleNextPuzzle = useCallback(() => navigate('/play'), [navigate]);

  if (!checked) return null;

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
          {new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </h1>
        <div className="flex items-center justify-between mt-1">
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
            }}
          >
            Daily Puzzle · 10×10
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
              Next puzzle in
            </span>
            <Countdown targetMs={getTimeUntilMidnightUTC()} />
          </div>
        </div>
      </div>
      {existingSolve ? (
        <ScheduledComplete
          solveTime={existingSolve.solve_time_seconds}
          hintsUsed={existingSolve.hints_used}
          nextPuzzleMs={getTimeUntilMidnightUTC()}
          nextLabel="Next daily in"
        />
      ) : (
        <GamePage
          puzzle={puzzle}
          difficulty="medium"
          puzzleType="Daily"
          puzzleSeed={seed}
          onNextPuzzle={handleNextPuzzle}
        />
      )}
    </div>
  );
}
