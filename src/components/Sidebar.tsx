import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Users2,
  Truck,
  Zap,
  Wrench,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Trash2,
  Shield,
  TrendingUp,
} from 'lucide-react';
import appLogo from '../assets/images/app-logo.png';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onSidebarToggle?: (isOpen: boolean) => void;
  userName: string;
  userRole: string;
  isLoggingOut: boolean;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'vehicles', label: 'Vehicles', icon: Truck },
  { id: 'drivers', label: 'Drivers', icon: Users },
  { id: 'users', label: 'Users', icon: Users2 },
  { id: 'fuel', label: 'Fuel Tracking', icon: Zap },
  { id: 'fuel_analytics', label: 'Fuel Analytics', icon: TrendingUp },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'insurance', label: 'Insurance', icon: Shield },
  { id: 'disposal', label: 'Disposal', icon: Trash2 },
  { id: 'reports', label: 'Reports', icon: FileText },
];

export default function Sidebar({
  activeTab,
  onTabChange,
  onLogout,
  onSidebarToggle,
  isLoggingOut,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isOpen));
    onSidebarToggle?.(isOpen);
  }, [isOpen, onSidebarToggle]);

  const handleToggle = (newState: boolean) => {
    setIsOpen(newState);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => handleToggle(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-md bg-white dark:bg-gray-800 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
      >
        {isOpen ? <X size={20} className="text-gray-700 dark:text-gray-300" /> : <Menu size={20} className="text-gray-700 dark:text-gray-300" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen border-r border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-gray-800 shadow-lg transition-all duration-300 ease-out transform ${
          isOpen ? 'w-52 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'
        } lg:translate-x-0 z-40 flex flex-col`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-300 dark:border-gray-700 flex items-center justify-between">
          {isOpen && (
            <div className="flex items-center gap-2">
              <img 
                src={appLogo} 
                alt="Fleet Logo" 
                className="w-8 h-8 rounded-md object-cover"
              />
              <h1 className="text-base font-bold text-black dark:text-white">Fleet</h1>
            </div>
          )}
          {!isOpen && (
            <div className="w-full flex justify-center">
              <img 
                src={appLogo} 
                alt="Fleet Logo" 
                className="w-8 h-8 rounded-md object-cover"
              />
            </div>
          )}
          <button
            onClick={() => handleToggle(!isOpen)}
            className="hidden lg:flex p-1 rounded transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
          >
            <ChevronLeft size={18} className={`text-black dark:text-white transition-transform duration-300 ${
              isOpen ? 'rotate-0' : 'rotate-180'
            }`} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    onTabChange(item.id);
                  }}
                  title={!isOpen ? item.label : ''}
                  className={`w-full px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 font-medium ${
                    isActive
                      ? 'bg-gray-300 dark:bg-gray-700 text-black dark:text-white shadow-md scale-105'
                      : 'text-black dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {isOpen && <span className="text-sm">{item.label}</span>}
                </button>
                {index < menuItems.length - 1 && (
                  <div className="my-2 border-t border-gray-300 dark:border-gray-700" />
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
