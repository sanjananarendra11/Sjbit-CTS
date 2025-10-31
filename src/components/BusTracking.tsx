import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Bus, MapPin, Clock, Navigation } from 'lucide-react';

interface TrackingData {
  id: string;
  route_id: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: string;
  driver_name: string | null;
  bus_number: string | null;
}

interface RouteWithTracking {
  id: string;
  route_name: string;
  route_code: string;
  tracking: TrackingData | null;
}

export default function BusTracking() {
  const [routes, setRoutes] = useState<RouteWithTracking[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutesWithTracking();

    const subscription = supabase
      .channel('bus_tracking_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bus_tracking' }, () => {
        fetchRoutesWithTracking();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchRoutesWithTracking = async () => {
    try {
      const { data: routesData, error: routesError } = await supabase
        .from('bus_routes')
        .select('*')
        .eq('is_active', true)
        .order('route_code');

      if (routesError) throw routesError;

      const routesWithTracking: RouteWithTracking[] = [];

      for (const route of routesData || []) {
        const { data: trackingData } = await supabase
          .from('bus_tracking')
          .select('*')
          .eq('route_id', route.id)
          .order('timestamp', { ascending: false })
          .limit(1)
          .maybeSingle();

        routesWithTracking.push({
          ...route,
          tracking: trackingData
        });
      }

      setRoutes(routesWithTracking);
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeSince = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const selectedRouteData = routes.find(r => r.id === selectedRoute);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Bus className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Real-Time Bus Tracking</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Active Routes</h3>
          {routes.map((route) => (
            <button
              key={route.id}
              onClick={() => setSelectedRoute(route.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedRoute === route.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-800">{route.route_code}</div>
                  <div className="text-sm text-gray-600">{route.route_name}</div>
                </div>
                <div className={`w-3 h-3 rounded-full ${route.tracking ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              {route.tracking && (
                <div className="mt-2 text-xs text-gray-500">
                  Updated {getTimeSince(route.tracking.timestamp)}
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="md:col-span-2">
          {selectedRouteData ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {selectedRouteData.route_code} - {selectedRouteData.route_name}
                </h3>
                {selectedRouteData.tracking ? (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Live Tracking Active
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                    No tracking data available
                  </div>
                )}
              </div>

              {selectedRouteData.tracking ? (
                <div className="space-y-4">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50" />
                    <div className="relative z-10 text-center">
                      <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-2" />
                      <p className="text-gray-600">Map View</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {selectedRouteData.tracking.latitude.toFixed(6)}, {selectedRouteData.tracking.longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Navigation className="w-4 h-4" />
                        <span className="text-sm font-medium">Speed</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-800">
                        {selectedRouteData.tracking.speed.toFixed(1)} km/h
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Navigation className="w-4 h-4" style={{ transform: `rotate(${selectedRouteData.tracking.heading}deg)` }} />
                        <span className="text-sm font-medium">Heading</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-800">
                        {selectedRouteData.tracking.heading.toFixed(0)}°
                      </div>
                    </div>

                    {selectedRouteData.tracking.driver_name && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Bus className="w-4 h-4" />
                          <span className="text-sm font-medium">Driver</span>
                        </div>
                        <div className="text-lg font-semibold text-gray-800">
                          {selectedRouteData.tracking.driver_name}
                        </div>
                      </div>
                    )}

                    {selectedRouteData.tracking.bus_number && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <Bus className="w-4 h-4" />
                          <span className="text-sm font-medium">Bus Number</span>
                        </div>
                        <div className="text-lg font-semibold text-gray-800">
                          {selectedRouteData.tracking.bus_number}
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Last Updated</span>
                      </div>
                      <div className="text-lg font-semibold text-gray-800">
                        {getTimeSince(selectedRouteData.tracking.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No tracking data available for this route</p>
                  <p className="text-sm text-gray-400 mt-2">The bus may not be active at this time</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a route to view tracking details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
