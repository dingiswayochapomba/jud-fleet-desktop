import { useState, useEffect } from 'react';
import { Bell, LogOut, Settings, Moon, Sun } from 'lucide-react';
import NotificationsPanel from './NotificationsPanel';
import { getNotificationsForUser } from '../lib/firebaseQueries';

interface HeaderProps {
  userName: string;
  userRole: string;
  activeTabLabel: string;
  userId?: string;
  onLogout?: () => void;
  onSettingsClick?: () => void;
  onTabChange?: (tab: string) => void;
}

export default function Header({ userName, userRole, activeTabLabel, userId, onLogout, onSettingsClick, onTabChange }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      // Use system preference if no saved theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  // Apply theme whenever isDarkMode changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Load unread notifications count
  useEffect(() => {
    if (userId) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [userId]);

  const loadUnreadCount = async () => {
    if (!userId) return;
    try {
      const { data, error } = await getNotificationsForUser(userId, true);
      if (!error && data) {
        setUnreadCount(data.length);
      }
    } catch (err) {
      console.error('Error loading unread count:', err);
    }
  };

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
    onSettingsClick?.();
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    onLogout?.();
  };

  const handleThemeToggle = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20 transition-all duration-300">
      <div className="px-4 py-3 lg:ml-0">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Title */}
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              {activeTabLabel}
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              <span className="font-medium">{userName}</span> • {userRole}
            </p>
          </div>

          {/* Right: Notifications and User Avatar */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200"
              title="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Panel */}
            {userId && (
              <NotificationsPanel 
                userId={userId}
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
              />
            )}

            {/* Theme Toggle */}
            <button 
              onClick={handleThemeToggle}
              className="relative p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200"
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* User Avatar with Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-8 h-8 bg-gradient-to-br from-[#44444E] to-[#2E2E33] dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center text-white text-sm font-semibold hover:shadow-md transition-shadow duration-200 flex-shrink-0 cursor-pointer"
              >
                {userName?.charAt(0).toUpperCase()}
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{userName}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{userRole}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button 
                      onClick={() => {
                        onTabChange?.('notifications');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors duration-200"
                    >
                      <Bell size={16} className="text-gray-500 dark:text-gray-400" />
                      Notifications
                    </button>
                    <button 
                      onClick={handleSettingsClick}
                      className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors duration-200 border-t border-gray-100 dark:border-gray-700"
                    >
                      <Settings size={16} className="text-gray-500 dark:text-gray-400" />
                      Account Settings
                    </button>
                    <button 
                      onClick={handleLogoutClick}
                      className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors duration-200 border-t border-gray-100 dark:border-gray-700"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
