import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import {
  initAnalytics,
  trackPageView,
  identifyUser,
  resetAnalytics,
} from '~/lib/analytics';
import type { Profile } from '~/lib/hooks/useAuth';

export function usePostHogInit() {
  const initedRef = useRef(false);
  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;
    initAnalytics();
  }, []);
}

export function usePageView() {
  const { pathname } = useLocation();
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);
}

export function useAnalyticsIdentify(
  user: { id: string } | null,
  profile: Profile | null,
) {
  const prevUserId = useRef<string | null>(null);

  useEffect(() => {
    if (user && user.id !== prevUserId.current) {
      prevUserId.current = user.id;
      identifyUser(user.id, {
        username: profile?.username,
        puzzles_completed: profile?.puzzles_completed,
      });
    } else if (!user && prevUserId.current) {
      prevUserId.current = null;
      resetAnalytics();
    }
  }, [user, profile]);
}
