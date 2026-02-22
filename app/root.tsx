import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router';
import { ClerkProvider } from '@clerk/clerk-react';
import type { Route } from './+types/root';
import { ThemeContext, useThemeProvider } from '~/lib/hooks/useTheme';
import { useSettingsSync } from '~/lib/hooks/useSettingsSync';
import { useAuth } from '~/lib/hooks/useAuth';
import {
  usePostHogInit,
  usePageView,
  useAnalyticsIdentify,
} from '~/lib/hooks/useAnalytics';
import { ToastProvider } from '~/lib/hooks/useToast';
import Nav from '~/components/ui/Nav';
import ToastContainer from '~/components/ui/ToastContainer';
import './app.css';

const initThemeScript = `(function(){try{
  var s = localStorage.getItem('theme');
  var m = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', s === 'light' || s === 'dark' ? s : (m ? 'dark' : 'light'));
}catch(e){
  document.documentElement.setAttribute('data-theme', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}})();`;

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Outfit:wght@300;400;500;700&display=swap',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <script dangerouslySetInnerHTML={{ __html: initThemeScript }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function AppContent() {
  const location = useLocation();
  useSettingsSync();
  usePageView();
  const { user, profile } = useAuth();
  useAnalyticsIdentify(user, profile);

  return (
    <>
      <Nav />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  const themeValue = useThemeProvider();
  usePostHogInit();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      signInUrl="/login"
      signUpUrl="/signup"
      afterSignOutUrl="/"
    >
      <ThemeContext.Provider value={themeValue}>
        <ToastProvider>
          <AppContent />
          <ToastContainer />
        </ToastProvider>
      </ThemeContext.Provider>
    </ClerkProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-5xl)',
          color: 'var(--color-text)',
        }}
      >
        {message}
      </h1>
      <p
        className="mt-4"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-lg)',
          color: 'var(--color-text-muted)',
        }}
      >
        {details}
      </p>
      {stack && (
        <pre className="mt-8 w-full max-w-2xl p-4 overflow-x-auto bg-[var(--color-surface)] border-2 border-[var(--color-border)]">
          <code style={{ fontSize: 'var(--text-xs)' }}>{stack}</code>
        </pre>
      )}
    </main>
  );
}
