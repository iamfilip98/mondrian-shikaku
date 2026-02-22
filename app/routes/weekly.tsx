import { useState, useEffect } from 'react';
import { getISOWeek } from 'date-fns';
import { getWeeklyPuzzle, getTimeUntilMondayUTC } from '~/lib/puzzle/scheduled';
import type { Puzzle } from '~/lib/puzzle/types';
import Countdown from '~/components/ui/Countdown';
import GamePage from '~/components/game/GamePage';

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
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [week, setWeek] = useState(0);
  const [year, setYear] = useState(0);

  useEffect(() => {
    const now = new Date();
    setWeek(getISOWeek(now));
    setYear(now.getFullYear());
    setPuzzle(getWeeklyPuzzle(now));
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
              fontSize: 'var(--text-3xl)',
              color: 'var(--color-text)',
            }}
          >
            Week {week}, {year}
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
            }}
          >
            Weekly Puzzle · 20×20 · Expert
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
          <Countdown targetMs={getTimeUntilMondayUTC()} />
        </div>
      </div>
      <GamePage
        puzzle={puzzle}
        difficulty="expert"
        puzzleType="Weekly"
      />
    </div>
  );
}
