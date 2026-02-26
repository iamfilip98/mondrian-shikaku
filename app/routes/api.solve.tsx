import type { ActionFunctionArgs } from 'react-router';
import { getAuthUserId } from '~/lib/auth/verify.server';
import { getServerSupabase } from '~/lib/supabase/server';

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
  const { puzzleType, puzzleSeed, difficulty, gridWidth, gridHeight, solveTimeSeconds, hintsUsed, blindModeOn } = body;

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

  const supabase = getServerSupabase();

  // Rate limiting: max 5 solves per minute per user
  const { count: recentSolves } = await supabase
    .from('solves')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - 60_000).toISOString());

  if (recentSolves !== null && recentSolves >= 5) {
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
  if (puzzleType === 'daily') {
    // Use atomic RPC to prevent streak race conditions
    const today = new Date().toISOString().slice(0, 10);
    const { data: streakResult, error: streakError } = await supabase
      .rpc('update_daily_streak', { p_user_id: userId, p_today: today });

    if (streakError) {
      console.error('[api.solve] Streak RPC error:', streakError.message);
    }

    const streak = streakResult?.[0]?.new_streak ?? null;
    return Response.json({ ok: true, ...(streak !== null && { streak }) });
  } else {
    // Non-daily: just increment puzzles_completed
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
      // Fallback: read-then-write
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

  return Response.json({ ok: true });
}
