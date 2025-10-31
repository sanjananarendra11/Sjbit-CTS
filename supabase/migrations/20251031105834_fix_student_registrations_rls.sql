/*
  # Fix Student Registrations RLS Policies

  ## Issue
  Student registrations policies only allowed authenticated users, preventing public registration.

  ## Solution
  Allow public users to create registrations without authentication.
*/

DROP POLICY IF EXISTS "Students can insert own registrations" ON student_registrations;
DROP POLICY IF EXISTS "Students can update own registrations" ON student_registrations;
DROP POLICY IF EXISTS "Students can view own registrations" ON student_registrations;

CREATE POLICY "Enable insert for registration"
  ON student_registrations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable select for authenticated users"
  ON student_registrations FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Enable update for authenticated users"
  ON student_registrations FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);
