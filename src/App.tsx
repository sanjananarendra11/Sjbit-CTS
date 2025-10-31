import { useState } from 'react';
import { Bus, Calendar, Bell, MapPin, Users, LayoutDashboard } from 'lucide-react';
import StudentRegistration from './components/StudentRegistration';
import BusTracking from './components/BusTracking';
import Notifications from './components/Notifications';
import ScheduleView from './components/ScheduleView';
import AdminDashboard from './components/AdminDashboard';

type View = 'home' | 'register' | 'tracking' | 'schedule' | 'notifications' | 'admin';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');

  const renderView = () => {
    switch (currentView) {
      case 'register':
        return <StudentRegistration />;
      case 'tracking':
        return <BusTracking />;
      case 'notifications':
        return <Notifications />;
      case 'schedule':
        return <ScheduleView />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return (
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-8">
              <Bus className="w-24 h-24 text-blue-600 mx-auto mb-4" />
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                SJBIT College Transportation System
              </h1>
              <p className="text-xl text-gray-600">
                Smart bus management for students and administrators
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              <button
                onClick={() => setCurrentView('register')}
                className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-600"
              >
                <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Register for Bus</h3>
                <p className="text-gray-600">Sign up for a bus route and select your preferred stop</p>
              </button>

              <button
                onClick={() => setCurrentView('tracking')}
                className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-600"
              >
                <Bus className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Track Buses</h3>
                <p className="text-gray-600">View real-time location and status of all buses</p>
              </button>

              <button
                onClick={() => setCurrentView('schedule')}
                className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-600"
              >
                <Calendar className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">View Schedules</h3>
                <p className="text-gray-600">Check bus timings and stops for all routes</p>
              </button>

              <button
                onClick={() => setCurrentView('notifications')}
                className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-600"
              >
                <Bell className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Notifications</h3>
                <p className="text-gray-600">Stay updated on arrivals, delays, and route changes</p>
              </button>

              <button
                onClick={() => setCurrentView('admin')}
                className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-600"
              >
                <LayoutDashboard className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Admin Dashboard</h3>
                <p className="text-gray-600">Manage routes, registrations, and notifications</p>
              </button>

              <div className="bg-gradient-to-br from-blue-50 to-green-50 p-8 rounded-lg shadow-md border-2 border-blue-200">
                <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Key Features</h3>
                <ul className="text-left text-sm text-gray-700 space-y-2">
                  <li>• Real-time GPS tracking</li>
                  <li>• Instant notifications</li>
                  <li>• Optimized schedules</li>
                  <li>• Easy registration</li>
                </ul>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2 text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
            >
              <Bus className="w-6 h-6" />
              SJBIT Transport
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('register')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'register'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Register
              </button>
              <button
                onClick={() => setCurrentView('tracking')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'tracking'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Track
              </button>
              <button
                onClick={() => setCurrentView('schedule')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'schedule'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Schedule
              </button>
              <button
                onClick={() => setCurrentView('notifications')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'notifications'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Bell className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'admin'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-600">
          <p>SJBIT College Transportation System - Smart Bus Management</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
