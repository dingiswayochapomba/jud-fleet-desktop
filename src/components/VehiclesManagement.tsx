import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, X, AlertCircle, Truck, TrendingUp, Calendar, Zap, AlertTriangle, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getAllVehicles, createVehicle, updateVehicle, deleteVehicle } from '../lib/supabaseQueries';

interface Vehicle {
  id: string;
  registration_number: string;
  make: string;
  model: string;
  year: number;
  status: 'available' | 'in_use' | 'maintenance' | 'broken' | 'disposed';
  mileage: number;
  fuel_type: string;
  chassis_number: string;
  engine_number: string;
  purchase_date: string;
  insurance_expiry: string;
  created_at: string;
}

const statusColors: { [key: string]: { bg: string; text: string; border: string; badge: string } } = {
  available: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800' },
  in_use: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800' },
  maintenance: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800' },
  broken: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', badge: 'bg-red-100 text-red-800' },
  disposed: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-800' },
};

function VehiclesManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'registration' | 'mileage' | 'year' | 'status'>('registration');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    registration_number: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    status: 'available',
    mileage: 0,
    fuel_type: 'diesel',
    chassis_number: '',
    engine_number: '',
    purchase_date: '',
    insurance_expiry: '',
  });

  // Load vehicles on mount (only once)
  useEffect(() => {
    let isMounted = true;
    
    const loadVehiclesOnce = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await getAllVehicles();
        if (isMounted) {
          if (err) {
            setError(err.message);
          } else {
            setVehicles(data || []);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load vehicles');
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadVehiclesOnce();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddVehicle = () => {
    setFormData({
      registration_number: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      status: 'available',
      mileage: 0,
      fuel_type: 'diesel',
      chassis_number: '',
      engine_number: '',
      purchase_date: '',
      insurance_expiry: '',
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setFormData({
      registration_number: vehicle.registration_number,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      status: vehicle.status,
      mileage: vehicle.mileage,
      fuel_type: vehicle.fuel_type,
      chassis_number: vehicle.chassis_number,
      engine_number: vehicle.engine_number,
      purchase_date: vehicle.purchase_date,
      insurance_expiry: vehicle.insurance_expiry,
    });
    setEditingId(vehicle.id);
    setShowForm(true);
  };

  const handleSaveVehicle = async () => {
    if (!formData.registration_number || !formData.make || !formData.model) {
      setError('Please fill in required fields: Registration, Make, and Model');
      return;
    }

    try {
      if (editingId) {
        const { error: err } = await updateVehicle(editingId, formData);
        if (err) {
          setError(err.message);
          return;
        }
        // Update vehicle in state
        setVehicles(vehicles.map(v => v.id === editingId ? {
          ...v,
          ...formData,
          status: formData.status as 'available' | 'in_use' | 'maintenance' | 'broken' | 'disposed',
        } : v));
      } else {
        const { error: err } = await createVehicle(formData);
        if (err) {
          setError(err.message);
          return;
        }
        // Add new vehicle to state
        const newVehicle: Vehicle = {
          id: Date.now().toString(),
          ...formData,
          status: formData.status as 'available' | 'in_use' | 'maintenance' | 'broken' | 'disposed',
          created_at: new Date().toISOString(),
        };
        setVehicles([...vehicles, newVehicle]);
      }
      setShowForm(false);
      setEditingId(null);
      setError(null);
    } catch (err) {
      setError('Failed to save vehicle');
      console.error(err);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    try {
      const { error: err } = await deleteVehicle(id);
      if (err) {
        setError(err.message);
        return;
      }
      // Remove vehicle from state
      setVehicles(vehicles.filter(v => v.id !== id));
      setDeleteConfirm(null);
      setError(null);
    } catch (err) {
      setError('Failed to delete vehicle');
      console.error(err);
    }
  };

  const filteredVehicles = (filterStatus === 'all' 
    ? vehicles 
    : vehicles.filter(v => v.status === filterStatus)
  ).filter(v => 
    v.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    let compareValue = 0;
    switch (sortBy) {
      case 'mileage':
        compareValue = a.mileage - b.mileage;
        break;
      case 'year':
        compareValue = a.year - b.year;
        break;
      case 'status':
        compareValue = a.status.localeCompare(b.status);
        break;
      default:
        compareValue = a.registration_number.localeCompare(b.registration_number);
    }
    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  const viewingVehicle = vehicles.find(v => v.id === viewingId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header Section with Advanced Controls */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl p-4 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <BarChart3 size={28} />
              Fleet Vehicles
            </h2>
            <p className="text-blue-100 text-xs">Manage and track your entire vehicle inventory in real-time</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              className="flex items-center gap-2 px-3 py-1.5 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all font-medium text-xs backdrop-blur-sm border border-white border-opacity-30"
              title="Export report"
            >
              ↓
              Export
            </button>
            <button
              onClick={handleAddVehicle}
              className="flex items-center gap-2 px-6 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Add Vehicle
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Advanced KPI Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
        {/* Fleet Health */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-2.5 border border-green-200 shadow-sm">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase">Fleet Health</p>
              <p className="text-xl font-bold text-green-600 mt-0.5">
                {vehicles.length > 0 ? Math.round(((vehicles.length - vehicles.filter(v => v.status === 'broken' || v.status === 'maintenance').length) / vehicles.length) * 100) : 0}%
              </p>
            </div>
            <div className="p-1.5 bg-green-100 rounded-lg">
              <TrendingUp size={16} className="text-green-600" />
            </div>
          </div>
          <div className="flex gap-1 text-xs">
            <span className="px-2 py-1 bg-green-200 text-green-800 rounded">Operational</span>
          </div>
        </div>

        {/* Cost Impact */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-2.5 border border-purple-200 shadow-sm">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase">Maintenance</p>
              <p className="text-xl font-bold text-purple-600 mt-0.5">
                {vehicles.filter(v => v.status === 'maintenance' || v.status === 'broken').length}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <AlertTriangle size={18} className="text-purple-600" />
            </div>
          </div>
          <div className="flex gap-1 text-xs">
            <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded">Attention</span>
          </div>
        </div>

        {/* Total Mileage */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3.5 border border-orange-200 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase">Total Mileage</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {vehicles.length > 0 ? (vehicles.reduce((sum, v) => sum + v.mileage, 0) / 1000000).toFixed(1) : 0}M
              </p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp size={18} className="text-orange-600" />
            </div>
          </div>
          <div className="flex gap-1 text-xs">
            <span className="px-2 py-1 bg-orange-200 text-orange-800 rounded">km</span>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-3.5 border border-red-200 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase">Expiring</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {vehicles.filter(v => {
                  const exp = new Date(v.insurance_expiry);
                  const today = new Date();
                  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                  return exp <= in30Days && exp >= today;
                }).length}
              </p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <Calendar size={18} className="text-red-600" />
            </div>
          </div>
          <div className="flex gap-1 text-xs">
            <span className="px-2 py-1 bg-red-200 text-red-800 rounded">30 days</span>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Total Vehicles */}
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-gray-600 font-medium">Total</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{vehicles.length}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck size={16} className="text-blue-600" />
            </div>
          </div>
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Available */}
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-gray-600 font-medium">Available</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">{vehicles.filter(v => v.status === 'available').length}</p>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp size={16} className="text-emerald-600" />
            </div>
          </div>
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600" style={{ width: `${(vehicles.filter(v => v.status === 'available').length / vehicles.length) * 100}%` }}></div>
          </div>
        </div>

        {/* In Use */}
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-gray-600 font-medium">In Use</p>
              <p className="text-xl font-bold text-blue-600 mt-1">{vehicles.filter(v => v.status === 'in_use').length}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap size={16} className="text-blue-600" />
            </div>
          </div>
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600" style={{ width: `${(vehicles.filter(v => v.status === 'in_use').length / vehicles.length) * 100}%` }}></div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-gray-600 font-medium">Maintenance</p>
              <p className="text-xl font-bold text-amber-600 mt-1">{vehicles.filter(v => v.status === 'maintenance').length}</p>
            </div>
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle size={16} className="text-amber-600" />
            </div>
          </div>
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-amber-600" style={{ width: `${(vehicles.filter(v => v.status === 'maintenance').length / vehicles.length) * 100}%` }}></div>
          </div>
        </div>

        {/* Broken */}
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-gray-600 font-medium">Broken</p>
              <p className="text-xl font-bold text-red-600 mt-1">{vehicles.filter(v => v.status === 'broken').length}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle size={16} className="text-red-600" />
            </div>
          </div>
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-red-600" style={{ width: `${(vehicles.filter(v => v.status === 'broken').length / vehicles.length) * 100}%` }}></div>
          </div>
        </div>

        {/* Avg Mileage */}
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-gray-600 font-medium">Avg Mileage</p>
              <p className="text-xl font-bold text-purple-600 mt-1">
                {vehicles.length > 0 ? Math.round(vehicles.reduce((sum, v) => sum + v.mileage, 0) / vehicles.length / 1000) : 0}k
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp size={16} className="text-purple-600" />
            </div>
          </div>
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-purple-600" style={{ width: '65%' }}></div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <input
              type="text"
              placeholder="Search registration, make, model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-gray-50 text-sm"
            />
            <svg className="absolute left-3 top-3 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-gray-50 text-sm font-medium"
            >
              <option value="registration">Sort by: Registration</option>
              <option value="mileage">Sort by: Mileage</option>
              <option value="year">Sort by: Year</option>
              <option value="status">Sort by: Status</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 bg-gray-50 transition-colors text-sm font-medium"
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-1.5">
          {['all', 'available', 'in_use', 'maintenance', 'broken', 'disposed'].map(status => {
            const labels = {
              all: 'All Vehicles',
              available: 'Available',
              in_use: 'In Use',
              maintenance: 'Maintenance',
              broken: 'Broken',
              disposed: 'Disposed',
            };
            const isActive = filterStatus === status;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-full font-medium transition-all text-xs ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {labels[status as keyof typeof labels]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Insurance Expiry Alert */}
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">Insurance Expiry Timeline</h4>
              <p className="text-xs text-gray-600 mt-0.5">Vehicles by expiry period</p>
            </div>
            <div className="p-1.5 bg-orange-100 rounded-lg">
              <Calendar size={14} className="text-orange-600" />
            </div>
          </div>
          <div className="w-full h-28">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: 'Expired',
                    count: vehicles.filter(v => new Date(v.insurance_expiry) < new Date()).length,
                    fill: '#dc2626'
                  },
                  {
                    name: '0-15 days',
                    count: vehicles.filter(v => {
                      const exp = new Date(v.insurance_expiry);
                      const today = new Date();
                      const in15Days = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
                      return exp > today && exp <= in15Days;
                    }).length,
                    fill: '#f97316'
                  },
                  {
                    name: '15-30 days',
                    count: vehicles.filter(v => {
                      const exp = new Date(v.insurance_expiry);
                      const today = new Date();
                      const in15Days = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
                      const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                      return exp > in15Days && exp <= in30Days;
                    }).length,
                    fill: '#eab308'
                  },
                  {
                    name: '30+ days',
                    count: vehicles.filter(v => {
                      const exp = new Date(v.insurance_expiry);
                      const today = new Date();
                      const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                      return exp > in30Days;
                    }).length,
                    fill: '#16a34a'
                  }
                ]}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                  formatter={(value) => `${value} vehicles`}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {[
                    { name: 'Expired', fill: '#dc2626' },
                    { name: '0-15 days', fill: '#f97316' },
                    { name: '15-30 days', fill: '#eab308' },
                    { name: '30+ days', fill: '#16a34a' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fuel Type Distribution */}
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">Fuel Types</h4>
              <p className="text-xs text-gray-600 mt-0.5">Fleet composition</p>
            </div>
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Zap size={14} className="text-blue-600" />
            </div>
          </div>
          <div className="w-full h-28">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={['diesel', 'petrol', 'hybrid', 'electric']
                    .map(fuel => ({
                      name: fuel.charAt(0).toUpperCase() + fuel.slice(1),
                      value: vehicles.filter(v => v.fuel_type === fuel).length,
                    }))
                    .filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }: any) => `${name} ${value} (${((percent || 0) * 100).toFixed(0)}%)`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#2563eb" />
                  <Cell fill="#dc2626" />
                  <Cell fill="#16a34a" />
                  <Cell fill="#7c3aed" />
                </Pie>
                <Tooltip 
                  formatter={(value) => `${value} vehicles`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Vehicles Table */}
      {filteredVehicles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <div className="text-gray-400 mb-4">
            <Truck size={48} className="mx-auto opacity-50" />
          </div>
          <p className="text-gray-500 text-lg font-medium">No vehicles found</p>
          <p className="text-gray-400 text-sm mt-1">
            {searchTerm ? 'Try adjusting your search terms' : 'Add your first vehicle to get started'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleAddVehicle}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
            >
              Add Vehicle
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                  <th className="px-4 py-1.5 text-left font-semibold text-gray-900 text-xs">Reg.</th>
                  <th className="px-4 py-1.5 text-left font-semibold text-gray-900 text-xs">Vehicle</th>
                  <th className="px-4 py-1.5 text-left font-semibold text-gray-900 text-xs">Yr</th>
                  <th className="px-4 py-1.5 text-left font-semibold text-gray-900 text-xs">Mileage</th>
                  <th className="px-4 py-1.5 text-left font-semibold text-gray-900 text-xs">Fuel</th>
                  <th className="px-4 py-1.5 text-left font-semibold text-gray-900 text-xs">Ins. Exp</th>
                  <th className="px-4 py-1.5 text-left font-semibold text-gray-900 text-xs">Status</th>
                  <th className="px-4 py-1.5 text-center font-semibold text-gray-900 text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((vehicle, idx) => {
                  const insuranceExpired = new Date(vehicle.insurance_expiry) < new Date();
                  const insuranceExpiringSoon = new Date(vehicle.insurance_expiry) < new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
                  
                  return (
                    <tr 
                      key={vehicle.id} 
                      className={`border-b border-gray-200 transition-colors duration-150 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-blue-50`}
                    >
                      <td className="px-4 py-2 font-semibold text-gray-900">{vehicle.registration_number}</td>
                      <td className="px-4 py-2 text-gray-700">{vehicle.make} <span className="font-medium">{vehicle.model}</span></td>
                      <td className="px-4 py-2 text-gray-700">{vehicle.year}</td>
                      <td className="px-4 py-2 text-gray-700 font-medium">{(vehicle.mileage / 1000).toFixed(0)}k km</td>
                      <td className="px-4 py-2">
                        <span className="inline-block px-1.5 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800 capitalize">
                          {vehicle.fuel_type}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1">
                          <span className={`text-xs font-semibold ${insuranceExpired ? 'text-red-600' : insuranceExpiringSoon ? 'text-orange-600' : 'text-green-600'}`}>
                            {new Date(vehicle.insurance_expiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          {insuranceExpired && <AlertTriangle size={12} className="text-red-600" />}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColors[vehicle.status].badge}`}>
                          {vehicle.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            onClick={() => setViewingId(vehicle.id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors duration-200"
                            title="View details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleEditVehicle(vehicle)}
                            className="p-1.5 text-amber-600 hover:bg-amber-100 rounded transition-colors duration-200"
                            title="Edit vehicle"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(vehicle.id)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors duration-200"
                            title="Delete vehicle"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 flex justify-between">
            <span>Showing <span className="font-semibold">{filteredVehicles.length}</span> of <span className="font-semibold">{vehicles.length}</span> vehicles</span>
            <span className="text-gray-500">Total Mileage: <span className="font-semibold">{Math.round(filteredVehicles.reduce((sum, v) => sum + v.mileage, 0) / 1000)}k km</span></span>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingId ? '✏️ Edit Vehicle' : '➕ Add New Vehicle'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {editingId ? 'Update vehicle information' : 'Add a new vehicle to your fleet'}
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Registration Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Registration Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.registration_number}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white hover:border-gray-400 transition-colors"
                    placeholder="e.g., JJ-16-AB"
                  />
                </div>

                {/* Make */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Make <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white hover:border-gray-400 transition-colors"
                    placeholder="e.g., Toyota"
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white hover:border-gray-400 transition-colors"
                    placeholder="e.g., Land Cruiser"
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white hover:border-gray-400 transition-colors"
                    placeholder="e.g., 2020"
                  />
                </div>

                {/* Mileage */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Mileage (km)
                  </label>
                  <input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white hover:border-gray-400 transition-colors"
                    placeholder="e.g., 50000"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white hover:border-gray-400 transition-colors"
                  >
                    <option value="available">Available</option>
                    <option value="in_use">In Use</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="broken">Broken</option>
                    <option value="disposed">Disposed</option>
                  </select>
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Fuel Type
                  </label>
                  <select
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white hover:border-gray-400 transition-colors"
                  >
                    <option value="diesel">Diesel</option>
                    <option value="petrol">Petrol</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="electric">Electric</option>
                  </select>
                </div>

                {/* Chassis Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Chassis Number
                  </label>
                  <input
                    type="text"
                    value={formData.chassis_number}
                    onChange={(e) => setFormData({ ...formData, chassis_number: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white hover:border-gray-400 transition-colors"
                    placeholder="VIN"
                  />
                </div>

                {/* Engine Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Engine Number
                  </label>
                  <input
                    type="text"
                    value={formData.engine_number}
                    onChange={(e) => setFormData({ ...formData, engine_number: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white hover:border-gray-400 transition-colors"
                  />
                </div>

                {/* Purchase Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white hover:border-gray-400 transition-colors"
                  />
                </div>

                {/* Insurance Expiry */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Insurance Expiry
                  </label>
                  <input
                    type="date"
                    value={formData.insurance_expiry}
                    onChange={(e) => setFormData({ ...formData, insurance_expiry: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white hover:border-gray-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVehicle}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                {editingId ? 'Update Vehicle' : 'Add Vehicle'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl">
            <div className="flex items-start justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-gray-50">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {viewingVehicle.registration_number}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {viewingVehicle.make} {viewingVehicle.model}
                </p>
              </div>
              <button
                onClick={() => setViewingId(null)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${statusColors[viewingVehicle.status].badge}`}>
                  {viewingVehicle.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-2">
                    Make & Model
                  </label>
                  <p className="text-gray-900 font-semibold text-lg">{viewingVehicle.make} {viewingVehicle.model}</p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-2">
                    Year
                  </label>
                  <p className="text-gray-900 font-semibold text-lg">{viewingVehicle.year}</p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-2">
                    Fuel Type
                  </label>
                  <p className="text-gray-900 font-semibold text-lg capitalize">{viewingVehicle.fuel_type}</p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-2">
                    Mileage
                  </label>
                  <p className="text-gray-900 font-semibold text-lg">{viewingVehicle.mileage.toLocaleString()} km</p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-2">
                    Chassis Number
                  </label>
                  <p className="text-gray-900 font-semibold">{viewingVehicle.chassis_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-2">
                    Engine Number
                  </label>
                  <p className="text-gray-900 font-semibold">{viewingVehicle.engine_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-2">
                    Purchase Date
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {viewingVehicle.purchase_date ? new Date(viewingVehicle.purchase_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-2">
                    Insurance Expiry
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {viewingVehicle.insurance_expiry ? new Date(viewingVehicle.insurance_expiry).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide font-bold text-gray-600 mb-2">
                    Added On
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {new Date(viewingVehicle.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setViewingId(null);
                  setDeleteConfirm(viewingVehicle.id);
                }}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium flex items-center gap-2"
              >
                <Trash2 size={18} />
                Delete
              </button>
              <button
                onClick={() => handleEditVehicle(viewingVehicle)}
                className="px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200 font-medium flex items-center gap-2"
              >
                <Edit2 size={18} />
                Edit
              </button>
              <button
                onClick={() => setViewingId(null)}
                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Delete Vehicle</h3>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this vehicle? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteVehicle(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VehiclesManagement;
