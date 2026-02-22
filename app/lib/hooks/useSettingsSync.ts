import { useEffect, useRef } from 'react';
import { useAuth, type Profile } from './useAuth';
import { useTheme } from './useTheme';
import { updateProfile } from '~/lib/supabase/queries';

/**
 * Syncs settings between localStorage and Supabase profile.
 * - On login: loads profile settings → localStorage
 * - On change: debounced push localStorage → Supabase
 */
export function useSettingsSync() {
  const { user, profile } = useAuth();
  const { setTheme } = useTheme();
  const lastSyncedRef = useRef<string | null>(null);

  // On login: pull profile settings → localStorage
  useEffect(() => {
    if (!profile || !user) return;
    // Only sync once per user session
    if (lastSyncedRef.current === user.id) return;
    lastSyncedRef.current = user.id;

    applyProfileSettings(profile);
  }, [profile, user]);

  function applyProfileSettings(p: Profile) {
    try {
      if (p.theme) {
        localStorage.setItem('theme', p.theme);
        setTheme(p.theme as 'light' | 'dark' | 'system');
      }
      if (typeof p.blind_mode === 'boolean') {
        localStorage.setItem('blindMode', String(p.blind_mode));
      }
      if (typeof p.sound_enabled === 'boolean') {
        localStorage.setItem('soundEnabled', String(p.sound_enabled));
      }
      if (typeof p.show_timer === 'boolean') {
        localStorage.setItem('showTimer', String(p.show_timer));
      }
    } catch {}
  }

  // On localStorage change: debounced push → Supabase
  useEffect(() => {
    if (!user) return;

    let timer: ReturnType<typeof setTimeout>;

    const handleStorage = (e: StorageEvent) => {
      const syncKeys = ['theme', 'blindMode', 'soundEnabled', 'showTimer'];
      if (!e.key || !syncKeys.includes(e.key)) return;

      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          updateProfile(user.id, {
            theme: localStorage.getItem('theme') || 'system',
            blind_mode: localStorage.getItem('blindMode') === 'true',
            sound_enabled: localStorage.getItem('soundEnabled') !== 'false',
            show_timer: localStorage.getItem('showTimer') !== 'false',
          });
        } catch {}
      }, 1500);
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', handleStorage);
    };
  }, [user]);
}
