import type { ActionFunctionArgs } from 'react-router';
import { getAuthUserId } from '~/lib/auth/verify.server';
import { getServerSupabase } from '~/lib/supabase/server';

const ALLOWED_FIELDS = new Set([
  'username',
  'avatar_color',
  'theme',
  'blind_mode',
  'sound_enabled',
  'show_timer',
  'notify_daily',
  'notify_streak_risk',
  'email',
]);

const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,30}$/;

export async function action({ request }: ActionFunctionArgs) {
  const userId = await getAuthUserId(request);
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Whitelist fields + validate values
  const updates: Record<string, unknown> = {};
  for (const key of Object.keys(body)) {
    if (!ALLOWED_FIELDS.has(key)) continue;
    const value = body[key];

    switch (key) {
      case 'username':
        if (typeof value !== 'string' || !USERNAME_PATTERN.test(value)) {
          return Response.json({ error: 'Invalid request.' }, { status: 400 });
        }
        break;
      case 'theme':
        if (value !== 'light' && value !== 'dark' && value !== 'system') {
          return Response.json({ error: 'Invalid request.' }, { status: 400 });
        }
        break;
      case 'blind_mode':
      case 'sound_enabled':
      case 'show_timer':
        if (typeof value !== 'boolean') {
          return Response.json({ error: 'Invalid request.' }, { status: 400 });
        }
        break;
      case 'avatar_color':
        if (typeof value !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(value)) {
          return Response.json({ error: 'Invalid request.' }, { status: 400 });
        }
        break;
      case 'notify_daily':
      case 'notify_streak_risk':
        if (typeof value !== 'boolean') {
          return Response.json({ error: 'Invalid request.' }, { status: 400 });
        }
        break;
      case 'email':
        if (typeof value !== 'string' || (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) {
          return Response.json({ error: 'Invalid request.' }, { status: 400 });
        }
        break;
    }

    updates[key] = value;
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: 'No valid fields' }, { status: 400 });
  }

  const supabase = getServerSupabase();

  // Rate limiting: max 10 updates per minute per user
  const { data: profileRow } = await supabase
    .from('profiles')
    .select('updated_at')
    .eq('id', userId)
    .single();

  if (profileRow?.updated_at) {
    const lastUpdate = new Date(profileRow.updated_at).getTime();
    // If updated within the last 30 seconds, rate limit
    if (Date.now() - lastUpdate < 30_000) {
      return Response.json({ error: 'Too many requests.' }, { status: 429 });
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('[api.profile.update] Error:', error.message);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
