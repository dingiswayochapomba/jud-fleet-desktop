import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import { Plus, Edit2, Trash2, Eye, X, AlertCircle, Users, TrendingUp, AlertTriangle, CheckCircle, Gauge, Clock, Calendar, Shield, Activity, Zap, BellRing, BadgeCheck, PhoneCall, CalendarClock, ShieldCheck, Truck, MoreHorizontal } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, Tooltip, PieChart, Pie } from 'recharts';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import Swal from 'sweetalert2';
import { createDriver, deleteDriver, getAllDrivers, syncDriverExpiryNotifications, syncDriverRetirementNotifications, markDriverRetired, testConnection, updateDriver } from '../lib/supabaseQueries';
import { canRenewLicense } from '../lib/access';

type DriverStatus = 'active' | 'inactive' | 'suspended' | 'retired';
interface Driver {
  id: string;
  name: string;
  license_number: string;
  phone: string;
  license_expiry: string;
  status: DriverStatus;
  date_of_birth: string;
  date_of_appointment: string;
  license_class: string;
  cost_center?: string;
  division?: string;
  created_at: string;
}

interface DriverFormData {
  name: string;
  license_number: string;
  phone: string;
  license_expiry: string;
  status: DriverStatus | 'retired';
  date_of_birth: string;
  date_of_appointment: string;
  license_class: string;
  cost_center: string;
  division: string;
}

const statusColors: Record<string, { badge: string; bg: string; text: string; icon: string }> = {
  active: { badge: 'bg-emerald-100 text-emerald-800', bg: 'from-emerald-50 to-green-50', text: 'text-emerald-600', icon: 'emerald' },
  inactive: { badge: 'bg-gray-100 text-gray-800', bg: 'from-gray-50 to-slate-50', text: 'text-gray-600', icon: 'gray' },
  suspended: { badge: 'bg-red-100 text-red-800', bg: 'from-red-50 to-rose-50', text: 'text-red-600', icon: 'red' },
  retired: { badge: 'bg-violet-100 text-violet-800', bg: 'from-violet-50 to-white', text: 'text-violet-600', icon: 'violet' },
};

const stockDriverImages = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=160&q=80',
];

const divisionOptions = [
  'Supreme Court of Appeal',
  'High Court – General Division',
  'High Court – Commercial Division',
  'Industrial Relations Court',
  'Subordinate Courts',
  'Local and Traditional Courts',
];

function getDriverAvatarUrl(name: string) {
  const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return stockDriverImages[seed % stockDriverImages.length];
}

function getLicenseExpiryState(driver: Driver) {
  if (!driver.license_expiry) {
    return { label: 'No expiry', tone: 'gray' as const, icon: CalendarClock, daysLeft: null };
  }

  const expiryDate = new Date(driver.license_expiry);
  const today = new Date();
  const daysLeft = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return { label: 'Expired', tone: 'red' as const, icon: AlertTriangle, daysLeft };
  }
  if (daysLeft <= 15) {
    return { label: `${daysLeft}d left`, tone: 'red' as const, icon: AlertTriangle, daysLeft };
  }
  if (daysLeft <= 30) {
    return { label: `${daysLeft}d left`, tone: 'amber' as const, icon: BellRing, daysLeft };
  }
  return { label: 'Valid', tone: 'green' as const, icon: ShieldCheck, daysLeft };
}

function getDriverExpiryBucket(driver: Driver): 'expired' | 'soon' | 'valid' {
  const expiryState = getLicenseExpiryState(driver);
  if (expiryState.tone === 'red') return 'expired';
  if (expiryState.tone === 'amber') return 'soon';
  return 'valid';
}

function normalizeDriverStatus(status?: string): DriverStatus {
  const normalized = (status || '').toString().trim().toLowerCase();
  if (normalized === 'retired') return 'retired';
  if (normalized === 'inactive') return 'inactive';
  if (normalized === 'suspended') return 'suspended';
  return 'active';
}

function normalizeDriver(record: any): Driver {
  const dob = record?.date_of_birth || '';
  let age: number | null = null;
  if (dob) {
    const d = new Date(dob);
    if (!Number.isNaN(d.getTime())) {
      const today = new Date();
      age = today.getFullYear() - d.getFullYear();
      const m = today.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1;
    }
  }

  // If age indicates retirement, prefer that status for display
  const computedStatus = age !== null && age >= 65 ? 'retired' : normalizeDriverStatus(record?.status);

  return {
    id: record?.id || '',
    name: record?.name || 'Unnamed Driver',
    license_number: record?.license_number || '',
    phone: record?.phone || '',
    license_expiry: record?.license_expiry || '',
    status: computedStatus,
    date_of_birth: dob,
    date_of_appointment: record?.date_of_appointment || '',
    license_class: record?.license_class || '',
    cost_center: record?.cost_center || '',
    division: record?.division || '',
    created_at: record?.created_at || new Date().toISOString(),
  };
}

export default function DriversManagement({ currentUserId, userRole, highlightDriverId }: { currentUserId?: string | null; userRole?: string | null; highlightDriverId?: string }) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'expired' | 'soon' | 'valid'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'license_number' | 'date_of_appointment' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [renewingExpiry, setRenewingExpiry] = useState<string>('');
  const [renewingLicenseNumber, setRenewingLicenseNumber] = useState<string>('');
  const [formData, setFormData] = useState<DriverFormData>({
    name: '',
    license_number: '',
    phone: '',
    license_expiry: '',
    status: 'active',
    date_of_birth: new Date().toISOString().split('T')[0],
    date_of_appointment: '',
    license_class: '',
    cost_center: '',
    division: '',
  });
  const statusChartRef = useRef<HTMLDivElement | null>(null);

  const loadDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const connTest = await testConnection();
      if (!connTest.success) {
        throw new Error(connTest.error?.message || 'Unable to connect to database');
      }

      const { data, error } = await getAllDrivers();
      if (error) {
        throw new Error(error?.message || error?.error_description || error?.details || 'Failed to load drivers');
      }

      const normalizedDrivers = (data || []).map(normalizeDriver);
      setDrivers(normalizedDrivers);

      if (normalizedDrivers.length > 0 && currentUserId) {
        await syncDriverExpiryNotifications(currentUserId, normalizedDrivers);
        try {
          await syncDriverRetirementNotifications(currentUserId, normalizedDrivers);
        } catch (e) {
          // Non-fatal: retirement sync failing should not block UI
          console.warn('Retirement sync failed', e);
        }
        // Automatically mark drivers aged >= 65 as retired in the DB if not already set
        try {
          const rawDrivers = data || [];
          for (const rec of rawDrivers) {
            try {
              const dob = rec?.date_of_birth || rec?.dob || '';
              if (!dob) continue;
              const d = new Date(dob);
              if (Number.isNaN(d.getTime())) continue;
              const today = new Date();
              let age = today.getFullYear() - d.getFullYear();
              const m = today.getMonth() - d.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age -= 1;
              const currentStatus = (rec?.status || '').toString().toLowerCase();
              if (age >= 65 && currentStatus !== 'retired') {
                // mark retired (non-blocking per driver)
                try {
                  await markDriverRetired(rec.id);
                  console.info(`Marked driver ${rec.id} as retired (age ${age})`);
                } catch (err) {
                  console.warn('Failed to mark driver retired', rec.id, err);
                }
              }
            } catch (inner) {
              /* ignore per-record errors */
            }
          }
        } catch (err) {
          console.warn('Retirement DB update pass failed', err);
        }
      }
    } catch (err: any) {
      console.error('❌ Driver loading exception:', err);
      setError(`Error: ${err?.message || 'Failed to load drivers'}`);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDrivers();
  }, [loadDrivers]);

  useEffect(() => {
    if (highlightDriverId) {
      setViewingId(highlightDriverId);
    }
  }, [highlightDriverId]);

  useEffect(() => {
    if (!statusChartRef.current) return;

    const chart = echarts.init(statusChartRef.current);
    const chartData = ['active', 'inactive', 'suspended', 'retired'].map((status) => ({
      name: status === 'inactive' ? 'Inactive' : status.charAt(0).toUpperCase() + status.slice(1),
      value: drivers.filter((driver) => driver.status === status).length,
    }));

    const option: EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => `${params.name}: ${params.value} drivers (${params.percent}%)`,
      },
      legend: {
        bottom: 0,
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: '#4b5563', fontSize: 12 },
        data: chartData.map((item) => item.name),
      },
      series: [
        {
          name: 'Driver Status',
          type: 'pie',
          radius: ['40%', '75%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#ffffff',
            borderWidth: 2,
          },
          emphasis: {
            scale: true,
            scaleSize: 8,
          },
          label: {
            show: true,
            position: 'outside',
            formatter: (params: any) => `${params.name}\n${params.value}`,
            color: '#111827',
            fontSize: 12,
            fontWeight: '600',
          },
          labelLine: {
            show: true,
            length: 10,
            length2: 8,
          },
          data: [
            { value: chartData[0].value, name: chartData[0].name, itemStyle: { color: '#10b981' } },
            { value: chartData[1].value, name: chartData[1].name, itemStyle: { color: '#6366f1' } },
            { value: chartData[2].value, name: chartData[2].name, itemStyle: { color: '#ef4444' } },
            { value: chartData[3].value, name: chartData[3].name, itemStyle: { color: '#8b5cf6' } },
          ],
        },
      ],
    };

    chart.setOption(option);
    const resize = () => chart.resize();
    window.addEventListener('resize', resize);

    return () => {
      chart.dispose();
      window.removeEventListener('resize', resize);
    };
  }, [drivers]);

  const handleAddDriver = () => {
    setFormData({
      name: '',
      license_number: '',
      phone: '',
      license_expiry: '',
      status: 'active',
      date_of_birth: new Date().toISOString().split('T')[0],
      date_of_appointment: '',
      license_class: '',
      cost_center: '',
      division: '',
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
      date_of_birth: driver.date_of_birth || '',
      date_of_appointment: driver.date_of_appointment || '',
      license_class: driver.license_class || '',
      cost_center: driver.cost_center || '',
      division: driver.division || '',
    });
    setEditingId(driver.id);
    setShowForm(true);
  };

  const handleSaveDriver = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setError(null);
    
    if (!formData.license_number?.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'License number is required',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }
    if (!formData.name?.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Name is required',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }
    if (!formData.date_of_birth?.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Date of birth is required',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        license_number: formData.license_number.trim(),
        phone: formData.phone.trim(),
        cost_center: formData.cost_center.trim(),
        division: formData.division,
      };

      if (editingId) {
        const { data, error } = await updateDriver(editingId, payload);
        if (error) throw error;
        await loadDrivers();
        setShowForm(false);
        await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Driver ${payload.name} updated successfully`,
          confirmButtonColor: '#10b981',
          timer: 2000,
          timerProgressBar: true,
        });
      } else {
        const { data, error } = await createDriver(payload);
        if (error) throw error;
        await loadDrivers();
        setShowForm(false);
        await Swal.fire({
          icon: 'success',
          title: 'Driver Added',
          text: `New driver ${payload.name} added successfully`,
          confirmButtonColor: '#10b981',
          timer: 2000,
          timerProgressBar: true,
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to save driver: ${errorMsg}`,
        confirmButtonColor: '#ef4444',
      });
      console.error(err);
    }
  };

  const handleDeleteDriver = async (id: string) => {
    try {
      const deletedDriver = drivers.find(d => d.id === id);
      const { error } = await deleteDriver(id);
      if (error) throw error;
      await loadDrivers();
      setDeleteConfirm(null);
      await Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: `Driver ${deletedDriver?.name} deleted successfully`,
        confirmButtonColor: '#10b981',
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to delete driver: ${errorMsg}`,
        confirmButtonColor: '#ef4444',
      });
      console.error(err);
    }
  };

  const filteredDrivers = drivers
    .filter((driver) => {
      const matchesStatus = filterStatus === 'all' || driver.status === filterStatus;
      const matchesExpiry = expiryFilter === 'all' || getDriverExpiryBucket(driver) === expiryFilter;
      const matchesSearch = !searchTerm || [driver.name, driver.license_number, driver.phone, driver.license_class, driver.cost_center, driver.division]
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesStatus && matchesExpiry && matchesSearch;
    })
    .sort((a, b) => {
    let compareValue = 0;
    switch (sortBy) {
      case 'license_number':
        compareValue = a.license_number.localeCompare(b.license_number);
        break;
      case 'status':
        compareValue = a.status.localeCompare(b.status);
        break;
      case 'date_of_appointment':
        compareValue = a.date_of_appointment.localeCompare(b.date_of_appointment);
        break;
      default:
        compareValue = a.name.localeCompare(b.name);
    }
    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  const viewingDriver = drivers.find(d => d.id === viewingId);
  const priorityExpiryDrivers = drivers.filter((driver) => getLicenseExpiryState(driver).tone !== 'green').slice(0, 4);
  const viewingDriverExpiryState = viewingDriver ? getLicenseExpiryState(viewingDriver) : null;

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

      {/* License Expiry Notifications */}
      {priorityExpiryDrivers.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BellRing size={18} className="text-amber-600" />
              <div>
                <h3 className="text-sm font-semibold text-amber-900">License expiry notifications</h3>
                <p className="text-xs text-amber-700">Live alerts from the database for drivers needing attention</p>
              </div>
            </div>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
              {priorityExpiryDrivers.length} active
            </span>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {priorityExpiryDrivers.map((driver) => {
              const expiryState = getLicenseExpiryState(driver);
              const ExpiryIcon = expiryState.icon;
              return (
                <button
                  key={driver.id}
                  type="button"
                  onClick={() => setViewingId(driver.id)}
                  className="flex w-full items-center justify-between rounded-lg border border-amber-200 bg-white/70 px-3 py-2 text-left transition-all hover:border-amber-300 hover:bg-amber-100/70"
                >
                  <div className="flex items-center gap-2">
                    <ExpiryIcon size={16} className={expiryState.tone === 'red' ? 'text-red-600' : 'text-amber-600'} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{driver.name}</p>
                      <p className="text-xs text-gray-600">{driver.license_number || 'No license number'}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${expiryState.tone === 'red' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {expiryState.label}
                  </span>
                </button>
              );
            })}
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
              <p className="text-[11px] text-blue-600">Live from the database</p>
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
              <p className="text-[11px] text-emerald-600">Operational fleet</p>
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
              <p className="text-[11px] text-gray-600">Awaiting deployment</p>
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
              <p className="text-[11px] text-amber-600">Based on current license dates</p>
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
        {/* Driver Status Distribution - Enhanced Card */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg border border-blue-100">
                <Activity size={20} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">Driver Status</h4>
                <p className="text-xs text-gray-500 mt-1">Workforce composition & availability</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-sm font-bold text-blue-700">{drivers.length}</span>
              </div>
              <span className="text-xs text-gray-500">Total Drivers</span>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="w-full h-48 mb-4 min-h-48">
            <div ref={statusChartRef} className="w-full h-full" />
          </div>

          {/* Status Cards with Detailed Metrics */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              {
                status: 'active',
                label: 'Active',
                bgColor: 'bg-emerald-50',
                borderColor: 'border-emerald-200',
                iconColor: 'text-emerald-600',
                icon: CheckCircle,
                textColor: 'text-emerald-700',
              },
              {
                status: 'inactive',
                label: 'Inactive',
                bgColor: 'bg-indigo-50',
                borderColor: 'border-indigo-200',
                iconColor: 'text-indigo-600',
                icon: Gauge,
                textColor: 'text-indigo-700',
              },
              {
                status: 'suspended',
                label: 'Suspended',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                iconColor: 'text-red-600',
                icon: AlertTriangle,
                textColor: 'text-red-700',
              },
            ].map((item) => {
              const count = drivers.filter(d => d.status === item.status).length;
              const percentage = drivers.length > 0 ? Math.round((count / drivers.length) * 100) : 0;
              const expiredInStatus = drivers
                .filter(d => d.status === item.status && new Date(d.license_expiry) < new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000))
                .length;
              const Icon = item.icon;

              return (
                <div key={item.status} className={`${item.bgColor} border-2 ${item.borderColor} rounded-lg p-3 transition-all hover:shadow-md`}>
                  <div className="flex items-start gap-2 mb-2">
                    <Icon size={16} className={item.iconColor} />
                    <div className="flex-1">
                      <div className={`text-xs font-semibold ${item.textColor}`}>{item.label}</div>
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Share:</span>
                      <span className={`font-semibold ${item.textColor}`}>{percentage}%</span>
                    </div>
                    {expiredInStatus > 0 && (
                      <div className="flex justify-between pt-1 border-t border-gray-200">
                        <span className="text-gray-600">At-Risk:</span>
                        <span className="font-semibold text-red-600">{expiredInStatus}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Key Performance Indicators */}
          <div className="border-t border-gray-100 pt-4">
            <h5 className="text-xs font-semibold text-gray-900 mb-3 uppercase tracking-wide">Performance Metrics</h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-blue-600" />
                  <span className="text-sm text-gray-700">Operational Rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="font-bold text-gray-900 text-sm">
                      {drivers.length > 0 ? Math.round((drivers.filter(d => d.status === 'active').length / drivers.length) * 100) : 0}%
                    </div>
                  </div>
                  <div className="w-8 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all"
                      style={{
                        width: `${drivers.length > 0 ? Math.round((drivers.filter(d => d.status === 'active').length / drivers.length) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-orange-600" />
                  <span className="text-sm text-gray-700">License Issues</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="font-bold text-gray-900 text-sm">
                      {drivers.filter(d => new Date(d.license_expiry) < new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)).length}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">drivers</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-violet-600" />
                  <span className="text-sm text-gray-700">Avg. Appointment</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900 text-sm">
                    {drivers.length > 0
                      ? Math.floor(
                          drivers.reduce((sum, d) => {
                            if (!d.date_of_appointment) return sum;
                            const years = (new Date().getTime() - new Date(d.date_of_appointment).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
                            return sum + years;
                          }, 0) / drivers.length
                        )
                      : 0}
                  </div>
                  <div className="text-xs text-gray-600">years ago</div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Legend */}
          <div className="mt-4 space-y-2 text-xs border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-gray-700">Active drivers are available for operations</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span className="text-gray-700">Inactive drivers are temporarily unavailable</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-700">Suspended drivers require immediate review</span>
            </div>
          </div>
        </div>

        {/* License Expiry Timeline - Enhanced with detailed tracking */}
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
              <div className="text-xs text-gray-500 font-medium">Total Drivers</div>
            </div>
          </div>

          {/* Overview Chart */}
          <div className="w-full h-40 min-h-40 mb-4">
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

          {/* Status Summary Grid */}
          <div className="grid grid-cols-4 gap-3 mb-4 text-xs">
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="font-bold text-red-700">{drivers.filter(d => new Date(d.license_expiry) < new Date()).length}</div>
              <div className="text-red-600">Expired</div>
            </div>
            <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
              <div className="font-bold text-orange-700">{drivers.filter(d => {
                const exp = new Date(d.license_expiry);
                const today = new Date();
                const in15Days = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
                return exp > today && exp <= in15Days;
              }).length}</div>
              <div className="text-orange-600">0-15 Days</div>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="font-bold text-yellow-700">{drivers.filter(d => {
                const exp = new Date(d.license_expiry);
                const today = new Date();
                const in15Days = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
                const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                return exp > in15Days && exp <= in30Days;
              }).length}</div>
              <div className="text-yellow-600">15-30 Days</div>
            </div>
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="font-bold text-green-700">{drivers.filter(d => {
                const exp = new Date(d.license_expiry);
                const today = new Date();
                const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
                return exp > in30Days;
              }).length}</div>
              <div className="text-green-600">30+ Days</div>
            </div>
          </div>

          {/* Detailed Driver List - Critical to Non-Critical */}
          <div className="border-t border-gray-100 pt-4">
            <h5 className="text-sm font-semibold text-gray-900 mb-3">At-Risk Drivers (Sorted by Urgency)</h5>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {drivers
                .filter(d => {
                  const exp = new Date(d.license_expiry);
                  return exp < new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
                })
                .sort((a, b) => {
                  const dateA = new Date(a.license_expiry).getTime();
                  const dateB = new Date(b.license_expiry).getTime();
                  return dateA - dateB;
                })
                .slice(0, 10)
                .map((driver) => {
                  const exp = new Date(driver.license_expiry);
                  const today = new Date();
                  const daysLeft = Math.floor((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  
                  let status = 'safe';
                  let statusColor = 'bg-green-100 text-green-700 border-green-200';
                  let statusLabel = 'SAFE';
                  let statusIcon = Shield;

                  if (daysLeft < 0) {
                    status = 'expired';
                    statusColor = 'bg-red-100 text-red-700 border-red-200';
                    statusLabel = 'EXPIRED';
                    statusIcon = AlertTriangle;
                  } else if (daysLeft <= 15) {
                    status = 'critical';
                    statusColor = 'bg-red-100 text-red-700 border-red-200';
                    statusLabel = `${daysLeft}d LEFT`;
                    statusIcon = AlertTriangle;
                  } else if (daysLeft <= 30) {
                    status = 'warning';
                    statusColor = 'bg-yellow-100 text-yellow-700 border-yellow-200';
                    statusLabel = `${daysLeft}d LEFT`;
                    statusIcon = Clock;
                  }

                  const Icon = statusIcon;

                  return (
                    <div
                      key={driver.id}
                      className={`p-3 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${
                        status === 'expired' || status === 'critical'
                          ? 'bg-red-50 border-red-200 hover:bg-red-100'
                          : status === 'warning'
                          ? 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                          : 'bg-green-50 border-green-200 hover:bg-green-100'
                      }`}
                      onClick={() => setViewingId(driver.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <Icon size={16} className={status === 'expired' || status === 'critical' ? 'text-red-600' : status === 'warning' ? 'text-yellow-600' : 'text-green-600'} />
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 text-sm">{driver.name}</div>
                            <div className="text-xs text-gray-600">{driver.license_number}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="font-bold text-gray-900 text-sm">
                              {exp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="text-xs text-gray-600">{exp.getFullYear()}</div>
                          </div>
                          <div className={`px-2 py-1 rounded border font-semibold text-xs ${statusColor}`}>
                            {statusLabel}
                          </div>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            status === 'expired' || status === 'critical'
                              ? 'bg-red-600'
                              : status === 'warning'
                              ? 'bg-yellow-500'
                              : 'bg-green-600'
                          }`}
                          style={{
                            width: `${Math.max(0, Math.min(100, ((daysLeft + 1) / 90) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              {drivers.filter(d => {
                const exp = new Date(d.license_expiry);
                return exp < new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
              }).length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm">
                  <CheckCircle size={16} className="mx-auto mb-2 text-green-600" />
                  All driver licenses are valid!
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 space-y-2 text-xs border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                <span className="text-gray-700">Expired or 0-15 days: Immediate action required</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700">15-30 days: Schedule renewal soon</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-gray-700">30+ days: No action needed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* License Class Distribution */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-gradient-to-br from-violet-100 to-violet-50 rounded-lg border border-violet-100">
              <Shield size={20} className="text-violet-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">License Class Mix</h4>
              <p className="text-xs text-gray-500 mt-1">Distribution of license categories in the fleet</p>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-violet-50 rounded-lg border border-violet-100">
            <span className="text-sm font-bold text-violet-700">{drivers.length}</span>
          </div>
        </div>
        <div className="w-full h-52">
          <ResponsiveContainer width="100%" height={208}>
            <BarChart
              data={Object.entries(
                drivers.reduce((acc, driver) => {
                  const key = driver.license_class?.trim() || 'Unspecified';
                  acc[key] = (acc[key] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([name, value]) => ({ name, value }))}
              margin={{ top: 8, right: 8, left: -20, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => `${value} drivers`} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4 space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Filter & search drivers</h3>
            <p className="text-xs text-gray-500">Refine the roster by status, expiry risk, or keyword.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <span>{filteredDrivers.length}</span>
            <span className="text-blue-500">Results</span>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_0.9fr] items-end">
          <div className="relative min-w-0">
            <input
              type="text"
              placeholder="Search name, license, phone, cost center..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 pl-11 text-sm text-gray-900 shadow-sm transition focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>

          <div className="min-w-0">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500">Sort</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 shadow-sm transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="name">Name</option>
              <option value="license_number">License</option>
              <option value="date_of_appointment">Appointment</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div className="min-w-0">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500">Order</label>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-blue-300"
            >
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500">Status</div>
            <div className="flex flex-wrap gap-2">
              {['all', 'active', 'inactive', 'suspended', 'retired'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    filterStatus === status
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all'
                    ? 'All'
                    : status === 'active'
                    ? 'Active'
                    : status === 'inactive'
                    ? 'Inactive'
                    : status === 'suspended'
                    ? 'Suspended'
                    : 'Retired'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gray-500">Expiry risk</div>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'expired', label: 'Expired' },
                { value: 'soon', label: 'Soon' },
                { value: 'valid', label: 'Valid' },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setExpiryFilter(item.value as 'all' | 'expired' | 'soon' | 'valid')}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    expiryFilter === item.value
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
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
                  <th className="px-3 py-2 text-left font-bold text-white"><div className="flex items-center gap-1.5"><Users size={14} /> Name</div></th>
                  <th className="px-3 py-2 text-left font-bold text-white"><div className="flex items-center gap-1.5"><BadgeCheck size={14} /> License</div></th>
                  <th className="px-3 py-2 text-left font-bold text-white"><div className="flex items-center gap-1.5"><PhoneCall size={14} /> Phone</div></th>
                  <th className="px-3 py-2 text-left font-bold text-white"><div className="flex items-center gap-1.5"><Calendar size={14} /> DOB</div></th>
                  <th className="px-3 py-2 text-left font-bold text-white"><div className="flex items-center gap-1.5"><Shield size={14} /> License Class</div></th>
                  <th className="px-3 py-2 text-left font-bold text-white"><div className="flex items-center gap-1.5"><Calendar size={14} /> Cost Center</div></th>
                  <th className="px-3 py-2 text-left font-bold text-white"><div className="flex items-center gap-1.5"><Calendar size={14} /> Division</div></th>
                  <th className="px-3 py-2 text-left font-bold text-white"><div className="flex items-center gap-1.5"><Calendar size={14} /> Appointed</div></th>
                  <th className="px-3 py-2 text-left font-bold text-white"><div className="flex items-center gap-1.5"><CalendarClock size={14} /> Exp. Date</div></th>
                  <th className="px-3 py-2 text-left font-bold text-white"><div className="flex items-center gap-1.5"><Activity size={14} /> Status</div></th>
                  <th className="px-3 py-2 text-center font-bold text-white"><div className="flex items-center justify-center gap-1.5"><Zap size={14} /> Actions</div></th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((driver, idx) => {
                  const expiryBucket = getDriverExpiryBucket(driver);
                  const isFlagged = expiryBucket !== 'valid';
                  const rowHighlightClass = isFlagged
                    ? expiryBucket === 'expired'
                      ? 'bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 shadow-[inset_4px_0_0_0_#ef4444] border-l-4 border-red-400'
                      : 'bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 shadow-[inset_4px_0_0_0_#f59e0b] border-l-4 border-amber-400'
                    : idx % 2 === 0
                      ? 'bg-white'
                      : 'bg-slate-50';

                  return (
                  <tr key={driver.id} className={`border-b border-gray-200 hover:bg-blue-50 transition-all ${rowHighlightClass}`}>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <img src={getDriverAvatarUrl(driver.name)} alt={driver.name} className="h-9 w-9 rounded-full object-cover border border-gray-200 shadow-sm" />
                        <div>
                          <div className="font-bold text-gray-900 text-xs">{driver.name}</div>
                          {getDriverExpiryBucket(driver) !== 'valid' && (
                            <div className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${getDriverExpiryBucket(driver) === 'expired' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                              {getDriverExpiryBucket(driver) === 'expired' ? <AlertTriangle size={10} /> : <BellRing size={10} />}
                              {getDriverExpiryBucket(driver) === 'expired' ? 'Needs renewal' : 'Expires soon'}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-700 font-medium text-xs">
                      <div className="flex items-center gap-1.5">
                        <BadgeCheck size={14} className="text-blue-500" />
                        <span>{driver.license_number || '—'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-700 text-xs">
                      <div className="flex items-center gap-1.5">
                        <PhoneCall size={14} className="text-emerald-500" />
                        <span>{driver.phone || '—'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-700 text-xs font-medium">
                      {driver.date_of_birth ? new Date(driver.date_of_birth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—'}
                    </td>
                    <td className="px-3 py-2 text-gray-700 text-xs font-medium">
                      <span className="inline-block px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                        {driver.license_class || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-gray-700 text-xs font-medium">
                      {driver.cost_center || '—'}
                    </td>
                    <td className="px-3 py-2 text-gray-700 text-xs font-medium">
                      {driver.division || '—'}
                    </td>
                    <td className="px-3 py-2 text-gray-700 text-xs font-medium">
                      {driver.date_of_appointment ? new Date(driver.date_of_appointment).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—'}
                    </td>
                    <td className="px-3 py-2 font-semibold text-xs">
                      {(() => {
                        const expiryState = getLicenseExpiryState(driver);
                        const ExpiryIcon = expiryState.icon;
                        const toneClass = expiryState.tone === 'red' ? 'bg-red-100 text-red-700' : expiryState.tone === 'amber' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';
                        return (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${toneClass}`}>
                            <ExpiryIcon size={12} /> {expiryState.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[driver.status].badge} shadow-sm`}>
                        {driver.status === 'active' ? <ShieldCheck size={12} /> : driver.status === 'inactive' ? <Clock size={12} /> : <AlertTriangle size={12} />} {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center">
                        <div className="relative">
                          <button
                            onClick={() => setOpenActionMenuId(openActionMenuId === driver.id ? null : driver.id)}
                            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-600 transition-all font-bold hover:shadow-sm border border-transparent hover:border-slate-200"
                            title="Actions"
                          >
                            <MoreHorizontal size={15} />
                          </button>

                          {openActionMenuId === driver.id && (
                            <div className="absolute right-0 top-8 z-10 w-36 rounded-lg border border-gray-200 bg-white shadow-xl overflow-hidden">
                              <button
                                onClick={() => {
                                  setViewingId(driver.id);
                                  setOpenActionMenuId(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                              >
                                <Eye size={14} /> View
                              </button>
                              <button
                                onClick={() => {
                                  handleEditDriver(driver);
                                  setOpenActionMenuId(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                              >
                                <Edit2 size={14} /> Edit
                              </button>
                                  {canRenewLicense(userRole) && (
                                    <button
                                      onClick={() => {
                                        setRenewingId(driver.id);
                                        setRenewingExpiry(driver.license_expiry || '');
                                        setRenewingLicenseNumber(driver.license_number || '');
                                        setOpenActionMenuId(null);
                                      }}
                                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                                    >
                                      <ShieldCheck size={14} /> Renew License
                                    </button>
                                  )}
                              <button
                                onClick={() => {
                                  setDeleteConfirm(driver.id);
                                  setOpenActionMenuId(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-red-50 hover:text-red-700"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                  );
                })}
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

            <form onSubmit={(event) => { void handleSaveDriver(event); }} className="w-full">
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
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date of Appointment</label>
                  <input
                    type="date"
                    value={formData.date_of_appointment}
                    onChange={(e) => setFormData({ ...formData, date_of_appointment: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cost Center</label>
                  <input
                    type="text"
                    value={formData.cost_center}
                    onChange={(e) => setFormData({ ...formData, cost_center: e.target.value })}
                    placeholder="e.g. Finance, Registry"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Division</label>
                  <select
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  >
                    <option value="">Select a division</option>
                    {divisionOptions.map((division) => (
                      <option key={division} value={division}>{division}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">License Class</label>
                  <select
                    value={formData.license_class}
                    onChange={(e) => setFormData({ ...formData, license_class: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  >
                    <option value="">Select a license class</option>
                    <option value="Class A">Class A</option>
                    <option value="Class B">Class B</option>
                    <option value="Class EB">Class EB</option>
                    <option value="Class C1">Class C1</option>
                    <option value="Class C">Class C</option>
                    <option value="Class EC1">Class EC1</option>
                    <option value="Class EC">Class EC</option>
                    <option value="Class F">Class F</option>
                    <option value="Permit G">Permit G</option>
                    <option value="Permit P">Permit P</option>
                    <option value="Permit D">Permit D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">License Expiry</label>
                  <input
                    type="date"
                    value={formData.license_expiry}
                    onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as DriverFormData['status'] })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-xs text-[#EA7B7B] hover:bg-red-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#EA7B7B] text-white rounded text-xs hover:bg-[#D65A5A] transition-colors font-medium shadow-md"
                >
                  {editingId ? 'Update Driver' : 'Create Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Renew License Modal */}
      {renewingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="bg-gradient-to-r from-[#44444E] to-[#2E2E33] px-4 py-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Renew Driver License</h2>
              <button
                onClick={() => setRenewingId(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">License Number</label>
              <input
                type="text"
                value={renewingLicenseNumber}
                onChange={(e) => setRenewingLicenseNumber(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none mb-3"
              />
              <label className="block text-xs font-medium text-gray-700 mb-1">New Expiry Date *</label>
              <input
                type="date"
                value={renewingExpiry}
                onChange={(e) => setRenewingExpiry(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setRenewingId(null)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-xs text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!renewingExpiry) {
                      await Swal.fire({ icon: 'warning', title: 'Validation', text: 'Expiry date is required', confirmButtonColor: '#3b82f6' });
                      return;
                    }
                    try {
                      const payload: any = { license_expiry: renewingExpiry };
                      if (renewingLicenseNumber) payload.license_number = renewingLicenseNumber.trim();
                      const { data, error } = await updateDriver(renewingId as string, payload);
                      if (error) throw error;
                      await loadDrivers();
                      setRenewingId(null);
                      await Swal.fire({ icon: 'success', title: 'Success', text: 'License renewed', confirmButtonColor: '#10b981', timer: 1700, timerProgressBar: true });
                    } catch (err: any) {
                      await Swal.fire({ icon: 'error', title: 'Error', text: `Failed to renew license: ${err?.message || err}`, confirmButtonColor: '#ef4444' });
                    }
                  }}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700"
                >
                  Renew
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-[fadeIn_0.25s_ease-out]">
            <div className="relative">
              <div className="h-36 bg-gradient-to-r from-[#2E2E33] via-[#3F3F46] to-[#1F2024]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_45%)]" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 py-4">
                <div className="text-white">
                  <p className="text-[11px] uppercase tracking-[0.35em] opacity-80">Driver Profile</p>
                  <h2 className="text-lg font-semibold">{viewingDriver.name}</h2>
                </div>
                <button
                  onClick={() => setViewingId(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 pb-6 -mt-10">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div className="flex items-end gap-4">
                    <div className="h-24 w-24 rounded-full border-4 border-white bg-gradient-to-br from-[#2E2E33] via-[#44444E] to-[#1F2024] flex items-center justify-center text-2xl font-bold text-white shadow-xl">
                      {viewingDriver.name
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join('')
                        .toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900">{viewingDriver.name}</h3>
                      <p className="text-sm text-gray-600">{viewingDriver.license_number || 'No license number provided'}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-semibold shadow-sm ${statusColors[viewingDriver.status].badge}`}>
                      {viewingDriver.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {viewingDriverExpiryState && viewingDriverExpiryState.tone !== 'green' && (
                      <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold shadow-sm ${viewingDriverExpiryState.tone === 'red' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        <AlertTriangle size={14} />
                        {viewingDriverExpiryState.label.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-3 shadow-sm">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-indigo-500">License Class</p>
                    <p className="mt-1 text-base font-semibold text-gray-900">{viewingDriver.license_class || '—'}</p>
                  </div>
                  <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-3 shadow-sm">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-amber-600">Expiry</p>
                    <p className="mt-1 text-base font-semibold text-gray-900">
                      {viewingDriver.license_expiry ? new Date(viewingDriver.license_expiry).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-3 shadow-sm">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-emerald-600">Joined</p>
                    <p className="mt-1 text-base font-semibold text-gray-900">
                      {viewingDriver.created_at ? new Date(viewingDriver.created_at).toLocaleDateString() : '—'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500">Phone</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{viewingDriver.phone || '—'}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500">Date of Birth</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{viewingDriver.date_of_birth || '—'}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500">Date of Appointment</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{viewingDriver.date_of_appointment || '—'}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500">Status</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{viewingDriver.status.charAt(0).toUpperCase() + viewingDriver.status.slice(1)}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500">Cost Center</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{viewingDriver.cost_center || '—'}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500">Division</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{viewingDriver.division || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 px-6 py-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                onClick={() => setViewingId(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm text-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleEditDriver(viewingDriver);
                  setViewingId(null);
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#EA7B7B] to-[#D65A5A] text-white rounded-lg hover:brightness-110 transition-all font-medium text-sm shadow-sm"
              >
                Edit Driver
              </button>
              {canRenewLicense(userRole) && (
                <button
                  onClick={() => {
                    setRenewingId(viewingDriver.id);
                    setRenewingExpiry(viewingDriver.license_expiry || '');
                    setRenewingLicenseNumber(viewingDriver.license_number || '');
                    setViewingId(null);
                  }}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:brightness-110 transition-all font-medium text-sm shadow-sm"
                >
                  Renew License
                </button>
              )}
              <button
                onClick={() => setDeleteConfirm(viewingDriver.id)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
              >
                Delete Driver
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
