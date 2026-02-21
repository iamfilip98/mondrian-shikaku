import { useState } from 'react';
import { motion } from 'framer-motion';
import LeaderboardTable from '~/components/ui/LeaderboardTable';

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

// Placeholder data — will be replaced with Supabase queries
const mockEntries = [
  { rank: 1, username: 'mondrian_fan', avatarColor: '#D40920', solveTime: 142, hintsUsed: 0, completedAt: '2026-02-21' },
  { rank: 2, username: 'grid_master', avatarColor: '#1356A2', solveTime: 187, hintsUsed: 0, completedAt: '2026-02-21' },
  { rank: 3, username: 'puzzle_lover', avatarColor: '#F9C30F', solveTime: 215, hintsUsed: 1, completedAt: '2026-02-21' },
];

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<Tab>('Daily');

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

      <LeaderboardTable entries={mockEntries} />
    </div>
  );
}
