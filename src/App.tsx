import { useState, useEffect, useCallback, useRef } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardContent from './components/DashboardContent';
import VehiclesManagement from './components/VehiclesManagement';
import DriversManagement from './components/DriversManagement'
import UsersManagement from './components/UsersManagement';
import FuelTracking from './components/FuelTracking';
import FuelAnalytics from './components/FuelAnalytics';
import MaintenanceManagement from './components/MaintenanceManagement';
import InsuranceManagement from './components/InsuranceManagement';
import DisposalTracking from './components/DisposalTracking';
import ReportsPage from './components/ReportsPage';
import NotificationsPage from './components/NotificationsPage';
import SettingsPage from './components/SettingsPage';
import { firebaseAuth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getUserProfileByFirebase } from './lib/supabaseQueries';
import { logActivity, updateUserProfile } from './lib/firebaseQueries';
import { canAccessUsersPage, getRoleKey, isUsersReadOnly } from './lib/access';

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
  notifications: 'Notifications',
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
  const lastAuthUidRef = useRef<string | null>(null);

  const currentUserId = user?.uid || user?.id || userProfile?.id || null;

  // Fetch user profile from database
  const fetchUserProfile = useCallback(async (userId: string, email?: string) => {
    try {
      const { data, error } = await getUserProfileByFirebase(userId, email);

      if (error) {
        console.error('Profile fetch error:', error);
        // Set a default profile if user doesn't exist
        setUserProfile({ id: userId, email: email || 'user@judiciary.mw', role: 'user' });
        return;
      }

      if (data) {
        setUserProfile(data);
        console.log('✓ User profile loaded:', data.email, '(' + data.role + ')');
        return data;
      } else {
        console.log('No user profile found in database, using default');
        // Set a default profile if no data returned
        const fallbackProfile = { id: userId, email: email || 'user@judiciary.mw', role: 'user' };
        setUserProfile(fallbackProfile);
        return fallbackProfile;
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Fallback default profile
      const fallbackProfile = { id: userId, email: email || 'user@judiciary.mw', role: 'user' };
      setUserProfile(fallbackProfile);
      return fallbackProfile;
    }
  }, []);

  const trackSuccessfulLogin = useCallback(async (currentUser: any, profile: any) => {
    if (!currentUser?.uid || !profile || !profile.email || profile.email === 'user@judiciary.mw') {
      return;
    }

    try {
      const now = new Date().toISOString();
      if (profile.id && profile.id !== currentUser.uid) {
        await updateUserProfile(profile.id, { last_login: now });
      }

      await logActivity({
        actor_id: currentUser.uid,
        actor_email: currentUser.email || profile.email,
        actor_name: profile.name || currentUser.email?.split('@')[0] || 'User',
        action: 'login',
        category: 'authentication',
        severity: 'info',
        details: 'User signed in successfully',
        target_user_id: profile.id,
        target_user_email: profile.email,
        metadata: { source: 'web' },
      });
    } catch (error) {
      console.error('Failed to record login activity:', error);
    }
  }, []);

  // Check if user is already logged in and listen for auth state changes
  useEffect(() => {
    let isMounted = true;

    // Set up Firebase auth listener
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      if (!isMounted) return;
      
      console.log('Auth state changed:', currentUser ? 'Logged In' : 'Logged Out');
      
      if (currentUser) {
        console.log('User found:', currentUser.email);
        setIsLoggedIn(true);
        setUser(currentUser);
        try {
          const profile = await fetchUserProfile(currentUser.uid, currentUser.email || undefined);
          if (currentUser.uid !== lastAuthUidRef.current) {
            await trackSuccessfulLogin(currentUser, profile);
            lastAuthUidRef.current = currentUser.uid;
          }
          if (isMounted) {
            console.log('✓ Auth state changed: User logged in');
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        lastAuthUidRef.current = null;
        if (isMounted) {
          setIsLoggedIn(false);
          setUser(null);
          setUserProfile(null);
          setActiveTab('dashboard');
          console.log('✓ Auth state changed: User logged out');
        }
      }
      
      if (isMounted) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
      console.log('Auth subscription cleaned up');
    };
  }, [fetchUserProfile, trackSuccessfulLogin]);

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
      
      // Sign out from Firebase - this will trigger the auth state change listener
      const error = await signOut(firebaseAuth);

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
  }, []);

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        onSidebarToggle={setSidebarOpen}
        userName={userProfile?.name || user?.email?.split('@')[0] || 'User'}
        userRole={getRoleKey(userProfile?.role)}
        isLoggingOut={loggingOut}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-52' : 'lg:ml-20'}`}>
        {/* Header */}
        <Header
          userName={userProfile?.name || user?.email?.split('@')[0] || 'User'}
          userRole={getRoleKey(userProfile?.role)}
          activeTabLabel={tabNames[activeTab] || 'Dashboard'}
          userId={currentUserId}
          onLogout={handleLogout}
          onSettingsClick={() => setActiveTab('settings')}
          onTabChange={(tab) => setActiveTab(tab)}
        />

        {/* Page Content */}
        <main className="p-4 lg:p-6 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
          {activeTab === 'dashboard' && <DashboardContent />}
          {activeTab === 'vehicles' && <VehiclesManagement />}
          {activeTab === 'drivers' && <DriversManagement />}
          {activeTab === 'users' && (canAccessUsersPage(userProfile?.role) ? (
            <UsersManagement
              currentRole={getRoleKey(userProfile?.role)}
              readOnly={isUsersReadOnly(userProfile?.role)}
            />
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-800">
              <h2 className="text-lg font-semibold">Access restricted</h2>
              <p className="mt-2 text-sm">Only system administrators and court administrators can access this section.</p>
            </div>
          ))}
          {activeTab === 'fuel' && <FuelTracking />}
          {activeTab === 'fuel_analytics' && <FuelAnalytics />}
          {activeTab === 'maintenance' && <MaintenanceManagement />}
          {activeTab === 'insurance' && <InsuranceManagement />}
          {activeTab === 'disposal' && <DisposalTracking />}
          {activeTab === 'reports' && <ReportsPage />}
          {activeTab === 'notifications' && currentUserId && <NotificationsPage userId={currentUserId} />}
          {activeTab === 'settings' && user && (
            <SettingsPage 
              userProfile={userProfile}
              user={user}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;