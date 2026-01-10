import { useState } from 'react';
import { Download, BarChart3, TrendingUp, Filter, RefreshCw, AlertCircle, DollarSign, Users, Truck, PieChart } from 'lucide-react';
import { BarChart, Bar, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend, ComposedChart, Line, PieChart as RechartsPie } from 'recharts';

// Custom Tooltip Components (consistent with Dashboard)
const CustomMonthlyTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-semibold text-gray-900">{payload[0].payload.month}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">MK{entry.value?.toLocaleString?.() || entry.value || 0}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomVehicleTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-semibold text-gray-900">{payload[0].payload.registration}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">MK{entry.value?.toLocaleString?.() || entry.value || 0}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomCostBreakdownTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-semibold text-gray-900">{payload[0].payload.name}</p>
        <p className="text-xs font-bold" style={{ color: payload[0].payload.color }}>
          MK{payload[0].value?.toLocaleString?.() || payload[0].value || 0}
        </p>
      </div>
    );
  }
  return null;
};

const CustomStatusTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-semibold text-gray-900">{payload[0].payload.name}</p>
        <p className="text-xs font-bold" style={{ color: payload[0].payload.color }}>
          Vehicles: <span>{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

interface VehicleStats {
  id: string;
  registration: string;
  totalMaintenance: number;
  totalFuel: number;
  totalCost: number;
  status: string;
  mileage: number;
}

interface MonthlyData {
  month: string;
  maintenance: number;
  fuel: number;
  insurance: number;
  total: number;
}

interface DriverStats {
  id: string;
  name: string;
  vehiclesAssigned: number;
  tripsCompleted: number;
  averageRating: number;
  status: string;
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({ from: '2025-11-01', to: '2026-01-09' });
  const [filterVehicle, setFilterVehicle] = useState('all');
  const [filterDriver, setFilterDriver] = useState('all');
  const [loading, setLoading] = useState(false);

  // Mock data
  const [vehicleStats] = useState<VehicleStats[]>([
    { id: '1', registration: 'JJ-16-AB', totalMaintenance: 45000, totalFuel: 85000, totalCost: 130000, status: 'active', mileage: 45200 },
    { id: '2', registration: 'JJ-16-AC', totalMaintenance: 32000, totalFuel: 92000, totalCost: 124000, status: 'active', mileage: 62600 },
    { id: '3', registration: 'JJ-16-AD', totalMaintenance: 22000, totalFuel: 78000, totalCost: 100000, status: 'active', mileage: 28100 },
    { id: '4', registration: 'JJ-16-AE', totalMaintenance: 15000, totalFuel: 105000, totalCost: 120000, status: 'active', mileage: 78700 },
    { id: '5', registration: 'JJ-16-AF', totalMaintenance: 38000, totalFuel: 88000, totalCost: 126000, status: 'inactive', mileage: 95200 },
  ]);

  const [monthlyData] = useState<MonthlyData[]>([
    { month: 'Nov', maintenance: 75000, fuel: 125000, insurance: 35000, total: 235000 },
    { month: 'Dec', maintenance: 102000, fuel: 155000, insurance: 35000, total: 292000 },
    { month: 'Jan', maintenance: 152000, fuel: 170000, insurance: 35000, total: 357000 },
  ]);

  const [driverStats] = useState<DriverStats[]>([
    { id: '1', name: 'John Banda', vehiclesAssigned: 2, tripsCompleted: 45, averageRating: 4.8, status: 'active' },
    { id: '2', name: 'Grace Mwale', vehiclesAssigned: 1, tripsCompleted: 38, averageRating: 4.6, status: 'active' },
    { id: '3', name: 'Peter Chisaka', vehiclesAssigned: 2, tripsCompleted: 52, averageRating: 4.9, status: 'active' },
    { id: '4', name: 'Mercy Phiri', vehiclesAssigned: 1, tripsCompleted: 35, averageRating: 4.5, status: 'active' },
    { id: '5', name: 'Samuel Kachale', vehiclesAssigned: 2, tripsCompleted: 48, averageRating: 4.7, status: 'active' },
  ]);

  // Calculate totals
  const totalVehicles = vehicleStats.length;
  const activeVehicles = vehicleStats.filter(v => v.status === 'active').length;
  const totalCost = vehicleStats.reduce((sum, v) => sum + v.totalCost, 0);
  const avgCostPerVehicle = totalCost / totalVehicles;
  const totalDrivers = driverStats.length;
  const totalTrips = driverStats.reduce((sum, d) => sum + d.tripsCompleted, 0);
  const avgDriverRating = (driverStats.reduce((sum, d) => sum + d.averageRating, 0) / totalDrivers).toFixed(1);

  // Cost breakdown data
  const costBreakdownData = [
    { name: 'Maintenance', value: vehicleStats.reduce((sum, v) => sum + v.totalMaintenance, 0), color: '#f59e0b' },
    { name: 'Fuel', value: vehicleStats.reduce((sum, v) => sum + v.totalFuel, 0), color: '#3b82f6' },
    { name: 'Insurance', value: 105000, color: '#10b981' },
  ];

  // Vehicle status distribution
  const vehicleStatusData = [
    { name: 'Active', value: activeVehicles, color: '#10b981' },
    { name: 'Inactive', value: vehicleStats.filter(v => v.status === 'inactive').length, color: '#ef4444' },
  ];

  const handleExportPDF = () => {
    alert('PDF export functionality will be integrated with your backend');
  };

  const handleExportCSV = () => {
    // Generate CSV data
    const headers = ['Vehicle', 'Maintenance', 'Fuel', 'Total Cost', 'Status', 'Mileage'];
    const rows = vehicleStats.map(v => [v.registration, v.totalMaintenance, v.totalFuel, v.totalCost, v.status, v.mileage]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fleet-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-lg p-6 text-white shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 size={28} />
              <h1 className="text-2xl font-bold">Fleet Reports & Analytics</h1>
            </div>
            <p className="text-purple-100 text-sm">Comprehensive insights into your fleet operations</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all font-medium text-sm backdrop-blur-sm border border-white border-opacity-30 disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all font-medium text-sm backdrop-blur-sm border border-white border-opacity-30"
            >
              📄 PDF
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-6 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              <Download size={18} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200 shadow-md p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} className="text-gray-700" />
          <h3 className="font-bold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle</label>
            <select
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
            >
              <option value="all">All Vehicles</option>
              {vehicleStats.map(v => (
                <option key={v.id} value={v.id}>{v.registration}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Driver</label>
            <select
              value={filterDriver}
              onChange={(e) => setFilterDriver(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
            >
              <option value="all">All Drivers</option>
              {driverStats.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
        {/* Total Vehicles */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-lg p-1.5 border border-blue-200 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Total Vehicles</p>
              <p className="text-lg font-bold text-blue-600 mt-0.5">{totalVehicles}</p>
            </div>
            <div className="p-1 bg-blue-200 rounded-lg group-hover:scale-110 transition-transform">
              <Truck size={12} className="text-blue-600" />
            </div>
          </div>
          <div className="text-xs text-blue-700 font-medium">{activeVehicles} Active</div>
        </div>

        {/* Total Cost */}
        <div className="bg-gradient-to-br from-red-50 to-orange-100 rounded-lg p-1.5 border border-red-200 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Total Cost</p>
              <p className="text-lg font-bold text-red-600 mt-0.5">MK{(totalCost / 1000).toFixed(0)}k</p>
            </div>
            <div className="p-1 bg-red-200 rounded-lg group-hover:scale-110 transition-transform">
              <DollarSign size={12} className="text-red-600" />
            </div>
          </div>
          <div className="text-xs text-red-700 font-medium">Period: {dateRange.from} to {dateRange.to}</div>
        </div>

        {/* Avg Cost Per Vehicle */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-lg p-1.5 border border-purple-200 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Avg Cost/Vehicle</p>
              <p className="text-lg font-bold text-purple-600 mt-0.5">MK{(avgCostPerVehicle / 1000).toFixed(0)}k</p>
            </div>
            <div className="p-1 bg-purple-200 rounded-lg group-hover:scale-110 transition-transform">
              <TrendingUp size={12} className="text-purple-600" />
            </div>
          </div>
          <div className="text-xs text-purple-700 font-medium">Maintenance + Fuel</div>
        </div>

        {/* Total Drivers */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-lg p-1.5 border border-emerald-200 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Total Drivers</p>
              <p className="text-lg font-bold text-emerald-600 mt-0.5">{totalDrivers}</p>
            </div>
            <div className="p-1 bg-emerald-200 rounded-lg group-hover:scale-110 transition-transform">
              <Users size={12} className="text-emerald-600" />
            </div>
          </div>
          <div className="text-xs text-emerald-700 font-medium">{totalTrips} trips completed</div>
        </div>

        {/* Avg Driver Rating */}
        <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-lg p-1.5 border border-yellow-200 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Avg Driver Rating</p>
              <p className="text-lg font-bold text-amber-600 mt-0.5">⭐ {avgDriverRating}</p>
            </div>
            <div className="p-1 bg-yellow-200 rounded-lg group-hover:scale-110 transition-transform">
              <PieChart size={12} className="text-amber-600" />
            </div>
          </div>
          <div className="text-xs text-amber-700 font-medium">Out of 5.0</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Cost Trend */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md p-5 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">📈 Monthly Cost Trend</h3>
              <p className="text-xs text-gray-600 mt-1">Maintenance, Fuel & Insurance</p>
            </div>
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyData} margin={{ top: 10, right: 15, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#9ca3af" />
                <Tooltip cursor={false} content={<CustomMonthlyTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} />
                <Bar dataKey="maintenance" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                <Bar dataKey="fuel" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="insurance" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md p-5 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">💰 Cost Breakdown</h3>
              <p className="text-xs text-gray-600 mt-1">Total: MK{(costBreakdownData.reduce((sum, item) => sum + item.value, 0) / 1000).toFixed(0)}k</p>
            </div>
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie
                data={costBreakdownData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={90}
                dataKey="value"
              >
                {costBreakdownData.map((item, index) => (
                  <Cell key={`cell-${index}`} fill={item.color} />
                ))}
                <Tooltip cursor={false} content={<CustomCostBreakdownTooltip />} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Vehicle Statistics */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-md p-5 hover:shadow-lg transition-all">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">🚗 Vehicle Cost Analysis</h3>
            <p className="text-xs text-gray-600 mt-1">Maintenance and fuel costs by vehicle</p>
          </div>
          <div className="px-3 py-1.5 bg-blue-100 rounded-full">
            <span className="text-xs font-bold text-blue-700">{vehicleStats.length} Vehicles</span>
          </div>
        </div>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={vehicleStats} margin={{ top: 10, right: 15, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="registration"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                angle={-45}
                textAnchor="end"
                height={80}
                stroke="#9ca3af"
              />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#9ca3af" />
              <Tooltip cursor={false} content={<CustomVehicleTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} />
              <Bar dataKey="totalMaintenance" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Maintenance" />
              <Bar dataKey="totalFuel" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Fuel" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md p-5 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">📊 Vehicle Status</h3>
              <p className="text-xs text-gray-600 mt-1">Active vs Inactive</p>
            </div>
          </div>
          <div className="w-full h-60">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie
                data={vehicleStatusData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={75}
                dataKey="value"
              >
                {vehicleStatusData.map((item, index) => (
                  <Cell key={`cell-${index}`} fill={item.color} />
                ))}
                <Tooltip cursor={false} content={<CustomStatusTooltip />} />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-md p-5 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">🏆 Top Driver Performers</h3>
              <p className="text-xs text-gray-600 mt-1">By average rating</p>
            </div>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {driverStats.sort((a, b) => b.averageRating - a.averageRating).map((driver, index) => (
              <div key={driver.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100 hover:border-blue-200 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{driver.name}</p>
                    <p className="text-xs text-gray-600">{driver.tripsCompleted} trips</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-amber-600">⭐ {driver.averageRating}</p>
                  <p className="text-xs text-gray-600">rating</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Vehicle Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden hover:shadow-lg transition-all">
        <div className="p-5 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 text-lg">📋 Detailed Vehicle Report</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-4 py-4 text-left font-bold text-white">🚗 Vehicle</th>
                <th className="px-4 py-4 text-left font-bold text-white">🔧 Maintenance</th>
                <th className="px-4 py-4 text-left font-bold text-white">⛽ Fuel</th>
                <th className="px-4 py-4 text-left font-bold text-white">💰 Total Cost</th>
                <th className="px-4 py-4 text-left font-bold text-white">📍 Mileage</th>
                <th className="px-4 py-4 text-left font-bold text-white">🎯 Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicleStats.map((vehicle, idx) => (
                <tr key={vehicle.id} className={`border-b border-gray-100 hover:bg-purple-50 transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                  <td className="px-4 py-3 font-bold text-gray-900">{vehicle.registration}</td>
                  <td className="px-4 py-3 text-gray-700 font-semibold">MK{vehicle.totalMaintenance.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-700 font-semibold">MK{vehicle.totalFuel.toLocaleString()}</td>
                  <td className="px-4 py-3 font-bold text-red-600">MK{vehicle.totalCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-700">{vehicle.mileage.toLocaleString()} km</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold ${vehicle.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'} shadow-sm`}>
                      {vehicle.status === 'active' ? '✅ Active' : '❌ Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 text-xs text-gray-600 flex justify-between font-bold">
          <span>Total Vehicles: {vehicleStats.length}</span>
          <span>Total Cost: MK{totalCost.toLocaleString()}</span>
        </div>
      </div>

      {/* Driver Performance Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden hover:shadow-lg transition-all">
        <div className="p-5 border-b border-gray-200">
          <h3 className="font-bold text-gray-900 text-lg">👥 Driver Performance Report</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-4 py-4 text-left font-bold text-white">👤 Driver Name</th>
                <th className="px-4 py-4 text-left font-bold text-white">🚗 Vehicles Assigned</th>
                <th className="px-4 py-4 text-left font-bold text-white">🛣️ Trips Completed</th>
                <th className="px-4 py-4 text-left font-bold text-white">⭐ Avg Rating</th>
                <th className="px-4 py-4 text-left font-bold text-white">🎯 Status</th>
              </tr>
            </thead>
            <tbody>
              {driverStats.map((driver, idx) => (
                <tr key={driver.id} className={`border-b border-gray-100 hover:bg-purple-50 transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                  <td className="px-4 py-3 font-bold text-gray-900">{driver.name}</td>
                  <td className="px-4 py-3 text-gray-700 text-center font-semibold">{driver.vehiclesAssigned}</td>
                  <td className="px-4 py-3 text-gray-700 text-center font-semibold">{driver.tripsCompleted}</td>
                  <td className="px-4 py-3 text-amber-600 font-bold text-center">⭐ {driver.averageRating}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 shadow-sm`}>
                      ✅ {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 text-xs text-gray-600 flex justify-between font-bold">
          <span>Total Drivers: {driverStats.length}</span>
          <span>Total Trips: {totalTrips}</span>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 shadow-md p-6">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-indigo-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-indigo-900 mb-2">📊 Quick Insights</h3>
            <ul className="space-y-1 text-sm text-indigo-800">
              <li>✓ Fleet operating at {Math.round((activeVehicles / totalVehicles) * 100)}% capacity ({activeVehicles}/{totalVehicles} vehicles active)</li>
              <li>✓ Average cost per vehicle: MK{(avgCostPerVehicle / 1000).toFixed(0)}k for maintenance and fuel</li>
              <li>✓ Highest rated driver: {driverStats.sort((a, b) => b.averageRating - a.averageRating)[0]?.name} (⭐ {driverStats.sort((a, b) => b.averageRating - a.averageRating)[0]?.averageRating})</li>
              <li>✓ Total operational cost this period: MK{(totalCost / 1000).toFixed(0)}k</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
