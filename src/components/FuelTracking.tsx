import { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
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
  Search,
  AlertTriangle,
  Download,
  Truck,
  DollarSign,
  X,
  ChevronRight,
  Calendar,
  Gauge,
  Eye,
  MoreHorizontal,
} from 'lucide-react';
import {
  getFuelLogsByVehicle,
  createFuelLog,
  deleteFuelLog,
  getAllVehicles,
  getAllDrivers,
  updateFuelLog,
} from '../lib/firebaseQueries';
import { calculateFuelStats, buildVehicleBreakdown, calculateFuelAvailability, buildFuelTrendData, type VehicleFuelBreakdown } from '../lib/fuelStats';
import { filterFuelLogs } from '../lib/fuelSearch';
import { showDeleteConfirm, showErrorAlert, showSuccessAlert } from '../lib/sweetAlert';

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
  status?: string;
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
  const [vehicleScope, setVehicleScope] = useState<'all' | string>('all');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [stats, setStats] = useState<FuelStats | null>(null);
  const [fleetStats, setFleetStats] = useState<FuelStats | null>(null);
  const [vehicleBreakdown, setVehicleBreakdown] = useState<VehicleFuelBreakdown[]>([]);
  const [fuelAvailability, setFuelAvailability] = useState<{ currentFuelAvailable: number; fuelLeft: number; consumptionRate: number } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState<Vehicle | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [showPrimaryLedgerModal, setShowPrimaryLedgerModal] = useState(false);
  const [showVehicleLogBookModal, setShowVehicleLogBookModal] = useState(false);
  
  // Filter states
  const [filterType, setFilterType] = useState<'all' | 'month' | 'range'>('all');
  const [viewWindow, setViewWindow] = useState<'all' | '30' | '90'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('all');
  const [selectedStation, setSelectedStation] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [efficiencyBucket, setEfficiencyBucket] = useState<'all' | 'high' | 'average' | 'low'>('all');

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

  const fleetOverviewData = useMemo(() => {
    if (!fleetStats) return [];

    const maxValue = Math.max(fleetStats.totalLitres, fleetStats.totalCost, fleetStats.avgKmPerLitre, fleetStats.totalKm);

    return [
      {
        metric: 'Litres',
        value: (fleetStats.totalLitres / maxValue) * 100,
        rawValue: fleetStats.totalLitres,
        color: '#3b82f6',
      },
      {
        metric: 'Cost',
        value: (fleetStats.totalCost / maxValue) * 100,
        rawValue: fleetStats.totalCost,
        color: '#10b981',
      },
      {
        metric: 'Efficiency',
        value: (fleetStats.avgKmPerLitre / maxValue) * 100,
        rawValue: fleetStats.avgKmPerLitre,
        color: '#f59e0b',
      },
      {
        metric: 'Distance',
        value: (fleetStats.totalKm / maxValue) * 100,
        rawValue: fleetStats.totalKm,
        color: '#8b5cf6',
      },
    ];
  }, [fleetStats]);

  const refreshFleetOverview = async (currentVehicles: Vehicle[] = vehicles) => {
    if (!currentVehicles.length) {
      setFleetStats(null);
      setVehicleBreakdown([]);
      return;
    }

    try {
      const results = await Promise.all(currentVehicles.map((vehicle) => getFuelLogsByVehicle(vehicle.id)));
      const allLogs = results.flatMap((result) => (result.data || []) as FuelLog[]);
      setFleetStats(calculateFuelStats(allLogs));
      setVehicleBreakdown(buildVehicleBreakdown(allLogs, currentVehicles));
    } catch (err) {
      console.error('Error loading fleet fuel overview:', err);
    }
  };

  const updateFuelDisplay = (logs: FuelLog[]) => {
    calculateStats(logs);
    const selectedVehicleData = vehicles.find((vehicle) => vehicle.id === selectedVehicle);
    setFuelAvailability(calculateFuelAvailability(logs, selectedVehicleData?.mileage || 0));
  };

  // Fetch vehicles and drivers on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const vehiclesRes = await getAllVehicles();
        const driversRes = await getAllDrivers();

        const vehiclesList = vehiclesRes.data || [];
        const driversList = driversRes.data || [];

        setVehicles(vehiclesList);
        setDrivers(driversList);

        if (vehiclesList.length > 0) {
          setSelectedVehicle(vehiclesList[0].id);
          setVehicleScope('all');
          await refreshFleetOverview(vehiclesList);
        } else {
          setError('No vehicles found. Please add vehicles first.');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load initial data';
        console.error('Error loading initial data:', err);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Fetch fuel logs for the currently selected vehicle scope
  useEffect(() => {
    if (!vehicles.length) return;

    const loadFuelLogs = async () => {
      try {
        setLoading(true);
        const scopeIds = vehicleScope === 'all'
          ? vehicles.map((vehicle) => vehicle.id)
          : [vehicleScope];

        const results = await Promise.all(scopeIds.map((id) => getFuelLogsByVehicle(id)));
        const logs = results.flatMap((result) => (result.data || []) as FuelLog[]);

        setFuelLogs(logs);
        updateFuelDisplay(logs);
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load fuel logs';
        console.error('Error loading fuel logs:', err);
        setFuelLogs([]);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    loadFuelLogs();
  }, [vehicleScope, vehicles]);

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
      lastRefuel: sortedByDate[sortedByDate.length - 1] || null,
      avgKmPerLitre: parseFloat(avgKmPerLitre.toFixed(2)),
      bestKmPerLitre: parseFloat(bestKmPerLitre.toFixed(2)),
      worstKmPerLitre: parseFloat(worstKmPerLitre.toFixed(2)),
      totalKm,
      anomalies: anomalies.slice(0, 3), // Show top 3 anomalies
    });
  };

  const trendData = useMemo(() => buildFuelTrendData(fuelLogs), [fuelLogs]);
  const fleetChartData = useMemo(() => vehicleBreakdown.map((vehicle) => ({
    name: vehicle.registrationNumber,
    litres: vehicle.totalLitres,
    cost: vehicle.totalCost,
  })), [vehicleBreakdown]);

  const stationBreakdown = useMemo(() => {
    const counts = fuelLogs.reduce<Record<string, number>>((acc, log) => {
      const station = log.station_name?.trim() || 'Unspecified';
      acc[station] = (acc[station] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [fuelLogs]);

  const displayLogs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const today = new Date();

    return [...fuelLogs]
      .sort((a, b) => new Date(a.refuel_date).getTime() - new Date(b.refuel_date).getTime())
      .filter((log) => {
        const logDate = new Date(log.refuel_date);

        if (viewWindow === '30') {
          const daysAgo = new Date();
          daysAgo.setDate(today.getDate() - 30);
          if (logDate < daysAgo) return false;
        } else if (viewWindow === '90') {
          const daysAgo = new Date();
          daysAgo.setDate(today.getDate() - 90);
          if (logDate < daysAgo) return false;
        }

        if (filterType === 'month') {
          const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
          if (logDate < monthAgo) return false;
        } else if (filterType === 'range' && startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          if (logDate < start || logDate > end) return false;
        }

        if (vehicleScope !== 'all' && log.vehicle_id !== vehicleScope) return false;
        if (selectedDriver !== 'all' && log.driver_id !== selectedDriver) return false;
        if (selectedStation !== 'all' && log.station_name.toLowerCase() !== selectedStation.toLowerCase()) return false;
        if (selectedStatus !== 'all') {
          const vehicle = vehicles.find((item) => item.id === log.vehicle_id);
          if (!vehicle || (vehicle.status || 'available').toLowerCase() !== selectedStatus.toLowerCase()) return false;
        }

        if (normalizedSearch) {
          const driverName = drivers.find((driver) => driver.id === log.driver_id)?.name.toLowerCase() || '';
          const vehicleName = vehicles.find((vehicle) => vehicle.id === log.vehicle_id)?.registration_number.toLowerCase() || '';
          const haystack = [
            log.station_name,
            driverName,
            vehicleName,
            log.cost.toString(),
            log.litres.toString(),
            log.odometer.toString(),
            log.refuel_date,
          ].join(' ').toLowerCase();

          if (!haystack.includes(normalizedSearch)) return false;
        }

        if (efficiencyBucket !== 'all') {
          const sortedLogs = [...fuelLogs].sort((a, b) => new Date(a.refuel_date).getTime() - new Date(b.refuel_date).getTime());
          const index = sortedLogs.findIndex((entry) => entry.id === log.id);
          if (index <= 0) return efficiencyBucket === 'low';
          const previousLog = sortedLogs[index - 1];
          if (previousLog.odometer && log.odometer) {
            const efficiency = (log.odometer - previousLog.odometer) / log.litres;
            if (efficiencyBucket === 'high' && efficiency < 8) return false;
            if (efficiencyBucket === 'average' && (efficiency < 5 || efficiency > 9)) return false;
            if (efficiencyBucket === 'low' && efficiency >= 5) return false;
          }
        }

        return true;
      })
      .reverse();
  }, [fuelLogs, searchTerm, drivers, vehicles, filterType, viewWindow, startDate, endDate, vehicleScope, selectedDriver, selectedStation, selectedStatus, efficiencyBucket]);

  const filteredLogs = useMemo(() => displayLogs, [displayLogs]);

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
        station_name: formData.station_name || 'N/A',
        odometer: formData.odometer ? parseInt(formData.odometer) : 0,
        receipt_url: formData.receipt_url || null,
        refuel_date: formData.refuel_date,
        created_at: new Date().toISOString(),
      };

      let result;
      if (editingId) {
        result = await updateFuelLog(editingId, fuelLogData);
        if (result.error) throw new Error(result.error.message || 'Failed to update fuel log');
      } else {
        result = await createFuelLog(fuelLogData);
        if (result.error) throw new Error(result.error.message || 'Failed to create fuel log');
      }

      // Refresh the fuel logs
      const refreshResult = await getFuelLogsByVehicle(selectedVehicle);
      if (refreshResult.data) {
        setFuelLogs(refreshResult.data);
        updateFuelDisplay(refreshResult.data);
      }
      await refreshFleetOverview(vehicles);

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
      const errorMsg = err instanceof Error ? err.message : 'Failed to save fuel log';
      setError(errorMsg);
      showErrorAlert('Save failed', errorMsg);
      console.error('Error saving fuel log:', err);
    }
  };

  const handleDelete = async (logId: string) => {
    const confirmResult = await showDeleteConfirm(
      'Delete fuel log?',
      'This fuel log will be permanently deleted. This action cannot be undone.'
    );

    if (!confirmResult.isConfirmed) {
      setDeleteTargetId(null);
      return;
    }

    try {
      const result = await deleteFuelLog(logId);
      if (result.error) throw new Error(result.error.message || 'Failed to delete fuel log');

      const updatedLogs = fuelLogs.filter((log) => log.id !== logId);
      setFuelLogs(updatedLogs);
      updateFuelDisplay(updatedLogs);
      await refreshFleetOverview(vehicles);
      setDeleteTargetId(null);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete fuel log';
      setError(errorMsg);
      showErrorAlert('Delete failed', errorMsg);
      console.error('Error deleting fuel log:', err);
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
    if (filteredLogs.length === 0) {
      setError('No fuel logs to export');
      return;
    }

    const headers = ['Date', 'Station', 'Litres', 'Cost (MWK)', 'Cost/Litre', 'Odometer (km)', 'Driver', 'Km/Litre'];
    const rows = filteredLogs.map((log) => {
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

  useEffect(() => {
    if (!fuelLogs.length) {
      setStats(null);
      setFuelAvailability(null);
      return;
    }

    const selectedVehicleData = vehicles.find((vehicle) => vehicle.id === selectedVehicle);
    calculateStats(filteredLogs);
    setFuelAvailability(calculateFuelAvailability(filteredLogs, selectedVehicleData?.mileage || 0));
  }, [filteredLogs, selectedVehicle, vehicles]);

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
          <div className="flex flex-wrap gap-2">
            <button
              className="flex items-center gap-1 px-3 py-1 bg-white bg-opacity-15 text-white rounded-md hover:bg-opacity-25 transition-all font-medium text-xs backdrop-blur-sm border border-white border-opacity-20"
              title="Download report"
            >
              📊
            </button>
            <button
              onClick={() => setShowPrimaryLedgerModal(true)}
              className="flex items-center gap-1 px-3 py-1 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-all font-semibold text-xs shadow-md"
            >
              <Plus size={14} />
              Primary Ledger
            </button>
            <button
              onClick={() => setShowPrimaryLedgerModal(true)}
              className="flex items-center gap-1 px-3 py-1 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-all font-semibold text-xs shadow-md"
            >
              <Plus size={14} />
              Fuel Register
            </button>
            <button
              onClick={() => setShowVehicleLogBookModal(true)}
              className="flex items-center gap-1 px-3 py-1 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-all font-semibold text-xs shadow-md"
            >
              <Plus size={14} />
              Vehicle Log Book
            </button>
          </div>
        </div>
      </div>

      {showPrimaryLedgerModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowPrimaryLedgerModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="primary-ledger-title"
            className="w-full max-w-2xl rounded-xl border border-gray-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <div>
                <h2 id="primary-ledger-title" className="text-sm font-semibold text-gray-900">Primary Ledger</h2>
                <p className="text-xs text-gray-600">Record fuel top-up transactions</p>
              </div>
              <button
                onClick={() => setShowPrimaryLedgerModal(false)}
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close Primary Ledger"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Date of Top Up</label>
                  <input type="date" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Proof of Payment (POP)</label>
                  <input type="text" placeholder="POP reference" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Amount to Top Up</label>
                  <input type="number" placeholder="0" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">General Receipt Number</label>
                  <input type="text" placeholder="Receipt number" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Vehicle Registration Number</label>
                  <input type="text" placeholder="Registration number" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Fuel Gas Station</label>
                  <input type="text" placeholder="Station name" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Balance After Refill</label>
                  <input type="number" placeholder="0" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Driver&apos;s Name</label>
                  <input type="text" placeholder="Driver name" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Authorising Officer</label>
                  <input type="text" placeholder="Officer name" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-700">Activity (Description)</label>
                  <textarea rows={3} placeholder="Describe the top-up activity" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
                <button
                  onClick={() => setShowPrimaryLedgerModal(false)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowPrimaryLedgerModal(false);
                    showSuccessAlert('Primary Ledger', 'Fuel top-up entry saved successfully.');
                  }}
                  className="rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVehicleLogBookModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowVehicleLogBookModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="vehicle-log-book-title"
            className="w-full max-w-3xl rounded-xl border border-gray-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <div>
                <h2 id="vehicle-log-book-title" className="text-sm font-semibold text-gray-900">Vehicle Log Book</h2>
                <p className="text-xs text-gray-600">Record vehicle journey details</p>
              </div>
              <button
                onClick={() => setShowVehicleLogBookModal(false)}
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close Vehicle Log Book"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Date</label>
                  <input type="date" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Time</label>
                  <input type="time" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Authorising Officer</label>
                  <input type="text" placeholder="Officer name" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Mileage Start Up</label>
                  <input type="number" placeholder="0" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Finishing Mileage</label>
                  <input type="number" placeholder="0" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Distance Covered</label>
                  <input type="number" placeholder="0" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Type of Fuel</label>
                  <input type="text" placeholder="Fuel type" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">How Many Litres</label>
                  <input type="number" placeholder="0" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Refulants (Litres)</label>
                  <input type="number" placeholder="0" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Driver Name</label>
                  <input type="text" placeholder="Driver name" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-700">Details of the Journey (Description)</label>
                  <textarea rows={3} placeholder="Describe the journey" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Time for Completing the Journey</label>
                  <input type="time" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">
                <button
                  onClick={() => setShowVehicleLogBookModal(false)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowVehicleLogBookModal(false);
                    showSuccessAlert('Vehicle Log Book', 'Journey log entry saved successfully.');
                  }}
                  className="rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Fleet Overview */}
      {fleetStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Fleet Fuel Overview</p>
                <p className="text-xs text-gray-500">Across all tracked vehicles</p>
              </div>
              <div className="rounded-full bg-orange-100 p-2 text-orange-600">
                <Fuel size={18} />
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fleetOverviewData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="metric" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip
                    formatter={(value: number, name, props: any) => {
                      const payload = props.payload as { metric: string; rawValue: number };
                      if (payload.metric === 'Litres') return [`${payload.rawValue.toFixed(2)}L`, payload.metric];
                      if (payload.metric === 'Cost') return [`K${payload.rawValue.toFixed(0)}`, payload.metric];
                      if (payload.metric === 'Efficiency') return [`${payload.rawValue.toFixed(2)} km/L`, payload.metric];
                      return [`${payload.rawValue.toLocaleString()} km`, payload.metric];
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#EA7B7B" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="rounded-lg bg-blue-50 px-3 py-2">
                <p className="font-semibold text-blue-700">{fleetStats.totalLitres.toFixed(2)}L</p>
                <p>Total litres</p>
              </div>
              <div className="rounded-lg bg-emerald-50 px-3 py-2">
                <p className="font-semibold text-emerald-700">K{fleetStats.totalCost.toFixed(0)}</p>
                <p>Total cost</p>
              </div>
              <div className="rounded-lg bg-amber-50 px-3 py-2">
                <p className="font-semibold text-amber-700">{fleetStats.avgKmPerLitre.toFixed(2)} km/L</p>
                <p>Avg efficiency</p>
              </div>
              <div className="rounded-lg bg-purple-50 px-3 py-2">
                <p className="font-semibold text-purple-700">{fleetStats.totalKm.toLocaleString()} km</p>
                <p>Distance</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Vehicle Performance</p>
                <p className="text-xs text-gray-500">Top fuel consumers by vehicle</p>
              </div>
              <div className="rounded-full bg-gray-100 p-2 text-gray-600">
                <Truck size={18} />
              </div>
            </div>
            <div className="space-y-3">
              {vehicleBreakdown.slice(0, 4).map((vehicle) => (
                <div key={vehicle.vehicleId} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{vehicle.registrationNumber}</p>
                    <p className="text-xs text-gray-500">{vehicle.make} {vehicle.model}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{vehicle.totalLitres.toFixed(1)}L</p>
                    <p className="text-xs text-gray-500">{vehicle.refuelCount} refuels</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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

            {/* Current Fuel Available Card */}
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100/50 border border-cyan-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-cyan-500" />
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700 opacity-85">Current Fuel Available</p>
                  <p className="text-2xl font-bold text-cyan-900 mt-2">{fuelAvailability?.currentFuelAvailable.toFixed(2) || '0.00'}L</p>
                  <p className="text-xs text-cyan-600 mt-2 font-medium">Estimated from latest refill</p>
                </div>
                <div className="bg-cyan-100 p-2.5 rounded-lg group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                  <Gauge className="w-5 h-5 text-cyan-600" />
                </div>
              </div>
            </div>

            {/* Fuel Left Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-indigo-500" />
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700 opacity-85">Fuel Left</p>
                  <p className="text-2xl font-bold text-indigo-900 mt-2">{fuelAvailability?.fuelLeft.toFixed(2) || '0.00'}L</p>
                  <p className="text-xs text-indigo-600 mt-2 font-medium">Approx. remaining balance</p>
                </div>
                <div className="bg-indigo-100 p-2.5 rounded-lg group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                  <Fuel className="w-5 h-5 text-indigo-600" />
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

      {selectedVehicle && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Selected Vehicle Snapshot</p>
              <p className="text-xs text-gray-500">Focused fuel view for the currently chosen vehicle</p>
            </div>
            <div className="rounded-full bg-blue-100 p-2 text-blue-600">
              <Gauge size={18} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Vehicle</p>
              <p className="text-sm font-semibold text-gray-900">
                {vehicles.find((vehicle) => vehicle.id === selectedVehicle)?.registration_number || 'Selected vehicle'}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Latest refuel</p>
              <p className="text-sm font-semibold text-gray-900">{stats?.lastRefuel ? new Date(stats.lastRefuel.refuel_date).toLocaleDateString() : 'No data'}</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Consumption trend</p>
              <p className="text-sm font-semibold text-gray-900">{stats?.avgKmPerLitre ? `${stats.avgKmPerLitre.toFixed(2)} km/L` : 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Fuel Trend</p>
              <p className="text-xs text-gray-500">Recent refuels for the selected vehicle</p>
            </div>
            <div className="rounded-full bg-orange-100 p-2 text-orange-600">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="fuelGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EA7B7B" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#EA7B7B" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `${value.toFixed(1)} L`} />
                <Area type="monotone" dataKey="litres" stroke="#EA7B7B" fill="url(#fuelGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Fleet Comparison</p>
              <p className="text-xs text-gray-500">Fuel usage and spend across vehicles</p>
            </div>
            <div className="rounded-full bg-blue-100 p-2 text-blue-600">
              <Truck size={18} />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fleetChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="litres" fill="#EA7B7B" radius={[6, 6, 0, 0]} />
                <Bar dataKey="cost" fill="#F59E0B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_0.9fr] gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Fuel Operations Filters</p>
              <p className="text-xs text-gray-500">Slice the page by time, driver, station and efficiency</p>
            </div>
            <div className="rounded-full bg-gray-100 p-2 text-gray-600">
              <Filter size={18} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { setFilterType('all'); setViewWindow('all'); }} className={`rounded-full px-3 py-1.5 text-sm font-medium ${filterType === 'all' && viewWindow === 'all' ? 'bg-[#EA7B7B] text-white' : 'bg-gray-100 text-gray-700'}`}>
                All time
              </button>
              <button onClick={() => { setFilterType('month'); setViewWindow('all'); }} className={`rounded-full px-3 py-1.5 text-sm font-medium ${filterType === 'month' ? 'bg-[#EA7B7B] text-white' : 'bg-gray-100 text-gray-700'}`}>
                Last month
              </button>
              <button onClick={() => { setFilterType('range'); setViewWindow('all'); }} className={`rounded-full px-3 py-1.5 text-sm font-medium ${filterType === 'range' ? 'bg-[#EA7B7B] text-white' : 'bg-gray-100 text-gray-700'}`}>
                Custom range
              </button>
              <button onClick={() => setViewWindow('30')} className={`rounded-full px-3 py-1.5 text-sm font-medium ${viewWindow === '30' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                30 days
              </button>
              <button onClick={() => setViewWindow('90')} className={`rounded-full px-3 py-1.5 text-sm font-medium ${viewWindow === '90' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                90 days
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-sm font-medium text-gray-700">
                <span className="mb-1 block">Vehicle / Registry</span>
                <select value={vehicleScope} onChange={(e) => setVehicleScope(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#EA7B7B]">
                  <option value="all">All vehicles</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>{vehicle.registration_number}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-gray-700">
                <span className="mb-1 block">Vehicle status</span>
                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#EA7B7B]">
                  <option value="all">All statuses</option>
                  <option value="available">Available</option>
                  <option value="in_use">In use</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="broken">Broken</option>
                  <option value="disposed">Disposed</option>
                </select>
              </label>
              <label className="text-sm font-medium text-gray-700">
                <span className="mb-1 block">Driver</span>
                <select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#EA7B7B]">
                  <option value="all">All drivers</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>{driver.name}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-gray-700">
                <span className="mb-1 block">Station</span>
                <select value={selectedStation} onChange={(e) => setSelectedStation(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#EA7B7B]">
                  <option value="all">All stations</option>
                  {[...new Set(fuelLogs.map((log) => log.station_name).filter(Boolean))].map((station) => (
                    <option key={station} value={station}>{station}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-gray-700">
                <span className="mb-1 block">Efficiency band</span>
                <select value={efficiencyBucket} onChange={(e) => setEfficiencyBucket(e.target.value as 'all' | 'high' | 'average' | 'low')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#EA7B7B]">
                  <option value="all">All efficiencies</option>
                  <option value="high">High efficiency</option>
                  <option value="average">Average efficiency</option>
                  <option value="low">Low efficiency</option>
                </select>
              </label>
              <button onClick={() => { setFilterType('all'); setViewWindow('all'); setVehicleScope('all'); setSelectedDriver('all'); setSelectedStation('all'); setSelectedStatus('all'); setEfficiencyBucket('all'); setSearchTerm(''); setStartDate(''); setEndDate(''); }} className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Search size={16} />
                Reset filters
              </button>
            </div>

            {filterType === 'range' && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                <span className="text-sm text-gray-600">to</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Station mix</p>
              <p className="text-xs text-gray-500">Where refuels happen most often</p>
            </div>
            <div className="rounded-full bg-orange-100 p-2 text-orange-600">
              <MapPin size={18} />
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stationBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {stationBreakdown.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={['#EA7B7B', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-2">
            {stationBreakdown.slice(0, 4).map((entry) => (
              <div key={entry.name} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
                <span className="font-medium text-gray-700">{entry.name}</span>
                <span className="font-semibold text-gray-900">{entry.value} fills</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Header with Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Showing <span className="text-[#EA7B7B]">{filteredLogs.length}</span> of{' '}
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
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by station, driver, vehicle, cost, litres, date or odometer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-4 text-sm font-medium text-gray-700 placeholder:text-gray-500 focus:border-transparent focus:ring-2 focus:ring-[#EA7B7B]"
            />
          </div>

          {/* Filter Options */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                filterType === 'all'
                  ? 'bg-gradient-to-r from-[#EA7B7B] to-[#D65A5A] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Logs
            </button>
            <button
              onClick={() => setFilterType('month')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                filterType === 'month'
                  ? 'bg-gradient-to-r from-[#EA7B7B] to-[#D65A5A] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => setFilterType('range')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                filterType === 'range'
                  ? 'bg-gradient-to-r from-[#EA7B7B] to-[#D65A5A] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Date Range
            </button>
          </div>
        </div>
      </div>

      {/* Fuel Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {filteredLogs.length > 0 ? (
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
                {filteredLogs.map((log, idx) => {
                  const driver = drivers.find((d) => d.id === log.driver_id);
                  const vehicle = vehicles.find((v) => v.id === log.vehicle_id);
                  const costPerLitre = log.litres > 0 ? log.cost / log.litres : 0;
                  
                  let kml = '-';
                  let efficiencyStatus = '';
                  let efficiencyBg = '';
                  const previousLog = filteredLogs[idx + 1];
                  if (previousLog && log.odometer && previousLog.odometer) {
                    const kmDriven = log.odometer - previousLog.odometer;
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
                      <td className={`px-6 py-4 text-sm font-bold text-gray-700 ${efficiencyStatus} ${efficiencyBg ? efficiencyBg + ' rounded' : ''}`}>
                        {kml !== '-' ? `${kml} km/L` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">{driver?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleEdit(log)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-150"
                            title="Edit fuel log"
                            aria-label="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(log.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-150"
                            title="Delete fuel log"
                            aria-label="Delete"
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
            <div className="sticky top-0 bg-gradient-to-r from-[#44444E] to-[#2E2E33] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-100">Vehicle Details</p>
                  <h2 className="text-2xl font-bold text-white">{selectedVehicleForDetail.registration_number}</h2>
                  <p className="text-sm text-gray-300">
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
                                <div className="relative flex justify-center">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenActionMenuId(openActionMenuId === log.id ? null : log.id);
                                    }}
                                    className="p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-full transition-colors"
                                    title="More actions"
                                    aria-label="More actions"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>

                                  {openActionMenuId === log.id && (
                                    <div className="absolute right-0 top-8 z-10 w-36 rounded-lg border border-gray-200 bg-white shadow-lg">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEdit(log);
                                          setDetailModalOpen(false);
                                          setOpenActionMenuId(null);
                                        }}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                      >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenActionMenuId(null);
                                          handleDelete(log.id);
                                        }}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                      </button>
                                    </div>
                                  )}
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
