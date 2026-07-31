import { useState, useEffect, useRef, useMemo } from 'react';
import Swal from 'sweetalert2';
import { Plus, Edit2, Trash2, Eye, X, AlertCircle, Truck, BarChart3, Search, CheckCircle, Activity, Wrench, AlertTriangle, Recycle, MoreVertical, FileText, Image, Gauge, CalendarDays, Building2, Fuel } from 'lucide-react';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { getAllVehicles, getAllVehiclesFull, createVehicle, updateVehicle, deleteVehicle, syncVehicleStatusNotifications } from '../lib/supabaseQueries';
import { validateVehicleForm } from '../lib/vehicleUtils';

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
  cost_center?: string;
  division?: string;
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
const divisionOptions = [
  'Supreme Court of Appeal',
  'High Court – General Division',
  'High Court – Commercial Division',
  'Industrial Relations Court',
  'Subordinate Courts',
  'Local and Traditional Courts',
];

const HIGH_MILEAGE_THRESHOLD = 5000; // km — flag as highest mileage and alert for maintenance

// ============= MAIN COMPONENT =============
export default function VehiclesManagement({ highlightVehicleId, currentUserId }: { highlightVehicleId?: string; currentUserId?: string | null }) {
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
  const [filterFuelType, setFilterFuelType] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterDivision, setFilterDivision] = useState<string>('all');
  const [filterMake, setFilterMake] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [vehicleCount, setVehicleCount] = useState<number | null>(null);
  const [vehicleImages, setVehicleImages] = useState<{ [key: string]: string[] }>({});
  const [detailsTab, setDetailsTab] = useState<'info' | 'images'>('info');
  const [mileageVehicles, setMileageVehicles] = useState<Vehicle[]>([]);

  // Fleet Chat state
  const [messages] = useState<Array<{ id: string; sender: 'user' | 'bot'; text: string; time: number }>>([]);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const funnelRef = useRef<HTMLDivElement | null>(null);
  const prevHighMileageIdsRef = useRef<Set<string>>(new Set());

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
    cost_center: '',
    division: '',
  });

  const { vehiclesByMileage } = useMemo(() => {
    const list = vehicles.map((v) => ({
      id: v.id,
      registration: v.registration_number || v.id,
      make: v.make || '',
      model: v.model || '',
      mileage: v.mileage || 0,
    }));

    list.sort((a, b) => b.mileage - a.mileage);

    const threshold = HIGH_MILEAGE_THRESHOLD;
    const annotated = list.map((r) => ({ ...r, isHigh: r.mileage >= threshold }));
    return { vehiclesByMileage: annotated };
  }, [vehicles]);

  const highMileageAlertVehicles = vehicles.filter((v) => v.mileage >= HIGH_MILEAGE_THRESHOLD && !['maintenance', 'broken', 'disposed'].includes(v.status));

  // ===== LOAD VEHICLES ON MOUNT =====
  useEffect(() => {
    if (highlightVehicleId) {
      setViewingId(highlightVehicleId);
    }
  }, [highlightVehicleId]);

  useEffect(() => {
    // auto-scroll chat to bottom
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // render funnel chart for top high-mileage vehicles using ECharts
  useEffect(() => {
    if (!funnelRef.current) return;
    const chart = echarts.init(funnelRef.current as HTMLDivElement);
    const funnelColors = ['#EA7B7B', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#6B7280'];
    const top = vehiclesByMileage.slice(0, 6).map((v, index) => ({
      name: `${v.registration} - ${v.mileage.toLocaleString()} km`,
      value: v.mileage,
      itemStyle: {
        color: funnelColors[index % funnelColors.length],
      },
      label: {
        color: '#ffffff',
        fontWeight: 600,
      },
    }));
    const maxVal = top.length ? Math.max(...top.map((d) => d.value)) : 0;
    const option: EChartsOption = {
      tooltip: { trigger: 'item', formatter: (p: any) => `${p.name}: ${Number(p.value).toLocaleString()} km` },
      series: [
        {
          name: 'Mileage',
          type: 'funnel',
          left: '10%',
          top: 5,
          bottom: 5,
          width: '80%',
          min: 0,
          max: maxVal || 1,
          sort: 'descending',
          gap: 4,
          funnelAlign: 'center',
          label: { show: true, position: 'inside', fontSize: 11, color: '#ffffff' },
          labelLine: { show: false },
          emphasis: {
            focus: 'self',
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              shadowColor: 'rgba(0, 0, 0, 0.25)',
            },
          },
          data: top,
        },
      ],
    };
    chart.setOption(option);
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [vehiclesByMileage]);

  // Notify when vehicles newly cross the high-mileage threshold
  useEffect(() => {
    const prevIds = prevHighMileageIdsRef.current;
    const newlyCrossed = highMileageAlertVehicles.filter((v) => !prevIds.has(v.id));
    if (newlyCrossed.length > 0) {
      // update the prev set immediately to avoid duplicate notifications
      prevHighMileageIdsRef.current = new Set([...prevIds, ...newlyCrossed.map((v) => v.id)]);
      // call the notification sync function if we have a user id
      if (currentUserId) {
        syncVehicleStatusNotifications(currentUserId, newlyCrossed).catch((err) => {
          console.warn('Failed to sync high-mileage notifications:', err);
        });
      }

      // show an in-app toast and chat message
      try {
        Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: `${newlyCrossed.length} vehicle(s) crossed ${HIGH_MILEAGE_THRESHOLD.toLocaleString()} km`, showConfirmButton: false, timer: 4000 });
      } catch (e) {
        /* ignore */
      }

    }
  }, [highMileageAlertVehicles, currentUserId]);

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
          if (currentUserId) {
            syncVehicleStatusNotifications(currentUserId, data).catch((syncErr) => {
              console.warn('⚠️ Vehicle notification sync failed on load:', syncErr);
            });
          }
          setMileageVehicles(data);
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
    loadMileageVehicles();

    return () => {
      console.log('🧹 Cleanup function called');
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const loadMileageVehicles = async () => {
    try {
      const { data, error: mileageErr } = await getAllVehiclesFull();
      if (mileageErr) {
        console.warn('⚠️ Failed to load full mileage vehicles:', mileageErr);
        return;
      }

      if (data && data.length > 0) {
        setMileageVehicles(data);
      }
    } catch (err) {
      console.warn('⚠️ Exception loading full mileage vehicles:', err);
    }
  };

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
      cost_center: '',
      division: '',
    });
    setSubmitError(null);
  };

  const handleOpenForm = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingId(vehicle.id);
      setFormData({
        ...vehicle,
        cost_center: vehicle.cost_center || '',
        division: vehicle.division || '',
      });
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
    const { valid, errors } = validateVehicleForm(formData as any);
    if (!valid) {
      setSubmitError(errors.join('; '));
      return;
    }

    try {
      setSubmitting(true);
      console.log('📝 Submitting vehicle form...');

      let updatedList: Vehicle[] = vehicles;

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
          updatedList = updatedVehicles;
          setVehicles(updatedVehicles);
          console.log('✅ Vehicle list refreshed from database');
        } else {
          // Fallback: update local state if fetch fails
          updatedList = vehicles.map(v => v.id === editingId ? { ...v, ...formData } as Vehicle : v);
          setVehicles(updatedList);
        }
        await loadMileageVehicles();
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
          updatedList = [newVehicle, ...vehicles];
          setVehicles(updatedList);
        }
      }
      await loadMileageVehicles();

      handleCloseForm();
      const successMsg = editingId ? 'Vehicle updated successfully!' : 'Vehicle added successfully!';
      console.log(successMsg);
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: successMsg,
        confirmButtonColor: '#10b981',
        timer: 1800,
        timerProgressBar: true,
      });
      setSuccessMessage(successMsg);
      setVehicleCount(updatedList.length);
      setTimeout(() => setSuccessMessage(null), 3000);
      if (currentUserId) {
        try {
          await syncVehicleStatusNotifications(currentUserId, updatedList);
        } catch (syncErr) {
          console.warn('⚠️ Vehicle notification sync failed:', syncErr);
        }
      }
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
        await Swal.fire({
          icon: 'error',
          title: 'Delete Failed',
          text: `Failed to delete vehicle: ${err?.message || String(err)}`,
          confirmButtonColor: '#ef4444',
        });
        setError(`Delete failed: ${err?.message || String(err)}`);
        return;
      }

      console.log('✅ Vehicle deleted successfully');
      const remainingVehicles = vehicles.filter(v => v.id !== id);
      setVehicles(remainingVehicles);
      setVehicleCount(remainingVehicles.length);
      setDeleteConfirm(null);
      await loadMileageVehicles();
      await Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: 'Vehicle deleted successfully',
        confirmButtonColor: '#10b981',
        timer: 1800,
        timerProgressBar: true,
      });
      if (currentUserId) {
        try {
          await syncVehicleStatusNotifications(currentUserId, remainingVehicles);
        } catch (syncErr) {
          console.warn('⚠️ Vehicle notification sync failed after delete:', syncErr);
        }
      }
    } catch (err: any) {
      console.error('❌ Exception:', err);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Delete exception: ${err?.message || 'Unknown error'}`,
        confirmButtonColor: '#ef4444',
      });
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
  const uniqueYears = Array.from(new Set(vehicles.map(v => v.year))).sort((a, b) => b - a);
  const uniqueMakes = Array.from(new Set(vehicles.map(v => v.make))).sort((a, b) => a.localeCompare(b));
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filtered = vehicles
    .filter(v => filterStatus === 'all' || v.status === filterStatus)
    .filter(v => filterFuelType === 'all' || v.fuel_type === filterFuelType)
    .filter(v => filterYear === 'all' || v.year.toString() === filterYear)
    .filter(v => filterDivision === 'all' || (v.division || '').toLowerCase() === filterDivision.toLowerCase())
    .filter(v => filterMake === 'all' || v.make === filterMake)
    .filter(v =>
      normalizedSearch === '' ||
      v.registration_number.toLowerCase().includes(normalizedSearch) ||
      v.make.toLowerCase().includes(normalizedSearch) ||
      v.model.toLowerCase().includes(normalizedSearch) ||
      v.fuel_type.toLowerCase().includes(normalizedSearch) ||
      (v.cost_center || '').toLowerCase().includes(normalizedSearch) ||
      (v.division || '').toLowerCase().includes(normalizedSearch)
    );

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterFuelType('all');
    setFilterYear('all');
    setFilterDivision('all');
    setFilterMake('all');
    setSearchTerm('');
  };

  // ===== ANALYTICS =====
  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === 'available').length,
    in_use: vehicles.filter(v => v.status === 'in_use').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    broken: vehicles.filter(v => v.status === 'broken').length,
    disposed: vehicles.filter(v => v.status === 'disposed').length,
  };

  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance');
  const brokenVehicles = vehicles.filter(v => v.status === 'broken');

  const statusData = [
    { name: 'Available', value: stats.available, color: statusColors.available.chart },
    { name: 'In Use', value: stats.in_use, color: statusColors.in_use.chart },
    { name: 'Maintenance', value: stats.maintenance, color: statusColors.maintenance.chart },
    { name: 'Broken', value: stats.broken, color: statusColors.broken.chart },
    { name: 'Disposed', value: stats.disposed, color: statusColors.disposed.chart },
  ];

  mileageVehicles
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
  const statusChartRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!statusChartRef.current) return;

    const chart = echarts.init(statusChartRef.current);
    const chartData = statusData.map((item) => ({
      name: item.name,
      value: item.value,
      itemStyle: { color: item.color },
    }));

    const option: EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => `${params.name}: ${params.value} (${params.percent}%)`,
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
          name: 'Vehicle Status',
          type: 'pie',
          radius: ['30%', '70%'],
          center: ['50%', '45%'],
          roseType: 'area',
          avoidLabelOverlap: true,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#ffffff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}: {c}',
            color: '#111827',
            fontSize: 12,
            fontWeight: 600,
          },
          emphasis: {
            scale: true,
            scaleSize: 8,
          },
          data: chartData,
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
  }, [statusData]);

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
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
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
          {/* ===== ALERT PANELS ===== */}
          {(brokenVehicles.length > 0 || maintenanceVehicles.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {highMileageAlertVehicles.length > 0 && (
                <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-4 shadow-sm col-span-1 lg:col-span-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={18} className="text-amber-700" />
                      <div>
                        <h3 className="text-sm font-semibold text-amber-900">High Mileage Alert</h3>
                        <p className="text-xs text-amber-700">{highMileageAlertVehicles.length} vehicle(s) have reached {HIGH_MILEAGE_THRESHOLD.toLocaleString()} km — consider scheduling maintenance.</p>
                      </div>
                    </div>
                    <button onClick={() => { /* placeholder: could open maintenance modal */ }} className="px-2 py-1 bg-amber-600 text-white rounded text-xs">Schedule</button>
                  </div>
                  <div className="mt-3 grid gap-2 grid-cols-1 md:grid-cols-3">
                    {highMileageAlertVehicles.slice(0,6).map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center justify-between rounded-lg border border-amber-200 bg-white/80 px-3 py-2 text-left">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{vehicle.registration_number}</p>
                          <p className="text-xs text-gray-600">{vehicle.make} {vehicle.model}</p>
                        </div>
                        <div className="text-sm font-semibold text-amber-700">{vehicle.mileage.toLocaleString()} km</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {brokenVehicles.length > 0 && (
                <div className="rounded-xl border border-red-200 bg-red-50/90 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={18} className="text-red-600" />
                      <div>
                        <h3 className="text-sm font-semibold text-red-900">Broken Down Vehicles</h3>
                        <p className="text-xs text-red-700">Active alerts for vehicles requiring repair.</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                      {brokenVehicles.length} active
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {brokenVehicles.slice(0, 4).map((vehicle) => (
                      <button
                        key={vehicle.id}
                        type="button"
                        onClick={() => setViewingId(vehicle.id)}
                        className="flex w-full items-center justify-between rounded-lg border border-red-200 bg-white/80 px-3 py-2 text-left transition-all hover:border-red-300 hover:bg-red-50/80"
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={16} className="text-red-600" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{vehicle.registration_number}</p>
                            <p className="text-xs text-gray-600">{vehicle.make || 'Unknown make'}</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-red-100 px-2 py-1 text-[11px] font-semibold text-red-700">Broken</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {maintenanceVehicles.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Wrench size={18} className="text-amber-600" />
                      <div>
                        <h3 className="text-sm font-semibold text-amber-900">Maintenance Due</h3>
                        <p className="text-xs text-amber-700">Vehicles that need maintenance action.</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      {maintenanceVehicles.length} active
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {maintenanceVehicles.slice(0, 4).map((vehicle) => (
                      <button
                        key={vehicle.id}
                        type="button"
                        onClick={() => setViewingId(vehicle.id)}
                        className="flex w-full items-center justify-between rounded-lg border border-amber-200 bg-white/80 px-3 py-2 text-left transition-all hover:border-amber-300 hover:bg-amber-50/80"
                      >
                        <div className="flex items-center gap-2">
                          <Wrench size={16} className="text-amber-600" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{vehicle.registration_number}</p>
                            <p className="text-xs text-gray-600">{vehicle.make || 'Unknown make'}</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">Maintenance</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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
            {/* Status Distribution Nightingale Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <BarChart3 size={16} className="text-[#EA7B7B]" />
                Status Distribution
              </h2>
              {statusData.some(s => s.value > 0) ? (
                <div ref={statusChartRef} className="h-64 w-full" />
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-500 text-sm">No data</div>
              )}
            </div>

            {/* Fleet Chat — interactive assistant for vehicle queries */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-col min-h-[320px]">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Truck size={16} className="text-[#EA7B7B]" />
                  Fleet Chat
                </h2>
                <div className="text-xs text-gray-500">Top vehicles by mileage</div>
              </div>

              <div className="flex-1 min-h-0 rounded-lg bg-slate-50 p-2">
                <div ref={funnelRef} className="h-full w-full" />
              </div>
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
          <div className="flex flex-wrap gap-3 items-end bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search registration, make, model, fuel, cost center, division"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="min-w-[180px] px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="in_use">In Use</option>
              <option value="maintenance">Maintenance</option>
              <option value="broken">Broken</option>
              <option value="disposed">Disposed</option>
            </select>

            <select
              value={filterFuelType}
              onChange={(e) => setFilterFuelType(e.target.value)}
              className="min-w-[180px] px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            >
              <option value="all">All Fuel Types</option>
              {fuelTypes.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="min-w-[140px] px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            >
              <option value="all">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year.toString()}>{year}</option>
              ))}
            </select>

            <select
              value={filterDivision}
              onChange={(e) => setFilterDivision(e.target.value)}
              className="min-w-[220px] px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            >
              <option value="all">All Divisions</option>
              {divisionOptions.map(division => (
                <option key={division} value={division}>{division}</option>
              ))}
            </select>

            <select
              value={filterMake}
              onChange={(e) => setFilterMake(e.target.value)}
              className="min-w-[180px] px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            >
              <option value="all">All Makes</option>
              {uniqueMakes.map(make => (
                <option key={make} value={make}>{make}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={clearFilters}
              className="min-w-[140px] px-3 py-2 text-sm font-medium text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            >
              Clear Filters
            </button>
          </div>

          {/* ===== VEHICLES TABLE ===== */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
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
                <table className="w-full text-[11px] whitespace-nowrap">
                  <thead className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
                    <tr>
                      <th className="px-2.5 py-2 text-left font-bold text-white">
                        <div className="flex items-center gap-1.5"><Truck size={12} /> Registration</div>
                      </th>
                      <th className="px-2.5 py-2 text-left font-bold text-white">
                        <div className="flex items-center gap-1.5"><Building2 size={12} /> Make</div>
                      </th>
                      <th className="px-2.5 py-2 text-left font-bold text-white">
                        <div className="flex items-center gap-1.5"><FileText size={12} /> Model</div>
                      </th>
                      <th className="px-2.5 py-2 text-left font-bold text-white">
                        <div className="flex items-center gap-1.5"><CalendarDays size={12} /> Year</div>
                      </th>
                      <th className="px-2.5 py-2 text-left font-bold text-white">
                        <div className="flex items-center gap-1.5"><Activity size={12} /> Status</div>
                      </th>
                      <th className="px-2.5 py-2 text-left font-bold text-white">
                        <div className="flex items-center gap-1.5"><Gauge size={12} /> Mileage</div>
                      </th>
                      <th className="px-2.5 py-2 text-left font-bold text-white">
                        <div className="flex items-center gap-1.5"><Fuel size={12} /> Fuel</div>
                      </th>
                      <th className="px-2.5 py-2 text-left font-bold text-white">
                        <div className="flex items-center gap-1.5"><CalendarDays size={12} /> Insurance</div>
                      </th>
                      <th className="px-2.5 py-2 text-left font-bold text-white">
                        <div className="flex items-center gap-1.5"><Building2 size={12} /> Cost</div>
                      </th>
                      <th className="px-2.5 py-2 text-left font-bold text-white">
                        <div className="flex items-center gap-1.5"><Building2 size={12} /> Division</div>
                      </th>
                      <th className="px-2.5 py-2 text-center font-bold text-white">
                        <div className="flex items-center justify-center gap-1.5"><MoreVertical size={12} /> Actions</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((vehicle, index) => {
                      const colors = statusColors[vehicle.status];
                      const isHighMileage = (vehicle.mileage ?? 0) >= HIGH_MILEAGE_THRESHOLD;
                      const isFlagged = vehicle.status === 'broken' || vehicle.status === 'maintenance' || isHighMileage;
                      const rowHighlightClass = isFlagged
                        ? vehicle.status === 'broken'
                          ? 'bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 shadow-[inset_4px_0_0_0_#ef4444] border-l-4 border-red-400'
                          : vehicle.status === 'maintenance'
                            ? 'bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 shadow-[inset_4px_0_0_0_#f59e0b] border-l-4 border-amber-400'
                            : 'bg-gradient-to-r from-blue-50 via-cyan-50 to-sky-50 shadow-[inset_4px_0_0_0_#3b82f6] border-l-4 border-blue-400'
                        : index % 2 === 0
                          ? 'bg-white'
                          : 'bg-slate-50';

                      return (
                        <tr key={vehicle.id} className={`border-b border-gray-100 hover:bg-blue-50 transition-all ${rowHighlightClass}`}>
                          <td className="px-2.5 py-2 text-[11px] font-semibold text-gray-900">{vehicle.registration_number}</td>
                          <td className="px-2.5 py-2 text-[11px] text-gray-600">{vehicle.make || '—'}</td>
                          <td className="px-2.5 py-2 text-[11px] text-gray-600">{vehicle.model || '—'}</td>
                          <td className="px-2.5 py-2 text-[11px] text-gray-600">{vehicle.year || '—'}</td>
                          <td className="px-2.5 py-2">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${colors.badge}`}>
                                {vehicle.status.replace(/_/g, ' ')}
                              </span>
                              {isFlagged && (
                                <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold whitespace-nowrap ${vehicle.status === 'broken' ? 'bg-red-100 text-red-700' : vehicle.status === 'maintenance' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {vehicle.status === 'broken' ? <AlertTriangle size={9} /> : vehicle.status === 'maintenance' ? <Wrench size={9} /> : <AlertCircle size={9} />}
                                  {vehicle.status === 'broken' ? 'Needs attention' : vehicle.status === 'maintenance' ? 'Under maintenance' : 'High mileage'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-2.5 py-2 text-[11px] text-gray-600">{(vehicle.mileage ?? 0).toLocaleString()} km</td>
                          <td className="px-2.5 py-2 text-[11px] text-gray-600 capitalize">{vehicle.fuel_type || '—'}</td>
                          <td className="px-2.5 py-2 text-[11px] text-gray-600">{vehicle.insurance_expiry ? new Date(vehicle.insurance_expiry).toLocaleDateString('en-GB') : '—'}</td>
                          <td className="px-2.5 py-2 text-[11px] text-gray-600">{vehicle.cost_center || '—'}</td>
                          <td className="px-2.5 py-2 text-[11px] text-gray-600">{vehicle.division || '—'}</td>
                          <td className="px-3 py-2">
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-[#44444E] to-[#2E2E33] px-4 py-3 flex justify-between items-center rounded-t-lg">
              <h2 className="text-lg font-bold text-white">
                {editingId ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h2>
              <button
                onClick={handleCloseForm}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
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
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
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
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
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
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
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
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
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
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
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
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
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
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
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
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>

                {/* Cost Center */}
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">
                    Cost Center
                  </label>
                  <input
                    type="text"
                    value={formData.cost_center || ''}
                    onChange={(e) => setFormData({ ...formData, cost_center: e.target.value })}
                    placeholder="e.g. Registry, Finance"
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  />
                </div>

                {/* Division */}
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">
                    Division
                  </label>
                  <select
                    value={formData.division || ''}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                  >
                    <option value="">Select a division</option>
                    {divisionOptions.map((division) => (
                      <option key={division} value={division}>{division}</option>
                    ))}
                  </select>
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
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
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
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
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
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
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
                  className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
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
            <div className="bg-gradient-to-r from-[#44444E] to-[#2E2E33] px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h2 className="text-lg font-bold text-white">Delete Vehicle</h2>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
              >
                <X size={18} />
              </button>
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
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col">
            {(() => {
              const vehicle = vehicles.find(v => v.id === viewingId);
              if (!vehicle) return null;
              const colors = statusColors[vehicle.status];

              return (
                <>
                  <div className="bg-gradient-to-r from-[#44444E] to-[#2E2E33] px-4 py-3 flex justify-between items-center flex-shrink-0 rounded-t-lg">
                    <div>
                      <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <Truck size={18} className="text-[#EA7B7B]" />
                        Vehicle Details
                      </h2>
                      <p className="text-xs text-slate-200 mt-0.5">{vehicle.registration_number}</p>
                    </div>
                    <button
                      onClick={() => setViewingId(null)}
                      className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors flex-shrink-0"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="sticky top-[3.5rem] bg-slate-100 border-b border-slate-200 flex gap-0 flex-shrink-0">
                    <button
                      onClick={() => setDetailsTab('info')}
                      className={`flex-1 px-3 py-2 text-xs font-semibold uppercase tracking-wide border-b-2 transition-colors ${
                        detailsTab === 'info'
                          ? 'text-blue-700 border-blue-700'
                          : 'text-gray-600 border-transparent hover:text-gray-900'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <FileText size={14} />
                        Info
                      </span>
                    </button>
                    <button
                      onClick={() => setDetailsTab('images')}
                      className={`flex-1 px-3 py-2 text-xs font-semibold uppercase tracking-wide border-b-2 transition-colors relative ${
                        detailsTab === 'images'
                          ? 'text-blue-700 border-blue-700'
                          : 'text-gray-600 border-transparent hover:text-gray-900'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Image size={14} />
                        Images
                      </span>
                      {vehicleImages[vehicle.id]?.length > 0 && (
                        <span className="absolute -top-1 right-1 bg-blue-700 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {vehicleImages[vehicle.id].length}
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="p-4 space-y-3 overflow-y-auto flex-1">
                    {/* INFO TAB */}
                    {detailsTab === 'info' && (
                      <>
                        {/* Vehicle Overview */}
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500 flex items-center gap-1.5">
                            <Activity size={12} className="text-[#EA7B7B]" />
                            Vehicle Overview
                          </p>
                          <p className="mt-1 text-sm font-semibold text-gray-900">{vehicle.registration_number}</p>
                          <p className="text-xs text-gray-600">{vehicle.make} {vehicle.model} • {vehicle.year}</p>
                        </div>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${colors.badge}`}>
                          {vehicle.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Key Information - Highlighted */}
                    <div className="grid grid-cols-2 gap-2 bg-gradient-to-br from-blue-50 to-blue-50/50 p-3 rounded-lg border border-blue-100">
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide flex items-center gap-1.5">
                          <Fuel size={12} className="text-[#EA7B7B]" />
                          Fuel
                        </p>
                        <p className="text-xs font-bold text-gray-900 mt-1 capitalize">{vehicle.fuel_type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide flex items-center gap-1.5">
                          <Gauge size={12} className="text-[#EA7B7B]" />
                          Mileage
                        </p>
                        <p className="text-xs font-bold text-gray-900 mt-1">{vehicle.mileage.toLocaleString()} km</p>
                      </div>
                    </div>

                    {/* Technical Details */}
                    <div>
                      <h4 className="text-xs font-bold uppercase text-gray-700 mb-2 tracking-wide flex items-center gap-1.5">
                        <Wrench size={12} className="text-[#EA7B7B]" />
                        Technical
                      </h4>
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
                      <h4 className="text-xs font-bold uppercase text-gray-700 mb-2 tracking-wide flex items-center gap-1.5">
                        <CalendarDays size={12} className="text-[#EA7B7B]" />
                        Dates
                      </h4>
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

                    <div>
                      <h4 className="text-xs font-bold uppercase text-gray-700 mb-2 tracking-wide flex items-center gap-1.5">
                        <Building2 size={12} className="text-[#EA7B7B]" />
                        Organizational
                      </h4>
                      <div className="grid grid-cols-1 gap-1.5 space-y-0">
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors">
                          <span className="text-xs text-gray-600">Cost Center</span>
                          <span className="text-xs font-semibold text-gray-900 text-right">{vehicle.cost_center || '—'}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors">
                          <span className="text-xs text-gray-600">Division</span>
                          <span className="text-xs font-semibold text-gray-900 text-right">{vehicle.division || '—'}</span>
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
                            <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center justify-center gap-2">
                              <Image size={14} className="text-[#EA7B7B]" />
                              Click to upload images
                            </p>
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
                            <p className="text-xs flex items-center justify-center gap-2">
                              <Image size={14} className="text-[#EA7B7B]" />
                              No images yet
                            </p>
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
                        className="px-2.5 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
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
