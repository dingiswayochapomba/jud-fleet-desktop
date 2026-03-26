import { useState, useEffect } from 'react';
import {
  Fuel,
  Plus,
  Trash2,
  Edit,
  AlertCircle,
  CheckCircle,
  Filter,
  MapPin,
  TrendingUp,
  Zap,
  AlertTriangle,
  Download,
  Truck,
  DollarSign,
  X,
  ChevronRight,
  Calendar,
  Gauge,
  Eye,
} from 'lucide-react';
import {
  getFuelLogsByVehicle,
  createFuelLog,
  deleteFuelLog,
  getAllVehicles,
  getAllDrivers,
  updateFuelLog,
} from '../lib/supabaseQueries';

interface FuelLog {
  id: string;
  vehicle_id: string;
  driver_id: string | null;
  litres: number;
  cost: number;
  station_name: string;
  odometer: number;
  receipt_url: string | null;
  refuel_date: string;
  created_at: string;
}

interface Vehicle {
  id: string;
  registration_number: string;
  make: string;
  model: string;
  mileage: number;
}

interface Driver {
  id: string;
  name: string;
  license_number: string;
}

interface FuelStats {
  totalLitres: number;
  totalCost: number;
  avgCostPerLitre: number;
  lastRefuel: FuelLog | null;
  avgKmPerLitre: number;
  bestKmPerLitre: number;
  worstKmPerLitre: number;
  totalKm: number;
  anomalies: string[];
}

export default function FuelTracking() {
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [stats, setStats] = useState<FuelStats | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState<Vehicle | null>(null);
  
  // Filter states
  const [filterType, setFilterType] = useState<'all' | 'month' | 'range'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    vehicle_id: '',
    driver_id: '',
    litres: '',
    cost: '',
    station_name: '',
    odometer: '',
    receipt_url: '',
    refuel_date: new Date().toISOString().slice(0, 10),
  });

  // Fetch vehicles and drivers on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [vehiclesRes, driversRes] = await Promise.all([
          getAllVehicles(),
          getAllDrivers(),
        ]);

        if (vehiclesRes.data) setVehicles(vehiclesRes.data);
        if (driversRes.data) setDrivers(driversRes.data);

        if (vehiclesRes.data && vehiclesRes.data.length > 0) {
          setSelectedVehicle(vehiclesRes.data[0].id);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Fetch fuel logs when selected vehicle changes
  useEffect(() => {
    if (!selectedVehicle) return;

    const loadFuelLogs = async () => {
      try {
        const { data, error: err } = await getFuelLogsByVehicle(selectedVehicle);
        if (err) {
          setError(err.message);
          return;
        }
        setFuelLogs(data || []);
        calculateStats(data || []);
      } catch (err) {
        console.error('Error loading fuel logs:', err);
      }
    };

    loadFuelLogs();
  }, [selectedVehicle]);

  const calculateStats = (logs: FuelLog[]) => {
    if (logs.length === 0) {
      setStats(null);
      return;
    }

    const sortedByDate = [...logs].sort((a, b) => 
      new Date(a.refuel_date).getTime() - new Date(b.refuel_date).getTime()
    );

    const totalLitres = logs.reduce((sum, log) => sum + log.litres, 0);
    const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);
    const avgCostPerLitre = totalLitres > 0 ? totalCost / totalLitres : 0;

    // Calculate km/L efficiency
    const efficiencies: number[] = [];
    let totalKm = 0;
    
    for (let i = 1; i < sortedByDate.length; i++) {
      const current = sortedByDate[i];
      const previous = sortedByDate[i - 1];
      
      if (current.odometer && previous.odometer) {
        const kmDriven = current.odometer - previous.odometer;
        const kml = kmDriven / current.litres;
        
        if (kml > 0 && kml < 100) { // Filter unrealistic values
          efficiencies.push(kml);
        }
      }
    }

    const avgKmPerLitre = efficiencies.length > 0 
      ? efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length 
      : 0;
    
    const bestKmPerLitre = efficiencies.length > 0 ? Math.max(...efficiencies) : 0;
    const worstKmPerLitre = efficiencies.length > 0 ? Math.min(...efficiencies) : 0;

    // Calculate total km
    if (sortedByDate.length > 0) {
      const lastLog = sortedByDate[sortedByDate.length - 1];
      const firstLog = sortedByDate[0];
      if (lastLog.odometer && firstLog.odometer) {
        totalKm = lastLog.odometer - firstLog.odometer;
      }
    }

    // Detect anomalies
    const anomalies: string[] = [];
    if (avgKmPerLitre > 0) {
      logs.forEach((log, idx) => {
        if (idx > 0) {
          const prevLog = logs[idx - 1];
          if (log.odometer && prevLog.odometer) {
            const kml = (log.odometer - prevLog.odometer) / log.litres;
            if (kml > avgKmPerLitre * 1.5) {
              anomalies.push(`Unusually high efficiency on ${new Date(log.refuel_date).toLocaleDateString()}`);
            } else if (kml < avgKmPerLitre * 0.5) {
              anomalies.push(`Unusually low efficiency on ${new Date(log.refuel_date).toLocaleDateString()}`);
            }
          }
        }
      });
    }

    setStats({
      totalLitres: parseFloat(totalLitres.toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      avgCostPerLitre: parseFloat(avgCostPerLitre.toFixed(2)),
      lastRefuel: logs[0] || null,
      avgKmPerLitre: parseFloat(avgKmPerLitre.toFixed(2)),
      bestKmPerLitre: parseFloat(bestKmPerLitre.toFixed(2)),
      worstKmPerLitre: parseFloat(worstKmPerLitre.toFixed(2)),
      totalKm,
      anomalies: anomalies.slice(0, 3), // Show top 3 anomalies
    });
  };

  const sortedLogs = [...fuelLogs]
    .sort((a, b) => {
      return new Date(b.refuel_date).getTime() - new Date(a.refuel_date).getTime();
    })
    .filter((log) => {
      // Date filtering
      if (filterType === 'month') {
        const logDate = new Date(log.refuel_date);
        const today = new Date();
        const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        if (logDate < monthAgo) return false;
      } else if (filterType === 'range' && startDate && endDate) {
        const logDate = new Date(log.refuel_date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (logDate < start || logDate > end) return false;
      }

      // Search filtering
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const driver = drivers.find((d) => d.id === log.driver_id);
        return (
          log.station_name.toLowerCase().includes(term) ||
          driver?.name.toLowerCase().includes(term) ||
          log.cost.toString().includes(term) ||
          log.litres.toString().includes(term)
        );
      }

      return true;
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vehicle_id || !formData.litres || !formData.cost) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const fuelLogData = {
        vehicle_id: formData.vehicle_id,
        driver_id: formData.driver_id || null,
        litres: parseFloat(formData.litres),
        cost: parseFloat(formData.cost),
        station_name: formData.station_name,
        odometer: formData.odometer ? parseInt(formData.odometer) : null,
        receipt_url: formData.receipt_url || null,
        refuel_date: new Date(formData.refuel_date).toISOString(),
      };

      let result;
      if (editingId) {
        result = await updateFuelLog(editingId, fuelLogData);
      } else {
        result = await createFuelLog(fuelLogData);
      }

      if (result.error) throw new Error(result.error.message);

      // Refresh the fuel logs
      const { data } = await getFuelLogsByVehicle(selectedVehicle);
      setFuelLogs(data || []);
      calculateStats(data || []);

      const message = editingId ? 'Fuel log updated successfully!' : 'Fuel log created successfully!';
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 3000);

      // Reset form
      setFormData({
        vehicle_id: selectedVehicle,
        driver_id: '',
        litres: '',
        cost: '',
        station_name: '',
        odometer: '',
        receipt_url: '',
        refuel_date: new Date().toISOString().slice(0, 10),
      });

      setShowModal(false);
      setEditingId(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save fuel log');
      console.error('Error saving fuel log:', err);
    }
  };

  const handleDelete = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this fuel log?')) return;

    try {
      const result = await deleteFuelLog(logId);
      if (result.error) throw new Error(result.error.message);

      const updatedLogs = fuelLogs.filter((log) => log.id !== logId);
      setFuelLogs(updatedLogs);
      calculateStats(updatedLogs);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete fuel log');
    }
  };

  const handleEdit = (log: FuelLog) => {
    setFormData({
      vehicle_id: log.vehicle_id,
      driver_id: log.driver_id || '',
      litres: log.litres.toString(),
      cost: log.cost.toString(),
      station_name: log.station_name,
      odometer: log.odometer?.toString() || '',
      receipt_url: log.receipt_url || '',
      refuel_date: log.refuel_date.slice(0, 10),
    });
    setEditingId(log.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const exportToCSV = () => {
    if (sortedLogs.length === 0) {
      setError('No fuel logs to export');
      return;
    }

    const headers = ['Date', 'Station', 'Litres', 'Cost (MWK)', 'Cost/Litre', 'Odometer (km)', 'Driver', 'Km/Litre'];
    const rows = sortedLogs.map((log) => {
      const driver = drivers.find((d) => d.id === log.driver_id);
      const costPerLitre = log.litres > 0 ? log.cost / log.litres : 0;
      const kml = 'N/A'; // Would calculate from adjacent records if needed
      return [
        new Date(log.refuel_date).toLocaleDateString(),
        log.station_name,
        log.litres.toFixed(2),
        log.cost.toFixed(0),
        costPerLitre.toFixed(2),
        log.odometer || '-',
        driver?.name || '-',
        kml,
      ];
    });

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuel-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Fuel className="w-12 h-12 mx-auto text-[#EA7B7B] mb-4 animate-pulse" />
          <p className="text-gray-600">Loading fuel tracking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-800 via-amber-900 to-orange-900 rounded-lg p-4 text-white shadow-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white bg-opacity-15 rounded-lg backdrop-blur-sm">
              <Fuel size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Fuel Tracking</h1>
              <p className="text-orange-200 text-xs">Monitor consumption & efficiency</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="flex items-center gap-1 px-3 py-1 bg-white bg-opacity-15 text-white rounded-md hover:bg-opacity-25 transition-all font-medium text-xs backdrop-blur-sm border border-white border-opacity-20"
              title="Download report"
            >
              📊
            </button>
            <button
              onClick={() => {
                setFormData({
                  vehicle_id: selectedVehicle,
                  driver_id: '',
                  litres: '',
                  cost: '',
                  station_name: '',
                  odometer: '',
                  receipt_url: '',
                  refuel_date: new Date().toISOString().slice(0, 10),
                });
                setEditingId(null);
                setShowModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-1 bg-white text-orange-800 rounded-md hover:bg-orange-50 transition-all font-semibold text-xs shadow-md"
            >
              <Plus size={16} />
              Log
            </button>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-green-900">Success</h3>
            <p className="text-sm text-green-700 mt-1">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-900">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Vehicle Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-3">
          <Truck className="w-5 h-5 text-[#EA7B7B]" />
          <label className="block text-sm font-semibold text-gray-900 dark:text-white">Select Vehicle</label>
        </div>
        <select
          value={selectedVehicle}
          onChange={(e) => setSelectedVehicle(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent font-medium"
        >
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.registration_number} - {vehicle.make} {vehicle.model}
            </option>
          ))}
        </select>
      </div>

      {/* Statistics */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Litres Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-500" />
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 opacity-85">Total Fuel</p>
                  <p className="text-2xl font-bold text-blue-900 mt-2">{stats.totalLitres.toFixed(2)}L</p>
                  <p className="text-xs text-blue-600 mt-2 font-medium">{fuelLogs.length} refuel records</p>
                </div>
                <div className="bg-blue-100 p-2.5 rounded-lg group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Total Cost Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-500" />
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 opacity-85">Total Cost</p>
                  <p className="text-2xl font-bold text-emerald-900 mt-2">K{stats.totalCost.toFixed(0)}</p>
                  <p className="text-xs text-emerald-600 mt-2 font-medium">Avg K{stats.avgCostPerLitre.toFixed(0)}/L</p>
                </div>
                <div className="bg-emerald-100 p-2.5 rounded-lg group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
            </div>

            {/* Efficiency Card */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 opacity-85">Average Efficiency</p>
                  <p className="text-2xl font-bold text-amber-900 mt-2">{stats.avgKmPerLitre.toFixed(2)} km/L</p>
                  <p className="text-xs text-amber-600 mt-2 font-medium">Distance: {stats.totalKm.toLocaleString()} km</p>
                </div>
                <div className="bg-amber-100 p-2.5 rounded-lg group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
              </div>
            </div>

            {/* Best vs Worst Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-purple-500" />
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-purple-700 opacity-85">Efficiency Range</p>
                  <div className="mt-2 space-y-1.5">
                    <p className="text-sm font-bold text-green-600">↑ Best: {stats.bestKmPerLitre.toFixed(2)} km/L</p>
                    <p className="text-sm font-bold text-red-600">↓ Worst: {stats.worstKmPerLitre.toFixed(2)} km/L</p>
                  </div>
                </div>
                <div className="bg-purple-100 p-2.5 rounded-lg group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Anomalies Alert */}
          {stats.anomalies.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-5 flex items-start gap-4 shadow-sm">
              <AlertTriangle className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-2">Consumption Anomalies Detected</h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  {stats.anomalies.map((anomaly, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                      {anomaly}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}

      {/* Table Header with Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Showing <span className="text-[#EA7B7B]">{sortedLogs.length}</span> of{' '}
                <span className="text-gray-700">{fuelLogs.length}</span> logs
              </span>
            </div>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-100 transition-all duration-200 flex items-center gap-2 text-sm font-semibold border border-gray-200"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Search Bar */}
          <div>
            <input
              type="text"
              placeholder="🔍 Search by station, driver, cost, or litres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent text-sm font-medium"
            />
          </div>

          {/* Filter Options */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filterType === 'all'
                  ? 'bg-gradient-to-r from-[#EA7B7B] to-[#D65A5A] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Logs
            </button>
            <button
              onClick={() => setFilterType('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filterType === 'month'
                  ? 'bg-gradient-to-r from-[#EA7B7B] to-[#D65A5A] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => setFilterType('range')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filterType === 'range'
                  ? 'bg-gradient-to-r from-[#EA7B7B] to-[#D65A5A] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Date Range
            </button>

            {filterType === 'range' && (
              <div className="flex items-center gap-2 ml-auto">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#EA7B7B] font-medium"
                />
                <span className="text-gray-400 text-sm font-medium">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#EA7B7B] font-medium"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fuel Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {sortedLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 dark:from-gray-700 to-gray-100 dark:to-gray-600 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">Station</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Litres</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Cost</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Cost/L</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Odometer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Efficiency</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Driver</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedLogs.map((log, idx) => {
                  const driver = drivers.find((d) => d.id === log.driver_id);
                  const vehicle = vehicles.find((v) => v.id === log.vehicle_id);
                  const costPerLitre = log.litres > 0 ? log.cost / log.litres : 0;
                  
                  // Calculate km/L for this entry
                  let kml = '-';
                  let efficiencyStatus = '';
                  let efficiencyBg = '';
                  if (idx > 0 && log.odometer && sortedLogs[idx - 1].odometer) {
                    const kmDriven = log.odometer - sortedLogs[idx - 1].odometer;
                    const calculatedKml = kmDriven / log.litres;
                    if (calculatedKml > 0 && calculatedKml < 100) {
                      kml = calculatedKml.toFixed(2);
                      if (stats?.avgKmPerLitre) {
                        if (calculatedKml > stats.avgKmPerLitre * 1.2) {
                          efficiencyStatus = 'text-green-700 font-bold';
                          efficiencyBg = 'bg-green-50';
                        } else if (calculatedKml < stats.avgKmPerLitre * 0.8) {
                          efficiencyStatus = 'text-red-700 font-bold';
                          efficiencyBg = 'bg-red-50';
                        }
                      }
                    }
                  }

                  return (
                    <tr 
                      key={log.id} 
                      className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
                      onClick={() => {
                        if (vehicle) {
                          setSelectedVehicleForDetail(vehicle);
                          setDetailModalOpen(true);
                        }
                      }}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {new Date(log.refuel_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2 font-medium">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {log.station_name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{log.litres.toFixed(2)}L</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">K{log.cost.toFixed(0)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">K{costPerLitre.toFixed(0)}/L</td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                        {log.odometer ? `${log.odometer.toLocaleString()}km` : '-'}
                      </td>
                      <td className={`px-6 py-4 text-sm font-bold ${efficiencyStatus} ${efficiencyBg ? efficiencyBg + ' rounded' : ''}`}>
                        {kml !== '-' ? `${kml} km/L` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">{driver?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              if (vehicle) {
                                setSelectedVehicleForDetail(vehicle);
                                setDetailModalOpen(true);
                              }
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-150 font-medium"
                            title="View Vehicle Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(log)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150 font-medium"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(log.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150 font-medium"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <Fuel className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-semibold text-lg">No fuel logs yet</p>
            <p className="text-gray-400 text-sm mt-2">Start by logging your first fuel entry</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#EA7B7B] to-[#D65A5A] rounded-lg">
                  <Fuel className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? 'Edit Fuel Log' : 'Log New Fuel Entry'}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-all duration-200"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.refuel_date}
                    onChange={(e) => setFormData({ ...formData, refuel_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Station</label>
                  <input
                    type="text"
                    placeholder="e.g., Shell, Caltex, Puma"
                    value={formData.station_name}
                    onChange={(e) => setFormData({ ...formData, station_name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Litres <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.litres}
                    onChange={(e) => setFormData({ ...formData, litres: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Cost (MWK) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Odometer (km)</label>
                  <input
                    type="number"
                    placeholder="e.g., 125000"
                    value={formData.odometer}
                    onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Driver</label>
                  <select
                    value={formData.driver_id}
                    onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent font-medium"
                  >
                    <option value="">Select Driver</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-[#EA7B7B] to-[#D65A5A] text-white rounded-lg hover:shadow-lg transition-all duration-200 font-semibold"
                >
                  {editingId ? 'Update Log' : 'Save Log'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vehicle Detail Modal */}
      {detailModalOpen && selectedVehicleForDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-gray-800 via-amber-900 to-orange-900 text-white p-6 flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white bg-opacity-15 rounded-lg backdrop-blur-sm">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-orange-200">Vehicle Details</p>
                  <h2 className="text-2xl font-bold">{selectedVehicleForDetail.registration_number}</h2>
                  <p className="text-sm text-orange-100">
                    {selectedVehicleForDetail.make} {selectedVehicleForDetail.model}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Vehicle Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Year</p>
                  <p className="text-lg font-bold text-blue-900">{selectedVehicleForDetail.year || 'N/A'}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">Current Mileage</p>
                  <p className="text-lg font-bold text-emerald-900">
                    {selectedVehicleForDetail.mileage?.toLocaleString() || 'N/A'} km
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Fuel Type</p>
                  <p className="text-lg font-bold text-amber-900">{selectedVehicleForDetail.fuel_type || 'N/A'}</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">Status</p>
                  <p className="text-lg font-bold text-purple-900 capitalize">{selectedVehicleForDetail.status || 'N/A'}</p>
                </div>
              </div>

              {/* Fuel Statistics for Selected Vehicle */}
              {stats && selectedVehicle === selectedVehicleForDetail.id && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#EA7B7B]" />
                    Fuel Consumption Statistics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-lg p-4">
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Total Fuel</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.totalLitres.toFixed(1)}L</p>
                      <p className="text-xs text-blue-600 mt-2">{fuelLogs.length} refuel records</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-lg p-4">
                      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Total Cost</p>
                      <p className="text-2xl font-bold text-emerald-900">K{stats.totalCost.toFixed(0)}</p>
                      <p className="text-xs text-emerald-600 mt-2">Avg K{stats.avgCostPerLitre.toFixed(0)}/L</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-lg p-4">
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Avg Efficiency</p>
                      <p className="text-2xl font-bold text-amber-900">{stats.avgKmPerLitre.toFixed(2)}</p>
                      <p className="text-xs text-amber-600 mt-2">km/L</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200 rounded-lg p-4">
                      <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">Distance</p>
                      <p className="text-2xl font-bold text-purple-900">{stats.totalKm.toLocaleString()}</p>
                      <p className="text-xs text-purple-600 mt-2">km</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Fuel Logs Table */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#EA7B7B]" />
                    Fuel Log History
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedVehicle(selectedVehicleForDetail.id);
                      setFormData({
                        vehicle_id: selectedVehicleForDetail.id,
                        driver_id: '',
                        litres: '',
                        cost: '',
                        station_name: '',
                        odometer: '',
                        receipt_url: '',
                        refuel_date: new Date().toISOString().slice(0, 10),
                      });
                      setDetailModalOpen(false);
                      setEditingId(null);
                      setShowModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EA7B7B] text-white rounded-lg hover:bg-[#D65A5A] transition-all text-xs font-semibold"
                  >
                    <Plus size={16} />
                    Add Fuel Log
                  </button>
                </div>
                
                {fuelLogs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Station</th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">Litres</th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">Cost</th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">Odometer</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Driver</th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {fuelLogs.map((log) => {
                          const driver = drivers.find((d) => d.id === log.driver_id);
                          return (
                            <tr key={log.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-900 font-medium">
                                {new Date(log.refuel_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </td>
                              <td className="px-4 py-3 text-gray-700">{log.station_name || '-'}</td>
                              <td className="px-4 py-3 text-right font-semibold text-gray-900">{log.litres.toFixed(2)}L</td>
                              <td className="px-4 py-3 text-right font-semibold text-gray-900">K{log.cost.toFixed(0)}</td>
                              <td className="px-4 py-3 text-right text-gray-700">
                                {log.odometer ? `${log.odometer.toLocaleString()}km` : '-'}
                              </td>
                              <td className="px-4 py-3 text-gray-700">{driver?.name || '-'}</td>
                              <td className="px-4 py-3 text-center">
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      handleEdit(log);
                                      setDetailModalOpen(false);
                                    }}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Edit"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(log.id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Fuel className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500 font-medium">No fuel logs for this vehicle yet</p>
                  </div>
                )}
              </div>

              {/* Additional Vehicle Details */}
              <div className="border-t border-gray-200 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Vehicle Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chassis Number:</span>
                      <span className="font-medium text-gray-900">{selectedVehicleForDetail.chassis_number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Engine Number:</span>
                      <span className="font-medium text-gray-900">{selectedVehicleForDetail.engine_number || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purchase Date:</span>
                      <span className="font-medium text-gray-900">
                        {selectedVehicleForDetail.purchase_date
                          ? new Date(selectedVehicleForDetail.purchase_date).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Insurance & Compliance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Insurance Expiry:</span>
                      <span className="font-medium text-gray-900">
                        {selectedVehicleForDetail.insurance_expiry
                          ? new Date(selectedVehicleForDetail.insurance_expiry).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Maintenance:</span>
                      <span className="font-medium text-gray-900">Not Available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 p-4 flex gap-3 justify-end">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
