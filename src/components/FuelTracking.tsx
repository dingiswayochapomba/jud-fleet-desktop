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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Fuel className="w-8 h-8 text-[#EA7B7B]" />
            Fuel Tracking
          </h1>
          <p className="text-gray-600 mt-1">Monitor fuel consumption and costs</p>
        </div>
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
          className="px-4 py-2 bg-[#EA7B7B] text-white rounded-lg hover:bg-[#D65A5A] transition-colors duration-200 flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Log Fuel
        </button>
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
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Vehicle</label>
        <select
          value={selectedVehicle}
          onChange={(e) => setSelectedVehicle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <p className="text-sm text-gray-600 font-medium">Total Litres</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalLitres.toFixed(2)}L</p>
              <p className="text-xs text-gray-500 mt-2">Across {fuelLogs.length} logs</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <p className="text-sm text-gray-600 font-medium">Total Cost</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">K{stats.totalCost.toFixed(0)}</p>
              <p className="text-xs text-gray-500 mt-2">Avg K{stats.avgCostPerLitre.toFixed(0)}/L</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <p className="text-sm text-gray-600 font-medium flex items-center gap-1">
                <Zap className="w-4 h-4 text-[#EA7B7B]" />
                Fuel Efficiency
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.avgKmPerLitre.toFixed(2)} km/L</p>
              <p className="text-xs text-gray-500 mt-2">Total: {stats.totalKm.toLocaleString()} km</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <p className="text-sm text-gray-600 font-medium flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Best vs Worst
              </p>
              <p className="text-sm font-bold text-gray-900 mt-2">
                Best: {stats.bestKmPerLitre.toFixed(2)} km/L
              </p>
              <p className="text-sm font-bold text-red-600 mt-1">
                Worst: {stats.worstKmPerLitre.toFixed(2)} km/L
              </p>
            </div>
          </div>

          {/* Anomalies Alert */}
          {stats.anomalies.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-yellow-900">Consumption Anomalies Detected</h3>
                <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                  {stats.anomalies.map((anomaly, idx) => (
                    <li key={idx}>• {anomaly}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}

      {/* Table Header with Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">
              Showing <span className="font-medium">{sortedLogs.length}</span> of{' '}
              <span className="font-medium">{fuelLogs.length}</span> logs
            </span>
          </div>
          <button
            onClick={exportToCSV}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Search Bar */}
        <div>
          <input
            type="text"
            placeholder="Search by station, driver, cost, or litres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent text-sm"
          />
        </div>

        {/* Filter Options */}
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Filter:</label>
          </div>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-[#EA7B7B] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Logs
          </button>
          <button
            onClick={() => setFilterType('month')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'month'
                ? 'bg-[#EA7B7B] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => setFilterType('range')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'range'
                ? 'bg-[#EA7B7B] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Date Range
          </button>

          {filterType === 'range' && (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#EA7B7B]"
              />
              <span className="text-gray-400 self-center">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#EA7B7B]"
              />
            </>
          )}
        </div>
      </div>

      {/* Fuel Logs Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {sortedLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Station</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Litres</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Cost/L</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Odometer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Efficiency</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Driver</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedLogs.map((log, idx) => {
                  const driver = drivers.find((d) => d.id === log.driver_id);
                  const costPerLitre = log.litres > 0 ? log.cost / log.litres : 0;
                  
                  // Calculate km/L for this entry
                  let kml = '-';
                  let efficiencyStatus = '';
                  if (idx > 0 && log.odometer && sortedLogs[idx - 1].odometer) {
                    const kmDriven = log.odometer - sortedLogs[idx - 1].odometer;
                    const calculatedKml = kmDriven / log.litres;
                    if (calculatedKml > 0 && calculatedKml < 100) {
                      kml = calculatedKml.toFixed(2);
                      if (stats?.avgKmPerLitre) {
                        if (calculatedKml > stats.avgKmPerLitre * 1.2) {
                          efficiencyStatus = 'text-green-600 font-semibold';
                        } else if (calculatedKml < stats.avgKmPerLitre * 0.8) {
                          efficiencyStatus = 'text-red-600 font-semibold';
                        }
                      }
                    }
                  }

                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {new Date(log.refuel_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {log.station_name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{log.litres.toFixed(2)}L</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">K{log.cost.toFixed(0)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">K{costPerLitre.toFixed(0)}/L</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {log.odometer ? `${log.odometer.toLocaleString()}km` : '-'}
                      </td>
                      <td className={`px-6 py-4 text-sm ${efficiencyStatus}`}>
                        {kml !== '-' ? `${kml} km/L` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{driver?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(log)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(log.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
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
          <div className="text-center py-12">
            <Fuel className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No fuel logs yet</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Fuel Log' : 'New Fuel Log'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={formData.refuel_date}
                    onChange={(e) => setFormData({ ...formData, refuel_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Station</label>
                  <input
                    type="text"
                    placeholder="e.g., Shell"
                    value={formData.station_name}
                    onChange={(e) => setFormData({ ...formData, station_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Litres *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.litres}
                    onChange={(e) => setFormData({ ...formData, litres: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost (MWK) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Odometer (km)</label>
                  <input
                    type="number"
                    value={formData.odometer}
                    onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                  <select
                    value={formData.driver_id}
                    onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
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

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#EA7B7B] text-white rounded-lg hover:bg-[#D65A5A] transition-colors font-medium"
                >
                  {editingId ? 'Update' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
