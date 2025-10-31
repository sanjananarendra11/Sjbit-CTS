import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface Route {
  id: string;
  route_name: string;
  route_code: string;
}

interface Schedule {
  id: string;
  route_id: string;
  day_of_week: string;
  departure_time: string;
  arrival_time: string;
  is_active: boolean;
}

interface Stop {
  id: string;
  route_id: string;
  stop_name: string;
  stop_order: number;
  estimated_time: string;
}

export default function ScheduleView() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (selectedRoute) {
      fetchSchedules(selectedRoute);
      fetchStops(selectedRoute);
    }
  }, [selectedRoute]);

  const fetchRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from('bus_routes')
        .select('id, route_name, route_code')
        .eq('is_active', true)
        .order('route_code');

      if (error) throw error;
      setRoutes(data || []);
      if (data && data.length > 0) {
        setSelectedRoute(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async (routeId: string) => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('route_id', routeId)
        .eq('is_active', true);

      if (error) throw error;

      const sorted = (data || []).sort((a, b) => {
        const dayDiff = daysOrder.indexOf(a.day_of_week) - daysOrder.indexOf(b.day_of_week);
        if (dayDiff !== 0) return dayDiff;
        return a.departure_time.localeCompare(b.departure_time);
      });

      setSchedules(sorted);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const fetchStops = async (routeId: string) => {
    try {
      const { data, error } = await supabase
        .from('bus_stops')
        .select('*')
        .eq('route_id', routeId)
        .order('stop_order');

      if (error) throw error;
      setStops(data || []);
    } catch (error) {
      console.error('Error fetching stops:', error);
    }
  };

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const capitalizeDay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const selectedRouteData = routes.find(r => r.id === selectedRoute);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Bus Schedules</h2>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Route</label>
        <select
          value={selectedRoute}
          onChange={(e) => setSelectedRoute(e.target.value)}
          className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {routes.map((route) => (
            <option key={route.id} value={route.id}>
              {route.route_code} - {route.route_name}
            </option>
          ))}
        </select>
      </div>

      {selectedRouteData && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Weekly Schedule
            </h3>

            {schedules.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No schedules available for this route</p>
            ) : (
              <div className="space-y-3">
                {daysOrder.map((day) => {
                  const daySchedules = schedules.filter(s => s.day_of_week === day);
                  if (daySchedules.length === 0) return null;

                  return (
                    <div key={day} className="border-l-4 border-blue-600 pl-4 py-2">
                      <div className="font-semibold text-gray-800 mb-2">{capitalizeDay(day)}</div>
                      {daySchedules.map((schedule) => (
                        <div key={schedule.id} className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                          <Clock className="w-3 h-3" />
                          Departs: {formatTime(schedule.departure_time)} → Arrives: {formatTime(schedule.arrival_time)}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Bus Stops
            </h3>

            {stops.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No stops configured for this route</p>
            ) : (
              <div className="space-y-3">
                {stops.map((stop, index) => (
                  <div key={stop.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      {index < stops.length - 1 && (
                        <div className="w-0.5 h-8 bg-blue-200 my-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="font-semibold text-gray-800">{stop.stop_name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        ETA: {formatTime(stop.estimated_time)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
