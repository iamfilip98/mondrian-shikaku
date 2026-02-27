import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { useAuth } from '~/lib/hooks/useAuth';
import { getUserSolveHistory, type SolveHistoryRow } from '~/lib/supabase/queries';

export function meta() {
  return [
    { title: 'Statistics — Mondrian Shikaku' },
    { name: 'description', content: 'View your detailed solving statistics, trends, and performance breakdown.' },
    { property: 'og:title', content: 'Statistics — Mondrian Shikaku' },
    { property: 'og:image', content: 'https://mondrianshikaku.com/og-image.png' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:image', content: 'https://mondrianshikaku.com/og-image.png' },
  ];
}

const DIFFICULTY_ORDER = ['easy', 'medium', 'hard', 'expert', 'nightmare'] as const;
const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'var(--color-yellow)',
  medium: 'var(--color-blue)',
  hard: 'var(--color-red)',
  expert: 'var(--color-text)',
  nightmare: 'var(--color-red)',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
}

interface DifficultyBreakdown {
  difficulty: string;
  totalSolves: number;
  bestTime: number;
  avgTime: number;
  times: number[];
}

function computeStats(solves: SolveHistoryRow[]) {
  const byDifficulty = new Map<string, DifficultyBreakdown>();

  for (const s of solves) {
    let entry = byDifficulty.get(s.difficulty);
    if (!entry) {
      entry = { difficulty: s.difficulty, totalSolves: 0, bestTime: Infinity, avgTime: 0, times: [] };
      byDifficulty.set(s.difficulty, entry);
    }
    entry.totalSolves++;
    entry.bestTime = Math.min(entry.bestTime, s.solve_time_seconds);
    entry.times.push(s.solve_time_seconds);
  }

  for (const entry of byDifficulty.values()) {
    entry.avgTime = Math.round(entry.times.reduce((a, b) => a + b, 0) / entry.times.length);
  }

  const sorted = [...byDifficulty.values()].sort(
    (a, b) => DIFFICULTY_ORDER.indexOf(a.difficulty as typeof DIFFICULTY_ORDER[number]) -
              DIFFICULTY_ORDER.indexOf(b.difficulty as typeof DIFFICULTY_ORDER[number])
  );

  return sorted;
}

// SVG bar chart component
function BarChart({ data, width = 600, height = 200 }: {
  data: { label: string; value: number; color: string }[];
  width?: number;
  height?: number;
}) {
  if (data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.value));
  const barWidth = Math.min(60, (width - 40) / data.length - 8);
  const chartHeight = height - 40;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {/* Y-axis labels */}
      {[0, 0.25, 0.5, 0.75, 1].map(frac => (
        <g key={frac}>
          <line
            x1={40} y1={10 + chartHeight * (1 - frac)}
            x2={width} y2={10 + chartHeight * (1 - frac)}
            stroke="var(--color-border-muted)" strokeWidth={1} strokeDasharray={frac === 0 ? 'none' : '4 4'}
          />
          <text
            x={36} y={14 + chartHeight * (1 - frac)}
            textAnchor="end" fill="var(--color-text-muted)"
            style={{ fontSize: '10px', fontFamily: 'var(--font-body)' }}
          >
            {Math.round(maxVal * frac)}
          </text>
        </g>
      ))}
      {/* Bars */}
      {data.map((d, i) => {
        const barH = maxVal > 0 ? (d.value / maxVal) * chartHeight : 0;
        const x = 40 + i * ((width - 40) / data.length) + ((width - 40) / data.length - barWidth) / 2;
        return (
          <g key={d.label}>
            <rect
              x={x} y={10 + chartHeight - barH}
              width={barWidth} height={barH}
              fill={d.color} stroke="var(--color-border)" strokeWidth={2}
            />
            <text
              x={x + barWidth / 2} y={height - 4}
              textAnchor="middle" fill="var(--color-text-muted)"
              style={{ fontSize: '10px', fontFamily: 'var(--font-body)', textTransform: 'capitalize' }}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// SVG line chart for solve time trend
function TrendChart({ solves, width = 600, height = 180 }: {
  solves: SolveHistoryRow[];
  width?: number;
  height?: number;
}) {
  if (solves.length < 2) return null;

  const times = solves.map(s => s.solve_time_seconds);
  const maxTime = Math.max(...times);
  const minTime = Math.min(...times);
  const range = maxTime - minTime || 1;
  const chartW = width - 50;
  const chartH = height - 30;

  const points = times.map((t, i) => {
    const x = 50 + (i / (times.length - 1)) * chartW;
    const y = 10 + (1 - (t - minTime) / range) * chartH;
    return `${x},${y}`;
  });

  // Rolling average (window of 5)
  const windowSize = Math.min(5, Math.floor(times.length / 2));
  const avgPoints: string[] = [];
  if (windowSize >= 2) {
    for (let i = 0; i < times.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(times.length, i + Math.ceil(windowSize / 2));
      const avg = times.slice(start, end).reduce((a, b) => a + b, 0) / (end - start);
      const x = 50 + (i / (times.length - 1)) * chartW;
      const y = 10 + (1 - (avg - minTime) / range) * chartH;
      avgPoints.push(`${x},${y}`);
    }
  }

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {/* Grid lines */}
      {[0, 0.5, 1].map(frac => (
        <g key={frac}>
          <line
            x1={50} y1={10 + chartH * (1 - frac)}
            x2={width} y2={10 + chartH * (1 - frac)}
            stroke="var(--color-border-muted)" strokeWidth={1} strokeDasharray="4 4"
          />
          <text
            x={46} y={14 + chartH * (1 - frac)}
            textAnchor="end" fill="var(--color-text-muted)"
            style={{ fontSize: '10px', fontFamily: 'var(--font-body)' }}
          >
            {formatTime(Math.round(minTime + range * frac))}
          </text>
        </g>
      ))}
      {/* Data line */}
      <polyline
        points={points.join(' ')}
        fill="none" stroke="var(--color-blue)" strokeWidth={1.5} opacity={0.4}
      />
      {/* Rolling average */}
      {avgPoints.length > 0 && (
        <polyline
          points={avgPoints.join(' ')}
          fill="none" stroke="var(--color-red)" strokeWidth={2}
        />
      )}
      {/* Data points */}
      {points.map((p, i) => {
        const [x, y] = p.split(',').map(Number);
        return (
          <circle key={i} cx={x} cy={y} r={2.5}
            fill="var(--color-blue)" stroke="var(--color-bg)" strokeWidth={1}
          />
        );
      })}
      {/* Legend */}
      <line x1={width - 120} y1={height - 8} x2={width - 100} y2={height - 8}
        stroke="var(--color-blue)" strokeWidth={1.5} opacity={0.4} />
      <text x={width - 96} y={height - 4} fill="var(--color-text-muted)"
        style={{ fontSize: '9px', fontFamily: 'var(--font-body)' }}>Solve time</text>
      <line x1={width - 55} y1={height - 8} x2={width - 35} y2={height - 8}
        stroke="var(--color-red)" strokeWidth={2} />
      <text x={width - 31} y={height - 4} fill="var(--color-text-muted)"
        style={{ fontSize: '9px', fontFamily: 'var(--font-body)' }}>Avg</text>
    </svg>
  );
}

export default function Stats() {
  const { user, loading } = useAuth();
  const [solves, setSolves] = useState<SolveHistoryRow[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setDataLoading(false);
      return;
    }
    let cancelled = false;
    setDataLoading(true);
    getUserSolveHistory(user.id).then(data => {
      if (!cancelled) {
        setSolves(data);
        setDataLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [user]);

  const breakdown = useMemo(() => computeStats(solves), [solves]);

  const filteredSolves = useMemo(() =>
    selectedDifficulty ? solves.filter(s => s.difficulty === selectedDifficulty) : solves,
    [solves, selectedDifficulty]
  );

  const totalSolves = solves.length;
  const totalTime = solves.reduce((a, s) => a + s.solve_time_seconds, 0);
  const avgTime = totalSolves > 0 ? Math.round(totalTime / totalSolves) : 0;
  const hintFreeSolves = solves.filter(s => s.hints_used === 0).length;

  if (loading) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-12">
        <div className="flex items-center justify-center py-12"
          style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-12">
        <h1 className="mb-6" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', color: 'var(--color-text)' }}>
          Statistics
        </h1>
        <div className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-8"
          style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text)' }}>
          <p className="mb-4">Sign in to view your detailed statistics.</p>
          <Link to="/login" className="inline-flex items-center justify-center"
            style={{ padding: '10px 24px', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 'var(--text-sm)',
              color: 'var(--color-text-inverse)', backgroundColor: 'var(--color-border)', border: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto px-6 py-12">
      <h1 className="mb-8" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', color: 'var(--color-text)' }}>
        Statistics
      </h1>

      {dataLoading ? (
        <div className="flex items-center justify-center py-12"
          style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          Loading...
        </div>
      ) : solves.length === 0 ? (
        <div className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-6"
          style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          No solves yet. Play some puzzles and come back to see your stats.
        </div>
      ) : (
        <>
          {/* Summary row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Solves', value: String(totalSolves) },
              { label: 'Average Time', value: formatTime(avgTime) },
              { label: 'Hint-Free', value: String(hintFreeSolves) },
              { label: 'Total Time', value: formatTime(totalTime) },
            ].map(stat => (
              <div key={stat.label} className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <span className="block" style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  {stat.label}
                </span>
                <span className="block" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-2xl)',
                  color: 'var(--color-text)', fontVariantNumeric: 'tabular-nums' }}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          {/* Solves by difficulty chart */}
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text)' }}>
            Solves by Difficulty
          </h2>
          <div className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-4 mb-8">
            <BarChart
              data={breakdown.map(d => ({
                label: d.difficulty,
                value: d.totalSolves,
                color: DIFFICULTY_COLORS[d.difficulty] || 'var(--color-text)',
              }))}
            />
          </div>

          {/* Average times chart */}
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text)' }}>
            Average Time by Difficulty
          </h2>
          <div className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-4 mb-8">
            <BarChart
              data={breakdown.map(d => ({
                label: d.difficulty,
                value: d.avgTime,
                color: DIFFICULTY_COLORS[d.difficulty] || 'var(--color-text)',
              }))}
            />
            <div className="flex justify-center gap-6 mt-2">
              {breakdown.map(d => (
                <span key={d.difficulty} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {formatTime(d.avgTime)}
                </span>
              ))}
            </div>
          </div>

          {/* Solve time trend */}
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text)' }}>
            Solve Time Trend
          </h2>

          {/* Difficulty filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setSelectedDifficulty(null)}
              style={{
                fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', padding: '4px 12px',
                border: '2px solid var(--color-border)', cursor: 'pointer',
                backgroundColor: selectedDifficulty === null ? 'var(--color-border)' : 'var(--color-surface)',
                color: selectedDifficulty === null ? 'var(--color-text-inverse)' : 'var(--color-text)',
              }}
            >
              All
            </button>
            {DIFFICULTY_ORDER.map(d => {
              const has = breakdown.some(b => b.difficulty === d);
              if (!has) return null;
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d)}
                  style={{
                    fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', padding: '4px 12px',
                    border: '2px solid var(--color-border)', cursor: 'pointer', textTransform: 'capitalize',
                    backgroundColor: selectedDifficulty === d ? 'var(--color-border)' : 'var(--color-surface)',
                    color: selectedDifficulty === d ? 'var(--color-text-inverse)' : 'var(--color-text)',
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>

          <div className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-4 mb-8">
            {filteredSolves.length < 2 ? (
              <div className="py-8 text-center" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Need at least 2 solves to show a trend.
              </div>
            ) : (
              <TrendChart solves={filteredSolves} />
            )}
          </div>

          {/* Detailed breakdown table */}
          <h2 className="mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text)' }}>
            Detailed Breakdown
          </h2>
          <div className="border-2 border-[var(--color-border)] mb-8">
            <div className="grid grid-cols-4 px-4"
              style={{ height: '40px', alignItems: 'center', backgroundColor: 'var(--color-surface)',
                borderBottom: '2px solid var(--color-border)', fontFamily: 'var(--font-body)', fontWeight: 500,
                fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Difficulty</span>
              <span style={{ textAlign: 'right' }}>Solves</span>
              <span style={{ textAlign: 'right' }}>Best</span>
              <span style={{ textAlign: 'right' }}>Average</span>
            </div>
            {breakdown.map(row => (
              <div key={row.difficulty} className="grid grid-cols-4 px-4"
                style={{ height: '44px', alignItems: 'center', borderBottom: '1px solid var(--color-border)',
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                <span style={{ textTransform: 'capitalize' }}>{row.difficulty}</span>
                <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{row.totalSolves}</span>
                <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatTime(row.bestTime)}</span>
                <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatTime(row.avgTime)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
