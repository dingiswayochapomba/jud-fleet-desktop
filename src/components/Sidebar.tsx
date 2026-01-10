import { useState } from 'react';
import {
  LayoutDashboard,
  Truck,
  Users,
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
  const [isOpen, setIsOpen] = useState(true);

  const handleToggle = (newState: boolean) => {
    setIsOpen(newState);
    onSidebarToggle?.(newState);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => handleToggle(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-md bg-white shadow-md hover:bg-gray-50 transition-colors border border-gray-200"
      >
        {isOpen ? <X size={20} className="text-gray-700" /> : <Menu size={20} className="text-gray-700" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-slate-800 border-r border-slate-700 text-white shadow-lg transition-all duration-300 ease-out transform ${
          isOpen ? 'w-52 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'
        } lg:translate-x-0 z-40 flex flex-col`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          {isOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                <Truck size={18} className="text-white" />
              </div>
              <h1 className="text-base font-bold text-white">Fleet</h1>
            </div>
          )}
          {!isOpen && (
            <div className="w-full flex justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                <Truck size={18} className="text-white" />
              </div>
            </div>
          )}
          <button
            onClick={() => handleToggle(!isOpen)}
            className="hidden lg:flex p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <ChevronLeft size={18} className={`transition-transform duration-300 ${
              isOpen ? 'rotate-0' : 'rotate-180'
            }`} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (!isOpen) setIsOpen(true);
                }}
                title={!isOpen ? item.label : ''}
                className={`w-full px-3 py-2 rounded-md transition-all duration-200 flex items-center gap-3 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                {isOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="px-2 py-3 border-t border-slate-700">
          <button
            onClick={onLogout}
            disabled={isLoggingOut}
            title={!isOpen ? 'Logout' : ''}
            className="w-full px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-md transition-colors flex items-center gap-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {isOpen && <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>}
          </button>
        </div>
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
