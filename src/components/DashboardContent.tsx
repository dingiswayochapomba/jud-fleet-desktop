import { Truck, Users, Zap, Wrench, TrendingUp, AlertCircle } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtext?: string;
  color: 'coral' | 'green' | 'yellow' | 'blue' | 'purple';
}

const colorMap = {
  coral: {
    bg: 'bg-gradient-to-br from-[#EA7B7B] to-[#D65A5A]',
    icon: 'text-white',
    badge: 'bg-white/20',
  },
  green: {
    bg: 'bg-gradient-to-br from-green-400 to-green-600',
    icon: 'text-white',
    badge: 'bg-white/20',
  },
  yellow: {
    bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    icon: 'text-white',
    badge: 'bg-white/20',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-400 to-blue-600',
    icon: 'text-white',
    badge: 'bg-white/20',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-400 to-purple-600',
    icon: 'text-white',
    badge: 'bg-white/20',
  },
};

function StatCard({ icon, title, value, subtext, color }: StatCardProps) {
  return (
    <div className="group h-full">
      <div
        className={`${colorMap[color].bg} rounded-xl p-6 text-white shadow-lg transition-all duration-300 ease-out hover:shadow-2xl hover:scale-105 cursor-default h-full`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {subtext && <p className="text-xs text-white/60 mt-1">{subtext}</p>}
          </div>
          <div
            className={`${colorMap[color].badge} p-3 rounded-lg backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}
          >
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <div className="p-5 rounded-lg border border-gray-200 bg-white hover:border-[#EA7B7B] hover:shadow-lg transition-all duration-300 group cursor-default">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-gradient-to-br from-[#EA7B7B] to-[#D65A5A] text-white group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#EA7B7B] transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardContent() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Fleet Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Truck size={28} />}
            title="Total Vehicles"
            value="48"
            subtext="All registered vehicles"
            color="coral"
          />
          <StatCard
            icon={<TrendingUp size={28} />}
            title="Available"
            value="35"
            subtext="Ready for use"
            color="green"
          />
          <StatCard
            icon={<Wrench size={28} />}
            title="In Maintenance"
            value="8"
            subtext="Scheduled service"
            color="yellow"
          />
          <StatCard
            icon={<AlertCircle size={28} />}
            title="Issues"
            value="5"
            subtext="Require attention"
            color="blue"
          />
        </div>
      </div>

      {/* Driver & Fuel Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatCard
          icon={<Users size={28} />}
          title="Active Drivers"
          value="24"
          subtext="On duty today"
          color="purple"
        />
        <StatCard
          icon={<Zap size={28} />}
          title="Fuel Consumption"
          value="420L"
          subtext="This week"
          color="blue"
        />
      </div>

      {/* Features */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureItem
            icon={<Truck size={20} />}
            title="Vehicle Management"
            description="Manage your entire fleet, track status, and schedule maintenance"
          />
          <FeatureItem
            icon={<Users size={20} />}
            title="Driver Management"
            description="Track drivers, licenses, assignments, and driving history"
          />
          <FeatureItem
            icon={<Zap size={20} />}
            title="Fuel Tracking"
            description="Monitor fuel consumption and refueling transactions in real-time"
          />
          <FeatureItem
            icon={<Wrench size={20} />}
            title="Maintenance Schedule"
            description="Schedule and track vehicle maintenance and repairs efficiently"
          />
          <FeatureItem
            icon={<TrendingUp size={20} />}
            title="Analytics & Reports"
            description="Generate comprehensive fleet analytics and performance reports"
          />
          <FeatureItem
            icon={<AlertCircle size={20} />}
            title="Alerts & Notifications"
            description="Get instant alerts for maintenance due and fuel refills"
          />
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 animate-subtle-glow">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100">
              <AlertCircle className="text-blue-600" size={20} />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Dashboard Status</h3>
            <p className="text-sm text-blue-800">
              Your fleet management dashboard is fully operational. All systems are connected and ready to help you manage your vehicles efficiently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
