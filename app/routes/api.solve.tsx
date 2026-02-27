import type { ActionFunctionArgs } from 'react-router';
import { getAuthUserId } from '~/lib/auth/verify.server';
import { getServerSupabase } from '~/lib/supabase/server';
import { validateSolve } from '~/lib/puzzle/validate.server';
import { checkNewBadges, type AchievementCheckContext } from '~/lib/achievements/badges';

const VALID_PUZZLE_TYPES = ['daily', 'weekly', 'monthly', 'free'] as const;
const VALID_DIFFICULTIES = ['primer', 'easy', 'medium', 'hard', 'expert', 'nightmare'] as const;

const SEED_PATTERN = /^(daily-\d{4}-\d{2}-\d{2}|weekly-\d{4}-W\d{2}|monthly-\d{4}-\d{2}|[a-zA-Z0-9_-]{1,100})$/;

// Expected grid sizes for scheduled puzzle types
const SCHEDULED_GRID_SIZES: Record<string, { width: number; height: number }> = {
  daily: { width: 10, height: 10 },
  weekly: { width: 20, height: 20 },
  monthly: { width: 40, height: 40 },
};

// Expected seed patterns for scheduled puzzle types
const SCHEDULED_SEED_PATTERNS: Record<string, RegExp> = {
  daily: /^daily-\d{4}-\d{2}-\d{2}$/,
  weekly: /^weekly-\d{4}-W\d{2}$/,
  monthly: /^monthly-\d{4}-\d{2}$/,
};

export async function action({ request }: ActionFunctionArgs) {
  const userId = await getAuthUserId(request);
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { puzzleType, puzzleSeed, difficulty, gridWidth, gridHeight, solveTimeSeconds, hintsUsed, blindModeOn, placedRects } = body;

  // Validate puzzleType
  if (!VALID_PUZZLE_TYPES.includes(puzzleType)) {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }
  // Validate difficulty
  if (!VALID_DIFFICULTIES.includes(difficulty)) {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }
  // Validate puzzleSeed format
  if (typeof puzzleSeed !== 'string' || !puzzleSeed || !SEED_PATTERN.test(puzzleSeed)) {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }
  // Cross-validate: scheduled puzzle types must have matching seed patterns
  if (puzzleType in SCHEDULED_SEED_PATTERNS && !SCHEDULED_SEED_PATTERNS[puzzleType].test(puzzleSeed)) {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }
  // Validate grid dimensions: must be numbers in range 4–100
  if (typeof gridWidth !== 'number' || typeof gridHeight !== 'number' ||
      gridWidth < 4 || gridWidth > 100 || gridHeight < 4 || gridHeight > 100 ||
      !Number.isInteger(gridWidth) || !Number.isInteger(gridHeight)) {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }
  // Cross-validate: scheduled puzzle types must match expected grid sizes
  if (puzzleType in SCHEDULED_GRID_SIZES) {
    const expected = SCHEDULED_GRID_SIZES[puzzleType];
    if (gridWidth !== expected.width || gridHeight !== expected.height) {
      return Response.json({ error: 'Invalid request.' }, { status: 400 });
    }
  }
  // Validate solveTimeSeconds: must be 1–86400
  if (typeof solveTimeSeconds !== 'number' || !Number.isInteger(solveTimeSeconds) ||
      solveTimeSeconds < 1 || solveTimeSeconds > 86400) {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // SEC-4: Minimum solve time based on grid area
  const gridArea = gridWidth * gridHeight;
  const minSolveTime = Math.max(1, Math.floor(gridArea / 10));
  if (solveTimeSeconds < minSolveTime) {
    console.warn(`[api.solve] Suspicious solve: user=${userId} time=${solveTimeSeconds}s min=${minSolveTime}s grid=${gridWidth}x${gridHeight}`);
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Validate hintsUsed: must be 0–3
  if (hintsUsed !== undefined && hintsUsed !== null) {
    if (typeof hintsUsed !== 'number' || !Number.isInteger(hintsUsed) ||
        hintsUsed < 0 || hintsUsed > 3) {
      return Response.json({ error: 'Invalid request.' }, { status: 400 });
    }
  }
  // Validate blindModeOn: must be boolean
  if (blindModeOn !== undefined && blindModeOn !== null && typeof blindModeOn !== 'boolean') {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Validate placedRects: must be an array of rectangle objects
  if (!Array.isArray(placedRects) || placedRects.length === 0) {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Server-side puzzle validation: regenerate puzzle and verify solution
  const validation = validateSolve(placedRects, puzzleSeed, difficulty, gridWidth, gridHeight);
  if (!validation.valid) {
    console.warn(`[api.solve] Invalid solve: user=${userId} reason=${validation.reason} seed=${puzzleSeed}`);
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const supabase = getServerSupabase();

  // Rate limiting: max 2 solves per minute per user
  const { count: recentSolves } = await supabase
    .from('solves')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 60_000).toISOString());

  if (recentSolves !== null && recentSolves >= 2) {
    return Response.json({ error: 'Too many requests. Please slow down.' }, { status: 429 });
  }

  // Insert solve
  const { error: solveError } = await supabase.from('solves').insert({
    user_id: userId,
    puzzle_type: puzzleType,
    puzzle_seed: puzzleSeed,
    difficulty,
    grid_width: gridWidth,
    grid_height: gridHeight,
    solve_time_seconds: solveTimeSeconds,
    hints_used: hintsUsed ?? 0,
    blind_mode_on: blindModeOn ?? false,
  });

  if (solveError) {
    // Silently ignore duplicate scheduled puzzle solves
    if (solveError.code === '23505') {
      return Response.json({ ok: true, duplicate: true });
    }
    console.error('[api.solve] Insert error:', solveError.message);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }

  // Update streak / puzzles_completed
  const responseData: Record<string, unknown> = { ok: true };

  if (puzzleType === 'daily') {
    const today = new Date().toISOString().slice(0, 10);
    const { data: streakResult, error: streakError } = await supabase
      .rpc('update_daily_streak', { p_user_id: userId, p_today: today });

    if (streakError) {
      console.error('[api.solve] Streak RPC error:', streakError.message);
    }

    const streak = streakResult?.[0]?.new_streak ?? null;
    if (streak !== null) responseData.streak = streak;
  } else if (puzzleType === 'weekly') {
    const now = new Date();
    const day = now.getUTCDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const weekStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + mondayOffset));
    const weekStartStr = weekStart.toISOString().slice(0, 10);

    const { data: streakResult, error: streakError } = await supabase
      .rpc('update_weekly_streak', { p_user_id: userId, p_week_start: weekStartStr });

    if (streakError) console.error('[api.solve] Weekly streak RPC error:', streakError.message);

    await incrementPuzzlesCompleted(supabase, userId);

    const streak = streakResult?.[0]?.new_streak ?? null;
    if (streak !== null) responseData.weeklyStreak = streak;
  } else if (puzzleType === 'monthly') {
    const now = new Date();
    const monthStart = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`;

    const { data: streakResult, error: streakError } = await supabase
      .rpc('update_monthly_streak', { p_user_id: userId, p_month_start: monthStart });

    if (streakError) console.error('[api.solve] Monthly streak RPC error:', streakError.message);

    await incrementPuzzlesCompleted(supabase, userId);

    const streak = streakResult?.[0]?.new_streak ?? null;
    if (streak !== null) responseData.monthlyStreak = streak;
  } else {
    await incrementPuzzlesCompleted(supabase, userId);
  }

  // Check achievements
  try {
    const [profileData, existingAchievements, noHintData] = await Promise.all([
      supabase.from('profiles').select('puzzles_completed, longest_streak').eq('id', userId).single(),
      supabase.from('achievements').select('badge_key').eq('user_id', userId),
      supabase.from('solves').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('hints_used', 0),
    ]);

    const earnedBadges = new Set((existingAchievements.data || []).map(a => a.badge_key));
    const ctx: AchievementCheckContext = {
      puzzlesCompleted: profileData.data?.puzzles_completed ?? 0,
      longestStreak: profileData.data?.longest_streak ?? 0,
      difficulty,
      hintsUsed: hintsUsed ?? 0,
      solveTimeSeconds,
      noHintSolves: noHintData.count ?? 0,
      earnedBadges,
    };

    const newBadges = checkNewBadges(ctx);
    if (newBadges.length > 0) {
      await supabase.from('achievements').insert(
        newBadges.map(key => ({ user_id: userId, badge_key: key }))
      );
      responseData.newBadges = newBadges;
    }
  } catch (err) {
    console.error('[api.solve] Achievement check error:', err);
  }

  return Response.json(responseData);
}

async function incrementPuzzlesCompleted(supabase: ReturnType<typeof getServerSupabase>, userId: string) {
  let updateError: { message: string } | null = null;
  try {
    const { error } = await supabase.rpc('increment_puzzles_completed', {
      p_user_id: userId,
    });
    updateError = error;
  } catch {
    updateError = { message: 'RPC not found' };
  }

  if (updateError) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('puzzles_completed')
      .eq('id', userId)
      .single();

    if (profile) {
      const { error: fallbackError } = await supabase
        .from('profiles')
        .update({ puzzles_completed: (profile.puzzles_completed || 0) + 1 })
        .eq('id', userId);

      if (fallbackError) {
        console.error('[api.solve] Puzzles completed update error:', fallbackError.message);
      }
    }
  }
}
