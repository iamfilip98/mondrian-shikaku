import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { useAuth } from '~/lib/hooks/useAuth';
import { useTheme, type Theme } from '~/lib/hooks/useTheme';
import { useSound } from '~/lib/hooks/useSound';
import { useToast } from '~/lib/hooks/useToast';
import { getUserStats } from '~/lib/supabase/queries';
import { setSettingItem } from '~/lib/utils/settingStorage';

export function meta() {
  return [
    { title: 'Profile — Mondrian Shikaku' },
    {
      name: 'description',
      content: 'View your Shikaku stats, streaks, and best times.',
    },
    { property: 'og:title', content: 'Profile — Mondrian Shikaku' },
    { property: 'og:image', content: 'https://mondrianshikaku.com/og-image.png' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:image', content: 'https://mondrianshikaku.com/og-image.png' },
  ];
}

const MONDRIAN_COLORS = [
  { value: '#D40920', label: 'Red' },
  { value: '#1356A2', label: 'Blue' },
  { value: '#F9C30F', label: 'Yellow' },
  { value: '#0A0A0A', label: 'Black' },
  { value: '#F5F5F0', label: 'White' },
];

const DIFFICULTY_ORDER = ['easy', 'medium', 'hard', 'expert', 'nightmare'] as const;

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

function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={() => onChange(!value)}
      className="flex items-center justify-between w-full py-3 cursor-pointer"
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text)',
        background: 'none',
        border: 'none',
      }}
    >
      <span>{label}</span>
      <div
        className="relative border-2 border-[var(--color-border)]"
        style={{
          width: '44px',
          height: '24px',
          backgroundColor: value ? 'var(--color-blue)' : 'var(--color-surface-2)',
        }}
      >
        <motion.div
          className="absolute top-0"
          style={{
            width: '18px',
            height: '18px',
            backgroundColor: 'var(--color-text)',
            top: '1px',
          }}
          animate={{ left: value ? '21px' : '1px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  );
}

export default function Profile() {
  const { user, profile, loading, refreshProfile, getToken } = useAuth();
  const { addToast } = useToast();
  const { theme, setTheme } = useTheme();
  const sound = useSound();
  const [stats, setStats] = useState<DifficultyStats[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [savingColor, setSavingColor] = useState(false);
  const [blindMode, setBlindMode] = useState(false);
  const [showTimer, setShowTimer] = useState(true);
  const [showDragCounter, setShowDragCounter] = useState(true);

  useEffect(() => {
    try {
      const b = localStorage.getItem('blindMode');
      if (b !== null) setBlindMode(b === 'true');
      const t = localStorage.getItem('showTimer');
      if (t !== null) setShowTimer(t !== 'false');
      const d = localStorage.getItem('showDragCounter');
      if (d !== null) setShowDragCounter(d !== 'false');
    } catch {}
  }, []);

  const handleBlindMode = useCallback((v: boolean) => {
    setBlindMode(v);
    try { setSettingItem('blindMode', String(v)); } catch {}
  }, []);

  const handleShowTimer = useCallback((v: boolean) => {
    setShowTimer(v);
    try { setSettingItem('showTimer', String(v)); } catch {}
  }, []);

  const handleShowDragCounter = useCallback((v: boolean) => {
    setShowDragCounter(v);
    try { setSettingItem('showDragCounter', String(v)); } catch {}
  }, []);

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
      if (!token) {
        addToast('Session expired. Please sign in again.', 'error');
        return;
      }
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
      <div className="flex gap-3 items-center mb-10">
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

      {/* Settings */}
      <h2
        className="mb-4"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          color: 'var(--color-text)',
        }}
      >
        Settings
      </h2>
      <div className="border-2 border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-2">
        {/* Theme */}
        <div className="py-3">
          <span
            className="block mb-2"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Theme
          </span>
          <div className="flex border-2 border-[var(--color-border)]">
            {(['light', 'dark', 'system'] as Theme[]).map((opt) => (
              <button
                key={opt}
                onClick={() => setTheme(opt)}
                className="flex-1 flex items-center justify-center cursor-pointer relative"
                style={{
                  height: '40px',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color:
                    theme === opt
                      ? 'var(--color-text-inverse)'
                      : 'var(--color-text)',
                  background: 'none',
                  border: 'none',
                  borderRightWidth: opt !== 'system' ? '2px' : '0',
                  borderRightStyle: 'solid',
                  borderRightColor: 'var(--color-border)',
                }}
              >
                {theme === opt && (
                  <motion.div
                    layoutId="profile-theme"
                    className="absolute inset-0"
                    style={{ backgroundColor: 'var(--color-border)' }}
                  />
                )}
                <span className="relative z-10 capitalize">{opt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="border-t border-[var(--color-border-muted)]">
          <Toggle
            value={blindMode}
            onChange={handleBlindMode}
            label="Colour all rectangles"
          />
          <Toggle
            value={sound.enabled}
            onChange={sound.toggleSound}
            label="Sound effects"
          />
          <Toggle
            value={showTimer}
            onChange={handleShowTimer}
            label="Show timer"
          />
          <Toggle
            value={showDragCounter}
            onChange={handleShowDragCounter}
            label="Show drag counter"
          />
        </div>
      </div>
    </div>
  );
}
