import { motion } from 'framer-motion';

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatarColor: string;
  solveTime: number;
  hintsUsed: number;
  completedAt: string;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUser?: string;
  className?: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function LeaderboardTable({
  entries,
  currentUser,
  className = '',
}: LeaderboardTableProps) {
  return (
    <div
      className={`border-2 border-[var(--color-border)] bg-[var(--color-surface)] ${className}`}
    >
      {/* Header */}
      <div
        className="grid items-center px-4 border-b-2 border-[var(--color-border)]"
        style={{
          gridTemplateColumns: '48px 1fr 100px 80px',
          height: '44px',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          fontWeight: 500,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        <span>#</span>
        <span>Player</span>
        <span className="text-right">Time</span>
        <span className="text-right">Hints</span>
      </div>

      {/* Rows */}
      {entries.length === 0 ? (
        <div
          className="flex items-center justify-center py-8"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          No solves yet. Be the first!
        </div>
      ) : (
        entries.map((entry, i) => {
          const isCurrentUser = currentUser === entry.username;
          return (
            <motion.div
              key={entry.username + entry.rank}
              className="grid items-center px-4 border-b border-[var(--color-border-muted)]"
              style={{
                gridTemplateColumns: '48px 1fr 100px 80px',
                height: '48px',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                backgroundColor: isCurrentUser
                  ? 'rgba(19, 86, 162, 0.08)'
                  : 'transparent',
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <span
                className="tabular-nums font-bold"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {entry.rank}
              </span>
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    backgroundColor: entry.avatarColor,
                  }}
                />
                <span className={isCurrentUser ? 'font-bold' : ''}>
                  {entry.username}
                </span>
              </div>
              <span
                className="text-right tabular-nums"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {formatTime(entry.solveTime)}
              </span>
              <span
                className="text-right tabular-nums"
                style={{
                  fontVariantNumeric: 'tabular-nums',
                  color:
                    entry.hintsUsed > 0
                      ? 'var(--color-text-muted)'
                      : 'var(--color-text)',
                }}
              >
                {entry.hintsUsed}
              </span>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
