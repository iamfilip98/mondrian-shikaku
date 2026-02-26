import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import Button from '~/components/ui/Button';
import Countdown from '~/components/ui/Countdown';
import { useAuth } from '~/lib/hooks/useAuth';
import {
  getTimeUntilMidnightUTC,
  getTimeUntilMondayUTC,
  getTimeUntilFirstOfMonth,
  getCurrentScheduledSeeds,
} from '~/lib/puzzle/scheduled';
import { getUserScheduledSolves } from '~/lib/supabase/queries';

export function meta() {
  return [
    { title: 'Mondrian Shikaku — Logic is an Art Form' },
    {
      name: 'description',
      content:
        'A premium Shikaku logic puzzle game inspired by Piet Mondrian. Divide the grid into rectangles. Pure logic, no guessing.',
    },
    { property: 'og:title', content: 'Mondrian Shikaku — Logic is an Art Form' },
    {
      property: 'og:description',
      content: 'A Mondrian-inspired Shikaku puzzle game. Logic is an art form.',
    },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ];
}

const heroBlocks = [
  { x: 20, y: 30, w: 280, h: 200, color: 'var(--color-red)', delay: 0 },
  { x: 320, y: 20, w: 200, h: 120, color: 'var(--color-blue)', delay: 0.5 },
  { x: 540, y: 60, w: 160, h: 280, color: 'var(--color-yellow)', delay: 1 },
  { x: 20, y: 250, w: 180, h: 160, color: 'var(--color-yellow)', delay: 1.5 },
  { x: 220, y: 260, w: 300, h: 150, color: 'var(--color-blue)', delay: 2 },
  { x: 720, y: 20, w: 200, h: 180, color: 'var(--color-red)', delay: 2.5 },
  { x: 720, y: 220, w: 200, h: 200, color: 'var(--color-yellow)', delay: 3 },
  { x: 940, y: 80, w: 140, h: 340, color: 'var(--color-blue)', delay: 3.5 },
];

const demoRects = [
  { row: 0, col: 0, width: 2, height: 2, color: 'var(--color-red)' },
  { row: 0, col: 2, width: 3, height: 1, color: 'var(--color-blue)' },
  { row: 1, col: 2, width: 1, height: 2, color: 'var(--color-yellow)' },
  { row: 1, col: 3, width: 2, height: 2, color: 'var(--color-red)' },
  { row: 2, col: 0, width: 2, height: 3, color: 'var(--color-blue)' },
  { row: 3, col: 2, width: 3, height: 2, color: 'var(--color-yellow)' },
];

export default function Home() {
  const { profile, user } = useAuth();
  const [completedSeeds, setCompletedSeeds] = useState<Set<string>>(new Set());

  const currentSeeds = useMemo(() => getCurrentScheduledSeeds(), []);

  useEffect(() => {
    if (!user) {
      setCompletedSeeds(new Set());
      return;
    }
    getUserScheduledSolves(user.id, Object.values(currentSeeds)).then(solved => {
      setCompletedSeeds(new Set(solved));
    });
  }, [user, currentSeeds]);

  return (
    <div>
      {/* Streak banner */}
      {profile && profile.daily_streak > 0 && (
        <div
          className="w-full flex items-center justify-center gap-3 py-3"
          style={{
            backgroundColor: 'var(--color-yellow)',
            borderBottom: '3px solid var(--color-border)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: 'var(--text-sm)',
              color: 'var(--color-black)',
            }}
          >
            {profile.daily_streak} day streak
          </span>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-black)',
              opacity: 0.7,
            }}
          >
            Keep it going — play today's puzzle!
          </span>
        </div>
      )}

      {/* Hero */}
      <section
        className="relative w-full overflow-hidden"
        style={{ minHeight: '520px', backgroundColor: 'var(--color-bg)' }}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1100 440"
          preserveAspectRatio="xMidYMid slice"
          style={{ opacity: 0.5 }}
        >
          {heroBlocks.map((block, i) => (
            <motion.rect
              key={i}
              x={block.x}
              y={block.y}
              width={block.w}
              height={block.h}
              fill={block.color}
              stroke="var(--color-text)"
              strokeWidth={3}
              animate={{
                scale: [1, 1.015, 1],
                opacity: [0.5, 0.75, 0.5],
              }}
              transition={{
                duration: 8,
                delay: block.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </svg>

        <div className="relative z-10 flex flex-col items-center justify-center px-6 py-20" style={{ minHeight: '520px' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 8vw, 5.5rem)',
              color: 'var(--color-text)',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: '-0.02em',
              textAlign: 'center',
            }}
          >
            Logic is an Art Form.
          </h1>
          <p
            className="mt-4 mb-8"
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 300,
              fontSize: 'var(--text-lg)',
              color: 'var(--color-text-muted)',
              textAlign: 'center',
            }}
          >
            A Mondrian-inspired Shikaku puzzle game.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/daily">
              <Button variant="primary" size="lg">
                Play Today's Puzzle
              </Button>
            </Link>
            <Link to="/blog/how-to-solve-shikaku">
              <Button
                variant="outline"
                size="lg"
                className="!text-[var(--color-text)] !border-[var(--color-text)]"
              >
                How to Play
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Scheduled Puzzles Strip */}
      <section className="w-full border-y-[3px] border-[var(--color-border)]">
        <div className="grid grid-cols-3">
          {[
            { name: 'Daily', grid: '10×10', href: '/daily', getMs: getTimeUntilMidnightUTC, seed: currentSeeds.daily, colorClass: '!bg-[var(--color-red)] !text-[var(--color-white)]' },
            { name: 'Weekly', grid: '20×20', href: '/weekly', getMs: getTimeUntilMondayUTC, seed: currentSeeds.weekly, colorClass: '!bg-[var(--color-blue)] !text-[var(--color-white)]' },
            { name: 'Monthly', grid: '40×40', href: '/monthly', getMs: getTimeUntilFirstOfMonth, seed: currentSeeds.monthly, colorClass: '!bg-[var(--color-yellow)] !text-[var(--color-black)]' },
          ].map((p, i) => {
            const completed = completedSeeds.has(p.seed);
            return (
              <div
                key={p.name}
                className={`flex flex-col items-center justify-center py-8 px-4 ${i < 2 ? 'border-r-[3px] border-[var(--color-border)]' : ''}`}
              >
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text)' }}>
                  {p.name}
                </span>
                <span className="mt-1 mb-2" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {p.grid}
                </span>
                <Countdown targetMs={p.getMs()} className="mb-4" />
                <Link to={p.href}>
                  <Button variant="outline" size="sm" className={completed ? p.colorClass : ''}>{completed ? 'Solved' : 'Play Now'}</Button>
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Demo */}
      <section className="flex flex-col items-center py-16 px-6">
        <div className="border-[4px] border-[var(--color-border)]">
          <svg width={250} height={250} viewBox="0 0 250 250" style={{ display: 'block' }}>
            <rect width={250} height={250} fill="var(--color-grid-bg)" />
            {demoRects.map((r, i) => (
              <motion.rect
                key={i}
                x={r.col * 50 + 1}
                y={r.row * 50 + 1}
                width={r.width * 50 - 2}
                height={r.height * 50 - 2}
                fill={r.color}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{
                  duration: 7,
                  delay: i * 1.8,
                  repeat: Infinity,
                  repeatDelay: demoRects.length * 1.8 - 7 + 2,
                  times: [0, 0.1, 0.85, 1],
                }}
              />
            ))}
            {Array.from({ length: 6 }, (_, i) => (
              <line key={`h-${i}`} x1={0} y1={i * 50} x2={250} y2={i * 50} stroke="var(--color-grid-line)" strokeWidth={1.5} />
            ))}
            {Array.from({ length: 6 }, (_, i) => (
              <line key={`v-${i}`} x1={i * 50} y1={0} x2={i * 50} y2={250} stroke="var(--color-grid-line)" strokeWidth={1.5} />
            ))}
            <rect width={250} height={250} fill="none" stroke="var(--color-grid-border)" strokeWidth={4} />
          </svg>
        </div>
        <p className="mt-4" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          The rules fit in one sentence.
        </p>
      </section>

      {/* Footer */}
      <footer className="w-full border-t-[3px] border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="grid grid-cols-2 md:grid-cols-4 max-w-[1200px] mx-auto">
          {[
            { title: 'Game', links: [{ label: 'Free Play', href: '/play' }, { label: 'Daily', href: '/daily' }, { label: 'Weekly', href: '/weekly' }, { label: 'Monthly', href: '/monthly' }] },
            { title: 'Learn', links: [{ label: 'How to Solve', href: '/blog/how-to-solve-shikaku' }, { label: 'Mathematics', href: '/blog/mathematics-of-shikaku' }] },
            { title: 'Community', links: [{ label: 'Leaderboard', href: '/leaderboard' }, { label: 'Hall of Fame', href: '/hall-of-fame' }] },
            { title: 'About', links: [{ label: 'About', href: '/about' }, { label: 'Mondrian & Logic', href: '/blog/mondrian-and-logic' }] },
          ].map((section, i) => (
            <div key={section.title} className={`py-8 px-6 ${i < 3 ? 'border-r-[3px] border-[var(--color-border)]' : ''}`}>
              <span className="block mb-3" style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {section.title}
              </span>
              {section.links.map((link) => (
                <Link key={link.href} to={link.href} className="block mb-2" style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="border-t-[3px] border-[var(--color-border)] py-4 text-center" style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          © MONDRIAN SHIKAKU
        </div>
      </footer>
    </div>
  );
}
