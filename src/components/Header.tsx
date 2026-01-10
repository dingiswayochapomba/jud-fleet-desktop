import { useState } from 'react';
import { Bell, Search, LogOut, Settings } from 'lucide-react';

interface HeaderProps {
  userName: string;
  userRole: string;
  activeTabLabel: string;
  onLogout?: () => void;
  onSettingsClick?: () => void;
}

export default function Header({ userName, userRole, activeTabLabel, onLogout, onSettingsClick }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
    onSettingsClick?.();
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    onLogout?.();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20 transition-all duration-300">
      <div className="px-4 py-3 lg:ml-0">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Title */}
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">
              {activeTabLabel}
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">
              <span className="font-medium">{userName}</span> • {userRole}
            </p>
          </div>

          {/* Right: Search, Notifications, and User Avatar */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden sm:flex items-center gap-1.5 bg-gray-100 rounded-md px-2 py-1.5 transition-all duration-300 hover:bg-gray-200 focus-within:bg-white focus-within:ring-1 focus-within:ring-blue-500 border border-transparent focus-within:border-blue-400">
              <Search size={14} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-xs text-gray-700 placeholder-gray-500 w-24"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200">
              <Bell size={16} />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-blue-600 rounded-full" />
            </button>

            {/* User Avatar with Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold hover:shadow-md transition-shadow duration-200 flex-shrink-0 cursor-pointer"
              >
                {userName?.charAt(0).toUpperCase()}
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900">{userName}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{userRole}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button 
                      onClick={handleSettingsClick}
                      className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors duration-200"
                    >
                      <Settings size={16} className="text-gray-500" />
                      Account Settings
                    </button>
                    <button 
                      onClick={handleLogoutClick}
                      className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors duration-200 border-t border-gray-100"
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
