import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Bus, MapPin, Calendar, Bell } from 'lucide-react';

interface Stats {
  totalStudents: number;
  totalRoutes: number;
  pendingRegistrations: number;
  activeRoutes: number;
}

interface Registration {
  id: string;
  registration_date: string;
  status: string;
  semester: string;
  students: { full_name: string; email: string };
  bus_routes: { route_name: string; route_code: string };
  bus_stops: { stop_name: string };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalRoutes: 0,
    pendingRegistrations: 0,
    activeRoutes: 0
  });
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'registrations' | 'notifications'>('overview');

  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'general' as 'arrival' | 'delay' | 'reroute' | 'general',
    routeId: ''
  });

  const [routes, setRoutes] = useState<Array<{ id: string; route_name: string; route_code: string }>>([]);

  useEffect(() => {
    fetchDashboardData();
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    const { data } = await supabase
      .from('bus_routes')
      .select('id, route_name, route_code')
      .eq('is_active', true);
    setRoutes(data || []);
  };

  const fetchDashboardData = async () => {
    try {
      const [studentsRes, routesRes, registrationsRes, activeRoutesRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('bus_routes').select('id', { count: 'exact', head: true }),
        supabase.from('student_registrations').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('bus_routes').select('id', { count: 'exact', head: true }).eq('is_active', true)
      ]);

      setStats({
        totalStudents: studentsRes.count || 0,
        totalRoutes: routesRes.count || 0,
        pendingRegistrations: registrationsRes.count || 0,
        activeRoutes: activeRoutesRes.count || 0
      });

      const { data: regsData } = await supabase
        .from('student_registrations')
        .select(`
          id,
          registration_date,
          status,
          semester,
          students (full_name, email),
          bus_routes (route_name, route_code),
          bus_stops (stop_name)
        `)
        .order('registration_date', { ascending: false })
        .limit(20);

      setRegistrations(regsData as any || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRegistrationStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await supabase
        .from('student_registrations')
        .update({ status })
        .eq('id', id);

      fetchDashboardData();
    } catch (error) {
      console.error('Error updating registration:', error);
    }
  };

  const sendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from('notifications').insert({
        title: notificationForm.title,
        message: notificationForm.message,
        type: notificationForm.type,
        route_id: notificationForm.routeId || null,
        student_id: null
      });

      setNotificationForm({ title: '', message: '', type: 'general', routeId: '' });
      alert('Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage the SJBIT College Transportation System</p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('registrations')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'registrations'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Registrations
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'notifications'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Notifications
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800">{stats.totalStudents}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Bus className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800">{stats.activeRoutes}</div>
            <div className="text-sm text-gray-600">Active Routes</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800">{stats.pendingRegistrations}</div>
            <div className="text-sm text-gray-600">Pending Registrations</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <MapPin className="w-8 h-8 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800">{stats.totalRoutes}</div>
            <div className="text-sm text-gray-600">Total Routes</div>
          </div>
        </div>
      )}

      {activeTab === 'registrations' && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Student Registrations</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Route</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Stop</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Semester</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-800">{reg.students.full_name}</div>
                        <div className="text-sm text-gray-600">{reg.students.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-800">{reg.bus_routes.route_code}</div>
                        <div className="text-sm text-gray-600">{reg.bus_routes.route_name}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{reg.bus_stops.stop_name}</td>
                      <td className="py-3 px-4 text-gray-700">{reg.semester}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          reg.status === 'approved' ? 'bg-green-100 text-green-800' :
                          reg.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {reg.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateRegistrationStatus(reg.id, 'approved')}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateRegistrationStatus(reg.id, 'rejected')}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {registrations.length === 0 && (
                <div className="text-center py-8 text-gray-500">No registrations found</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Send Notification</h2>
          </div>

          <form onSubmit={sendNotification} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                required
                value={notificationForm.title}
                onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                required
                value={notificationForm.message}
                onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={notificationForm.type}
                  onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="arrival">Arrival</option>
                  <option value="delay">Delay</option>
                  <option value="reroute">Reroute</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Route (Optional)</label>
                <select
                  value={notificationForm.routeId}
                  onChange={(e) => setNotificationForm({ ...notificationForm, routeId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Routes</option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.route_code} - {route.route_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Send Notification
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
