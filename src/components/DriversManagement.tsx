import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, X, AlertCircle, Users, TrendingUp, AlertTriangle, CheckCircle, Gauge, Clock, Calendar, Shield, Activity, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getAllDrivers, testConnection } from '../lib/firebaseQueries';

interface Driver {
  id: string;
  name: string;
  license_number: string;
  phone: string;
  license_expiry: string;
  status: 'active' | 'retired' | 'suspended';
  date_of_birth: string;
  created_at: string;
}

interface DriverFormData {
  name: string;
  license_number: string;
  phone: string;
  license_expiry: string;
  status: 'active' | 'retired' | 'suspended';
  date_of_birth: string;
}

const statusColors: Record<string, { badge: string; bg: string; text: string; icon: string }> = {
  active: { badge: 'bg-emerald-100 text-emerald-800', bg: 'from-emerald-50 to-green-50', text: 'text-emerald-600', icon: 'emerald' },
  retired: { badge: 'bg-gray-100 text-gray-800', bg: 'from-gray-50 to-slate-50', text: 'text-gray-600', icon: 'gray' },
  suspended: { badge: 'bg-red-100 text-red-800', bg: 'from-red-50 to-rose-50', text: 'text-red-600', icon: 'red' },
};

export default function DriversManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'license_number' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState<DriverFormData>({
    name: '',
    license_number: '',
    phone: '',
    license_expiry: '',
    status: 'active',
    date_of_birth: new Date().toISOString().split('T')[0],
  });

  // Load drivers from database
  useEffect(() => {
    let isMounted = true;

    const loadDrivers = async () => {
      setLoading(true);
      setError(null);
      try {
        // First test connection
        console.log('🔍 Testing connection to Firebase...');
        const connTest = await testConnection();
        if (!isMounted) return;
        
        if (!connTest.success) {
          console.error('❌ Connection test failed:', connTest.error);
          setError(`Connection error: ${connTest.error?.message || 'Unable to connect to database'}`);
          setLoading(false);
          return;
        }
        
        console.log('✅ Connection successful, fetching drivers...');
        const { data, error } = await getAllDrivers();
        if (!isMounted) return;
        
        if (error) {
          console.error('❌ Driver loading error:', error);
          const errorMsg = error?.message || error?.error_description || error?.details || JSON.stringify(error) || 'Failed to load drivers';
          setError(`Database error: ${errorMsg}`);
          // Use mock data as fallback for debugging
          const mockDrivers: Driver[] = [
            {
              id: '1',
              name: 'John Banda',
              license_number: 'DL001',
              phone: '+265999123456',
              status: 'active',
              license_expiry: '2026-12-31',
              date_of_birth: '1985-05-15',
              created_at: new Date().toISOString(),
            },
          ];
          console.log('⚠️ Using mock data as fallback');
          setDrivers(mockDrivers);
          return;
        }
        console.log(`✅ Loaded ${data?.length || 0} drivers from database`);
        setDrivers(data || []);
      } catch (err: any) {
        if (!isMounted) return;
        console.error('❌ Driver loading exception:', err);
        setError(`Error: ${err?.message || String(err) || 'Failed to load drivers'}`);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDrivers();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddDriver = () => {
    setFormData({
      name: '',
      license_number: '',
      phone: '',
      license_expiry: '',
      status: 'active',
      date_of_birth: new Date().toISOString().split('T')[0],
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditDriver = (driver: Driver) => {
    setFormData({
      name: driver.name,
      license_number: driver.license_number,
      phone: driver.phone,
      license_expiry: driver.license_expiry,
      status: driver.status,
      date_of_birth: driver.date_of_birth,
    });
    setEditingId(driver.id);
    setShowForm(true);
  };

  const handleSaveDriver = async () => {
    setError(null);
    
    if (!formData.license_number?.trim()) {
      setError('License number is required');
      return;
    }
    if (!formData.name?.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.date_of_birth?.trim()) {
      setError('Date of birth is required');
      return;
    }

    try {
      if (editingId) {
        // Update existing driver
        setDrivers(drivers.map(d => 
          d.id === editingId 
            ? { ...d, ...formData }
            : d
        ));
        setSuccess(`Driver ${formData.name} updated successfully`);
      } else {
        // Create new driver
        const newDriver: Driver = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date().toISOString(),
        };
        setDrivers([...drivers, newDriver]);
        setSuccess(`New driver ${formData.name} added successfully`);
      }
      
      // Auto-clear form
      setShowForm(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save driver: ' + (err instanceof Error ? err.message : 'Unknown error'));
      console.error(err);
    }
  };

  const handleDeleteDriver = async (id: string) => {
    try {
      const deletedDriver = drivers.find(d => d.id === id);
      setDrivers(drivers.filter(d => d.id !== id));
      setDeleteConfirm(null);
      setSuccess(`Driver ${deletedDriver?.name} deleted successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete driver: ' + (err instanceof Error ? err.message : 'Unknown error'));
      console.error(err);
    }
  };

  const filteredDrivers = (filterStatus === 'all'
    ? drivers
    : drivers.filter(d => d.status === filterStatus)
  ).filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.license_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.phone.includes(searchTerm)
  ).sort((a, b) => {
    let compareValue = 0;
    switch (sortBy) {
      case 'license_number':
        compareValue = a.license_number.localeCompare(b.license_number);
        break;
      case 'status':
        compareValue = a.status.localeCompare(b.status);
        break;
      default:
        compareValue = a.name.localeCompare(b.name);
    }
    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  const viewingDriver = drivers.find(d => d.id === viewingId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#44444E] to-[#2E2E33] rounded-lg p-3 text-white shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users size={20} />
              <h1 className="text-lg font-bold">Drivers Management</h1>
            </div>
            <p className="text-blue-100 text-xs">Manage your fleet drivers and licenses</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              className="flex items-center gap-1 px-3 py-1.5 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all font-medium text-xs backdrop-blur-sm border border-white border-opacity-30"
              title="View reports"
            >
              📊
              Reports
            </button>
            <button
              onClick={handleAddDriver}
              className="flex items-center gap-1 px-4 py-1.5 bg-white text-[#EA7B7B] rounded-lg hover:bg-blue-50 transition-all font-semibold shadow-lg hover:shadow-xl text-sm"
            >
              <Plus size={16} />
              Add Driver
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 shadow-sm">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-green-900">Success</h3>
            <p className="text-sm text-green-700 mt-1">{success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Drivers */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-md p-2.5 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-default group overflow-hidden relative">
          {/* Accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-500" />
          <div className="flex items-start justify-between relative z-10 gap-1">
            <div className="flex-1">
              <p className="text-blue-700 text-xs font-semibold uppercase tracking-wide mb-0.5 opacity-85 leading-tight">Total Drivers</p>
              <p className="text-blue-900 text-xl font-bold mb-0.5 leading-tight">{drivers.length}</p>
            </div>
            <div className="bg-blue-100 p-1.5 rounded flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
              <div className="text-blue-600 text-sm"><Users size={18} /></div>
            </div>
          </div>
          {/* Subtle background accent */}
          <div className="absolute bottom-0 right-0 w-12 h-12 bg-blue-100 rounded-full opacity-20 -mr-4 -mb-4" />
        </div>

        {/* Active Drivers */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-md p-2.5 border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-default group overflow-hidden relative">
          {/* Accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-500" />
          <div className="flex items-start justify-between relative z-10 gap-1">
            <div className="flex-1">
              <p className="text-emerald-700 text-xs font-semibold uppercase tracking-wide mb-0.5 opacity-85 leading-tight">Active</p>
              <p className="text-emerald-900 text-xl font-bold mb-0.5 leading-tight">{drivers.filter(d => d.status === 'active').length}</p>
            </div>
            <div className="bg-emerald-100 p-1.5 rounded flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
              <div className="text-emerald-600 text-sm"><TrendingUp size={18} /></div>
            </div>
          </div>
          {/* Subtle background accent */}
          <div className="absolute bottom-0 right-0 w-12 h-12 bg-emerald-100 rounded-full opacity-20 -mr-4 -mb-4" />
        </div>

        {/* Inactive Drivers */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-md p-2.5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-default group overflow-hidden relative">
          {/* Accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-400 to-gray-500" />
          <div className="flex items-start justify-between relative z-10 gap-1">
            <div className="flex-1">
              <p className="text-gray-700 text-xs font-semibold uppercase tracking-wide mb-0.5 opacity-85 leading-tight">Inactive</p>
              <p className="text-gray-900 text-xl font-bold mb-0.5 leading-tight">{drivers.filter(d => d.status === 'inactive').length}</p>
            </div>
            <div className="bg-gray-100 p-1.5 rounded flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
              <div className="text-gray-600 text-sm"><Users size={18} /></div>
            </div>
          </div>
          {/* Subtle background accent */}
          <div className="absolute bottom-0 right-0 w-12 h-12 bg-gray-100 rounded-full opacity-20 -mr-4 -mb-4" />
        </div>

        {/* License Expiring Soon */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-md p-2.5 border border-amber-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-default group overflow-hidden relative">
          {/* Accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500" />
          <div className="flex items-start justify-between relative z-10 gap-1">
            <div className="flex-1">
              <p className="text-amber-700 text-xs font-semibold uppercase tracking-wide mb-0.5 opacity-85 leading-tight">Expiring Soon</p>
              <p className="text-amber-900 text-xl font-bold mb-0.5 leading-tight">
                {drivers.filter(d => {
                  const exp = new Date(d.license_expiry);
                  const today = new Date();
                  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                  return exp <= in30Days && exp >= today;
                }).length}
              </p>
            </div>
            <div className="bg-amber-100 p-1.5 rounded flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
              <div className="text-amber-600 text-sm"><AlertTriangle size={18} /></div>
            </div>
          </div>
          {/* Subtle background accent */}
          <div className="absolute bottom-0 right-0 w-12 h-12 bg-amber-100 rounded-full opacity-20 -mr-4 -mb-4" />
        </div>
      </div>

      {/* Status Distribution Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Driver Status Distribution - Doughnut Chart */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg border border-blue-100">
                <Activity size={20} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Driver Status</h4>
                <p className="text-xs text-gray-500 mt-1">Workforce composition</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-sm font-bold text-blue-700">{drivers.length}</span>
              </div>
              <span className="text-xs text-gray-500">Total</span>
            </div>
          </div>
          <div className="w-full h-48 mb-2 min-h-48">
            <ResponsiveContainer width="100%" height={192}>
              <PieChart>
                <Pie
                  data={['active', 'inactive', 'suspended']
                    .map(status => ({
                      name: status.charAt(0).toUpperCase() + status.slice(1),
                      value: drivers.filter(d => d.status === status).length,
                    }))
                    .filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  outerRadius={64}
                  labelLine={false}
                  label={({ value, name }: any) => `${value}`}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={1}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#6366f1" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip
                  formatter={(value) => `${value} drivers`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', fontSize: '12px', padding: '8px 12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Enhanced legend with icons and detailed stats */}
          <div className="mt-5 space-y-3 text-xs border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full group-hover:scale-125 transition-transform"></div>
                <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                <div>
                  <span className="text-gray-700 font-semibold block">Active</span>
                  <span className="text-gray-400 text-xs">Operational</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{drivers.filter(d => d.status === 'active').length}</div>
                <div className="text-emerald-600 font-semibold">{drivers.length > 0 ? Math.round((drivers.filter(d => d.status === 'active').length / drivers.length) * 100) : 0}%</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-indigo-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-indigo-500 rounded-full group-hover:scale-125 transition-transform"></div>
                <Gauge size={16} className="text-indigo-500 flex-shrink-0" />
                <div>
                  <span className="text-gray-700 font-semibold block">Inactive</span>
                  <span className="text-gray-400 text-xs">Idle</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{drivers.filter(d => d.status === 'inactive').length}</div>
                <div className="text-indigo-600 font-semibold">{drivers.length > 0 ? Math.round((drivers.filter(d => d.status === 'inactive').length / drivers.length) * 100) : 0}%</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-red-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full group-hover:scale-125 transition-transform"></div>
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                <div>
                  <span className="text-gray-700 font-semibold block">Suspended</span>
                  <span className="text-gray-400 text-xs">Unavailable</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{drivers.filter(d => d.status === 'suspended').length}</div>
                <div className="text-red-600 font-semibold">{drivers.length > 0 ? Math.round((drivers.filter(d => d.status === 'suspended').length / drivers.length) * 100) : 0}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* License Expiry Timeline - Enhanced Bar Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all gap-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg border border-orange-200">
                <Calendar size={20} className="text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">License Expiry Timeline</h4>
                <p className="text-sm text-gray-500 mt-1">Track driver license expiry periods</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-2xl font-bold text-gray-900">{drivers.length}</div>
              <div className="text-xs text-gray-500 font-medium">Total</div>
            </div>
          </div>
          <div className="w-full h-40 min-h-40">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={[
                  {
                    name: 'Expired',
                    count: drivers.filter(d => new Date(d.license_expiry) < new Date()).length,
                    fill: '#dc2626'
                  },
                  {
                    name: '0-15d',
                    count: drivers.filter(d => {
                      const exp = new Date(d.license_expiry);
                      const today = new Date();
                      const in15Days = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
                      return exp > today && exp <= in15Days;
                    }).length,
                    fill: '#f97316'
                  },
                  {
                    name: '15-30d',
                    count: drivers.filter(d => {
                      const exp = new Date(d.license_expiry);
                      const today = new Date();
                      const in15Days = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
                      const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                      return exp > in15Days && exp <= in30Days;
                    }).length,
                    fill: '#eab308'
                  },
                  {
                    name: '30+d',
                    count: drivers.filter(d => {
                      const exp = new Date(d.license_expiry);
                      const today = new Date();
                      const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                      return exp > in30Days;
                    }).length,
                    fill: '#10b981'
                  }
                ]}
                margin={{ top: 8, right: 12, left: -20, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} width={30} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '0.5rem', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
                    fontSize: '12px',
                    padding: '8px 12px'
                  }}
                  formatter={(value) => [`${value} drivers`, 'Count']}
                  labelStyle={{ color: '#111827', fontWeight: '600' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} isAnimationActive={true}>
                  {[
                    { name: 'Expired', fill: '#dc2626' },
                    { name: '0-15 days', fill: '#f97316' },
                    { name: '15-30 days', fill: '#eab308' },
                    { name: '30+ days', fill: '#10b981' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Enhanced legend with icons and detailed stats */}
          <div className="mt-5 space-y-3 text-xs border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-red-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-600 rounded-full group-hover:scale-125 transition-transform"></div>
                <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
                <div>
                  <span className="text-gray-700 font-semibold block">Expired</span>
                  <span className="text-gray-400 text-xs">Immediate action</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{drivers.filter(d => new Date(d.license_expiry) < new Date()).length}</div>
                <div className="text-red-600 font-semibold">URGENT</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-orange-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full group-hover:scale-125 transition-transform"></div>
                <Clock size={16} className="text-orange-600 flex-shrink-0" />
                <div>
                  <span className="text-gray-700 font-semibold block">0-15 days</span>
                  <span className="text-gray-400 text-xs">Very soon</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{drivers.filter(d => {
                  const exp = new Date(d.license_expiry);
                  const today = new Date();
                  const in15Days = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
                  return exp > today && exp <= in15Days;
                }).length}</div>
                <div className="text-orange-600 font-semibold">CRITICAL</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-yellow-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full group-hover:scale-125 transition-transform"></div>
                <Zap size={16} className="text-yellow-600 flex-shrink-0" />
                <div>
                  <span className="text-gray-700 font-semibold block">15-30 days</span>
                  <span className="text-gray-400 text-xs">Upcoming</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{drivers.filter(d => {
                  const exp = new Date(d.license_expiry);
                  const today = new Date();
                  const in15Days = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
                  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                  return exp > in15Days && exp <= in30Days;
                }).length}</div>
                <div className="text-yellow-600 font-semibold">WARNING</div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-emerald-50 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-600 rounded-full group-hover:scale-125 transition-transform"></div>
                <Shield size={16} className="text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="text-gray-700 font-semibold block">30+ days</span>
                  <span className="text-gray-400 text-xs">No action needed</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{drivers.filter(d => {
                  const exp = new Date(d.license_expiry);
                  const today = new Date();
                  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                  return exp > in30Days;
                }).length}</div>
                <div className="text-emerald-600 font-semibold">SAFE</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200 shadow-md p-3 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-900">Filter & Search</h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{filteredDrivers.length} Results</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <input
              type="text"
              placeholder="🔍 Search name, license, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pl-9 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-sm transition-all hover:border-gray-300"
            />
            <svg className="absolute left-2.5 top-2.5 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-sm font-medium transition-all hover:border-gray-300"
            >
              <option value="name">↔️ Name</option>
              <option value="license">📋 License</option>
              <option value="hire_date">📅 Hire Date</option>
              <option value="status">🎯 Status</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg hover:bg-blue-50 bg-white transition-all text-xs font-bold text-gray-700 hover:border-blue-300"
            >
              {sortOrder === 'asc' ? '↑ A-Z' : '↓ Z-A'}
            </button>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1.5">
          {['all', 'active', 'inactive', 'suspended'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all transform hover:scale-105 ${
                filterStatus === status
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              {status === 'all' ? '📊 All' : status === 'active' ? '✅ Active' : status === 'inactive' ? '⏸️ Inactive' : '🚫 Suspended'}
            </button>
          ))}
        </div>
      </div>

      {/* Drivers Table */}
      {filteredDrivers.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-gray-300 mb-2">
            <Users size={40} className="mx-auto opacity-30" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">No drivers found</h3>
          <p className="text-gray-600 text-xs mb-3">Try adjusting your search or filters</p>
          <button
            onClick={handleAddDriver}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-xs shadow-md"
          >
            <Plus size={14} />
            Add First Driver
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden hover:shadow-lg transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 border-b border-slate-700 dark:border-slate-600">
                <tr>
                  <th className="px-3 py-2 text-left font-bold text-white">👤 Name</th>
                  <th className="px-3 py-2 text-left font-bold text-white">📋 License</th>
                  <th className="px-3 py-2 text-left font-bold text-white">📱 Phone</th>
                  <th className="px-3 py-2 text-left font-bold text-white">📅 Lic. Exp.</th>
                  <th className="px-3 py-2 text-left font-bold text-white">🚗 Vehicle</th>
                  <th className="px-3 py-2 text-left font-bold text-white">🎯 Status</th>
                  <th className="px-3 py-2 text-center font-bold text-white">⚙️ Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((driver, idx) => (
                  <tr key={driver.id} className={`border-b border-gray-100 hover:bg-blue-50 transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                    <td className="px-3 py-2">
                      <span className="font-bold text-gray-900 text-xs">{driver.name}</span>
                      <div className="text-xs text-gray-500">DOB: {driver.date_of_birth}</div>
                    </td>
                    <td className="px-3 py-2 text-gray-700 font-medium text-xs">{driver.license_number}</td>
                    <td className="px-3 py-2 text-gray-700 text-xs">{driver.phone || '-'}</td>
                    <td className="px-3 py-2 font-semibold text-xs">
                      {(() => {
                        const exp = new Date(driver.license_expiry);
                        const today = new Date();
                        if (exp < today) {
                          return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">🔴 Expired</span>;
                        }
                        const daysLeft = Math.floor((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        if (daysLeft <= 30) {
                          return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">⚠️ {daysLeft}d</span>;
                        }
                        return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">✅ Valid</span>;
                      })()}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[driver.status].badge} shadow-sm`}>
                        {driver.status === 'active' ? '✅' : driver.status === 'retired' ? '⏸️' : '🚫'} {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          onClick={() => setViewingId(driver.id)}
                          className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600 transition-all font-bold hover:shadow-md"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleEditDriver(driver)}
                          className="p-1.5 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-all font-bold hover:shadow-md"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(driver.id)}
                          className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 border-t border-gray-200 px-3 py-2 text-xs text-gray-600">
            Showing {filteredDrivers.length} of {drivers.length} drivers
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#44444E] to-[#2E2E33] px-4 py-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">{editingId ? 'Edit Driver' : 'Add New Driver'}</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">License Number *</label>
                  <input
                    type="text"
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    placeholder="DL-001-2024"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    placeholder="John Banda"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    placeholder="+265991234567"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">License Expiry</label>
                  <input
                    type="date"
                    value={formData.license_expiry}
                    onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="retired">Retired</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-3 py-1.5 border border-gray-300 rounded text-xs text-[#EA7B7B] hover:bg-red-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDriver}
                className="px-3 py-1.5 bg-[#EA7B7B] text-white rounded text-xs hover:bg-[#D65A5A] transition-colors font-medium shadow-md"
              >
                {editingId ? 'Update Driver' : 'Create Driver'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Driver Details</h2>
              <button
                onClick={() => setViewingId(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">License Number</p>
                  <p className="text-gray-900 font-semibold text-lg">{viewingDriver.license_number}</p>
                </div>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${statusColors[viewingDriver.status].badge}`}>
                  {viewingDriver.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">First Name</p>
                  <p className="text-gray-900 font-semibold text-lg">{viewingDriver.first_name}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Last Name</p>
                  <p className="text-gray-900 font-semibold text-lg">{viewingDriver.last_name}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Phone</p>
                  <p className="text-gray-900 font-semibold">{viewingDriver.phone}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Email</p>
                  <p className="text-gray-900 font-semibold">{viewingDriver.email}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">License Expiry</p>
                  <p className="text-gray-900 font-semibold">
                    {new Date(viewingDriver.license_expiry).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Assigned Vehicle</p>
                  <p className="text-gray-900 font-semibold">{viewingDriver.assigned_vehicle || 'None'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Hire Date</p>
                  <p className="text-gray-900 font-semibold">
                    {new Date(viewingDriver.hire_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(viewingDriver.id)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
              >
                Delete Driver
              </button>
              <button
                onClick={() => {
                  handleEditDriver(viewingDriver);
                  setViewingId(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Edit Driver
              </button>
              <button
                onClick={() => setViewingId(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Driver?</h3>
              <p className="text-gray-600 text-center text-sm mb-6">
                This action cannot be undone. The driver record will be permanently deleted.
              </p>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDriver(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
              >
                Delete Driver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
