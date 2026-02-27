-- Add weekly/monthly streak columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS weekly_streak       int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_weekly_streak int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_weekly_date    date,
  ADD COLUMN IF NOT EXISTS monthly_streak      int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_monthly_streak int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_monthly_date   date;

-- Atomic weekly streak update
CREATE OR REPLACE FUNCTION update_weekly_streak(p_user_id TEXT, p_week_start DATE)
RETURNS TABLE(new_streak INTEGER, new_longest INTEGER) AS $$
DECLARE
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_last_date DATE;
  v_new_streak INTEGER;
  v_new_longest INTEGER;
BEGIN
  SELECT weekly_streak, longest_weekly_streak, last_weekly_date
  INTO v_current_streak, v_longest_streak, v_last_date
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN RETURN; END IF;

  -- Already updated this week
  IF v_last_date = p_week_start THEN
    new_streak := v_current_streak;
    new_longest := v_longest_streak;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Consecutive week (previous week start = this week start - 7 days)
  IF v_last_date = p_week_start - 7 THEN
    v_new_streak := COALESCE(v_current_streak, 0) + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  v_new_longest := GREATEST(COALESCE(v_longest_streak, 0), v_new_streak);

  UPDATE profiles
  SET weekly_streak = v_new_streak,
      longest_weekly_streak = v_new_longest,
      last_weekly_date = p_week_start
  WHERE id = p_user_id;

  new_streak := v_new_streak;
  new_longest := v_new_longest;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic monthly streak update
CREATE OR REPLACE FUNCTION update_monthly_streak(p_user_id TEXT, p_month_start DATE)
RETURNS TABLE(new_streak INTEGER, new_longest INTEGER) AS $$
DECLARE
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_last_date DATE;
  v_new_streak INTEGER;
  v_new_longest INTEGER;
  v_expected_prev DATE;
BEGIN
  SELECT monthly_streak, longest_monthly_streak, last_monthly_date
  INTO v_current_streak, v_longest_streak, v_last_date
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN RETURN; END IF;

  -- Already updated this month
  IF v_last_date = p_month_start THEN
    new_streak := v_current_streak;
    new_longest := v_longest_streak;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Consecutive month (previous month start = this month start - 1 month)
  v_expected_prev := p_month_start - INTERVAL '1 month';
  IF v_last_date = v_expected_prev THEN
    v_new_streak := COALESCE(v_current_streak, 0) + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  v_new_longest := GREATEST(COALESCE(v_longest_streak, 0), v_new_streak);

  UPDATE profiles
  SET monthly_streak = v_new_streak,
      longest_monthly_streak = v_new_longest,
      last_monthly_date = p_month_start
  WHERE id = p_user_id;

  new_streak := v_new_streak;
  new_longest := v_new_longest;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
