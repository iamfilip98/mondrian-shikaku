-- Migration 005: Restrict writes to service role only.
-- All writes now go through server-side API routes using the service role key,
-- which bypasses RLS. Drop the permissive INSERT/UPDATE policies for anon.

-- profiles: drop insert/update (keep public read)
DROP POLICY IF EXISTS "allow insert profiles" ON profiles;
DROP POLICY IF EXISTS "allow update profiles" ON profiles;

-- solves: drop insert (keep public read)
DROP POLICY IF EXISTS "allow insert solves" ON solves;

-- hall_of_fame: drop insert (keep public read)
DROP POLICY IF EXISTS "allow insert hof" ON hall_of_fame;
