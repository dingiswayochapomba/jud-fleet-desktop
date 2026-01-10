import { Truck, Users, Zap, Wrench, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import FuelConsumptionChart from './FuelConsumptionChart';
import VehicleStatusChart from './VehicleStatusChart';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtext?: string;
  status?: 'success' | 'warning' | 'danger' | 'info';
}

const statusMap = {
  success: {
    bgGradient: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50',
    borderColor: 'border-emerald-200',
    titleColor: 'text-emerald-700',
    valueColor: 'text-emerald-900',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    accentLine: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
  },
  warning: {
    bgGradient: 'bg-gradient-to-br from-amber-50 to-amber-100/50',
    borderColor: 'border-amber-200',
    titleColor: 'text-amber-700',
    valueColor: 'text-amber-900',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    accentLine: 'bg-gradient-to-r from-amber-400 to-amber-500',
  },
  danger: {
    bgGradient: 'bg-gradient-to-br from-red-50 to-red-100/50',
    borderColor: 'border-red-200',
    titleColor: 'text-red-700',
    valueColor: 'text-red-900',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    accentLine: 'bg-gradient-to-r from-red-400 to-red-500',
  },
  info: {
    bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
    borderColor: 'border-blue-200',
    titleColor: 'text-blue-700',
    valueColor: 'text-blue-900',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    accentLine: 'bg-gradient-to-r from-blue-400 to-blue-500',
  },
};

function StatCard({ icon, title, value, subtext, status = 'info' }: StatCardProps) {
  const style = statusMap[status];
  return (
    <div className={`${style.bgGradient} border ${style.borderColor} rounded-md p-2.5 shadow-sm hover:shadow-md transition-all duration-300 cursor-default group overflow-hidden relative`}>
      {/* Accent line at top */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${style.accentLine}`} />
      
      <div className="flex items-start justify-between relative z-10 gap-1">
        <div className="flex-1">
          <p className={`${style.titleColor} text-xs font-semibold uppercase tracking-wide mb-0.5 opacity-85 leading-tight`}>
            {title}
          </p>
          <p className={`${style.valueColor} text-xl font-bold mb-0.5 leading-tight`}>{value}</p>
          {subtext && (
            <p className="text-xs text-gray-600 font-medium">{subtext}</p>
          )}
        </div>
        <div className={`${style.iconBg} p-1.5 rounded flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}>
          <div className={`${style.iconColor} text-sm`}>{icon}</div>
        </div>
      </div>
      
      {/* Subtle background accent */}
      <div className={`absolute bottom-0 right-0 w-12 h-12 ${style.iconBg} rounded-full opacity-20 -mr-4 -mb-4`} />
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
    <div className="p-3.5 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 group cursor-default">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors duration-200 flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-0.5 text-sm">
            {title}
          </h3>
          <p className="text-xs text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardContent() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Fleet Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Truck size={24} />}
            title="Total Vehicles"
            value="48"
            subtext="All registered vehicles"
            status="info"
          />
          <StatCard
            icon={<CheckCircle2 size={24} />}
            title="Available"
            value="35"
            subtext="Ready for use"
            status="success"
          />
          <StatCard
            icon={<Wrench size={24} />}
            title="In Maintenance"
            value="8"
            subtext="Scheduled service"
            status="warning"
          />
          <StatCard
            icon={<AlertCircle size={24} />}
            title="Issues"
            value="5"
            subtext="Require attention"
            status="danger"
          />
        </div>
      </div>

      {/* Driver & Fuel Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 h-80">
          <FuelConsumptionChart />
        </div>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 h-80">
          <VehicleStatusChart />
        </div>
      </div>

      {/* Features */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-100">
              <CheckCircle2 className="text-blue-600" size={16} />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-0.5 text-sm">Dashboard Status</h3>
            <p className="text-xs text-blue-800">
              Your fleet management dashboard is fully operational. All systems are connected and ready to help you manage your vehicles efficiently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
