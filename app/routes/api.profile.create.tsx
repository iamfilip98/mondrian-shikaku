import type { ActionFunctionArgs } from 'react-router';
import { getAuthUserId } from '~/lib/auth/verify.server';
import { getServerSupabase } from '~/lib/supabase/server';

const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,30}$/;

export async function action({ request }: ActionFunctionArgs) {
  const userId = await getAuthUserId(request);
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  let username = typeof body.username === 'string' ? body.username.trim() : '';

  // Validate username format; fall back to default if invalid
  if (!USERNAME_PATTERN.test(username)) {
    username = `player_${userId.slice(0, 8)}`;
  }

  const supabase = getServerSupabase();

  // Duplicate key constraint (23505) is sufficient rate limiting for profile creation —
  // each user can only have one profile, so no additional rate limit is needed.

  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: userId, username })
    .select('id')
    .maybeSingle();

  if (error) {
    // Duplicate key means profile already exists — that's fine
    if (error.code === '23505') {
      return Response.json({ ok: true, existing: true });
    }
    console.error('[api.profile.create] Error:', error.message);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }

  return Response.json({ ok: true, created: !!data });
}
