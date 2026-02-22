-- Fix daily leaderboard view: seed format is 'daily-YYYY-MM-DD'
CREATE OR REPLACE VIEW leaderboard_daily AS
  SELECT p.username, p.avatar_color,
         s.solve_time_seconds, s.hints_used, s.completed_at
  FROM solves s JOIN profiles p ON p.id = s.user_id
  WHERE s.puzzle_type = 'daily'
    AND s.puzzle_seed = 'daily-' || to_char(current_date, 'YYYY-MM-DD')
  ORDER BY s.solve_time_seconds ASC LIMIT 100;

-- Fix weekly view to match seed format
CREATE OR REPLACE VIEW leaderboard_weekly AS
  SELECT p.username, p.avatar_color,
         s.solve_time_seconds, s.hints_used, s.completed_at
  FROM solves s JOIN profiles p ON p.id = s.user_id
  WHERE s.puzzle_type = 'weekly'
    AND date_trunc('week', s.completed_at) = date_trunc('week', now())
  ORDER BY s.solve_time_seconds ASC LIMIT 100;

-- Fix monthly view to match seed format
CREATE OR REPLACE VIEW leaderboard_monthly AS
  SELECT p.username, p.avatar_color,
         s.solve_time_seconds, s.hints_used, s.completed_at
  FROM solves s JOIN profiles p ON p.id = s.user_id
  WHERE s.puzzle_type = 'monthly'
    AND date_trunc('month', s.completed_at) = date_trunc('month', now())
  ORDER BY s.solve_time_seconds ASC LIMIT 100;

-- Public profile reads (needed for leaderboard views to work for anon users)
CREATE POLICY "public profile read" ON profiles FOR SELECT USING (true);

-- Prevent duplicate scheduled puzzle solves
CREATE UNIQUE INDEX solves_unique_scheduled
  ON solves(user_id, puzzle_type, puzzle_seed)
  WHERE puzzle_type IN ('daily', 'weekly', 'monthly');
