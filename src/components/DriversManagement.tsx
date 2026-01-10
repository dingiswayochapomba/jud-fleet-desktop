import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, X, AlertCircle, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface Driver {
  id: string;
  license_number: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  license_expiry: string;
  assigned_vehicle?: string;
  status: 'active' | 'inactive' | 'suspended';
  hire_date: string;
  created_at: string;
}

interface DriverFormData {
  license_number: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  license_expiry: string;
  assigned_vehicle: string;
  status: 'active' | 'inactive' | 'suspended';
  hire_date: string;
}

const statusColors: Record<string, { badge: string; bg: string; text: string; icon: string }> = {
  active: { badge: 'bg-emerald-100 text-emerald-800', bg: 'from-emerald-50 to-green-50', text: 'text-emerald-600', icon: 'emerald' },
  inactive: { badge: 'bg-gray-100 text-gray-800', bg: 'from-gray-50 to-slate-50', text: 'text-gray-600', icon: 'gray' },
  suspended: { badge: 'bg-red-100 text-red-800', bg: 'from-red-50 to-rose-50', text: 'text-red-600', icon: 'red' },
};

export default function DriversManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'license' | 'hire_date' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState<DriverFormData>({
    license_number: '',
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    license_expiry: '',
    assigned_vehicle: '',
    status: 'active',
    hire_date: new Date().toISOString().split('T')[0],
  });

  // Mock data - replace with actual Supabase queries
  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock data for now
      const mockDrivers: Driver[] = [
        {
          id: '1',
          license_number: 'DL-001-2024',
          first_name: 'John',
          last_name: 'Banda',
          phone: '+265991234567',
          email: 'john.banda@judiciary.mw',
          license_expiry: '2026-06-15',
          assigned_vehicle: 'JJ-16-AB',
          status: 'active',
          hire_date: '2020-03-10',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          license_number: 'DL-002-2024',
          first_name: 'Grace',
          last_name: 'Mwale',
          phone: '+265992234567',
          email: 'grace.mwale@judiciary.mw',
          license_expiry: '2025-12-20',
          assigned_vehicle: 'JJ-16-AE',
          status: 'active',
          hire_date: '2021-05-15',
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          license_number: 'DL-003-2024',
          first_name: 'Peter',
          last_name: 'Chisaka',
          phone: '+265993234567',
          email: 'peter.chisaka@judiciary.mw',
          license_expiry: '2025-08-30',
          assigned_vehicle: 'JJ-16-AF',
          status: 'active',
          hire_date: '2019-01-20',
          created_at: new Date().toISOString(),
        },
        {
          id: '4',
          license_number: 'DL-004-2024',
          first_name: 'Mercy',
          last_name: 'Phiri',
          phone: '+265994234567',
          email: 'mercy.phiri@judiciary.mw',
          license_expiry: '2025-03-15',
          assigned_vehicle: '',
          status: 'inactive',
          hire_date: '2022-07-10',
          created_at: new Date().toISOString(),
        },
        {
          id: '5',
          license_number: 'DL-005-2024',
          first_name: 'Samuel',
          last_name: 'Kachale',
          phone: '+265995234567',
          email: 'samuel.kachale@judiciary.mw',
          license_expiry: '2024-11-05',
          assigned_vehicle: '',
          status: 'suspended',
          hire_date: '2018-02-05',
          created_at: new Date().toISOString(),
        },
      ];
      setDrivers(mockDrivers);
    } catch (err) {
      setError('Failed to load drivers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDriver = () => {
    setFormData({
      license_number: '',
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      license_expiry: '',
      assigned_vehicle: '',
      status: 'active',
      hire_date: new Date().toISOString().split('T')[0],
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditDriver = (driver: Driver) => {
    setFormData({
      license_number: driver.license_number,
      first_name: driver.first_name,
      last_name: driver.last_name,
      phone: driver.phone,
      email: driver.email,
      license_expiry: driver.license_expiry,
      assigned_vehicle: driver.assigned_vehicle || '',
      status: driver.status,
      hire_date: driver.hire_date,
    });
    setEditingId(driver.id);
    setShowForm(true);
  };

  const handleSaveDriver = async () => {
    if (!formData.license_number || !formData.first_name || !formData.last_name) {
      setError('License number, first name, and last name are required');
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
      } else {
        // Create new driver
        const newDriver: Driver = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date().toISOString(),
        };
        setDrivers([...drivers, newDriver]);
      }
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError('Failed to save driver');
      console.error(err);
    }
  };

  const handleDeleteDriver = async (id: string) => {
    try {
      setDrivers(drivers.filter(d => d.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete driver');
      console.error(err);
    }
  };

  const filteredDrivers = (filterStatus === 'all'
    ? drivers
    : drivers.filter(d => d.status === filterStatus)
  ).filter(d =>
    d.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.license_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.phone.includes(searchTerm)
  ).sort((a, b) => {
    let compareValue = 0;
    switch (sortBy) {
      case 'license':
        compareValue = a.license_number.localeCompare(b.license_number);
        break;
      case 'hire_date':
        compareValue = new Date(a.hire_date).getTime() - new Date(b.hire_date).getTime();
        break;
      case 'status':
        compareValue = a.status.localeCompare(b.status);
        break;
      default:
        compareValue = `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
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
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-lg p-3 text-white shadow-md">
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
              className="flex items-center gap-1 px-4 py-1.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-semibold shadow-lg hover:shadow-xl text-sm"
            >
              <Plus size={16} />
              Add Driver
            </button>
          </div>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Drivers */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Total Drivers</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{drivers.length}</p>
            </div>
            <div className="p-2 bg-blue-200 rounded-lg group-hover:scale-110 transition-transform">
              <Users size={16} className="text-blue-600" />
            </div>
          </div>
          <div className="w-full h-1.5 bg-blue-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Active Drivers */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-3 border border-emerald-200 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Active</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{drivers.filter(d => d.status === 'active').length}</p>
            </div>
            <div className="p-2 bg-emerald-200 rounded-lg group-hover:scale-110 transition-transform">
              <TrendingUp size={16} className="text-emerald-600" />
            </div>
          </div>
          <div className="w-full h-1.5 bg-emerald-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600" style={{ width: `${drivers.length > 0 ? (drivers.filter(d => d.status === 'active').length / drivers.length) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* Inactive Drivers */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-3 border border-slate-200 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Inactive</p>
              <p className="text-2xl font-bold text-slate-600 mt-1">{drivers.filter(d => d.status === 'inactive').length}</p>
            </div>
            <div className="p-2 bg-slate-200 rounded-lg group-hover:scale-110 transition-transform">
              <Users size={16} className="text-slate-600" />
            </div>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-slate-500 to-slate-600" style={{ width: `${drivers.length > 0 ? (drivers.filter(d => d.status === 'inactive').length / drivers.length) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* License Expiring Soon */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-3 border border-orange-200 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {drivers.filter(d => {
                  const exp = new Date(d.license_expiry);
                  const today = new Date();
                  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                  return exp <= in30Days && exp >= today;
                }).length}
              </p>
            </div>
            <div className="p-2 bg-orange-200 rounded-lg group-hover:scale-110 transition-transform">
              <AlertTriangle size={16} className="text-orange-600" />
            </div>
          </div>
          <div className="w-full h-1.5 bg-orange-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-orange-600" style={{ width: `${drivers.length > 0 ? (drivers.filter(d => {
              const exp = new Date(d.license_expiry);
              const today = new Date();
              const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
              return exp <= in30Days && exp >= today;
            }).length / drivers.length) * 100 : 0}%` }}></div>
          </div>
        </div>
      </div>

      {/* Status Distribution Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Driver Status Distribution - Doughnut Chart */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg p-3 border border-gray-200 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-gray-900 text-base">Driver Status</h4>
              <p className="text-xs text-gray-600 mt-0.5">Workforce composition</p>
            </div>
            <div className="px-2 py-1 bg-blue-100 rounded-full">
              <span className="text-xs font-bold text-blue-700">{drivers.length} Total</span>
            </div>
          </div>
          <div className="w-full h-32">
            <ResponsiveContainer width="100%" height="100%">
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
                  innerRadius={32}
                  outerRadius={50}
                  labelLine={false}
                  label={({ value }: any) => `${value}`}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={1}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#8b5cf6" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip
                  formatter={(value) => `${value} drivers`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* License Expiry Timeline - Enhanced Bar Chart */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 border border-gray-200 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-gray-900 text-base">License Expiry Timeline</h4>
              <p className="text-xs text-gray-600 mt-0.5">Drivers by expiry period</p>
            </div>
            <div className="px-2 py-1 bg-orange-100 rounded-full">
              <span className="text-xs font-bold text-orange-700">📅 Status</span>
            </div>
          </div>
          <div className="w-full h-32">
            <ResponsiveContainer width="100%" height="100%">
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
                margin={{ top: 5, right: 8, left: -25, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" radius={4} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} width={25} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontSize: '11px' }}
                  formatter={(value) => [`${value} drivers`, 'Count']}
                  labelStyle={{ color: '#6b7280' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} isAnimationActive={true}>
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
        <div className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden hover:shadow-lg transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
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
                      <span className="font-bold text-gray-900 text-xs">{driver.first_name} {driver.last_name}</span>
                      <div className="text-xs text-gray-500">{driver.email}</div>
                    </td>
                    <td className="px-3 py-2 text-gray-700 font-medium text-xs">{driver.license_number}</td>
                    <td className="px-3 py-2 text-gray-700 text-xs">{driver.phone}</td>
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
                    <td className="px-3 py-2 text-gray-700 text-xs">{driver.assigned_vehicle ? <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">{driver.assigned_vehicle}</span> : <span className="text-gray-400">-</span>}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[driver.status].badge} shadow-sm`}>
                        {driver.status === 'active' ? '✅' : driver.status === 'inactive' ? '⏸️' : '🚫'} {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Driver' : 'Add New Driver'}</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
                  <input
                    type="text"
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    placeholder="DL-001-2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    placeholder="Banda"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    placeholder="+265991234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    placeholder="john@judiciary.mw"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry</label>
                  <input
                    type="date"
                    value={formData.license_expiry}
                    onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Vehicle</label>
                  <input
                    type="text"
                    value={formData.assigned_vehicle}
                    onChange={(e) => setFormData({ ...formData, assigned_vehicle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    placeholder="JJ-16-AB"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
                  <input
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDriver}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-md"
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
