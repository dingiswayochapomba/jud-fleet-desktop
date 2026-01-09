import { useState } from 'react';
import {
  LayoutDashboard,
  Truck,
  Users,
  Zap,
  Wrench,
  FileText,
  ChevronRight,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  userName: string;
  userRole: string;
  isLoggingOut: boolean;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'vehicles', label: 'Vehicles', icon: Truck },
  { id: 'drivers', label: 'Drivers', icon: Users },
  { id: 'fuel', label: 'Fuel Tracking', icon: Zap },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'reports', label: 'Reports', icon: FileText },
];

export default function Sidebar({
  activeTab,
  onTabChange,
  onLogout,
  userName,
  userRole,
  isLoggingOut,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white shadow-lg hover:bg-gray-50 transition-colors"
      >
        {isOpen ? <X size={24} className="text-gray-900" /> : <Menu size={24} className="text-gray-900" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-[#EA7B7B] to-[#D65A5A] text-white shadow-xl transition-all duration-300 ease-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 z-40`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Truck size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Fleet Manager</h1>
          </div>
          <p className="text-sm text-white/70">Malawi Judiciary</p>
        </div>

        {/* User Info Section */}
        <div className="p-6 border-b border-white/20 bg-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center text-sm font-bold">
              {userName?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate text-sm">{userName}</p>
              <p className="text-xs text-white/70 uppercase tracking-wide">{userRole}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setIsOpen(false);
                }}
                className={`w-full group relative px-4 py-3 rounded-lg transition-all duration-300 flex items-center gap-3 font-medium overflow-hidden ${
                  isActive
                    ? 'bg-white/30 text-white shadow-lg'
                    : 'text-white/80 hover:text-white hover:bg-white/20'
                }`}
              >
                {/* Animated background */}
                <div
                  className={`absolute inset-0 bg-white/20 transition-all duration-500 ease-out ${
                    isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-50'
                  }`}
                />

                {/* Content */}
                <div className="relative flex items-center gap-3 w-full">
                  <Icon
                    size={20}
                    className={`transition-all duration-300 ${
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    }`}
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && (
                    <ChevronRight
                      size={18}
                      className="transition-all duration-300 animate-pulse"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/20 bg-white/10 backdrop-blur-sm">
          <button
            onClick={onLogout}
            disabled={isLoggingOut}
            className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-300 flex items-center gap-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <LogOut
              size={20}
              className="transition-all duration-300 group-hover:scale-110"
            />
            <span className="flex-1 text-left">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
