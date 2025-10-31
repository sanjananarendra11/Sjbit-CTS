import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string;
          address: string;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          phone: string;
          address: string;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string;
          address?: string;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
        };
      };
      bus_routes: {
        Row: {
          id: string;
          route_name: string;
          route_code: string;
          description: string;
          capacity: number;
          is_active: boolean;
          created_at: string;
        };
      };
      bus_stops: {
        Row: {
          id: string;
          route_id: string;
          stop_name: string;
          latitude: number;
          longitude: number;
          stop_order: number;
          estimated_time: string;
          created_at: string;
        };
      };
      student_registrations: {
        Row: {
          id: string;
          student_id: string;
          route_id: string;
          stop_id: string;
          registration_date: string;
          status: 'pending' | 'approved' | 'rejected';
          semester: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          route_id: string;
          stop_id: string;
          registration_date?: string;
          status?: 'pending' | 'approved' | 'rejected';
          semester: string;
          created_at?: string;
        };
      };
      bus_tracking: {
        Row: {
          id: string;
          route_id: string;
          latitude: number;
          longitude: number;
          speed: number;
          heading: number;
          timestamp: string;
          driver_name: string | null;
          bus_number: string | null;
        };
      };
      schedules: {
        Row: {
          id: string;
          route_id: string;
          day_of_week: string;
          departure_time: string;
          arrival_time: string;
          is_active: boolean;
          created_at: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          student_id: string | null;
          route_id: string | null;
          title: string;
          message: string;
          type: 'arrival' | 'delay' | 'reroute' | 'general';
          is_read: boolean;
          created_at: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
    };
  };
};
