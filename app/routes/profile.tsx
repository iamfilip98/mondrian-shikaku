import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth } from '~/lib/hooks/useAuth';
import { useToast } from '~/lib/hooks/useToast';
import { getUserStats } from '~/lib/supabase/queries';

export function meta() {
  return [
    { title: 'Profile — Mondrian Shikaku' },
    {
      name: 'description',
      content: 'View your Shikaku stats, streaks, and best times.',
    },
    { property: 'og:title', content: 'Profile — Mondrian Shikaku' },
  ];
}

const MONDRIAN_COLORS = [
  { value: '#D40920', label: 'Red' },
  { value: '#1356A2', label: 'Blue' },
  { value: '#F9C30F', label: 'Yellow' },
  { value: '#0A0A0A', label: 'Black' },
  { value: '#F5F5F0', label: 'White' },
];

const DIFFICULTY_ORDER = ['primer', 'easy', 'medium', 'hard', 'expert', 'nightmare'] as const;

interface DifficultyStats {
  difficulty: string;
  bestTime: number;
  totalSolves: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export default function Profile() {
  const { user, profile, loading, refreshProfile, getToken } = useAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState<DifficultyStats[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [savingColor, setSavingColor] = useState(false);

  useEffect(() => {
    if (!user) {
      setStatsLoading(false);
      return;
    }

    let cancelled = false;
    setStatsLoading(true);

    getUserStats(user.id).then((data) => {
      if (!cancelled) {
        setStats(data);
        setStatsLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [user]);

  const handleColorChange = async (color: string) => {
    if (!user || savingColor) return;
    setSavingColor(true);
    try {
      const token = await getToken();
      if (token) {
        const res = await fetch('/api/profile/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ avatar_color: color }),
        });
        if (res.ok) {
          await refreshProfile();
          addToast('Avatar color updated!', 'success');
        } else {
          addToast('Failed to update avatar color.', 'error');
        }
      }
    } catch {
      addToast('Network error. Please try again.', 'error');
    } finally {
      setSavingColor(false);
    }
  };

  // Auth gate
  if (loading) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-12">
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
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-12">
        <h1
          className="mb-6"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-4xl)',
            color: 'var(--color-text)',
          }}
        >
          Profile
        </h1>
        <div
          className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-8"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text)',
          }}
        >
          <p className="mb-4">Sign in to view your profile, stats, and streaks.</p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center"
            style={{
              padding: '10px 24px',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-inverse)',
              backgroundColor: 'var(--color-border)',
              border: 'none',
            }}
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Sort stats by difficulty order
  const sortedStats = [...stats].sort(
    (a, b) =>
      DIFFICULTY_ORDER.indexOf(a.difficulty as typeof DIFFICULTY_ORDER[number]) -
      DIFFICULTY_ORDER.indexOf(b.difficulty as typeof DIFFICULTY_ORDER[number])
  );

  return (
    <div className="max-w-[800px] mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: profile.avatar_color || '#D40920',
            flexShrink: 0,
          }}
        />
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-4xl)',
              color: 'var(--color-text)',
              lineHeight: 1,
            }}
          >
            {profile.username}
          </h1>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 400,
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Joined {formatDate(profile.created_at)}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div
          className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-4"
        >
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 400,
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '4px',
            }}
          >
            Puzzles Completed
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: 'var(--text-2xl)',
              color: 'var(--color-text)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {profile.puzzles_completed}
          </div>
        </div>

        <div
          className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          style={{ borderLeftWidth: '6px', borderLeftColor: 'var(--color-yellow)' }}
        >
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 400,
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '4px',
            }}
          >
            Current Streak
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: 'var(--text-2xl)',
              color: 'var(--color-text)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {profile.daily_streak}
          </div>
        </div>

        <div
          className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          style={{ borderLeftWidth: '6px', borderLeftColor: 'var(--color-yellow)' }}
        >
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 400,
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '4px',
            }}
          >
            Longest Streak
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: 'var(--text-2xl)',
              color: 'var(--color-text)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {profile.longest_streak}
          </div>
        </div>
      </div>

      {/* Best Times table */}
      <h2
        className="mb-4"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          color: 'var(--color-text)',
        }}
      >
        Best Times
      </h2>

      {statsLoading ? (
        <div
          className="flex items-center justify-center py-8"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          Loading...
        </div>
      ) : sortedStats.length === 0 ? (
        <div
          className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] p-6 mb-10"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          No solves yet. Play a puzzle to see your stats here.
        </div>
      ) : (
        <div className="border-2 border-[var(--color-border)] mb-10">
          {/* Table header */}
          <div
            className="grid grid-cols-3 px-4"
            style={{
              height: '40px',
              alignItems: 'center',
              backgroundColor: 'var(--color-surface)',
              borderBottom: '2px solid var(--color-border)',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            <span>Difficulty</span>
            <span style={{ textAlign: 'right' }}>Best Time</span>
            <span style={{ textAlign: 'right' }}>Solves</span>
          </div>
          {sortedStats.map((row) => (
            <div
              key={row.difficulty}
              className="grid grid-cols-3 px-4"
              style={{
                height: '44px',
                alignItems: 'center',
                borderBottom: '1px solid var(--color-border)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text)',
              }}
            >
              <span style={{ textTransform: 'capitalize' }}>
                {row.difficulty}
              </span>
              <span
                style={{
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatTime(row.bestTime)}
              </span>
              <span
                style={{
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {row.totalSolves}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Avatar color picker */}
      <h2
        className="mb-4"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          color: 'var(--color-text)',
        }}
      >
        Avatar Color
      </h2>
      <div className="flex gap-3 items-center">
        {MONDRIAN_COLORS.map((color) => {
          const isActive = profile.avatar_color === color.value;
          return (
            <button
              key={color.value}
              onClick={() => handleColorChange(color.value)}
              disabled={savingColor}
              aria-label={`Set avatar color to ${color.label}`}
              className="cursor-pointer"
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: color.value,
                border: isActive
                  ? '3px solid var(--color-text)'
                  : '2px solid var(--color-border)',
                outline: 'none',
                opacity: savingColor ? 0.5 : 1,
                padding: 0,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
