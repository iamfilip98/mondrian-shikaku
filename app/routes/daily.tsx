import { useMemo } from 'react';
import { getDailyPuzzle, getTimeUntilMidnightUTC } from '~/lib/puzzle/scheduled';
import Countdown from '~/components/ui/Countdown';
import GamePage from '~/components/game/GamePage';

export function meta() {
  const today = new Date().toISOString().slice(0, 10);
  return [
    { title: `Daily Puzzle — ${today} — Mondrian Shikaku` },
    {
      name: 'description',
      content: `Today's Shikaku puzzle. A fresh 10×10 Medium grid every day. Compete on the daily leaderboard.`,
    },
    { property: 'og:title', content: `Daily Puzzle — Mondrian Shikaku` },
  ];
}

export default function Daily() {
  const today = useMemo(() => new Date(), []);
  const dateStr = today.toISOString().slice(0, 10);
  const puzzle = useMemo(() => getDailyPuzzle(today), [today]);

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-between px-6 py-6 border-b-2 border-[var(--color-border)]">
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-3xl)',
              color: 'var(--color-text)',
            }}
          >
            {new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
            }}
          >
            Daily Puzzle · 10×10 · Medium
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0">
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
      <GamePage
        puzzle={puzzle}
        difficulty="medium"
        puzzleType="Daily"
      />
    </div>
  );
}
