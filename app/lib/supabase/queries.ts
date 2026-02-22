import { getSupabaseClient } from './client';

export interface LeaderboardRow {
  username: string;
  avatar_color: string;
  solve_time_seconds: number;
  hints_used: number;
  completed_at: string;
}

export interface AllTimeLeaderboardRow {
  username: string;
  avatar_color: string;
  best_time: number;
  avg_time: number;
  total_solves: number;
}

export async function getDailyLeaderboard(): Promise<LeaderboardRow[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('leaderboard_daily')
    .select('*')
    .limit(100);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getWeeklyLeaderboard(): Promise<LeaderboardRow[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('leaderboard_weekly')
    .select('*')
    .limit(100);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getMonthlyLeaderboard(): Promise<LeaderboardRow[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('leaderboard_monthly')
    .select('*')
    .limit(100);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getAllTimeLeaderboard(difficulty?: string): Promise<AllTimeLeaderboardRow[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  let query = supabase.from('leaderboard_alltime').select('*');

  if (difficulty) {
    query = query.eq('difficulty', difficulty);
  }

  const { data, error } = await query.limit(100);
  if (error) throw new Error(error.message);
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

export async function getUserScheduledSolves(userId: string, seeds: string[]): Promise<string[]> {
  const supabase = getSupabaseClient();
  if (!supabase || seeds.length === 0) return [];

  const { data } = await supabase
    .from('solves')
    .select('puzzle_seed')
    .eq('user_id', userId)
    .in('puzzle_seed', seeds)
    .in('puzzle_type', ['daily', 'weekly', 'monthly']);

  return (data || []).map(r => r.puzzle_seed);
}

export interface SolveResult {
  solve_time_seconds: number;
  hints_used: number;
}

export async function getUserSolveForSeed(userId: string, seed: string): Promise<SolveResult | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from('solves')
    .select('solve_time_seconds, hints_used')
    .eq('user_id', userId)
    .eq('puzzle_seed', seed)
    .single();

  return data || null;
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
