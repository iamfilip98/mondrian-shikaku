import { Link, useLocation } from 'react-router';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const navLinks = [
  { href: '/play', label: 'Play' },
  { href: '/daily', label: 'Daily' },
  { href: '/weekly', label: 'Weekly' },
  { href: '/monthly', label: 'Monthly' },
  { href: '/leaderboard', label: 'Rankings' },
  { href: '/blog', label: 'Blog' },
];

export default function Nav() {
  const location = useLocation();

  return (
    <nav
      className="w-full bg-[var(--color-bg)] border-b-[3px] border-[var(--color-border)]"
      style={{ height: '56px' }}
    >
      <div className="flex items-center h-full max-w-[1400px] mx-auto">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 px-4 h-full border-r-[3px] border-[var(--color-border)] shrink-0"
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'var(--color-red)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 700,
                fontSize: 'var(--text-sm)',
                color: 'var(--color-white)',
              }}
            >
              MS
            </span>
          </div>
          <span
            className="hidden md:inline"
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 300,
              fontSize: 'var(--text-sm)',
              letterSpacing: '0.05em',
              color: 'var(--color-text)',
            }}
          >
            MONDRIAN SHIKAKU
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center h-full overflow-x-auto">
          {navLinks.map((link) => {
            const isActive =
              location.pathname === link.href ||
              location.pathname.startsWith(link.href + '/');

            return (
              <Link
                key={link.href}
                to={link.href}
                className="relative flex items-center justify-center h-full px-4 border-r-[3px] border-[var(--color-border)] shrink-0"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: isActive ? 500 : 400,
                  fontSize: 'var(--text-sm)',
                  color: isActive ? 'var(--color-text-inverse)' : 'var(--color-text)',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0"
                    style={{ backgroundColor: 'var(--color-red)' }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 35,
                    }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Theme toggle */}
        <div className="flex items-center h-full border-l-[3px] border-[var(--color-border)] px-2">
          <ThemeToggle />
        </div>

        {/* Auth link */}
        <Link
          to="/login"
          className="flex items-center justify-center h-full px-4 border-l-[3px] border-[var(--color-border)] shrink-0"
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text)',
          }}
        >
          Sign In
        </Link>
      </div>
    </nav>
  );
}
