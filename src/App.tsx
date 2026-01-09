import { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import { LogOut } from 'lucide-react';

// Initialize Supabase
const SUPABASE_URL = 'https://ganrduvdyhlwkeiriaqp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhbnJkdXZkeWhsd2tlaXJpYXFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NjQ3MjUsImV4cCI6MjA4MzU0MDcyNX0.ZSjqnzKQoWMVxNgalPCa4M3EbDVG57mnQyvqWE6FECU';

let supabase: any = null;

// Lazy load Supabase
async function initSupabase() {
  if (supabase) return supabase;
  const { createClient } = await import('@supabase/supabase-js');
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabase;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const sb = await initSupabase();
        const { data: { session }, error } = await sb.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setIsLoggedIn(true);
          setUser(session.user);
          // Fetch user profile from database
          await fetchUserProfile(sb, session.user.id);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    let subscription: any = null;

    (async () => {
      try {
        const sb = await initSupabase();
        const { data: { subscription: authSubscription } } = sb.auth.onAuthStateChange(
          async (_event: any, session: any) => {
            if (session?.user) {
              setIsLoggedIn(true);
              setUser(session.user);
              await fetchUserProfile(sb, session.user.id);
              console.log('✓ Auth state changed: User logged in');
            } else {
              setIsLoggedIn(false);
              setUser(null);
              setUserProfile(null);
              console.log('✓ Auth state changed: User logged out');
            }
          }
        );
        subscription = authSubscription;
      } catch (error) {
        console.error('Auth listener setup failed:', error);
      }
    })();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Fetch user profile from database
  const fetchUserProfile = useCallback(async (sb: any, userId: string) => {
    try {
      const { data, error } = await sb
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        return;
      }

      setUserProfile(data);
      console.log('✓ User profile loaded:', data.email, '(' + data.role + ')');
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const sb = await initSupabase();
      const { error } = await sb.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setUserProfile(null);
        console.log('✓ Successfully logged out');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  const handleLoginSuccess = useCallback(() => {
    console.log('✓ Login callback triggered - UI will update via auth listener');
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading Fleet Manager...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login initSupabase={initSupabase} onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🚗 Fleet Manager Dashboard</h1>
              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                <p>Welcome, <span className="font-semibold text-[#EA7B7B]">{userProfile?.name || user?.email}</span></p>
                <span>•</span>
                <p>Role: <span className="font-semibold text-[#EA7B7B] uppercase">{userProfile?.role}</span></p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              <LogOut size={18} />
              {loggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#EA7B7B]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Vehicles</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <div className="text-[#EA7B7B] text-3xl">🚗</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Available Vehicles</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <div className="text-green-500 text-3xl">✓</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">In Maintenance</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <div className="text-yellow-500 text-3xl">🔧</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Drivers</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
              </div>
              <div className="text-red-500 text-3xl">👥</div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
              <p className="text-lg font-semibold text-gray-900">🚗 Vehicle Management</p>
              <p className="text-gray-600 text-sm mt-2">Manage your fleet vehicles, track status, and maintenance schedules</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
              <p className="text-lg font-semibold text-gray-900">👨‍✈️ Driver Management</p>
              <p className="text-gray-600 text-sm mt-2">Track drivers, licenses, assignments, and driving history</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
              <p className="text-lg font-semibold text-gray-900">⛽ Fuel Tracking</p>
              <p className="text-gray-600 text-sm mt-2">Monitor fuel consumption and refueling transactions</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
              <p className="text-lg font-semibold text-gray-900">🔧 Maintenance</p>
              <p className="text-gray-600 text-sm mt-2">Schedule and track vehicle maintenance and repairs</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
              <p className="text-lg font-semibold text-gray-900">📋 Insurance</p>
              <p className="text-gray-600 text-sm mt-2">Manage insurance policies and coverage</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
              <p className="text-lg font-semibold text-gray-900">📊 Reports</p>
              <p className="text-gray-600 text-sm mt-2">Generate comprehensive fleet analytics and reports</p>
            </div>
          </div>
        </div>

        {/* Status Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-900 font-medium">✓ Authentication Status: Connected to Supabase</p>
          <p className="text-blue-800 text-sm mt-2">All features are ready to use. The dashboard will be populated with real data from your database.</p>
        </div>
      </div>
    </div>
  );
}

export default App;