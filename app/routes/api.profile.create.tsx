import type { ActionFunctionArgs } from 'react-router';
import { getAuthUserId } from '~/lib/auth/verify.server';
import { getServerSupabase } from '~/lib/supabase/server';

export async function action({ request }: ActionFunctionArgs) {
  const userId = await getAuthUserId(request);
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const username = typeof body.username === 'string' ? body.username.slice(0, 50) : `player_${userId.slice(0, 8)}`;

  const supabase = getServerSupabase();

  const { error } = await supabase.from('profiles').upsert(
    { id: userId, username },
    { onConflict: 'id' }
  );

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
