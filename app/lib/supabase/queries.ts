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

  if (error) console.error('Error saving solve:', error);
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
