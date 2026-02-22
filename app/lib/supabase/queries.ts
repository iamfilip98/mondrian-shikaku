import { getSupabaseClient } from './client';

export async function getDailyLeaderboard() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from('leaderboard_daily')
    .select('*')
    .limit(100);

  return data || [];
}

export async function getWeeklyLeaderboard() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from('leaderboard_weekly')
    .select('*')
    .limit(100);

  return data || [];
}

export async function getMonthlyLeaderboard() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from('leaderboard_monthly')
    .select('*')
    .limit(100);

  return data || [];
}

export async function getAllTimeLeaderboard(difficulty?: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  let query = supabase.from('leaderboard_alltime').select('*');

  if (difficulty) {
    query = query.eq('difficulty', difficulty);
  }

  const { data } = await query.limit(100);
  return data || [];
}

export async function getHallOfFame() {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from('hall_of_fame')
    .select('*, profiles(username, avatar_color)')
    .order('archived_at', { ascending: false });

  return data || [];
}

export async function getUserStats(userId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('solves')
    .select('difficulty, solve_time_seconds')
    .eq('user_id', userId)
    .order('solve_time_seconds', { ascending: true });

  if (error) {
    console.error('Error fetching user stats:', error);
    return [];
  }

  // Group by difficulty: best time + total solves
  const grouped: Record<string, { bestTime: number; totalSolves: number }> = {};
  for (const row of data || []) {
    const d = row.difficulty;
    if (!grouped[d]) {
      grouped[d] = { bestTime: row.solve_time_seconds, totalSolves: 0 };
    }
    grouped[d].totalSolves++;
    if (row.solve_time_seconds < grouped[d].bestTime) {
      grouped[d].bestTime = row.solve_time_seconds;
    }
  }

  return Object.entries(grouped).map(([difficulty, stats]) => ({
    difficulty,
    bestTime: stats.bestTime,
    totalSolves: stats.totalSolves,
  }));
}

export async function getProfile(userId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return data;
}
