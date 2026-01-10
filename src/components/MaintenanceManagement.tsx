import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, X, AlertCircle, Wrench, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  vehicle_registration: string;
  service_type: 'oil_change' | 'tire_rotation' | 'brake_service' | 'filter_replacement' | 'inspection' | 'major_repair';
  description: string;
  cost: number;
  service_date: string;
  next_service_date: string;
  technician_name: string;
  mileage_at_service: number;
  status: 'completed' | 'scheduled' | 'in_progress' | 'cancelled';
  notes: string;
  created_at: string;
}

interface MaintenanceFormData {
  vehicle_id: string;
  vehicle_registration: string;
  service_type: 'oil_change' | 'tire_rotation' | 'brake_service' | 'filter_replacement' | 'inspection' | 'major_repair';
  description: string;
  cost: number;
  service_date: string;
  next_service_date: string;
  technician_name: string;
  mileage_at_service: number;
  status: 'completed' | 'scheduled' | 'in_progress' | 'cancelled';
  notes: string;
}

const statusColors: Record<string, { badge: string; bg: string; text: string }> = {
  completed: { badge: 'bg-emerald-100 text-emerald-800', bg: 'from-emerald-50 to-green-50', text: 'text-emerald-600' },
  scheduled: { badge: 'bg-blue-100 text-blue-800', bg: 'from-blue-50 to-cyan-50', text: 'text-blue-600' },
  in_progress: { badge: 'bg-amber-100 text-amber-800', bg: 'from-amber-50 to-orange-50', text: 'text-amber-600' },
  cancelled: { badge: 'bg-red-100 text-red-800', bg: 'from-red-50 to-rose-50', text: 'text-red-600' },
};

const serviceTypeNames: Record<string, string> = {
  oil_change: 'Oil Change',
  tire_rotation: 'Tire Rotation',
  brake_service: 'Brake Service',
  filter_replacement: 'Filter Replacement',
  inspection: 'Vehicle Inspection',
  major_repair: 'Major Repair',
};

export default function MaintenanceManagement() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterServiceType, setFilterServiceType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'cost' | 'vehicle' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState<MaintenanceFormData>({
    vehicle_id: '',
    vehicle_registration: '',
    service_type: 'oil_change',
    description: '',
    cost: 0,
    service_date: new Date().toISOString().split('T')[0],
    next_service_date: '',
    technician_name: '',
    mileage_at_service: 0,
    status: 'completed',
    notes: '',
  });

  // Mock data
  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const mockRecords: MaintenanceRecord[] = [
        {
          id: '1',
          vehicle_id: 'v1',
          vehicle_registration: 'JJ-16-AB',
          service_type: 'oil_change',
          description: 'Regular oil and filter change',
          cost: 15000,
          service_date: '2026-01-05',
          next_service_date: '2026-04-05',
          technician_name: 'John Mwale',
          mileage_at_service: 45200,
          status: 'completed',
          notes: 'Service completed successfully',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          vehicle_id: 'v2',
          vehicle_registration: 'JJ-16-AC',
          service_type: 'tire_rotation',
          description: 'Tire rotation and alignment',
          cost: 8500,
          service_date: '2026-01-08',
          next_service_date: '2026-07-08',
          technician_name: 'Grace Banda',
          mileage_at_service: 62600,
          status: 'completed',
          notes: 'All tires in good condition',
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          vehicle_id: 'v3',
          vehicle_registration: 'JJ-16-AD',
          service_type: 'brake_service',
          description: 'Brake pad replacement and inspection',
          cost: 22000,
          service_date: '2026-01-02',
          next_service_date: '2026-12-02',
          technician_name: 'Peter Chisaka',
          mileage_at_service: 28100,
          status: 'completed',
          notes: 'Front brake pads replaced',
          created_at: new Date().toISOString(),
        },
        {
          id: '4',
          vehicle_id: 'v4',
          vehicle_registration: 'JJ-16-AE',
          service_type: 'inspection',
          description: 'Annual vehicle inspection',
          cost: 5000,
          service_date: '2026-01-15',
          next_service_date: '2027-01-15',
          technician_name: 'Mercy Phiri',
          mileage_at_service: 78700,
          status: 'scheduled',
          notes: 'Awaiting inspection slot',
          created_at: new Date().toISOString(),
        },
        {
          id: '5',
          vehicle_id: 'v5',
          vehicle_registration: 'JJ-16-AF',
          service_type: 'filter_replacement',
          description: 'Air filter replacement',
          cost: 3500,
          service_date: '2026-01-10',
          next_service_date: '2026-07-10',
          technician_name: 'John Mwale',
          mileage_at_service: 95200,
          status: 'in_progress',
          notes: 'Currently being serviced',
          created_at: new Date().toISOString(),
        },
        {
          id: '6',
          vehicle_id: 'v1',
          vehicle_registration: 'JJ-16-AB',
          service_type: 'major_repair',
          description: 'Engine transmission service',
          cost: 75000,
          service_date: '2025-12-20',
          next_service_date: '2027-12-20',
          technician_name: 'Samuel Kachale',
          mileage_at_service: 42000,
          status: 'completed',
          notes: 'Major overhaul completed',
          created_at: new Date().toISOString(),
        },
      ];
      setRecords(mockRecords);
    } catch (err) {
      setError('Failed to load maintenance records');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = () => {
    setFormData({
      vehicle_id: '',
      vehicle_registration: '',
      service_type: 'oil_change',
      description: '',
      cost: 0,
      service_date: new Date().toISOString().split('T')[0],
      next_service_date: '',
      technician_name: '',
      mileage_at_service: 0,
      status: 'completed',
      notes: '',
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditRecord = (record: MaintenanceRecord) => {
    setFormData({
      vehicle_id: record.vehicle_id,
      vehicle_registration: record.vehicle_registration,
      service_type: record.service_type,
      description: record.description,
      cost: record.cost,
      service_date: record.service_date,
      next_service_date: record.next_service_date,
      technician_name: record.technician_name,
      mileage_at_service: record.mileage_at_service,
      status: record.status,
      notes: record.notes,
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  const handleSaveRecord = async () => {
    if (!formData.vehicle_registration || !formData.description || formData.cost <= 0) {
      setError('Vehicle, description, and cost are required');
      return;
    }

    try {
      if (editingId) {
        setRecords(records.map(r => r.id === editingId ? { ...r, ...formData } : r));
      } else {
        const newRecord: MaintenanceRecord = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date().toISOString(),
        };
        setRecords([...records, newRecord]);
      }
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError('Failed to save maintenance record');
      console.error(err);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      setRecords(records.filter(r => r.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete record');
      console.error(err);
    }
  };

  const filteredRecords = (filterStatus === 'all'
    ? records
    : records.filter(r => r.status === filterStatus)
  ).filter(r =>
    (filterServiceType === 'all' || r.service_type === filterServiceType) &&
    (r.vehicle_registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
     r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
     r.technician_name.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => {
    let compareValue = 0;
    switch (sortBy) {
      case 'cost':
        compareValue = a.cost - b.cost;
        break;
      case 'vehicle':
        compareValue = a.vehicle_registration.localeCompare(b.vehicle_registration);
        break;
      case 'status':
        compareValue = a.status.localeCompare(b.status);
        break;
      default:
        compareValue = new Date(a.service_date).getTime() - new Date(b.service_date).getTime();
    }
    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  const viewingRecord = records.find(r => r.id === viewingId);

  const totalCost = records.reduce((sum, r) => sum + (r.status === 'completed' ? r.cost : 0), 0);
  const completedCount = records.filter(r => r.status === 'completed').length;
  const scheduledCount = records.filter(r => r.status === 'scheduled').length;
  const inProgressCount = records.filter(r => r.status === 'in_progress').length;

  // Chart data
  const serviceTypeData = Object.entries(serviceTypeNames).map(([key, name]) => ({
    name,
    count: records.filter(r => r.service_type === key).length,
  }));

  const costTrendData = [
    { month: 'Nov', cost: 45000 },
    { month: 'Dec', cost: 125000 },
    { month: 'Jan', cost: 129500 },
  ];

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
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 rounded-lg p-3 text-white shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wrench size={18} />
              <h1 className="text-lg font-bold">Maintenance Management</h1>
            </div>
            <p className="text-purple-100 text-xs">Track vehicle maintenance and service records</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all font-medium text-sm backdrop-blur-sm border border-white border-opacity-30"
              title="Export report"
            >
              📊
              Reports
            </button>
            <button
              onClick={handleAddRecord}
              className="flex items-center gap-2 px-6 py-2.5 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-all font-semibold shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Add Record
            </button>
          </div>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {/* Total Cost */}
        <div className="bg-gradient-to-br from-red-50 to-orange-100 rounded-lg p-1.5 border border-red-200 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Total Cost</p>
              <p className="text-lg font-bold text-red-600 mt-1">MK{(totalCost / 1000).toFixed(0)}k</p>
            </div>
            <div className="p-1 bg-red-200 rounded-lg group-hover:scale-110 transition-transform">
              <TrendingUp size={12} className="text-red-600" />
            </div>
          </div>
          <div className="w-full h-2 bg-red-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-500 to-orange-600" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Completed Services */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-1.5 border border-emerald-200 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Completed</p>
              <p className="text-lg font-bold text-emerald-600 mt-1">{completedCount}</p>
            </div>
            <div className="p-1 bg-emerald-200 rounded-lg group-hover:scale-110 transition-transform">
              <Wrench size={12} className="text-emerald-600" />
            </div>
          </div>
          <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600" style={{ width: `${records.length > 0 ? (completedCount / records.length) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* Scheduled Services */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-1.5 border border-blue-200 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Scheduled</p>
              <p className="text-lg font-bold text-blue-600 mt-1">{scheduledCount}</p>
            </div>
            <div className="p-1 bg-blue-200 rounded-lg group-hover:scale-110 transition-transform">
              <Calendar size={12} className="text-blue-600" />
            </div>
          </div>
          <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: `${records.length > 0 ? (scheduledCount / records.length) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-1.5 border border-amber-200 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">In Progress</p>
              <p className="text-lg font-bold text-amber-600 mt-1">{inProgressCount}</p>
            </div>
            <div className="p-1 bg-amber-200 rounded-lg group-hover:scale-110 transition-transform">
              <AlertTriangle size={12} className="text-amber-600" />
            </div>
          </div>
          <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600" style={{ width: `${records.length > 0 ? (inProgressCount / records.length) * 100 : 0}%` }}></div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Service Type Distribution */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg p-3 border border-gray-200 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Service Types</h4>
              <p className="text-xs text-gray-600 mt-0.5">Distribution breakdown</p>
            </div>
            <div className="px-3 py-1.5 bg-purple-100 rounded-full">
              <span className="text-xs font-bold text-purple-700">{records.length} Total</span>
            </div>
          </div>
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceTypeData.filter(item => item.count > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  labelLine={false}
                  label={({ name, count }: any) => `${name}\n${count}`}
                  fill="#8884d8"
                  dataKey="count"
                  paddingAngle={2}
                >
                  <Cell fill="#7c3aed" />
                  <Cell fill="#2563eb" />
                  <Cell fill="#059669" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#dc2626" />
                  <Cell fill="#14b8a6" />
                </Pie>
                <Tooltip
                  formatter={(value) => `${value} services`}
                  contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '0.75rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Trend */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-3 border border-gray-200 shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Maintenance Cost Trend</h4>
              <p className="text-xs text-gray-600 mt-0.5">Monthly spending</p>
            </div>
            <div className="px-3 py-1.5 bg-red-100 rounded-full">
              <span className="text-xs font-bold text-red-700">📈 Trend</span>
            </div>
          </div>
          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={costTrendData} margin={{ top: 10, right: 15, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip
                  formatter={(value: any) => `MK${value?.toLocaleString?.() || value || 0}`}
                  contentStyle={{ backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '0.75rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  labelStyle={{ color: '#6b7280' }}
                />
                <Line type="monotone" dataKey="cost" stroke="#dc2626" strokeWidth={3} dot={{ fill: '#dc2626', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200 shadow-md p-3 space-y-2">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-xs font-bold text-gray-900">Filter & Search</h3>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">{filteredRecords.length} Results</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <input
              type="text"
              placeholder="🔍 Search vehicle, description, technician..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1.5 pl-8 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white text-xs transition-all hover:border-gray-300"
            />
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2 py-1.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white text-xs font-medium transition-all hover:border-gray-300"
            >
              <option value="date">📅 Date</option>
              <option value="cost">💰 Cost</option>
              <option value="vehicle">🚗 Vehicle</option>
              <option value="status">🎯 Status</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-full px-2 py-1.5 border-2 border-gray-200 rounded-lg hover:bg-purple-50 bg-white transition-all text-xs font-bold text-gray-700 hover:border-purple-300"
            >
              {sortOrder === 'asc' ? '↑ Low-High' : '↓ High-Low'}
            </button>
          </div>
        </div>

        {/* Status & Service Type Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-bold text-gray-700 mb-1 block">Status</label>
            <div className="flex flex-wrap gap-1">
              {['all', 'completed', 'scheduled', 'in_progress', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all transform hover:scale-105 ${
                    filterStatus === status
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {status === 'all' ? '📊 All' : status === 'completed' ? '✅ Done' : status === 'scheduled' ? '📅 Scheduled' : status === 'in_progress' ? '⏳ In Progress' : '❌ Cancelled'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 mb-1 block">Service Type</label>
            <div className="flex flex-wrap gap-1">
              {['all', 'oil_change', 'tire_rotation', 'brake_service', 'inspection'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterServiceType(type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all transform hover:scale-105 ${
                    filterServiceType === type
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  {type === 'all' ? '🔧 All' : type === 'oil_change' ? '🛢️ Oil' : type === 'tire_rotation' ? '🛞 Tires' : type === 'brake_service' ? '🛑 Brakes' : '🔍 Inspection'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Records Table */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-purple-50 rounded-lg border border-gray-200 shadow-sm">
          <div className="text-gray-300 mb-4">
            <Wrench size={56} className="mx-auto opacity-30" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No maintenance records found</h3>
          <p className="text-gray-600 text-sm mb-4">Try adjusting your search or filters</p>
          <button
            onClick={handleAddRecord}
            className="inline-flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-semibold text-sm shadow-md"
          >
            <Plus size={16} />
            Add First Record
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden hover:shadow-lg transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-4 text-left font-bold text-white">🚗 Vehicle</th>
                  <th className="px-4 py-4 text-left font-bold text-white">🔧 Service Type</th>
                  <th className="px-4 py-4 text-left font-bold text-white">📝 Description</th>
                  <th className="px-4 py-4 text-left font-bold text-white">💰 Cost</th>
                  <th className="px-4 py-4 text-left font-bold text-white">👤 Technician</th>
                  <th className="px-4 py-4 text-left font-bold text-white">📅 Date</th>
                  <th className="px-4 py-4 text-left font-bold text-white">🎯 Status</th>
                  <th className="px-4 py-4 text-center font-bold text-white">⚙️ Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, idx) => (
                  <tr key={record.id} className={`border-b border-gray-100 hover:bg-purple-50 transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                    <td className="px-4 py-3">
                      <span className="font-bold text-gray-900">{record.vehicle_registration}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{serviceTypeNames[record.service_type]}</td>
                    <td className="px-4 py-3 text-gray-700">{record.description}</td>
                    <td className="px-4 py-3 font-bold text-red-600">MK{record.cost.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-700">{record.technician_name}</td>
                    <td className="px-4 py-3 text-gray-700">{new Date(record.service_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold ${statusColors[record.status].badge} shadow-sm`}>
                        {record.status === 'completed' ? '✅' : record.status === 'scheduled' ? '📅' : record.status === 'in_progress' ? '⏳' : '❌'} {record.status.charAt(0).toUpperCase() + record.status.slice(1).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewingId(record.id)}
                          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-all font-bold hover:shadow-md"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditRecord(record)}
                          className="p-2 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-all font-bold hover:shadow-md"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(record.id)}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-all font-bold hover:shadow-md"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 text-xs text-gray-600 flex justify-between">
            <span>Showing {filteredRecords.length} of {records.length} records</span>
            <span className="font-bold">Total Cost: MK{records.reduce((sum, r) => sum + r.cost, 0).toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Maintenance Record' : 'Add New Maintenance Record'}</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Registration *</label>
                  <input
                    type="text"
                    value={formData.vehicle_registration}
                    onChange={(e) => setFormData({ ...formData, vehicle_registration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                    placeholder="JJ-16-AB"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
                  <select
                    value={formData.service_type}
                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  >
                    <option value="oil_change">Oil Change</option>
                    <option value="tire_rotation">Tire Rotation</option>
                    <option value="brake_service">Brake Service</option>
                    <option value="filter_replacement">Filter Replacement</option>
                    <option value="inspection">Vehicle Inspection</option>
                    <option value="major_repair">Major Repair</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                    placeholder="Service description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost (MK) *</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Date</label>
                  <input
                    type="date"
                    value={formData.service_date}
                    onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Service Date</label>
                  <input
                    type="date"
                    value={formData.next_service_date}
                    onChange={(e) => setFormData({ ...formData, next_service_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Technician Name</label>
                  <input
                    type="text"
                    value={formData.technician_name}
                    onChange={(e) => setFormData({ ...formData, technician_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                    placeholder="John Mwale"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mileage at Service</label>
                  <input
                    type="number"
                    value={formData.mileage_at_service}
                    onChange={(e) => setFormData({ ...formData, mileage_at_service: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                    placeholder="45000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                  >
                    <option value="completed">Completed</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRecord}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm shadow-md"
              >
                {editingId ? 'Update Record' : 'Create Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Maintenance Record Details</h2>
              <button
                onClick={() => setViewingId(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Vehicle</p>
                  <p className="text-gray-900 font-bold text-lg">{viewingRecord.vehicle_registration}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Service Type</p>
                  <p className="text-gray-900 font-bold text-lg">{serviceTypeNames[viewingRecord.service_type]}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Cost</p>
                  <p className="text-red-600 font-bold text-lg">MK{viewingRecord.cost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Status</p>
                  <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold ${statusColors[viewingRecord.status].badge}`}>
                    {viewingRecord.status.charAt(0).toUpperCase() + viewingRecord.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Service Date</p>
                  <p className="text-gray-900 font-semibold">{new Date(viewingRecord.service_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Next Service</p>
                  <p className="text-gray-900 font-semibold">{viewingRecord.next_service_date ? new Date(viewingRecord.next_service_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Technician</p>
                  <p className="text-gray-900 font-semibold">{viewingRecord.technician_name}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm mb-1">Mileage</p>
                  <p className="text-gray-900 font-semibold">{viewingRecord.mileage_at_service.toLocaleString()} km</p>
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm mb-1">Description</p>
                <p className="text-gray-900">{viewingRecord.description}</p>
              </div>
              {viewingRecord.notes && (
                <div>
                  <p className="text-gray-600 text-sm mb-1">Notes</p>
                  <p className="text-gray-900">{viewingRecord.notes}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(viewingRecord.id)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
              >
                Delete Record
              </button>
              <button
                onClick={() => {
                  handleEditRecord(viewingRecord);
                  setViewingId(null);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
              >
                Edit Record
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
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Record?</h3>
              <p className="text-gray-600 text-center text-sm mb-6">
                This action cannot be undone. The maintenance record will be permanently deleted.
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
                onClick={() => handleDeleteRecord(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
