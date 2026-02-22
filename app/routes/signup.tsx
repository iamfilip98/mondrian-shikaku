import { SignUp } from '@clerk/clerk-react';

export function meta() {
  return [
    { title: 'Create Account — Mondrian Shikaku' },
    { name: 'description', content: 'Create a Mondrian Shikaku account to save progress and compete on leaderboards.' },
  ];
}

export default function Signup() {
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

      {/* Sign-up form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 md:py-0">
        <SignUp
          routing="hash"
          signInUrl="/login"
          forceRedirectUrl="/"
        />
      </div>
    </div>
  );
}
