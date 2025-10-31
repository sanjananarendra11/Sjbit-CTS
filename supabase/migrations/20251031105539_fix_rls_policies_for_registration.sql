/*
  # Fix RLS Policies for Student Registration

  ## Issue
  The existing RLS policies required authentication and ownership checks that prevented
  new student registrations. This migration adjusts policies to allow unauthenticated
  registration while maintaining data security.

  ## Changes
  1. Allow public users to insert new student records (for registration)
  2. Maintain edit restrictions to prevent unauthorized modifications
  3. Keep read restrictions for sensitive data
*/

DROP POLICY IF EXISTS "Students can insert own profile" ON students;

CREATE POLICY "Anyone can create student profile"
  ON students FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Students can view own profile" ON students;

CREATE POLICY "Students can view own profile"
  ON students FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Public can view student data for registration"
  ON students FOR SELECT
  TO anon
  USING (false);

DROP POLICY IF EXISTS "Students can update own profile" ON students;

CREATE POLICY "Students can update own profile"
  ON students FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
