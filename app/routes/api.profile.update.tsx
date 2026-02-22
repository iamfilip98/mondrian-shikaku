import type { ActionFunctionArgs } from 'react-router';
import { getAuthUserId } from '~/lib/auth/verify.server';
import { getServerSupabase } from '~/lib/supabase/server';

const ALLOWED_FIELDS = new Set([
  'avatar_color',
  'theme',
  'blind_mode',
  'sound_enabled',
  'show_timer',
]);

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
      case 'theme':
        if (value !== 'light' && value !== 'dark' && value !== 'system') {
          return Response.json({ error: 'Invalid theme value' }, { status: 400 });
        }
        break;
      case 'blind_mode':
      case 'sound_enabled':
      case 'show_timer':
        if (typeof value !== 'boolean') {
          return Response.json({ error: `${key} must be a boolean` }, { status: 400 });
        }
        break;
      case 'avatar_color':
        if (typeof value !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(value)) {
          return Response.json({ error: 'Invalid avatar_color format' }, { status: 400 });
        }
        break;
    }

    updates[key] = value;
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: 'No valid fields' }, { status: 400 });
  }

  const supabase = getServerSupabase();

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
