import { useState } from 'react';
import { Link } from 'react-router';
import Button from '~/components/ui/Button';
import Input from '~/components/ui/Input';

export function meta() {
  return [
    { title: 'Create Account — Mondrian Shikaku' },
    { name: 'description', content: 'Create a Mondrian Shikaku account to save progress and compete on leaderboards.' },
  ];
}

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    setLoading(true);
    // TODO: Supabase auth integration
    setLoading(false);
    setError('Authentication not yet configured. Set up Supabase credentials to enable sign-up.');
  };

  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      {/* Left panel */}
      <div
        className="hidden md:flex items-center justify-center"
        style={{
          width: '40%',
          backgroundColor: 'var(--color-red)',
          borderRight: '3px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'var(--color-blue)',
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
            Create Account
          </h1>

          <div className="flex flex-col gap-4 mb-6">
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
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
              minLength={8}
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
            {loading ? 'Creating...' : 'Create Account'}
          </Button>

          <div className="mt-6 text-center">
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--color-blue)', fontWeight: 500 }}>
                Sign in
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
