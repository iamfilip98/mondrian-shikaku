import { SignIn } from '@clerk/clerk-react';

export function meta() {
  return [
    { title: 'Sign In — Mondrian Shikaku' },
    { name: 'description', content: 'Sign in to Mondrian Shikaku to save your progress and compete on leaderboards.' },
    { property: 'og:title', content: 'Sign In — Mondrian Shikaku' },
    { property: 'og:image', content: 'https://mondrianshikaku.com/og-image.png' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:image', content: 'https://mondrianshikaku.com/og-image.png' },
  ];
}

export default function Login() {
  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      {/* Left panel — Mondrian accent (desktop) */}
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

      {/* Sign-in form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 md:py-0">
        <SignIn
          routing="hash"
          signUpUrl="/signup"
          forceRedirectUrl="/"
        />
      </div>
    </div>
  );
}
