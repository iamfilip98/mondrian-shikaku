import { useState, useEffect } from 'react';
import { getHallOfFame } from '~/lib/supabase/queries';

export function meta() {
  return [
    { title: 'Hall of Fame — Mondrian Shikaku' },
    {
      name: 'description',
      content: 'Monthly Nightmare puzzle — top 3 finishers, archived forever.',
    },
    { property: 'og:title', content: 'Hall of Fame — Mondrian Shikaku' },
  ];
}

interface HofMonth {
  monthYear: string;
  entries: {
    rank: number;
    username: string;
    avatarColor: string;
    solveTime: number;
  }[];
}

const rankColors = ['var(--color-yellow)', 'var(--color-surface-2)', 'var(--color-red)'];

export default function HallOfFame() {
  const [hallOfFameEntries, setHallOfFameEntries] = useState<HofMonth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHallOfFame().then((data) => {
      // Group by month_year
      const grouped = new Map<string, HofMonth>();
      for (const row of data) {
        const key = row.month_year;
        if (!grouped.has(key)) {
          grouped.set(key, { monthYear: key, entries: [] });
        }
        const profileData = row.profiles as any;
        grouped.get(key)!.entries.push({
          rank: row.rank,
          username: profileData?.username ?? 'Unknown',
          avatarColor: profileData?.avatar_color ?? '#D40920',
          solveTime: row.solve_time_secs,
        });
      }
      // Sort entries within each month by rank
      for (const month of grouped.values()) {
        month.entries.sort((a, b) => a.rank - b.rank);
      }
      setHallOfFameEntries(Array.from(grouped.values()));
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-[800px] mx-auto px-6 py-12">
      <h1
        className="mb-2"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-4xl)',
          color: 'var(--color-text)',
        }}
      >
        Hall of Fame
      </h1>
      <p
        className="mb-10"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          color: 'var(--color-text-muted)',
        }}
      >
        Monthly Nightmare puzzle — top 3 finishers, archived forever.
      </p>

      {loading ? (
        <div
          className="flex items-center justify-center py-12"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          Loading...
        </div>
      ) : hallOfFameEntries.length === 0 ? (
        <div
          className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center"
          style={{ borderLeftWidth: '6px', borderLeftColor: 'var(--color-yellow)' }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              color: 'var(--color-text)',
              display: 'block',
              marginBottom: '8px',
            }}
          >
            No winners yet
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
            }}
          >
            Complete the monthly Nightmare puzzle to be the first entry in the Hall of Fame.
          </span>
        </div>
      ) : (
        hallOfFameEntries.map((month) => (
          <div key={month.monthYear} className="mb-8">
            <h2
              className="mb-4"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-2xl)',
                color: 'var(--color-text)',
              }}
            >
              {month.monthYear}
            </h2>
            <div className="flex flex-col gap-2">
              {month.entries.map((entry) => (
                <div
                  key={entry.rank}
                  className="flex items-center gap-4 px-4 py-3 border-2 border-[var(--color-border)] bg-[var(--color-surface)]"
                  style={{ borderLeftWidth: '6px', borderLeftColor: rankColors[entry.rank - 1] }}
                >
                  <span
                    className="font-bold tabular-nums"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-xl)',
                      fontVariantNumeric: 'tabular-nums',
                      width: '32px',
                    }}
                  >
                    {entry.rank}
                  </span>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: entry.avatarColor,
                    }}
                  />
                  <span
                    className="flex-1"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-base)',
                      fontWeight: 500,
                    }}
                  >
                    {entry.username}
                  </span>
                  <span
                    className="tabular-nums"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      fontVariantNumeric: 'tabular-nums',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {Math.floor(entry.solveTime / 60)}:{String(entry.solveTime % 60).padStart(2, '0')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
