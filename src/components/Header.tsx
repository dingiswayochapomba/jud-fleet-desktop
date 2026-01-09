import { Bell, Search } from 'lucide-react';

interface HeaderProps {
  userName: string;
  userRole: string;
  activeTabLabel: string;
}

export default function Header({ userName, userRole, activeTabLabel }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20 transition-all duration-300">
      <div className="px-6 py-4 lg:ml-64">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Title and Breadcrumb */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#EA7B7B] to-[#D65A5A] bg-clip-text text-transparent">
              {activeTabLabel}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Welcome back, <span className="font-semibold">{userName}</span> ({userRole})
            </p>
          </div>

          {/* Right: Search and Notifications */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 transition-all duration-300 hover:bg-gray-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#EA7B7B]">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-500 w-32"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-[#EA7B7B] transition-colors duration-300 hover:bg-gray-100 rounded-lg group">
              <Bell size={20} className="group-hover:scale-110 transition-transform duration-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#EA7B7B] rounded-full animate-pulse" />
            </button>

            {/* Timestamp */}
            <div className="hidden md:flex flex-col text-right text-sm">
              <span className="font-semibold text-gray-900">{new Date().toLocaleDateString()}</span>
              <span className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
