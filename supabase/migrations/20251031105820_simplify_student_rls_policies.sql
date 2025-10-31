/*
  # Simplify Student RLS Policies for Registration

  ## Issue
  The existing RLS policies had conflicts preventing student registration.

  ## Solution
  1. Remove all existing restrictive policies
  2. Create simple, clear policies that allow registration
  3. Keep authentication-based access control for authenticated users
*/

DROP POLICY IF EXISTS "Anyone can create student profile" ON students;
DROP POLICY IF EXISTS "Public can view student data for registration" ON students;
DROP POLICY IF EXISTS "Students can view own profile" ON students;
DROP POLICY IF EXISTS "Students can update own profile" ON students;

CREATE POLICY "Enable insert for registration"
  ON students FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable select for authenticated users"
  ON students FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update for authenticated users"
  ON students FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
