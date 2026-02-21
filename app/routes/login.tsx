import { useState } from 'react';
import { Link } from 'react-router';
import Button from '~/components/ui/Button';
import Input from '~/components/ui/Input';

export function meta() {
  return [
    { title: 'Sign In — Mondrian Shikaku' },
    { name: 'description', content: 'Sign in to Mondrian Shikaku to save your progress and compete on leaderboards.' },
  ];
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // TODO: Supabase auth integration
    setLoading(false);
    setError('Authentication not yet configured. Set up Supabase credentials to enable sign-in.');
  };

  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      {/* Left panel — Mondrian accent (desktop) / Top band (mobile) */}
      <div
        className="hidden md:flex items-center justify-center"
        style={{
          width: '40%',
          backgroundColor: 'var(--color-blue)',
          borderRight: '3px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'var(--color-red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-xl)', color: 'var(--color-white)' }}>
              MS
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 'var(--text-lg)', color: 'var(--color-white)' }}>
            MONDRIAN SHIKAKU
          </span>
        </div>
      </div>

      {/* Mobile top band */}
      <div
        className="md:hidden w-full flex items-center justify-center absolute top-[56px] left-0"
        style={{
          height: '80px',
          backgroundColor: 'var(--color-blue)',
          borderBottom: '3px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-2">
          <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--color-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-white)' }}>MS</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 md:py-0">
        <form onSubmit={handleSubmit} className="w-full max-w-[360px]">
          <h1
            className="mb-8"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-3xl)',
              color: 'var(--color-text)',
            }}
          >
            Sign In
          </h1>

          <div className="flex flex-col gap-4 mb-6">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p
              className="mb-4"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-red)',
              }}
            >
              {error}
            </p>
          )}

          <Button variant="primary" size="lg" fullWidth disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="mt-6 text-center">
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              No account?{' '}
              <Link to="/signup" style={{ color: 'var(--color-blue)', fontWeight: 500 }}>
                Create one
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
