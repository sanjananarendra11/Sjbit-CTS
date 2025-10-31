import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, MapPin, Clock } from 'lucide-react';

interface Route {
  id: string;
  route_name: string;
  route_code: string;
  description: string;
  capacity: number;
}

interface Stop {
  id: string;
  route_id: string;
  stop_name: string;
  latitude: number;
  longitude: number;
  stop_order: number;
  estimated_time: string;
}

export default function StudentRegistration() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    stopId: '',
    semester: 'Fall 2025'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (selectedRoute) {
      fetchStops(selectedRoute);
    }
  }, [selectedRoute]);

  const fetchRoutes = async () => {
    const { data, error } = await supabase
      .from('bus_routes')
      .select('*')
      .eq('is_active', true)
      .order('route_code');

    if (error) {
      console.error('Error fetching routes:', error);
    } else {
      setRoutes(data || []);
    }
  };

  const fetchStops = async (routeId: string) => {
    const { data, error } = await supabase
      .from('bus_stops')
      .select('*')
      .eq('route_id', routeId)
      .order('stop_order');

    if (error) {
      console.error('Error fetching stops:', error);
    } else {
      setStops(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data: existingStudent } = await supabase
        .from('students')
        .select('id')
        .eq('email', formData.email)
        .maybeSingle();

      let studentId = existingStudent?.id;

      if (!studentId) {
        const { data: newStudent, error: studentError } = await supabase
          .from('students')
          .insert({
            email: formData.email,
            full_name: formData.fullName,
            phone: formData.phone,
            address: formData.address
          })
          .select()
          .single();

        if (studentError) throw studentError;
        studentId = newStudent.id;
      }

      const { error: registrationError } = await supabase
        .from('student_registrations')
        .insert({
          student_id: studentId,
          route_id: selectedRoute,
          stop_id: formData.stopId,
          semester: formData.semester,
          status: 'pending'
        });

      if (registrationError) throw registrationError;

      setMessage({ type: 'success', text: 'Registration submitted successfully! Your request is pending approval.' });
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        stopId: '',
        semester: 'Fall 2025'
      });
      setSelectedRoute('');
      setStops([]);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
      <div className="flex items-center gap-3 mb-6">
        <UserPlus className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Bus Registration</h2>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <textarea
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Route</label>
          <select
            required
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose a route</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.route_code} - {route.route_name} (Capacity: {route.capacity})
              </option>
            ))}
          </select>
        </div>

        {selectedRoute && stops.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Stop</label>
            <div className="space-y-2">
              {stops.map((stop) => (
                <label
                  key={stop.id}
                  className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="stop"
                    required
                    value={stop.id}
                    checked={formData.stopId === stop.id}
                    onChange={(e) => setFormData({ ...formData, stopId: e.target.value })}
                    className="mr-3 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-medium text-gray-800">
                      <MapPin className="w-4 h-4" />
                      {stop.stop_name}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Clock className="w-3 h-3" />
                      ETA: {stop.estimated_time}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
          <input
            type="text"
            required
            value={formData.semester}
            onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Registration'}
        </button>
      </form>
    </div>
  );
}
