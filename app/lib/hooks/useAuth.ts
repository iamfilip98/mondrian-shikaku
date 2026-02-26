import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUser, useClerk, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { getProfile } from '~/lib/supabase/queries';

export interface Profile {
  id: string;
  username: string;
  avatar_color: string;
  theme: string;
  blind_mode: boolean;
  sound_enabled: boolean;
  show_timer: boolean;
  unlocked_colors: string[];
  puzzles_completed: number;
  daily_streak: number;
  longest_streak: number;
  last_daily_date: string | null;
  created_at: string;
}

export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const { getToken } = useClerkAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    const data = await getProfile(userId);
    if (data) {
      setProfile(data as Profile);
    }
    return data;
  }, []);

  // When Clerk user changes, fetch or auto-create Supabase profile
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) {
      setProfile(null);
      return;
    }

    let cancelled = false;

    fetchProfile(user.id).then(async (existing) => {
      if (cancelled) return;
      if (!existing) {
        // First sign-in — auto-create profile via server API
        try {
          const token = await getToken();
          if (cancelled || !token) return;

          const username =
            user.username ||
            user.firstName?.toLowerCase().replace(/\s+/g, '_') ||
            user.primaryEmailAddress?.emailAddress?.split('@')[0] ||
            `player_${user.id.slice(0, 8)}`;

          const res = await fetch('/api/profile/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ username }),
          });

          if (cancelled) return;
          if (res.ok) {
            setProfileError(null);
            await fetchProfile(user.id);
          } else {
            setProfileError('Failed to create profile. Please try again.');
          }
        } catch {
          if (!cancelled) setProfileError('Network error creating profile.');
        }
      }
    });

    return () => { cancelled = true; };
  }, [isLoaded, isSignedIn, user, fetchProfile, getToken]);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  const signOut = useCallback(async () => {
    await clerkSignOut();
    setProfile(null);
  }, [clerkSignOut]);

  const stableUser = useMemo(
    () => (isSignedIn && user ? { id: user.id } : null),
    [isSignedIn, user?.id]
  );

  return {
    user: stableUser,
    profile,
    profileError,
    loading: !isLoaded,
    signOut,
    refreshProfile,
    getToken,
  };
}
