import { useState, useEffect, useMemo, useRef } from 'react';
import * as echarts from 'echarts';
import { TrendingUp, Calendar, DollarSign, Droplet, AlertTriangle, Gauge, Fuel, Sparkles } from 'lucide-react';
import { getFuelLogsByVehicle, getAllVehicles } from '../lib/supabaseQueries';
import { buildFuelAnalyticsData, type FuelAnalyticsLog, type FuelAnalyticsChartPoint, type FuelAnalyticsMonthlyPoint } from '../lib/fuelAnalytics';

interface FuelLog extends FuelAnalyticsLog {}

interface ChartData extends FuelAnalyticsChartPoint {}

interface MonthlyData extends FuelAnalyticsMonthlyPoint {}

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
  const [selectedRegistry, setSelectedRegistry] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<'all' | '30' | '90' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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
  const lineChartRef = useRef<HTMLDivElement | null>(null);
  const costChartRef = useRef<HTMLDivElement | null>(null);
  const efficiencyChartRef = useRef<HTMLDivElement | null>(null);
  const monthlyChartRef = useRef<HTMLDivElement | null>(null);
  const refuelingsChartRef = useRef<HTMLDivElement | null>(null);
  const distributionChartRef = useRef<HTMLDivElement | null>(null);

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

  // Fetch and process fuel logs when vehicle changes or filters change
  useEffect(() => {
    if (!selectedVehicle) return;

    const fetchAndProcessLogs = async () => {
      try {
        setLoading(true);
        const { data, error } = await getFuelLogsByVehicle(selectedVehicle);

        if (error) throw new Error(error.message);

        const filteredLogs = filterLogsByDate(data || []);
        processChartData(filteredLogs);
        processMonthlyData(filteredLogs);
        calculateStats(filteredLogs);
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
  }, [selectedVehicle, selectedRegistry, datePreset, startDate, endDate]);

  const filterLogsByDate = (logs: FuelLog[]) => {
    let filtered = [...logs];

    if (selectedRegistry !== 'all') {
      filtered = filtered.filter((log) => log.vehicle_id === selectedRegistry);
    }

    const now = new Date();
    let fromDate: Date | null = null;
    let toDate: Date | null = null;

    if (datePreset === '30') {
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    } else if (datePreset === '90') {
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 90);
    } else if (datePreset === 'custom' && startDate) {
      fromDate = new Date(startDate);
    }

    if (datePreset === 'custom' && endDate) {
      toDate = new Date(endDate);
      toDate.setHours(23, 59, 59, 999);
    }

    if (fromDate) {
      filtered = filtered.filter((log) => new Date(log.refuel_date) >= fromDate!);
    }

    if (toDate) {
      filtered = filtered.filter((log) => new Date(log.refuel_date) <= toDate);
    }

    return filtered;
  };

  const processChartData = (logs: FuelLog[]) => {
    if (logs.length === 0) {
      setChartData([]);
      return;
    }

    const analytics = buildFuelAnalyticsData(logs);
    setChartData(analytics.chartData);
    setMonthlyData(analytics.monthlyData);
    setStats(analytics.stats);
  };

  const processMonthlyData = (logs: FuelLog[]) => {
    if (logs.length === 0) {
      setMonthlyData([]);
      return;
    }

    const analytics = buildFuelAnalyticsData(logs);
    setMonthlyData(analytics.monthlyData);
  };

  const calculateStats = (logs: FuelLog[]) => {
    const analytics = buildFuelAnalyticsData(logs);
    setStats(analytics.stats);
  };

  useEffect(() => {
    if (!lineChartRef.current || chartData.length === 0) return;

    const chart = echarts.init(lineChartRef.current);
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['Litres'] },
      grid: { left: 20, right: 12, top: 24, bottom: 40, containLabel: true },
      xAxis: getAxisOptions(chartData.map((item) => item.date)),
      yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#f3f4f6' } }, axisLabel: { color: '#6b7280' } },
      series: [{ type: 'line', name: 'Litres', data: chartData.map((item) => item.litres), smooth: true, lineStyle: { color: '#EA7B7B', width: 3 }, itemStyle: { color: '#EA7B7B' }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(234, 123, 123, 0.38)' }, { offset: 1, color: 'rgba(234, 123, 123, 0.04)' }]) } }],
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [chartData]);

  useEffect(() => {
    if (!costChartRef.current || chartData.length === 0) return;

    const chart = echarts.init(costChartRef.current);
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['Cost (MWK)'] },
      grid: { left: 20, right: 12, top: 24, bottom: 40, containLabel: true },
      xAxis: getAxisOptions(chartData.map((item) => item.date)),
      yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#f3f4f6' } }, axisLabel: { color: '#6b7280' } },
      series: [{ type: 'bar', name: 'Cost (MWK)', data: chartData.map((item) => item.cost), itemStyle: { color: '#D65A5A' } }],
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [chartData]);

  useEffect(() => {
    if (!efficiencyChartRef.current || chartData.filter((item) => item.efficiency > 0).length === 0) return;

    const efficiencyData = chartData.filter((item) => item.efficiency > 0);
    const chart = echarts.init(efficiencyChartRef.current);
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['Efficiency (km/L)'] },
      grid: { left: 20, right: 12, top: 24, bottom: 40, containLabel: true },
      xAxis: getAxisOptions(efficiencyData.map((item) => item.date)),
      yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#f3f4f6' } }, axisLabel: { color: '#6b7280' } },
      series: [{ type: 'line', name: 'Efficiency (km/L)', data: efficiencyData.map((item) => item.efficiency), smooth: true, lineStyle: { color: '#3b82f6', width: 3 }, itemStyle: { color: '#3b82f6' } }],
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [chartData]);

  useEffect(() => {
    if (!monthlyChartRef.current || monthlyData.length === 0) return;

    const chart = echarts.init(monthlyChartRef.current);
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['Total Cost (MWK)', 'Total Litres'] },
      grid: { left: 20, right: 12, top: 24, bottom: 40, containLabel: true },
      xAxis: getAxisOptions(monthlyData.map((item) => item.month)),
      yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#f3f4f6' } }, axisLabel: { color: '#6b7280' } },
      series: [
        { type: 'bar', name: 'Total Cost (MWK)', data: monthlyData.map((item) => item.totalCost), itemStyle: { color: '#EA7B7B' } },
        { type: 'bar', name: 'Total Litres', data: monthlyData.map((item) => item.totalLitres), itemStyle: { color: '#3b82f6' } },
      ],
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [monthlyData]);

  useEffect(() => {
    if (!refuelingsChartRef.current || monthlyData.length === 0) return;

    const chart = echarts.init(refuelingsChartRef.current);
    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['Refuelings'] },
      grid: { left: 20, right: 12, top: 24, bottom: 40, containLabel: true },
      xAxis: getAxisOptions(monthlyData.map((item) => item.month)),
      yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: '#f3f4f6' } }, axisLabel: { color: '#6b7280' } },
      series: [{ type: 'bar', name: 'Refuelings', data: monthlyData.map((item) => item.refuelings), itemStyle: { color: '#10b981' } }],
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [monthlyData]);

  useEffect(() => {
    if (!distributionChartRef.current || monthlyData.length === 0) return;

    const chart = echarts.init(distributionChartRef.current);
    chart.setOption({
      tooltip: { trigger: 'item' },
      legend: { top: 'bottom', type: 'scroll', textStyle: { color: '#6b7280' } },
      series: [{
        type: 'pie',
        radius: ['35%', '70%'],
        center: ['50%', '45%'],
        data: monthlyData.map((item, index) => ({
          name: item.month,
          value: item.totalCost,
          itemStyle: { color: COLORS[index % COLORS.length] },
        })),
        label: { show: false },
        labelLine: { show: false },
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.2)' } },
      }],
    });

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [monthlyData]);

  const getAxisOptions = (data: string[]) => ({
    type: 'category' as const,
    data,
    axisLine: { lineStyle: { color: '#d1d5db' } },
    axisLabel: {
      color: '#6b7280',
      interval: data.length > 8 ? Math.max(1, Math.ceil(data.length / 6)) : 0,
      rotate: data.length > 8 ? 25 : 0,
      margin: 8,
      fontSize: 11,
    },
  });

  const summaryCards = useMemo(() => [
    {
      label: 'Total Cost',
      value: `K${stats.totalCost.toLocaleString()}`,
      detail: 'All time',
      icon: DollarSign,
      tone: 'from-emerald-50 to-emerald-100/70 border-emerald-200 text-emerald-700',
    },
    {
      label: 'Total Litres',
      value: `${stats.totalLitres.toFixed(0)}L`,
      detail: 'Fuel consumed',
      icon: Droplet,
      tone: 'from-blue-50 to-blue-100/70 border-blue-200 text-blue-700',
    },
    {
      label: 'Fuel Efficiency',
      value: `${stats.avgFuelEfficiency.toFixed(2)} km/L`,
      detail: 'Average efficiency',
      icon: TrendingUp,
      tone: 'from-amber-50 to-amber-100/70 border-amber-200 text-amber-700',
    },
    {
      label: 'Avg Monthly',
      value: `K${stats.avgMonthlyCost.toLocaleString()}`,
      detail: 'Monthly average',
      icon: Calendar,
      tone: 'from-violet-50 to-violet-100/70 border-violet-200 text-violet-700',
    },
    {
      label: 'Anomalies',
      value: `${stats.anomalies}`,
      detail: 'Detected',
      icon: AlertTriangle,
      tone: stats.anomalies > 0 ? 'from-yellow-50 to-yellow-100/70 border-yellow-200 text-yellow-700' : 'from-slate-50 to-slate-100/70 border-slate-200 text-slate-700',
    },
  ], [stats]);

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <TrendingUp className="mx-auto mb-4 h-12 w-12 animate-pulse text-[#EA7B7B]" />
          <p className="text-lg font-semibold text-gray-900">Loading analytics...</p>
          <p className="mt-1 text-sm text-gray-500">Pulling your latest fuel data from the database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-[#FFF7F7] to-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#FFF0F0] px-3 py-1 text-sm font-medium text-[#D65A5A]">
              <Sparkles className="h-4 w-4" />
              Fuel intelligence
            </div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
              <TrendingUp className="h-8 w-8 text-[#EA7B7B]" />
              Fuel Analytics
            </h1>
            <p className="mt-1 text-gray-600">Real-time insights from your fuel database, with richer trend and cost views.</p>
          </div>
          <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Registry / Vehicle</label>
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-[#EA7B7B]"
                >
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.registration_number} - {vehicle.make} {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Date range</label>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setDatePreset('all')} className={`rounded-full px-3 py-1.5 text-sm font-medium ${datePreset === 'all' ? 'bg-[#EA7B7B] text-white' : 'bg-gray-100 text-gray-700'}`}>All</button>
                  <button onClick={() => setDatePreset('30')} className={`rounded-full px-3 py-1.5 text-sm font-medium ${datePreset === '30' ? 'bg-[#EA7B7B] text-white' : 'bg-gray-100 text-gray-700'}`}>30d</button>
                  <button onClick={() => setDatePreset('90')} className={`rounded-full px-3 py-1.5 text-sm font-medium ${datePreset === '90' ? 'bg-[#EA7B7B] text-white' : 'bg-gray-100 text-gray-700'}`}>90d</button>
                  <button onClick={() => setDatePreset('custom')} className={`rounded-full px-3 py-1.5 text-sm font-medium ${datePreset === 'custom' ? 'bg-[#EA7B7B] text-white' : 'bg-gray-100 text-gray-700'}`}>Custom</button>
                </div>
              </div>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Registry scope</label>
                <select
                  value={selectedRegistry}
                  onChange={(e) => setSelectedRegistry(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-transparent focus:ring-2 focus:ring-[#EA7B7B]"
                >
                  <option value="all">All registries</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>{vehicle.registration_number}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Custom dates</label>
                <div className="flex gap-2">
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`rounded-2xl border bg-gradient-to-br p-4 shadow-sm ${card.tone}`}>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">{card.label}</p>
                <div className="rounded-full bg-white/70 p-2 shadow-sm">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="mt-1 text-xs text-gray-600">{card.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="space-y-6">
          {/* Fuel Consumption Trend */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Fuel Consumption Trend</h2>
                <p className="text-sm text-gray-500">Refuel volume over time</p>
              </div>
              <div className="rounded-full bg-[#FFF0F0] p-2 text-[#D65A5A]">
                <Fuel className="h-4 w-4" />
              </div>
            </div>
            <div ref={lineChartRef} className="h-[320px] w-full" />
          </div>

          {/* Cost vs Consumption */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Trend */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Cost Trend</h2>
                  <p className="text-sm text-gray-500">Spend across each refill</p>
                </div>
                <div className="rounded-full bg-emerald-50 p-2 text-emerald-600">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <div ref={costChartRef} className="h-[300px] w-full" />
            </div>

            {/* Fuel Efficiency Trend */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Fuel Efficiency Trend</h2>
                  <p className="text-sm text-gray-500">Performance between refuels</p>
                </div>
                <div className="rounded-full bg-blue-50 p-2 text-blue-600">
                  <Gauge className="h-4 w-4" />
                </div>
              </div>
              <div ref={efficiencyChartRef} className="h-[300px] w-full" />
            </div>
          </div>

          {/* Monthly Breakdown */}
          {monthlyData.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Monthly Breakdown</h2>
                  <p className="text-sm text-gray-500">Rolling 12-month view</p>
                </div>
                <div className="rounded-full bg-[#FFF0F0] p-2 text-[#D65A5A]">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
              <div ref={monthlyChartRef} className="h-[300px] w-full" />
            </div>
          )}

          {/* Refuelings Distribution */}
          {monthlyData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Refuelings by Month</h2>
                    <p className="text-sm text-gray-500">Frequency of refuels</p>
                  </div>
                  <div className="rounded-full bg-emerald-50 p-2 text-emerald-600">
                    <Fuel className="h-4 w-4" />
                  </div>
                </div>
                <div ref={refuelingsChartRef} className="h-[300px] w-full" />
              </div>

              {/* Cost Distribution Pie */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Cost Distribution</h2>
                    <p className="text-sm text-gray-500">Spend by month</p>
                  </div>
                  <div className="rounded-full bg-violet-50 p-2 text-violet-600">
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>
                <div ref={distributionChartRef} className="h-[300px] w-full" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {chartData.length === 0 && !loading && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
          <Droplet className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="font-semibold text-gray-700">No fuel data available</p>
          <p className="mt-1 text-sm text-gray-500">Start by adding fuel logs so this page can render live analytics.</p>
        </div>
      )}
    </div>
  );
}
