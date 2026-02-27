-- Notification preferences for email reminders
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS email              text,
  ADD COLUMN IF NOT EXISTS notify_daily       boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS notify_streak_risk boolean DEFAULT false;
