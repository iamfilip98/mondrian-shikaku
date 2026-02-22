-- Migration 004: Add function to archive monthly Hall of Fame winners
-- Called by Vercel cron on the 1st of each month

CREATE OR REPLACE FUNCTION archive_monthly_winners()
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  prev_month     date;
  seed           text;
  display_month  text;
  winner         record;
  rank_counter   int := 0;
  inserted       int := 0;
BEGIN
  -- Previous month
  prev_month := date_trunc('month', now()) - interval '1 day';
  seed := 'monthly-' || to_char(prev_month, 'YYYY-MM');
  display_month := to_char(prev_month, 'FMMonth YYYY');

  -- Skip if already archived
  IF EXISTS (SELECT 1 FROM hall_of_fame WHERE puzzle_seed = seed) THEN
    RETURN jsonb_build_object(
      'status', 'skipped',
      'reason', 'already archived',
      'month', display_month
    );
  END IF;

  -- Insert top 3 fastest solvers
  FOR winner IN
    SELECT s.user_id, s.solve_time_seconds
    FROM solves s
    WHERE s.puzzle_type = 'monthly'
      AND s.puzzle_seed = seed
    ORDER BY s.solve_time_seconds ASC
    LIMIT 3
  LOOP
    rank_counter := rank_counter + 1;
    INSERT INTO hall_of_fame (user_id, puzzle_seed, month_year, rank, solve_time_secs)
    VALUES (winner.user_id, seed, display_month, rank_counter, winner.solve_time_seconds);
    inserted := inserted + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'status', 'archived',
    'month', display_month,
    'winners', inserted
  );
END;
$$;
