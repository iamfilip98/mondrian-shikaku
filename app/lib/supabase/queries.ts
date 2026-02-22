import { getSupabaseClient } from './client';

export async function saveSolve(solve: {
  userId: string;
  puzzleType: 'daily' | 'weekly' | 'monthly' | 'free';
  puzzleSeed: string;
  difficulty: string;
  gridWidth: number;
  gridHeight: number;
  solveTimeSeconds: number;
  hintsUsed: number;
  blindModeOn: boolean;
}) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from('solves').insert({
    user_id: solve.userId,
    puzzle_type: solve.puzzleType,
    puzzle_seed: solve.puzzleSeed,
    difficulty: solve.difficulty,
    grid_width: solve.gridWidth,
    grid_height: solve.gridHeight,
    solve_time_seconds: solve.solveTimeSeconds,
    hints_used: solve.hintsUsed,
    blind_mode_on: solve.blindModeOn,
  });

  if (error) {
    // Silently ignore duplicate scheduled puzzle solves (unique constraint violation)
    if (error.code === '23505') return null;
    console.error('Error saving solve:', error);
  }
  return data;
}

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

export async function updateProfile(userId: string, updates: Record<string, unknown>) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) console.error('Error updating profile:', error);
  return data;
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

export async function updateDailyStreak(userId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const profile = await getProfile(userId);
  if (!profile) return;

  const today = new Date().toISOString().slice(0, 10);
  const lastDate = profile.last_daily_date;

  let newStreak: number;
  if (lastDate === today) {
    // Already counted today
    return;
  } else if (lastDate) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    newStreak = lastDate === yesterdayStr ? profile.daily_streak + 1 : 1;
  } else {
    newStreak = 1;
  }

  const longestStreak = Math.max(profile.longest_streak || 0, newStreak);

  await supabase
    .from('profiles')
    .update({
      daily_streak: newStreak,
      longest_streak: longestStreak,
      last_daily_date: today,
      puzzles_completed: (profile.puzzles_completed || 0) + 1,
    })
    .eq('id', userId);
}

export async function incrementPuzzlesCompleted(userId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const profile = await getProfile(userId);
  if (!profile) return;

  await supabase
    .from('profiles')
    .update({
      puzzles_completed: (profile.puzzles_completed || 0) + 1,
    })
    .eq('id', userId);
}
