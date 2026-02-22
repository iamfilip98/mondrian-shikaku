import { useState, useEffect } from 'react';
import { getMonthlyPuzzle, getTimeUntilFirstOfMonth } from '~/lib/puzzle/scheduled';
import type { Puzzle } from '~/lib/puzzle/types';
import Countdown from '~/components/ui/Countdown';
import GamePage from '~/components/game/GamePage';

export function meta() {
  const now = new Date();
  const monthStr = now.toLocaleDateString('en-US', {
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
  ];
}

export default function Monthly() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [monthStr, setMonthStr] = useState('');

  useEffect(() => {
    const now = new Date();
    setMonthStr(
      now.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    );
    setPuzzle(getMonthlyPuzzle(now));
  }, []);

  if (!puzzle) {
    return (
      <div className="flex items-center justify-center" style={{ height: '60vh' }}>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-muted)',
          }}
        >
          Generating puzzle...
        </span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center justify-between px-6 py-6 border-b-2 border-[var(--color-border)]">
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-4xl)',
              color: 'var(--color-text)',
            }}
          >
            {monthStr}
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
            }}
          >
            Monthly Puzzle · 40×40 · Nightmare
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
            Resets in
          </span>
          <Countdown targetMs={getTimeUntilFirstOfMonth()} />
        </div>
      </div>
      <GamePage
        puzzle={puzzle}
        difficulty="nightmare"
        puzzleType="Monthly"
      />
    </div>
  );
}
