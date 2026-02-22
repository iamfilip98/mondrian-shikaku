-- Migration 003: Switch from Supabase Auth (UUID) to Clerk Auth (text IDs)
-- Tables are empty so safe to drop and recreate.

-- Drop views first
DROP VIEW IF EXISTS leaderboard_daily;
DROP VIEW IF EXISTS leaderboard_weekly;
DROP VIEW IF EXISTS leaderboard_monthly;
DROP VIEW IF EXISTS leaderboard_alltime;

-- Drop tables
DROP TABLE IF EXISTS hall_of_fame;
DROP TABLE IF EXISTS solves;
DROP TABLE IF EXISTS profiles;

-- Recreate with text IDs for Clerk user IDs
CREATE TABLE profiles (
  id                text PRIMARY KEY,
  username          text UNIQUE NOT NULL,
  avatar_color      text DEFAULT '#D40920',
  theme             text DEFAULT 'system'
                      CHECK (theme IN ('light','dark','system')),
  blind_mode        boolean DEFAULT false,
  sound_enabled     boolean DEFAULT true,
  show_timer        boolean DEFAULT true,
  unlocked_colors   text[] DEFAULT array['red'],
  puzzles_completed int DEFAULT 0,
  daily_streak      int DEFAULT 0,
  longest_streak    int DEFAULT 0,
  last_daily_date   date,
  created_at        timestamptz DEFAULT now()
);

CREATE TABLE solves (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             text REFERENCES profiles(id),
  puzzle_type         text NOT NULL
                        CHECK (puzzle_type IN ('daily','weekly','monthly','free')),
  puzzle_seed         text NOT NULL,
  difficulty          text NOT NULL
                        CHECK (difficulty IN
                          ('primer','easy','medium','hard','expert','nightmare')),
  grid_width          int NOT NULL,
  grid_height         int NOT NULL,
  solve_time_seconds  int NOT NULL,
  hints_used          int DEFAULT 0,
  blind_mode_on       boolean DEFAULT false,
  completed_at        timestamptz DEFAULT now()
);

CREATE TABLE hall_of_fame (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         text REFERENCES profiles(id),
  puzzle_seed     text NOT NULL,
  month_year      text NOT NULL,
  rank            int NOT NULL CHECK (rank IN (1,2,3)),
  solve_time_secs int NOT NULL,
  grid_svg        text,
  archived_at     timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX solves_user_idx       ON solves(user_id);
CREATE INDEX solves_seed_type_idx  ON solves(puzzle_seed, puzzle_type);
CREATE INDEX solves_completed_idx  ON solves(completed_at DESC);
CREATE INDEX hof_month_idx         ON hall_of_fame(month_year);

-- Prevent duplicate scheduled puzzle solves
CREATE UNIQUE INDEX solves_unique_scheduled
  ON solves(user_id, puzzle_type, puzzle_seed)
  WHERE puzzle_type IN ('daily', 'weekly', 'monthly');

-- Leaderboard views
CREATE VIEW leaderboard_daily AS
  SELECT p.username, p.avatar_color,
         s.solve_time_seconds, s.hints_used, s.completed_at
  FROM solves s JOIN profiles p ON p.id = s.user_id
  WHERE s.puzzle_type = 'daily'
    AND s.puzzle_seed = 'daily-' || to_char(current_date, 'YYYY-MM-DD')
  ORDER BY s.solve_time_seconds ASC LIMIT 100;

CREATE VIEW leaderboard_weekly AS
  SELECT p.username, p.avatar_color,
         s.solve_time_seconds, s.hints_used, s.completed_at
  FROM solves s JOIN profiles p ON p.id = s.user_id
  WHERE s.puzzle_type = 'weekly'
    AND date_trunc('week', s.completed_at) = date_trunc('week', now())
  ORDER BY s.solve_time_seconds ASC LIMIT 100;

CREATE VIEW leaderboard_monthly AS
  SELECT p.username, p.avatar_color,
         s.solve_time_seconds, s.hints_used, s.completed_at
  FROM solves s JOIN profiles p ON p.id = s.user_id
  WHERE s.puzzle_type = 'monthly'
    AND date_trunc('month', s.completed_at) = date_trunc('month', now())
  ORDER BY s.solve_time_seconds ASC LIMIT 100;

CREATE VIEW leaderboard_alltime AS
  SELECT p.username, p.avatar_color, s.difficulty,
         round(avg(s.solve_time_seconds)) AS avg_time,
         min(s.solve_time_seconds) AS best_time,
         count(*) AS total_solves
  FROM solves s JOIN profiles p ON p.id = s.user_id
  WHERE s.hints_used = 0
  GROUP BY p.username, p.avatar_color, s.difficulty
  ORDER BY avg_time ASC;

-- RLS: permissive (auth is handled by Clerk in the app layer)
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE solves       ENABLE ROW LEVEL SECURITY;
ALTER TABLE hall_of_fame ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "allow insert profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "allow update profiles" ON profiles FOR UPDATE USING (true);
CREATE POLICY "public read solves" ON solves FOR SELECT USING (true);
CREATE POLICY "allow insert solves" ON solves FOR INSERT WITH CHECK (true);
CREATE POLICY "public read hof" ON hall_of_fame FOR SELECT USING (true);
CREATE POLICY "allow insert hof" ON hall_of_fame FOR INSERT WITH CHECK (true);
