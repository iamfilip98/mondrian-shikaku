import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LeaderboardTable from '~/components/ui/LeaderboardTable';
import { useAuth } from '~/lib/hooks/useAuth';
import {
  getDailyLeaderboard,
  getWeeklyLeaderboard,
  getMonthlyLeaderboard,
  getAllTimeLeaderboard,
  type LeaderboardRow,
  type AllTimeLeaderboardRow,
} from '~/lib/supabase/queries';

export function meta() {
  return [
    { title: 'Leaderboard — Mondrian Shikaku' },
    {
      name: 'description',
      content: 'Rankings for Daily, Weekly, Monthly, and All-Time Shikaku puzzles.',
    },
    { property: 'og:title', content: 'Leaderboard — Mondrian Shikaku' },
  ];
}

const tabs = ['Daily', 'Weekly', 'Monthly', 'All-Time'] as const;
type Tab = (typeof tabs)[number];

const difficulties = ['easy', 'medium', 'hard', 'expert', 'nightmare'] as const;

// Module-level cache with 60s TTL
const leaderboardCache = new Map<string, { entries: LeaderboardEntry[]; fetchedAt: number }>();
const CACHE_TTL = 60_000;
type Difficulty = (typeof difficulties)[number];

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatarColor: string;
  solveTime: number;
  hintsUsed: number;
  completedAt: string;
  totalSolves?: number;
}

function mapEntries(data: LeaderboardRow[]): LeaderboardEntry[] {
  return data.map((row, i) => ({
    rank: i + 1,
    username: row.username,
    avatarColor: row.avatar_color || '#D40920',
    solveTime: row.solve_time_seconds ?? 0,
    hintsUsed: row.hints_used ?? 0,
    completedAt: row.completed_at ?? '',
  }));
}

function mapAllTimeEntries(data: AllTimeLeaderboardRow[]): LeaderboardEntry[] {
  return data.map((row, i) => ({
    rank: i + 1,
    username: row.username,
    avatarColor: row.avatar_color || '#D40920',
    solveTime: row.best_time ?? row.avg_time ?? 0,
    hintsUsed: 0,
    completedAt: '',
    totalSolves: row.total_solves ?? 0,
  }));
}

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<Tab>('Daily');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const { profile } = useAuth();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const cacheKey = activeTab === 'All-Time' ? `${activeTab}-${difficulty}` : activeTab;
    const cached = leaderboardCache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      setEntries(cached.entries);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        let mapped: LeaderboardEntry[];
        if (activeTab === 'All-Time') {
          const data = await getAllTimeLeaderboard(difficulty);
          mapped = mapAllTimeEntries(data);
        } else {
          const fetcher = activeTab === 'Daily' ? getDailyLeaderboard
            : activeTab === 'Weekly' ? getWeeklyLeaderboard
            : getMonthlyLeaderboard;
          const data = await fetcher();
          mapped = mapEntries(data);
        }
        if (!cancelled) {
          leaderboardCache.set(cacheKey, { entries: mapped, fetchedAt: Date.now() });
          setEntries(mapped);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load leaderboard.');
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [activeTab, difficulty, retryKey]);

  return (
    <div className="max-w-[800px] mx-auto px-6 py-12">
      <h1
        className="mb-8"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-4xl)',
          color: 'var(--color-text)',
        }}
      >
        Leaderboard
      </h1>

      {/* Tab switcher */}
      <div className="flex border-2 border-[var(--color-border)] mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="relative flex-1 flex items-center justify-center cursor-pointer"
            style={{
              height: '48px',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: activeTab === tab ? 500 : 400,
              color: activeTab === tab ? 'var(--color-text-inverse)' : 'var(--color-text)',
              borderRight: tab !== 'All-Time' ? '2px solid var(--color-border)' : 'none',
              background: 'none',
              border: 'none',
              borderRightWidth: tab !== 'All-Time' ? '2px' : '0',
              borderRightStyle: 'solid',
              borderRightColor: 'var(--color-border)',
            }}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="leaderboard-tab"
                className="absolute inset-0"
                style={{ backgroundColor: 'var(--color-border)' }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        ))}
      </div>

      {/* Difficulty filter for All-Time */}
      {activeTab === 'All-Time' && (
        <div className="flex flex-wrap gap-2 mb-6">
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className="cursor-pointer"
              style={{
                padding: '6px 14px',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                fontWeight: difficulty === d ? 500 : 400,
                color: difficulty === d ? 'var(--color-text-inverse)' : 'var(--color-text)',
                backgroundColor: difficulty === d ? 'var(--color-border)' : 'transparent',
                border: '1.5px solid var(--color-border)',
                textTransform: 'capitalize',
              }}
            >
              {d}
            </button>
          ))}
        </div>
      )}

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
      ) : error ? (
        <div
          className="flex flex-col items-center justify-center gap-4 py-12"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          <span>{error}</span>
          <button
            onClick={() => setRetryKey((k) => k + 1)}
            className="cursor-pointer"
            style={{
              padding: '8px 20px',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: 'var(--color-text-inverse)',
              backgroundColor: 'var(--color-border)',
              border: 'none',
            }}
          >
            Retry
          </button>
        </div>
      ) : (
        <LeaderboardTable
          entries={entries}
          currentUser={profile?.username}
          allTime={activeTab === 'All-Time'}
        />
      )}
    </div>
  );
}
