import type { ActionFunctionArgs } from 'react-router';
import { getAuthUserId } from '~/lib/auth/verify.server';
import { getServerSupabase } from '~/lib/supabase/server';

const VALID_PUZZLE_TYPES = ['daily', 'weekly', 'monthly', 'free'] as const;
const VALID_DIFFICULTIES = ['primer', 'easy', 'medium', 'hard', 'expert', 'nightmare'] as const;

export async function action({ request }: ActionFunctionArgs) {
  const userId = await getAuthUserId(request);
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { puzzleType, puzzleSeed, difficulty, gridWidth, gridHeight, solveTimeSeconds, hintsUsed, blindModeOn } = body;

  // Validate
  if (!VALID_PUZZLE_TYPES.includes(puzzleType)) {
    return Response.json({ error: 'Invalid puzzleType' }, { status: 400 });
  }
  if (!VALID_DIFFICULTIES.includes(difficulty)) {
    return Response.json({ error: 'Invalid difficulty' }, { status: 400 });
  }
  if (typeof puzzleSeed !== 'string' || !puzzleSeed) {
    return Response.json({ error: 'Invalid puzzleSeed' }, { status: 400 });
  }
  if (typeof gridWidth !== 'number' || typeof gridHeight !== 'number') {
    return Response.json({ error: 'Invalid grid dimensions' }, { status: 400 });
  }
  if (typeof solveTimeSeconds !== 'number' || solveTimeSeconds < 0) {
    return Response.json({ error: 'Invalid solveTimeSeconds' }, { status: 400 });
  }

  const supabase = getServerSupabase();

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
    return Response.json({ error: solveError.message }, { status: 500 });
  }

  // Update streak / puzzles_completed
  if (puzzleType === 'daily') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('daily_streak, longest_streak, last_daily_date, puzzles_completed')
      .eq('id', userId)
      .single();

    if (profile) {
      const today = new Date().toISOString().slice(0, 10);
      const lastDate = profile.last_daily_date;

      if (lastDate !== today) {
        let newStreak: number;
        if (lastDate) {
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

        return Response.json({ ok: true, streak: newStreak });
      }
    }
  } else {
    // Non-daily: just increment puzzles_completed
    const { data: profile } = await supabase
      .from('profiles')
      .select('puzzles_completed')
      .eq('id', userId)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({ puzzles_completed: (profile.puzzles_completed || 0) + 1 })
        .eq('id', userId);
    }
  }

  return Response.json({ ok: true });
}
