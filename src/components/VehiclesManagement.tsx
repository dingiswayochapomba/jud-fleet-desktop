import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, X, AlertCircle, Truck, BarChart3, Search, CheckCircle, Activity, Wrench, AlertTriangle, Recycle, MoreVertical } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getAllVehicles, createVehicle, updateVehicle, deleteVehicle } from '../lib/firebaseQueries';

// ============= INTERFACES =============
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

// ============= CONSTANTS =============
const statusColors: { [key: string]: { bg: string; text: string; border: string; badge: string; chart: string } } = {
  available: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800', chart: '#10b981' },
  in_use: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800', chart: '#3b82f6' },
  maintenance: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800', chart: '#f59e0b' },
  broken: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', badge: 'bg-red-100 text-red-800', chart: '#ef4444' },
  disposed: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-800', chart: '#6b7280' },
};

const fuelTypes = ['diesel', 'petrol', 'hybrid', 'electric'];
const statuses = ['available', 'in_use', 'maintenance', 'broken', 'disposed'];

// ============= MAIN COMPONENT =============
export default function VehiclesManagement() {
  // ===== STATE DECLARATIONS =====
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [vehicleCount, setVehicleCount] = useState<number | null>(null);
  const [vehicleImages, setVehicleImages] = useState<{ [key: string]: string[] }>({});
  const [detailsTab, setDetailsTab] = useState<'info' | 'images'>('info');

  const [formData, setFormData] = useState<Partial<Vehicle>>({
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

  // ===== LOAD VEHICLES ON MOUNT =====
  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const loadVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('📡 Fetching vehicles from database...');

        const { data, error: err } = await getAllVehicles();

        console.log('📊 Query result - isMounted:', isMounted, 'data length:', data?.length);

        if (!isMounted) {
          console.log('⚠️ Component unmounted, skipping state updates');
          return;
        }

        if (err) {
          console.error('❌ Error loading vehicles:', err);
          const errorMsg = err?.message || String(err);
          
          if (errorMsg.includes('new row violates') || errorMsg.includes('denied') || errorMsg.includes('policy') || errorMsg.includes('PGRST')) {
            setError(`Database access denied - RLS policies may need adjustment. Error: ${errorMsg}`);
          } else {
            setError(`Failed to load vehicles: ${errorMsg}`);
          }
          setVehicles([]);
          setVehicleCount(0);
        } else if (data && data.length > 0) {
          console.log(`✅ Loaded ${data.length} vehicles - setting state now`);
          setVehicles(data);
          setVehicleCount(data.length);
        } else {
          console.log('⚠️ No vehicles returned from query');
          setVehicles([]);
          setVehicleCount(0);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('❌ Exception loading vehicles:', err);
          const errorMsg = err?.message || 'Unknown error';
          setError(`Failed to load vehicles: ${errorMsg}`);
          setVehicles([]);
          setVehicleCount(0);
        }
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        if (isMounted) {
          console.log('🛑 Setting loading = false');
          setLoading(false);
        }
      }
    };

    // Set a failsafe timeout
    timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('⚠️ 5 second timeout reached, forcing loading = false');
        setLoading(false);
      }
    }, 5000);

    loadVehicles();

    return () => {
      console.log('🧹 Cleanup function called');
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // ===== FORM HANDLERS =====
  const resetForm = () => {
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
    setSubmitError(null);
  };

  const handleOpenForm = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingId(vehicle.id);
      setFormData(vehicle);
    } else {
      setEditingId(null);
      resetForm();
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validation
    if (!formData.registration_number?.trim()) {
      setSubmitError('Registration number is required');
      return;
    }
    if (!formData.make?.trim()) {
      setSubmitError('Make is required');
      return;
    }
    if (!formData.model?.trim()) {
      setSubmitError('Model is required');
      return;
    }

    try {
      setSubmitting(true);
      console.log('📝 Submitting vehicle form...');

      if (editingId) {
        // Update existing vehicle
        const { error: err } = await updateVehicle(editingId, formData);
        if (err) {
          console.error('❌ Update error:', err);
          let errorMsg = err?.message || String(err);
          
          if (errorMsg.includes('duplicate key') || errorMsg.includes('unique constraint') || errorMsg.includes('vehicles_registration_number_key')) {
            errorMsg = '❌ This registration number already exists. Please use a unique registration number.';
          } else if (errorMsg.includes('denied') || errorMsg.includes('policy')) {
            errorMsg = '❌ Permission denied. Check your access permissions.';
          } else {
            errorMsg = `❌ Update failed: ${errorMsg}`;
          }
          
          setSubmitError(errorMsg);
          return;
        }
        console.log('✅ Vehicle updated successfully in Firebase');
        // Fetch fresh data from database to ensure persistence
        const { data: updatedVehicles, error: fetchErr } = await getAllVehicles();
        if (!fetchErr && updatedVehicles) {
          setVehicles(updatedVehicles);
          console.log('✅ Vehicle list refreshed from database');
        } else {
          // Fallback: update local state if fetch fails
          setVehicles(vehicles.map(v => v.id === editingId ? { ...v, ...formData } as Vehicle : v));
        }
      } else {
        // Create new vehicle
        const { data: newVehicle, error: err } = await createVehicle(formData);
        if (err) {
          console.error('❌ Create error:', err);
          let errorMsg = err?.message || String(err);
          
          if (errorMsg.includes('duplicate key') || errorMsg.includes('unique constraint') || errorMsg.includes('vehicles_registration_number_key')) {
            errorMsg = '❌ This registration number already exists. Please use a unique registration number.';
          } else if (errorMsg.includes('denied') || errorMsg.includes('policy')) {
            errorMsg = '❌ Permission denied. Check your access permissions.';
          } else {
            errorMsg = `❌ Creation failed: ${errorMsg}`;
          }
          
          setSubmitError(errorMsg);
          return;
        }
        console.log('✅ Vehicle created successfully');
        if (newVehicle) {
          setVehicles([newVehicle, ...vehicles]);
        }
      }

      handleCloseForm();
      // Show success message
      const successMsg = editingId ? '✅ Vehicle updated successfully!' : '✅ Vehicle added successfully!';
      console.log(successMsg);
      setSuccessMessage(successMsg);
      // Auto-dismiss after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('❌ Exception:', err);
      setSubmitError(`Exception: ${err?.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('🗑️ Deleting vehicle...');
      const { error: err } = await deleteVehicle(id);

      if (err) {
        console.error('❌ Delete error:', err);
        setError(`Delete failed: ${err?.message || String(err)}`);
        return;
      }

      console.log('✅ Vehicle deleted successfully');
      setVehicles(vehicles.filter(v => v.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      console.error('❌ Exception:', err);
      setError(`Delete exception: ${err?.message || 'Unknown error'}`);
    }
  };

  // ===== IMAGE HANDLING =====
  const handleImageUpload = (vehicleId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result as string);
          setVehicleImages(prev => ({
            ...prev,
            [vehicleId]: [...(prev[vehicleId] || []), ...newImages]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteImage = (vehicleId: string, index: number) => {
    setVehicleImages(prev => ({
      ...prev,
      [vehicleId]: prev[vehicleId].filter((_, i) => i !== index)
    }));
  };

  // ===== FILTERING & SEARCHING =====
  const filtered = vehicles
    .filter(v => filterStatus === 'all' || v.status === filterStatus)
    .filter(v => 
      searchTerm === '' ||
      v.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // ===== ANALYTICS =====
  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === 'available').length,
    in_use: vehicles.filter(v => v.status === 'in_use').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    broken: vehicles.filter(v => v.status === 'broken').length,
    disposed: vehicles.filter(v => v.status === 'disposed').length,
  };

  const statusData = [
    { name: 'Available', value: stats.available, color: statusColors.available.chart },
    { name: 'In Use', value: stats.in_use, color: statusColors.in_use.chart },
    { name: 'Maintenance', value: stats.maintenance, color: statusColors.maintenance.chart },
    { name: 'Broken', value: stats.broken, color: statusColors.broken.chart },
    { name: 'Disposed', value: stats.disposed, color: statusColors.disposed.chart },
  ];

  const mileageByMake = vehicles
    .reduce((acc: any, v) => {
      const existing = acc.find((m: any) => m.make === v.make);
      if (existing) {
        existing.mileage = Math.round((existing.mileage + v.mileage) / 2);
        existing.count++;
      } else {
        acc.push({ make: v.make, mileage: v.mileage, count: 1 });
      }
      return acc;
    }, [])
    .sort((a: any, b: any) => b.mileage - a.mileage)
    .slice(0, 10);

  const avgMileage = vehicles.length > 0 ? Math.round(vehicles.reduce((sum, v) => sum + v.mileage, 0) / vehicles.length) : 0;

  // ===== DEBUG INFO =====
  useEffect(() => {
    console.log('🔍 DEBUG: Environment Info');
    console.log('- Running in Electron:', typeof window !== 'undefined' && !!(window as any).electron);
    console.log('- User Agent:', navigator.userAgent);
    console.log('- Online:', navigator.onLine);
  }, []);

  // ===== RENDER =====
  return (
    <div className="space-y-4">
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-light text-gray-700">Vehicle Management</h1>
          <p className="text-gray-600 text-sm mt-1">{vehicleCount} vehicle{vehicleCount !== 1 ? 's' : ''} in fleet</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#EA7B7B] hover:bg-[#D65A5A] text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {/* ===== ERROR DISPLAY ===== */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
          <div className="flex-1">
            <p className="text-red-700 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="text-xs text-red-600 hover:text-red-800 mt-1">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ===== SUCCESS MESSAGE ===== */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex gap-2">
          <div className="text-emerald-600 flex-shrink-0 mt-0.5">✓</div>
          <div className="flex-1">
            <p className="text-emerald-700 text-sm font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {/* ===== LOADING STATE ===== */}
      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#EA7B7B] mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading vehicles...</p>
        </div>
      )}

      {/* ===== CONTENT ===== */}
      {!loading && (
        <>
          {/* ===== STATS CARDS ===== */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            <div className="bg-white p-2 rounded border border-gray-200 text-xs">
              <div className="flex items-center gap-1">
                <Truck size={18} className="text-gray-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-gray-900">{stats.total}</div>
                  <div className="text-gray-600 text-xs">Total</div>
                </div>
              </div>
            </div>
            <div className="bg-emerald-50 p-2 rounded border border-emerald-200 text-xs">
              <div className="flex items-center gap-1">
                <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-emerald-700">{stats.available}</div>
                  <div className="text-emerald-600 text-xs">Available</div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-2 rounded border border-blue-200 text-xs">
              <div className="flex items-center gap-1">
                <Activity size={18} className="text-blue-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-blue-700">{stats.in_use}</div>
                  <div className="text-blue-600 text-xs">In Use</div>
                </div>
              </div>
            </div>
            <div className="bg-amber-50 p-2 rounded border border-amber-200 text-xs">
              <div className="flex items-center gap-1">
                <Wrench size={18} className="text-amber-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-amber-700">{stats.maintenance}</div>
                  <div className="text-amber-600 text-xs">Maint.</div>
                </div>
              </div>
            </div>
            <div className="bg-red-50 p-2 rounded border border-red-200 text-xs">
              <div className="flex items-center gap-1">
                <AlertTriangle size={18} className="text-red-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-red-700">{stats.broken}</div>
                  <div className="text-red-600 text-xs">Broken</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-2 rounded border border-gray-200 text-xs">
              <div className="flex items-center gap-1">
                <Recycle size={18} className="text-gray-600 flex-shrink-0" />
                <div>
                  <div className="font-bold text-gray-700">{stats.disposed}</div>
                  <div className="text-gray-600 text-xs">Disposed</div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== CHARTS ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Status Distribution Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <BarChart3 size={16} className="text-[#EA7B7B]" />
                Status Distribution
              </h2>
              {statusData.some(s => s.value > 0) ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-500 text-sm">No data</div>
              )}
            </div>

            {/* Average Mileage by Make */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Truck size={16} className="text-[#EA7B7B]" />
                Mileage by Make
              </h2>
              {mileageByMake.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={mileageByMake}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="make" height={40} tick={{ fontSize: 12 }} />
                    <YAxis width={40} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="mileage" fill="#EA7B7B" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-500 text-sm">No data</div>
              )}
            </div>
          </div>

          {/* ===== QUICK STATS ===== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Average Mileage Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-semibold">Avg. Mileage per Vehicle</p>
                  <p className="text-lg font-bold text-blue-900 mt-1">{avgMileage.toLocaleString()} km</p>
                  <p className="text-xs text-blue-600 mt-1">{vehicles.length} vehicles tracked</p>
                </div>
              </div>
            </div>

            {/* Total Mileage Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200 p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-emerald-600 font-semibold">Total Fleet Mileage</p>
                  <p className="text-lg font-bold text-emerald-900 mt-1">{vehicles.reduce((sum, v) => sum + v.mileage, 0).toLocaleString()} km</p>
                  <p className="text-xs text-emerald-600 mt-1">Cumulative distance</p>
                </div>
              </div>
            </div>

            {/* Availability Card */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200 p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-amber-600 font-semibold">Fleet Availability</p>
                  <p className="text-lg font-bold text-amber-900 mt-1">{vehicles.length > 0 ? Math.round((stats.available / stats.total) * 100) : 0}%</p>
                  <p className="text-xs text-amber-600 mt-1">{stats.available} of {stats.total} available</p>
                </div>
              </div>
            </div>
          </div>

          {/* ===== SEARCH & FILTER ===== */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B]"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B]"
            >
              <option value="all">All</option>
              <option value="available">Available</option>
              <option value="in_use">In Use</option>
              <option value="maintenance">Maintenance</option>
              <option value="broken">Broken</option>
              <option value="disposed">Disposed</option>
            </select>
          </div>

          {/* ===== VEHICLES TABLE ===== */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Vehicles on Board ({filtered.length} of {vehicles.length})
              </h2>
            </div>

            {filtered.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                {vehicles.length === 0 ? (
                  <>
                    <Truck size={48} className="mx-auto mb-4 text-gray-400" />
                    <p className="font-medium">No vehicles in fleet</p>
                    <p className="text-sm mt-1">Start by adding a new vehicle to your fleet</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">No vehicles match your search</p>
                    <p className="text-sm mt-1">Try adjusting your search or filter criteria</p>
                  </>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b border-[#44444E]">
                    <tr>
                      <th className="px-6 py-3 text-left font-bold text-gray-900">📋 Registration</th>
                      <th className="px-6 py-3 text-left font-bold text-gray-900">🚗 Vehicle</th>
                      <th className="px-6 py-3 text-left font-bold text-gray-900">📅 Year</th>
                      <th className="px-6 py-3 text-left font-bold text-gray-900">🛣️ Mileage</th>
                      <th className="px-6 py-3 text-left font-bold text-gray-900">⛽ Fuel Type</th>
                      <th className="px-6 py-3 text-left font-bold text-gray-900">🎯 Status</th>
                      <th className="px-6 py-3 text-center font-bold text-gray-900">⚙️ Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((vehicle, index) => {
                      const colors = statusColors[vehicle.status];
                      return (
                        <tr key={vehicle.id} className={`border-b border-gray-100 hover:bg-blue-50 transition-all ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">{vehicle.registration_number}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{vehicle.make} {vehicle.model}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{vehicle.year}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{vehicle.mileage.toLocaleString()} km</td>
                          <td className="px-6 py-4 text-sm text-gray-600 capitalize">{vehicle.fuel_type}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
                              {vehicle.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="relative">
                              <button
                                onClick={() => setOpenDropdown(openDropdown === vehicle.id ? null : vehicle.id)}
                                className="p-1 text-gray-600 hover:text-[#EA7B7B] transition-colors"
                                title="More options"
                              >
                                <MoreVertical size={18} />
                              </button>
                              
                              {openDropdown === vehicle.id && (
                                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                                  <button
                                    onClick={() => {
                                      setViewingId(vehicle.id);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 first:rounded-t-lg"
                                  >
                                    <Eye size={16} />
                                    View Details
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleOpenForm(vehicle);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Edit2 size={16} />
                                    Edit Vehicle
                                  </button>
                                  <div className="border-t border-gray-200"></div>
                                  <button
                                    onClick={() => {
                                      setDeleteConfirm(vehicle.id);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 last:rounded-b-lg"
                                  >
                                    <Trash2 size={16} />
                                    Delete Vehicle
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
            )}
          </div>
        </>
      )}

      {/* ===== ADD/EDIT FORM MODAL ===== */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h2>
              <button
                onClick={handleCloseForm}
                className="text-gray-600 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-red-700 text-sm">{submitError}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Registration Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">
                    Registration Number *
                  </label>
                  <input
                    type="text"
                    value={formData.registration_number || ''}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B]"
                    placeholder="e.g., MZ001ABC"
                  />
                </div>

                {/* Make */}
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">
                    Make *
                  </label>
                  <input
                    type="text"
                    value={formData.make || ''}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B]"
                    placeholder="e.g., Toyota"
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">
                    Model *
                  </label>
                  <input
                    type="text"
                    value={formData.model || ''}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B]"
                    placeholder="e.g., Land Cruiser"
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={formData.year || new Date().getFullYear()}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B]"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status || 'available'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B]"
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>

                {/* Mileage */}
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">
                    Mileage (km)
                  </label>
                  <input
                    type="number"
                    value={formData.mileage || 0}
                    onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B]"
                    min="0"
                  />
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">
                    Fuel Type
                  </label>
                  <select
                    value={formData.fuel_type || 'diesel'}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B]"
                  >
                    {fuelTypes.map(ft => (
                      <option key={ft} value={ft}>{ft}</option>
                    ))}
                  </select>
                </div>

                {/* Chassis Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">
                    Chassis Number
                  </label>
                  <input
                    type="text"
                    value={formData.chassis_number || ''}
                    onChange={(e) => setFormData({ ...formData, chassis_number: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B]"
                    placeholder="VIN/Chassis"
                  />
                </div>

                {/* Engine Number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">
                    Engine Number
                  </label>
                  <input
                    type="text"
                    value={formData.engine_number || ''}
                    onChange={(e) => setFormData({ ...formData, engine_number: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B]"
                    placeholder="Engine serial"
                  />
                </div>

                {/* Purchase Date */}
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    value={formData.purchase_date || ''}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B]"
                  />
                </div>

                {/* Insurance Expiry */}
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">
                    Insurance Expiry
                  </label>
                  <input
                    type="date"
                    value={formData.insurance_expiry || ''}
                    onChange={(e) => setFormData({ ...formData, insurance_expiry: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B]"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-1.5 text-sm bg-[#EA7B7B] hover:bg-[#D65A5A] disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Vehicle' : 'Add Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="bg-red-50 border-b border-red-200 px-6 py-4">
              <h2 className="text-lg font-bold text-red-900">Delete Vehicle</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete this vehicle? This action cannot be undone.
              </p>
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="font-semibold text-gray-900">
                  {vehicles.find(v => v.id === deleteConfirm)?.registration_number}
                </p>
                <p className="text-sm text-gray-600">
                  {vehicles.find(v => v.id === deleteConfirm)?.make} {vehicles.find(v => v.id === deleteConfirm)?.model}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DETAIL VIEW MODAL ===== */}
      {viewingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col">
            {(() => {
              const vehicle = vehicles.find(v => v.id === viewingId);
              if (!vehicle) return null;
              const colors = statusColors[vehicle.status];

              return (
                <>
                  <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-white border-b border-gray-200 px-4 py-3 flex justify-between items-center flex-shrink-0">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">🚗 Vehicle Details</h2>
                      <p className="text-xs text-gray-500 mt-0.5">{vehicle.registration_number}</p>
                    </div>
                    <button
                      onClick={() => setViewingId(null)}
                      className="text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="sticky top-[3.5rem] bg-white border-b border-gray-200 flex gap-0 flex-shrink-0">
                    <button
                      onClick={() => setDetailsTab('info')}
                      className={`flex-1 px-3 py-2 text-xs font-semibold uppercase tracking-wide border-b-2 transition-colors ${
                        detailsTab === 'info'
                          ? 'text-[#EA7B7B] border-[#EA7B7B]'
                          : 'text-gray-600 border-transparent hover:text-gray-900'
                      }`}
                    >
                      📋 Info
                    </button>
                    <button
                      onClick={() => setDetailsTab('images')}
                      className={`flex-1 px-3 py-2 text-xs font-semibold uppercase tracking-wide border-b-2 transition-colors relative ${
                        detailsTab === 'images'
                          ? 'text-[#EA7B7B] border-[#EA7B7B]'
                          : 'text-gray-600 border-transparent hover:text-gray-900'
                      }`}
                    >
                      🖼️ Images
                      {vehicleImages[vehicle.id]?.length > 0 && (
                        <span className="absolute -top-1 right-1 bg-[#EA7B7B] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {vehicleImages[vehicle.id].length}
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="p-4 space-y-3 overflow-y-auto flex-1">
                    {/* INFO TAB */}
                    {detailsTab === 'info' && (
                      <>
                        {/* Status Badge & Title */}
                    <div className="flex items-start justify-between pb-3 border-b border-gray-200">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-900">{vehicle.registration_number}</h3>
                        <p className="text-xs text-gray-600 mt-0.5">{vehicle.make} {vehicle.model} • {vehicle.year}</p>
                      </div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${colors.badge}`}>
                        {vehicle.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>

                    {/* Key Information - Highlighted */}
                    <div className="grid grid-cols-2 gap-2 bg-gradient-to-br from-blue-50 to-blue-50/50 p-3 rounded-lg border border-blue-100">
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">⛽ Fuel</p>
                        <p className="text-xs font-bold text-gray-900 mt-1 capitalize">{vehicle.fuel_type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">🛣️ Mileage</p>
                        <p className="text-xs font-bold text-gray-900 mt-1">{vehicle.mileage.toLocaleString()} km</p>
                      </div>
                    </div>

                    {/* Technical Details */}
                    <div>
                      <h4 className="text-xs font-bold uppercase text-gray-700 mb-2 tracking-wide">📋 Technical</h4>
                      <div className="grid grid-cols-1 gap-1.5 space-y-0">
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors">
                          <span className="text-xs text-gray-600">Chassis</span>
                          <span className="text-xs font-semibold text-gray-900 text-right">{vehicle.chassis_number || '—'}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors">
                          <span className="text-xs text-gray-600">Engine</span>
                          <span className="text-xs font-semibold text-gray-900 text-right">{vehicle.engine_number || '—'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Date Information */}
                    <div>
                      <h4 className="text-xs font-bold uppercase text-gray-700 mb-2 tracking-wide">📅 Dates</h4>
                      <div className="grid grid-cols-1 gap-1.5 space-y-0">
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors">
                          <span className="text-xs text-gray-600">Purchase</span>
                          <span className="text-xs font-semibold text-gray-900">
                            {vehicle.purchase_date ? new Date(vehicle.purchase_date).toLocaleDateString('en-GB') : '—'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors">
                          <span className="text-xs text-gray-600">Insurance</span>
                          <span className="text-xs font-semibold text-gray-900">
                            {vehicle.insurance_expiry ? new Date(vehicle.insurance_expiry).toLocaleDateString('en-GB') : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                      </>
                    )}

                    {/* IMAGES TAB */}
                    {detailsTab === 'images' && (
                      <>
                        {/* Upload Section */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#EA7B7B] transition-colors">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleImageUpload(vehicle.id, e)}
                            className="hidden"
                            id={`image-upload-${vehicle.id}`}
                          />
                          <label htmlFor={`image-upload-${vehicle.id}`} className="cursor-pointer block">
                            <p className="text-xs font-semibold text-gray-700 mb-1">📸 Click to upload images</p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF (Max 5MB)</p>
                          </label>
                        </div>

                        {/* Images Grid */}
                        {vehicleImages[vehicle.id] && vehicleImages[vehicle.id].length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {vehicleImages[vehicle.id].map((image, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={image}
                                  alt={`Vehicle ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                />
                                <button
                                  onClick={() => handleDeleteImage(vehicle.id, index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-500">
                            <p className="text-xs">📭 No images yet</p>
                            <p className="text-xs text-gray-400 mt-1">Upload images to get started</p>
                          </div>
                        )}
                      </>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 mt-auto flex-shrink-0 bg-white">
                      <button
                        onClick={() => setViewingId(null)}
                        className="px-2.5 py-1 text-xs border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => {
                          handleOpenForm(vehicle);
                          setViewingId(null);
                        }}
                        className="px-2.5 py-1 text-xs bg-[#EA7B7B] hover:bg-[#D65A5A] text-white rounded-lg font-medium transition-colors"
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
