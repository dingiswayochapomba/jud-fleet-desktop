import { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardContent from './components/DashboardContent';

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

// Tab configuration
const tabNames: { [key: string]: string } = {
  dashboard: 'Dashboard',
  vehicles: 'Vehicles',
  drivers: 'Drivers',
  fuel: 'Fuel Tracking',
  maintenance: 'Maintenance',
  reports: 'Reports',
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

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
        setActiveTab('dashboard');
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
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        userName={userProfile?.name || user?.email?.split('@')[0] || 'User'}
        userRole={userProfile?.role || 'User'}
        isLoggingOut={loggingOut}
      />

      {/* Main Content */}
      <div className="lg:ml-64 transition-all duration-300">
        {/* Header */}
        <Header
          userName={userProfile?.name || user?.email?.split('@')[0] || 'User'}
          userRole={userProfile?.role || 'User'}
          activeTabLabel={tabNames[activeTab] || 'Dashboard'}
        />

        {/* Page Content */}
        <main className="p-6 lg:p-8">
          {activeTab === 'dashboard' && <DashboardContent />}
          {activeTab === 'vehicles' && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Vehicles management coming soon...</p>
            </div>
          )}
          {activeTab === 'drivers' && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Drivers management coming soon...</p>
            </div>
          )}
          {activeTab === 'fuel' && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Fuel tracking coming soon...</p>
            </div>
          )}
          {activeTab === 'maintenance' && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Maintenance tracking coming soon...</p>
            </div>
          )}
          {activeTab === 'reports' && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Reports coming soon...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;