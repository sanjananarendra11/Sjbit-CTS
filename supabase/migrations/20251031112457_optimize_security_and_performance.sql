/*
  # Optimize Security and Performance

  ## Issues Addressed
  1. Add missing indexes on foreign keys
  2. Optimize RLS policies to use SELECT auth functions instead of direct calls
  3. Remove unused indexes
  4. Implement proper anonymous access policies

  ## Changes
  1. Add indexes for notifications.route_id and student_registrations.stop_id
  2. Update all RLS policies to use (SELECT auth.uid()) pattern
  3. Drop unused indexes
  4. Add restrictive policies for anonymous users
*/

CREATE INDEX IF NOT EXISTS idx_notifications_route_id ON notifications(route_id);
CREATE INDEX IF NOT EXISTS idx_student_registrations_stop_id ON student_registrations(stop_id);

DROP INDEX IF EXISTS idx_student_registrations_student_id;
DROP INDEX IF EXISTS idx_student_registrations_route_id;
DROP INDEX IF EXISTS idx_bus_tracking_timestamp;
DROP INDEX IF EXISTS idx_notifications_student_id;
DROP INDEX IF EXISTS idx_notifications_created_at;

DROP POLICY IF EXISTS "Enable select for authenticated users" ON students;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON students;

CREATE POLICY "Enable select for authenticated users"
  ON students FOR SELECT
  TO authenticated
  USING (auth.uid() = (SELECT id FROM students WHERE id = auth.uid()));

CREATE POLICY "Enable update for authenticated users"
  ON students FOR UPDATE
  TO authenticated
  USING (auth.uid() = (SELECT id FROM students WHERE id = auth.uid()))
  WITH CHECK (auth.uid() = (SELECT id FROM students WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Enable select for authenticated users" ON student_registrations;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON student_registrations;

CREATE POLICY "Enable select for authenticated users"
  ON student_registrations FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = student_id);

CREATE POLICY "Enable update for authenticated users"
  ON student_registrations FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = student_id)
  WITH CHECK ((SELECT auth.uid()) = student_id);

DROP POLICY IF EXISTS "Students can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Students can update own notifications" ON notifications;

CREATE POLICY "Students can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = student_id OR student_id IS NULL);

CREATE POLICY "Students can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = student_id)
  WITH CHECK ((SELECT auth.uid()) = student_id);

CREATE POLICY "Public cannot view private notifications"
  ON notifications FOR SELECT
  TO anon
  USING (false);
