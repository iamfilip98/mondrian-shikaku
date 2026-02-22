import { useEffect, useRef } from 'react';
import { useAuth, type Profile } from './useAuth';
import { useTheme } from './useTheme';
import { useToast } from './useToast';

/**
 * Syncs settings between localStorage and Supabase profile.
 * - On login: loads profile settings → localStorage
 * - On change: debounced push localStorage → Supabase via server API
 */
export function useSettingsSync() {
  const { user, profile, getToken } = useAuth();
  const { setTheme } = useTheme();
  const { addToast } = useToast();
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

    const syncKeys = ['theme', 'blindMode', 'soundEnabled', 'showTimer'];
    let timer: ReturnType<typeof setTimeout>;

    const doSync = () => {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        try {
          const token = await getToken();
          if (!token) return;

          const res = await fetch('/api/profile/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              theme: localStorage.getItem('theme') || 'system',
              blind_mode: localStorage.getItem('blindMode') === 'true',
              sound_enabled: localStorage.getItem('soundEnabled') !== 'false',
              show_timer: localStorage.getItem('showTimer') !== 'false',
            }),
          });
          if (!res.ok) throw new Error();
        } catch {
          addToast('Settings sync failed. Changes saved locally.', 'error');
        }
      }, 1500);
    };

    // Cross-tab changes
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || !syncKeys.includes(e.key)) return;
      doSync();
    };

    // Same-tab changes: intercept localStorage.setItem
    const origSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (key: string, value: string) {
      origSetItem(key, value);
      if (syncKeys.includes(key)) doSync();
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', handleStorage);
      localStorage.setItem = origSetItem;
    };
  }, [user, getToken]);
}
