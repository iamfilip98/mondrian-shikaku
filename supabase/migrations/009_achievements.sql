-- Achievement badges system
CREATE TABLE achievements (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    text REFERENCES profiles(id) NOT NULL,
  badge_key  text NOT NULL,
  earned_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_key)
);

CREATE INDEX achievements_user_idx ON achievements(user_id);

-- RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "allow insert achievements" ON achievements FOR INSERT WITH CHECK (true);
