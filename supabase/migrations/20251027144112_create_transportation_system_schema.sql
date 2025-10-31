/*
  # SJBIT College Transportation System - Database Schema

  ## Overview
  This migration creates the complete database structure for the college transportation system,
  including student registration, bus routes, schedules, real-time tracking, and notifications.

  ## New Tables

  ### 1. `students`
  Student registration and profile information
  - `id` (uuid, primary key) - Unique student identifier
  - `email` (text, unique) - Student email for login
  - `full_name` (text) - Student's full name
  - `phone` (text) - Contact number
  - `address` (text) - Pick-up address
  - `latitude` (decimal) - Location latitude for route optimization
  - `longitude` (decimal) - Location longitude for route optimization
  - `created_at` (timestamptz) - Registration timestamp

  ### 2. `bus_routes`
  Bus route definitions and details
  - `id` (uuid, primary key) - Unique route identifier
  - `route_name` (text) - Route display name (e.g., "Route A - North Campus")
  - `route_code` (text, unique) - Short code for the route (e.g., "RT-A")
  - `description` (text) - Route description
  - `capacity` (integer) - Maximum students per bus
  - `is_active` (boolean) - Whether route is currently operational
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. `bus_stops`
  Stops along each bus route
  - `id` (uuid, primary key) - Unique stop identifier
  - `route_id` (uuid, foreign key) - Associated route
  - `stop_name` (text) - Name of the stop
  - `latitude` (decimal) - Stop location latitude
  - `longitude` (decimal) - Stop location longitude
  - `stop_order` (integer) - Sequence in route (1, 2, 3...)
  - `estimated_time` (time) - Expected arrival time at stop
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. `student_registrations`
  Student bus route registrations
  - `id` (uuid, primary key) - Unique registration identifier
  - `student_id` (uuid, foreign key) - Registered student
  - `route_id` (uuid, foreign key) - Selected route
  - `stop_id` (uuid, foreign key) - Preferred stop
  - `registration_date` (timestamptz) - When student registered
  - `status` (text) - Registration status: 'pending', 'approved', 'rejected'
  - `semester` (text) - Academic semester (e.g., "Fall 2025")
  - `created_at` (timestamptz) - Record creation timestamp

  ### 5. `bus_tracking`
  Real-time bus location data
  - `id` (uuid, primary key) - Unique tracking record identifier
  - `route_id` (uuid, foreign key) - Bus route being tracked
  - `latitude` (decimal) - Current bus latitude
  - `longitude` (decimal) - Current bus longitude
  - `speed` (decimal) - Current speed in km/h
  - `heading` (decimal) - Direction in degrees
  - `timestamp` (timestamptz) - Location update time
  - `driver_name` (text) - Current driver name
  - `bus_number` (text) - Bus identification number

  ### 6. `schedules`
  Daily bus schedules
  - `id` (uuid, primary key) - Unique schedule identifier
  - `route_id` (uuid, foreign key) - Associated route
  - `day_of_week` (text) - Day: 'monday', 'tuesday', etc.
  - `departure_time` (time) - Bus departure time
  - `arrival_time` (time) - Expected arrival at college
  - `is_active` (boolean) - Whether schedule is active
  - `created_at` (timestamptz) - Creation timestamp

  ### 7. `notifications`
  System notifications for students
  - `id` (uuid, primary key) - Unique notification identifier
  - `student_id` (uuid, foreign key) - Target student (null for broadcast)
  - `route_id` (uuid, foreign key) - Related route (optional)
  - `title` (text) - Notification title
  - `message` (text) - Notification content
  - `type` (text) - Type: 'arrival', 'delay', 'reroute', 'general'
  - `is_read` (boolean) - Read status
  - `created_at` (timestamptz) - Notification creation time

  ## Security
  - Enable RLS on all tables
  - Students can view and update their own data
  - Students can view routes, stops, schedules, and tracking data
  - Students can view their own registrations and notifications
  - Admins (authenticated with admin role) have full access
  - Public users can only view active routes

  ## Important Notes
  1. Location data (latitude/longitude) uses decimal type for precision
  2. Real-time tracking uses timestamptz for accurate time tracking
  3. Notifications support both targeted and broadcast messages
  4. Route capacity enables automatic enrollment management
  5. Status fields enable workflow management
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  created_at timestamptz DEFAULT now()
);

-- Create bus_routes table
CREATE TABLE IF NOT EXISTS bus_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name text NOT NULL,
  route_code text UNIQUE NOT NULL,
  description text DEFAULT '',
  capacity integer NOT NULL DEFAULT 40,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create bus_stops table
CREATE TABLE IF NOT EXISTS bus_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES bus_routes(id) ON DELETE CASCADE,
  stop_name text NOT NULL,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  stop_order integer NOT NULL,
  estimated_time time NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create student_registrations table
CREATE TABLE IF NOT EXISTS student_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  route_id uuid NOT NULL REFERENCES bus_routes(id) ON DELETE CASCADE,
  stop_id uuid NOT NULL REFERENCES bus_stops(id) ON DELETE CASCADE,
  registration_date timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  semester text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, route_id, semester)
);

-- Create bus_tracking table
CREATE TABLE IF NOT EXISTS bus_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES bus_routes(id) ON DELETE CASCADE,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  speed decimal(5, 2) DEFAULT 0,
  heading decimal(5, 2) DEFAULT 0,
  timestamp timestamptz DEFAULT now(),
  driver_name text,
  bus_number text
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES bus_routes(id) ON DELETE CASCADE,
  day_of_week text NOT NULL CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
  departure_time time NOT NULL,
  arrival_time time NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  route_id uuid REFERENCES bus_routes(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'general' CHECK (type IN ('arrival', 'delay', 'reroute', 'general')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students table
CREATE POLICY "Students can view own profile"
  ON students FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Students can update own profile"
  ON students FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Students can insert own profile"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for bus_routes table
CREATE POLICY "Anyone can view active routes"
  ON bus_routes FOR SELECT
  USING (is_active = true);

-- RLS Policies for bus_stops table
CREATE POLICY "Anyone can view stops for active routes"
  ON bus_stops FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bus_routes
      WHERE bus_routes.id = bus_stops.route_id
      AND bus_routes.is_active = true
    )
  );

-- RLS Policies for student_registrations table
CREATE POLICY "Students can view own registrations"
  ON student_registrations FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert own registrations"
  ON student_registrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update own registrations"
  ON student_registrations FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- RLS Policies for bus_tracking table
CREATE POLICY "Anyone can view bus tracking"
  ON bus_tracking FOR SELECT
  USING (true);

-- RLS Policies for schedules table
CREATE POLICY "Anyone can view active schedules"
  ON schedules FOR SELECT
  USING (is_active = true);

-- RLS Policies for notifications table
CREATE POLICY "Students can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id OR student_id IS NULL);

CREATE POLICY "Students can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bus_stops_route_id ON bus_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_student_registrations_student_id ON student_registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_student_registrations_route_id ON student_registrations(route_id);
CREATE INDEX IF NOT EXISTS idx_bus_tracking_route_id ON bus_tracking(route_id);
CREATE INDEX IF NOT EXISTS idx_bus_tracking_timestamp ON bus_tracking(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_schedules_route_id ON schedules(route_id);
CREATE INDEX IF NOT EXISTS idx_notifications_student_id ON notifications(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);