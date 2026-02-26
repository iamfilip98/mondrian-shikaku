import type { LoaderFunctionArgs } from 'react-router';
import { getServerSupabase } from '~/lib/supabase/server';

export async function loader({ request }: LoaderFunctionArgs) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = getServerSupabase();
  const { data, error } = await supabase.rpc('archive_monthly_winners');

  if (error) {
    console.error('[api.cron.archive-hof] Error:', error.message);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }

  return Response.json(data);
}
