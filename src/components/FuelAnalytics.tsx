import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar, DollarSign, Droplet, AlertTriangle } from 'lucide-react';
import { getFuelLogsByVehicle, getAllVehicles } from '../lib/supabaseQueries';

interface FuelLog {
  id: string;
  vehicle_id: string;
  litres: number;
  cost: number;
  refuel_date: string;
  odometer: number;
}

interface ChartData {
  date: string;
  litres: number;
  cost: number;
  efficiency: number;
}

interface MonthlyData {
  month: string;
  totalCost: number;
  totalLitres: number;
  refuelings: number;
  [key: string]: string | number;
}

interface Vehicle {
  id: string;
  registration_number: string;
  make: string;
  model: string;
}

const COLORS = ['#EA7B7B', '#D65A5A', '#FF8787', '#E89999', '#F0A5A5'];

export default function FuelAnalytics() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    avgFuelEfficiency: 0,
    avgMonthlyCost: 0,
    totalCost: 0,
    totalLitres: 0,
    anomalies: 0,
  });

  // Fetch vehicles on mount
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const { data, error } = await getAllVehicles();
        if (error) throw new Error(error.message);
        setVehicles(data || []);
        if (data && data.length > 0) {
          setSelectedVehicle(data[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vehicles');
        console.error('Error fetching vehicles:', err);
      }
    };

    fetchVehicles();
  }, []);

  // Fetch and process fuel logs when vehicle changes
  useEffect(() => {
    if (!selectedVehicle) return;

    const fetchAndProcessLogs = async () => {
      try {
        setLoading(true);
        const { data, error } = await getFuelLogsByVehicle(selectedVehicle);

        if (error) throw new Error(error.message);

        processChartData(data || []);
        processMonthlyData(data || []);
        calculateStats(data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load fuel data');
        console.error('Error fetching fuel logs:', err);
        setChartData([]);
        setMonthlyData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessLogs();
  }, [selectedVehicle]);

  const processChartData = (logs: FuelLog[]) => {
    if (logs.length === 0) {
      setChartData([]);
      return;
    }

    // Sort by date
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(a.refuel_date).getTime() - new Date(b.refuel_date).getTime()
    );

    // Calculate efficiency for each log
    const data = sortedLogs.map((log, index) => {
      let efficiency = 0;

      if (index > 0) {
        const prevLog = sortedLogs[index - 1];
        const kmDriven = log.odometer - prevLog.odometer;
        efficiency = log.litres > 0 ? kmDriven / log.litres : 0;

        // Filter out unrealistic values
        if (efficiency < 0 || efficiency > 50) {
          efficiency = 0;
        }
      }

      return {
        date: new Date(log.refuel_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        litres: log.litres,
        cost: Math.round(log.cost),
        efficiency: parseFloat(efficiency.toFixed(2)),
      };
    });

    setChartData(data);
  };

  const processMonthlyData = (logs: FuelLog[]) => {
    if (logs.length === 0) {
      setMonthlyData([]);
      return;
    }

    // Group by month
    const monthMap: { [key: string]: MonthlyData } = {};

    logs.forEach((log) => {
      const date = new Date(log.refuel_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = {
          month: new Date(date.getFullYear(), date.getMonth()).toLocaleDateString('en-US', {
            month: 'short',
            year: '2-digit',
          }),
          totalCost: 0,
          totalLitres: 0,
          refuelings: 0,
        };
      }

      monthMap[monthKey].totalCost += log.cost;
      monthMap[monthKey].totalLitres += log.litres;
      monthMap[monthKey].refuelings += 1;
    });

    const monthlyArray = Object.values(monthMap)
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-12); // Last 12 months

    setMonthlyData(monthlyArray);
  };

  const calculateStats = (logs: FuelLog[]) => {
    if (logs.length === 0) {
      setStats({
        avgFuelEfficiency: 0,
        avgMonthlyCost: 0,
        totalCost: 0,
        totalLitres: 0,
        anomalies: 0,
      });
      return;
    }

    // Sort by date
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(a.refuel_date).getTime() - new Date(b.refuel_date).getTime()
    );

    // Calculate efficiency
    let totalEfficiency = 0;
    let efficiencyCount = 0;
    const efficiencies: number[] = [];

    for (let i = 1; i < sortedLogs.length; i++) {
      const current = sortedLogs[i];
      const previous = sortedLogs[i - 1];
      const kmDriven = current.odometer - previous.odometer;
      const efficiency = current.litres > 0 ? kmDriven / current.litres : 0;

      if (efficiency > 0 && efficiency < 50) {
        totalEfficiency += efficiency;
        efficiencyCount++;
        efficiencies.push(efficiency);
      }
    }

    const avgFuelEfficiency = efficiencyCount > 0 ? totalEfficiency / efficiencyCount : 0;

    // Calculate monthly average cost
    const monthMap: { [key: string]: number } = {};
    logs.forEach((log) => {
      const date = new Date(log.refuel_date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      monthMap[monthKey] = (monthMap[monthKey] || 0) + log.cost;
    });

    const avgMonthlyCost = Object.keys(monthMap).length > 0
      ? Object.values(monthMap).reduce((a, b) => a + b, 0) / Object.keys(monthMap).length
      : 0;

    // Find anomalies (efficiency values that are 2+ std deviations from mean)
    let anomalies = 0;
    if (efficiencies.length > 1) {
      const mean = totalEfficiency / efficiencyCount;
      const variance = efficiencies.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / efficiencies.length;
      const stdDev = Math.sqrt(variance);

      anomalies = efficiencies.filter((e) => Math.abs(e - mean) > 2 * stdDev).length;
    }

    const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);
    const totalLitres = logs.reduce((sum, log) => sum + log.litres, 0);

    setStats({
      avgFuelEfficiency: parseFloat(avgFuelEfficiency.toFixed(2)),
      avgMonthlyCost: Math.round(avgMonthlyCost),
      totalCost: Math.round(totalCost),
      totalLitres: parseFloat(totalLitres.toFixed(2)),
      anomalies,
    });
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 mx-auto text-[#EA7B7B] mb-4 animate-pulse" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-8 h-8 text-[#EA7B7B]" />
          Fuel Analytics
        </h1>
        <p className="text-gray-600 mt-1">Comprehensive fuel consumption and cost analysis</p>
      </div>

      {/* Vehicle Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Vehicle</label>
        <select
          value={selectedVehicle}
          onChange={(e) => setSelectedVehicle(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
        >
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.registration_number} - {vehicle.make} {vehicle.model}
            </option>
          ))}
        </select>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Cost */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Cost</p>
            <DollarSign className="w-5 h-5 text-green-600 opacity-20" />
          </div>
          <p className="text-2xl font-bold text-gray-900">K{stats.totalCost.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </div>

        {/* Total Litres */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Litres</p>
            <Droplet className="w-5 h-5 text-blue-600 opacity-20" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalLitres.toFixed(0)}L</p>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </div>

        {/* Avg Fuel Efficiency */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Fuel Efficiency</p>
            <TrendingUp className="w-5 h-5 text-blue-600 opacity-20" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.avgFuelEfficiency.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">km/L</p>
        </div>

        {/* Avg Monthly Cost */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Avg Monthly</p>
            <Calendar className="w-5 h-5 text-yellow-600 opacity-20" />
          </div>
          <p className="text-2xl font-bold text-gray-900">K{stats.avgMonthlyCost.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Monthly avg</p>
        </div>

        {/* Anomalies */}
        <div className={`rounded-lg border p-4 shadow-sm ${stats.anomalies > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Anomalies</p>
            <AlertTriangle className={`w-5 h-5 opacity-20 ${stats.anomalies > 0 ? 'text-yellow-600' : 'text-gray-400'}`} />
          </div>
          <p className={`text-2xl font-bold ${stats.anomalies > 0 ? 'text-yellow-900' : 'text-gray-900'}`}>
            {stats.anomalies}
          </p>
          <p className="text-xs text-gray-500 mt-1">Detected</p>
        </div>
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="space-y-6">
          {/* Fuel Consumption Trend */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Fuel Consumption Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="litres"
                  stroke="#EA7B7B"
                  dot={{ fill: '#EA7B7B', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Litres"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Cost vs Consumption */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Trend */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Cost Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="cost" fill="#D65A5A" name="Cost (MWK)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Fuel Efficiency Trend */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Fuel Efficiency Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.filter((d) => d.efficiency > 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#3b82f6"
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Efficiency (km/L)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Breakdown */}
          {monthlyData.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Monthly Breakdown (Last 12 Months)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="totalCost" fill="#EA7B7B" name="Total Cost (MWK)" />
                  <Bar dataKey="totalLitres" fill="#3b82f6" name="Total Litres" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Refuelings Distribution */}
          {monthlyData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Refuelings by Month</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="refuelings" fill="#10b981" name="Refuelings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Cost Distribution Pie */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Cost Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={monthlyData}
                      dataKey="totalCost"
                      nameKey="month"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {monthlyData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {chartData.length === 0 && !loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
          <Droplet className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">No fuel data available</p>
          <p className="text-gray-400 text-sm mt-1">Start by adding fuel logs to see analytics</p>
        </div>
      )}
    </div>
  );
}
