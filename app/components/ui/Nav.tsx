import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '~/lib/hooks/useAuth';

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
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, profile, loading, signOut } = useAuth();

  return (
    <nav
      className="relative w-full bg-[var(--color-bg)] border-b-[3px] border-[var(--color-border)]"
      style={{ height: '56px' }}
    >
      <div className="flex items-center h-full max-w-[1400px] mx-auto">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 px-4 h-full border-r-[3px] border-[var(--color-border)] shrink-0"
          onClick={() => setMenuOpen(false)}
          aria-label="Mondrian Shikaku Home"
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

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center h-full">
          {navLinks.map((link) => {
            const isActive =
              location.pathname === link.href ||
              location.pathname.startsWith(link.href + '/');

            return (
              <Link
                key={link.href}
                to={link.href}
                className="relative flex items-center justify-center h-full px-4 border-r-[3px] border-[var(--color-border)] shrink-0"
                aria-current={isActive ? 'page' : undefined}
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

        {/* Auth area (desktop) */}
        {!loading && (
          user ? (
            <div className="hidden md:flex items-center h-full border-l-[3px] border-[var(--color-border)]">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 h-full"
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    backgroundColor: profile?.avatar_color || 'var(--color-red)',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: 500,
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text)',
                  }}
                >
                  {profile?.username || 'Player'}
                </span>
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center justify-center h-full px-4 border-l-[3px] border-[var(--color-border)] cursor-pointer"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 400,
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                  background: 'none',
                  border: 'none',
                  borderLeft: '3px solid var(--color-border)',
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:flex items-center justify-center h-full px-4 border-l-[3px] border-[var(--color-border)] shrink-0"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text)',
              }}
            >
              Sign In
            </Link>
          )
        )}

        {/* Mobile hamburger */}
        <button
          className="flex md:hidden items-center justify-center h-full shrink-0 border-l-[3px] border-[var(--color-border)] cursor-pointer"
          style={{
            width: '48px',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text)',
            background: 'none',
            border: 'none',
            borderLeft: '3px solid var(--color-border)',
          }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            className="md:hidden absolute top-full left-0 right-0 z-50 bg-[var(--color-bg)] border-b-[3px] border-[var(--color-border)]"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            {navLinks.map((link) => {
              const isActive =
                location.pathname === link.href ||
                location.pathname.startsWith(link.href + '/');

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className="flex items-center px-6 border-b-2 border-[var(--color-border)]"
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    height: '48px',
                    fontFamily: 'var(--font-body)',
                    fontWeight: isActive ? 500 : 400,
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text)',
                    backgroundColor: isActive ? 'var(--color-red)' : 'transparent',
                    ...(isActive && { color: 'var(--color-text-inverse)' }),
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            {!loading && (
              user ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-6 border-b-2 border-[var(--color-border)]"
                    style={{
                      height: '48px',
                      fontFamily: 'var(--font-body)',
                      fontWeight: 500,
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text)',
                      textDecoration: 'none',
                    }}
                    onClick={() => setMenuOpen(false)}
                  >
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: profile?.avatar_color || 'var(--color-red)',
                      }}
                    />
                    {profile?.username || 'Player'}
                  </Link>
                  <button
                    className="flex items-center px-6 w-full cursor-pointer"
                    style={{
                      height: '48px',
                      fontFamily: 'var(--font-body)',
                      fontWeight: 400,
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-muted)',
                      background: 'none',
                      border: 'none',
                    }}
                    onClick={() => { signOut(); setMenuOpen(false); }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center px-6"
                  style={{
                    height: '48px',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 500,
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text)',
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </Link>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
