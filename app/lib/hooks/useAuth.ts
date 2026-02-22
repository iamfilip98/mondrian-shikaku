import { useCallback, useEffect, useState } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { getProfile } from '~/lib/supabase/queries';
import { getSupabaseClient } from '~/lib/supabase/client';

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
  const [profile, setProfile] = useState<Profile | null>(null);

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

    fetchProfile(user.id).then(async (existing) => {
      if (!existing) {
        // First sign-in — auto-create profile
        const supabase = getSupabaseClient();
        if (!supabase) return;

        const username =
          user.username ||
          user.firstName?.toLowerCase().replace(/\s+/g, '_') ||
          user.primaryEmailAddress?.emailAddress?.split('@')[0] ||
          `player_${user.id.slice(0, 8)}`;

        const { error } = await supabase.from('profiles').upsert({
          id: user.id,
          username,
        }, { onConflict: 'id' });

        if (!error) {
          await fetchProfile(user.id);
        }
      }
    });
  }, [isLoaded, isSignedIn, user, fetchProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  const signOut = useCallback(async () => {
    await clerkSignOut();
    setProfile(null);
  }, [clerkSignOut]);

  return {
    user: isSignedIn && user ? { id: user.id } : null,
    profile,
    loading: !isLoaded,
    signOut,
    refreshProfile,
  };
}
