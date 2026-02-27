import type { LoaderFunctionArgs } from 'react-router';
import { getServerSupabase } from '~/lib/supabase/server';
import { sendDailyReminder, sendStreakRiskReminder } from '~/lib/email/send.server';

export async function loader({ request }: LoaderFunctionArgs) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServerSupabase();
  const today = new Date().toISOString().slice(0, 10);

  // Find users who want daily reminders
  const { data: dailyUsers } = await supabase
    .from('profiles')
    .select('id, email, username, daily_streak, last_daily_date')
    .eq('notify_daily', true)
    .not('email', 'is', null);

  let sent = 0;

  for (const user of dailyUsers || []) {
    if (!user.email) continue;

    // Skip if already solved today
    if (user.last_daily_date === today) continue;

    try {
      await sendDailyReminder(user.email, user.username, user.daily_streak || 0);
      sent++;
    } catch (err) {
      console.error(`[cron.reminders] Failed to send to ${user.id}:`, err);
    }
  }

  // Find users at risk of losing streak (opted in, have streak, haven't solved today)
  const { data: streakUsers } = await supabase
    .from('profiles')
    .select('id, email, username, daily_streak, last_daily_date')
    .eq('notify_streak_risk', true)
    .gt('daily_streak', 0)
    .not('email', 'is', null);

  let streakSent = 0;

  for (const user of streakUsers || []) {
    if (!user.email) continue;
    if (user.last_daily_date === today) continue;

    try {
      await sendStreakRiskReminder(user.email, user.username, user.daily_streak);
      streakSent++;
    } catch (err) {
      console.error(`[cron.reminders] Failed streak reminder to ${user.id}:`, err);
    }
  }

  return Response.json({ ok: true, dailySent: sent, streakSent });
}
