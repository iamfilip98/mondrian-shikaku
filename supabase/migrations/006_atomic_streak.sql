-- Atomic daily streak update using row-level locking to prevent race conditions
CREATE OR REPLACE FUNCTION update_daily_streak(p_user_id UUID, p_today DATE)
RETURNS TABLE(new_streak INTEGER, new_longest INTEGER, puzzles_count INTEGER) AS $$
DECLARE
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_last_date DATE;
  v_puzzles INTEGER;
  v_new_streak INTEGER;
  v_new_longest INTEGER;
BEGIN
  -- Lock the row to prevent concurrent updates
  SELECT daily_streak, longest_streak, last_daily_date, puzzles_completed
  INTO v_current_streak, v_longest_streak, v_last_date, v_puzzles
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- If no profile found, return nothing
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- If already updated today, return current values without changing
  IF v_last_date = p_today THEN
    new_streak := v_current_streak;
    new_longest := v_longest_streak;
    puzzles_count := v_puzzles;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Calculate new streak
  IF v_last_date = p_today - 1 THEN
    v_new_streak := COALESCE(v_current_streak, 0) + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  v_new_longest := GREATEST(COALESCE(v_longest_streak, 0), v_new_streak);

  UPDATE profiles
  SET daily_streak = v_new_streak,
      longest_streak = v_new_longest,
      last_daily_date = p_today,
      puzzles_completed = COALESCE(v_puzzles, 0) + 1
  WHERE id = p_user_id;

  new_streak := v_new_streak;
  new_longest := v_new_longest;
  puzzles_count := COALESCE(v_puzzles, 0) + 1;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
