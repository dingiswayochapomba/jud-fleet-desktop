import { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardContent from './components/DashboardContent';
import VehiclesManagement from './components/VehiclesManagement';
import DriversManagement from './components/DriversManagement';
import FuelTracking from './components/FuelTracking';
import FuelAnalytics from './components/FuelAnalytics';
import MaintenanceManagement from './components/MaintenanceManagement';
import InsuranceManagement from './components/InsuranceManagement';
import DisposalTracking from './components/DisposalTracking';
import ReportsPage from './components/ReportsPage';

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
  fuel_analytics: 'Fuel Analytics',
  maintenance: 'Maintenance',
  insurance: 'Insurance',
  disposal: 'Disposal',
  reports: 'Reports',
  settings: 'Account Settings',
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  // Check if user is already logged in
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        console.log('Starting auth check...');
        const sb = await initSupabase();
        
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          console.warn('Auth check timeout - setting loading to false');
          if (isMounted) setLoading(false);
        }, 5000);
        
        const { data: { session }, error } = await sb.auth.getSession();

        console.log('Session check result:', { hasSession: !!session, error });

        if (error) {
          console.error('Session error:', error);
        }

        if (isMounted) {
          if (session?.user) {
            console.log('User found in session:', session.user.email);
            setIsLoggedIn(true);
            setUser(session.user);
            // Fetch user profile from database
            try {
              await fetchUserProfile(sb, session.user.id);
            } catch (err) {
              console.error('Profile fetch error:', err);
            }
          } else {
            console.log('No active session found');
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (isMounted) setLoading(false);
      }
    };

    checkAuth();
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [fetchUserProfile]);

  // Listen for auth state changes
  useEffect(() => {
    let subscription: any = null;
    let isMounted = true;

    (async () => {
      try {
        const sb = await initSupabase();
        const { data: { subscription: authSubscription } } = sb.auth.onAuthStateChange(
          async (event: any, session: any) => {
            if (!isMounted) return;
            
            console.log('Auth event:', event, 'Session:', !!session);
            
            if (session?.user) {
              if (isMounted) {
                setIsLoggedIn(true);
                setUser(session.user);
              }
              try {
                await fetchUserProfile(sb, session.user.id);
                if (isMounted) {
                  console.log('✓ Auth state changed: User logged in');
                }
              } catch (err) {
                console.error('Error fetching user profile:', err);
              }
            } else {
              if (isMounted) {
                setIsLoggedIn(false);
                setUser(null);
                setUserProfile(null);
                setActiveTab('dashboard');
                console.log('✓ Auth state changed: User logged out');
              }
            }
          }
        );
        if (isMounted) {
          subscription = authSubscription;
        }
      } catch (error) {
        console.error('Auth listener setup failed:', error);
      }
    })();

    return () => {
      isMounted = false;
      if (subscription) {
        try {
          subscription.unsubscribe();
          console.log('Auth subscription cleaned up');
        } catch (err) {
          console.error('Error unsubscribing from auth:', err);
        }
      }
    };
  }, [fetchUserProfile]);

  const handleLogout = async () => {
    try {
      console.log('Logout initiated...');
      setLoggingOut(true);
      
      // Set a timeout to prevent infinite logout state
      const timeoutId = setTimeout(() => {
        console.warn('Logout timeout - forcing state clear');
        setIsLoggedIn(false);
        setUser(null);
        setUserProfile(null);
        setActiveTab('dashboard');
        setLoggingOut(false);
      }, 3000);
      
      const sb = await initSupabase();
      
      // Sign out from Supabase - this will trigger the auth state change listener
      const { error } = await sb.auth.signOut();

      clearTimeout(timeoutId);

      if (error) {
        console.error('Logout error:', error);
        // Even if logout fails, clear local state
        setIsLoggedIn(false);
        setUser(null);
        setUserProfile(null);
        setActiveTab('dashboard');
        setLoggingOut(false);
        return;
      }

      // Note: Don't manually set state here - let the auth listener handle it
      // This prevents duplicate state updates and "signal aborted" errors
      setLoggingOut(false);
      console.log('✓ Session terminated successfully');
      
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear state anyway to show login page
      setIsLoggedIn(false);
      setUser(null);
      setUserProfile(null);
      setActiveTab('dashboard');
      setLoggingOut(false);
    }
  };

  const handleLoginSuccess = useCallback(() => {
    console.log('✓ Login callback triggered - UI will update via auth listener');
  }, [fetchUserProfile]);

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
        onSidebarToggle={setSidebarOpen}
        userName={userProfile?.name || user?.email?.split('@')[0] || 'User'}
        userRole={userProfile?.role || 'User'}
        isLoggingOut={loggingOut}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-52' : 'lg:ml-20'}`}>
        {/* Header */}
        <Header
          userName={userProfile?.name || user?.email?.split('@')[0] || 'User'}
          userRole={userProfile?.role || 'User'}
          activeTabLabel={tabNames[activeTab] || 'Dashboard'}
          onLogout={handleLogout}
          onSettingsClick={() => setActiveTab('settings')}
        />

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {activeTab === 'dashboard' && <DashboardContent />}
          {activeTab === 'vehicles' && <VehiclesManagement />}
          {activeTab === 'drivers' && <DriversManagement />}
          {activeTab === 'fuel' && <FuelTracking />}
          {activeTab === 'fuel_analytics' && <FuelAnalytics />}
          {activeTab === 'maintenance' && <MaintenanceManagement />}
          {activeTab === 'insurance' && <InsuranceManagement />}
          {activeTab === 'disposal' && <DisposalTracking />}
          {activeTab === 'reports' && <ReportsPage />}
          {activeTab === 'settings' && (
            <div className="max-w-2xl">
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h2>
                
                {/* User Profile Section */}
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input 
                        type="text" 
                        value={userProfile?.name || user?.email?.split('@')[0] || ''} 
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        value={user?.email || ''} 
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <input 
                        type="text" 
                        value={userProfile?.role || 'User'} 
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Contact administrator to update profile information</p>
                </div>

                {/* Security Section */}
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
                    Change Password
                  </button>
                  <p className="text-xs text-gray-500 mt-2">Update your password regularly for security</p>
                </div>

                {/* Session Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Session</h3>
                  <p className="text-sm text-gray-700 mb-4">You are logged in and your session is active.</p>
                  <button 
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;