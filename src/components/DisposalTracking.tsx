import { useState, useEffect } from 'react';
import {
  Trash,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Filter,
  Calendar,
  DollarSign,
  TrendingDown,
  Wrench,
  User,
  FileText,
} from 'lucide-react';
import {
  getAllDisposals,
  createDisposal,
  updateDisposal,
  deleteDisposal,
  getAllVehicles,
} from '../lib/supabaseQueries';

interface Disposal {
  id: string;
  vehicle_id: string;
  disposal_date: string;
  disposal_method: 'scrap' | 'auction' | 'donation' | 'sale' | 'other';
  disposal_value: number;
  buyer_name: string | null;
  final_mileage: number | null;
  condition: 'poor' | 'fair' | 'good' | 'excellent' | null;
  reason: string;
  notes: string | null;
  created_at: string;
}

interface Vehicle {
  id: string;
  registration_number: string;
  make: string;
  model: string;
  year: number;
}

interface DisposalStats {
  totalDisposed: number;
  totalRecovered: number;
  averageRecoveryValue: number;
  disposedThisYear: number;
  disposedThisMonth: number;
}

export default function DisposalTracking() {
  const [disposals, setDisposals] = useState<Disposal[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stats, setStats] = useState<DisposalStats | null>(null);
  const [filterMethod, setFilterMethod] = useState<'all' | 'scrap' | 'auction' | 'donation' | 'sale' | 'other'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    vehicle_id: '',
    disposal_date: new Date().toISOString().slice(0, 10),
    disposal_method: 'scrap' as const,
    disposal_value: '',
    buyer_name: '',
    final_mileage: '',
    condition: '' as any,
    reason: '',
    notes: '',
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [vehiclesRes, disposalsRes] = await Promise.all([
          getAllVehicles(),
          getAllDisposals(),
        ]);

        if (vehiclesRes.data) setVehicles(vehiclesRes.data);
        if (disposalsRes.data) {
          setDisposals(disposalsRes.data || []);
          calculateStats(disposalsRes.data || []);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const calculateStats = (disposalList: Disposal[]) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const stats: DisposalStats = {
      totalDisposed: disposalList.length,
      totalRecovered: disposalList.reduce((sum, d) => sum + (d.disposal_value || 0), 0),
      averageRecoveryValue: disposalList.length > 0
        ? disposalList.reduce((sum, d) => sum + (d.disposal_value || 0), 0) / disposalList.length
        : 0,
      disposedThisYear: disposalList.filter((d) => new Date(d.disposal_date).getFullYear() === currentYear).length,
      disposedThisMonth: disposalList.filter((d) => {
        const disposalDate = new Date(d.disposal_date);
        return disposalDate.getFullYear() === currentYear && disposalDate.getMonth() === currentMonth;
      }).length,
    };
    setStats(stats);
  };

  const filteredDisposals = disposals
    .filter((disposal) => {
      if (filterMethod !== 'all' && disposal.disposal_method !== filterMethod) return false;
      if (searchTerm) {
        const vehicle = vehicles.find((v) => v.id === disposal.vehicle_id);
        const searchLower = searchTerm.toLowerCase();
        return (
          vehicle?.registration_number.toLowerCase().includes(searchLower) ||
          disposal.reason.toLowerCase().includes(searchLower) ||
          (disposal.buyer_name?.toLowerCase().includes(searchLower) || false)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.disposal_date).getTime() - new Date(a.disposal_date).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vehicle_id || !formData.disposal_date || !formData.reason) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const disposalData = {
        vehicle_id: formData.vehicle_id,
        disposal_date: formData.disposal_date,
        disposal_method: formData.disposal_method,
        disposal_value: parseFloat(formData.disposal_value) || 0,
        buyer_name: formData.buyer_name || null,
        final_mileage: formData.final_mileage ? parseInt(formData.final_mileage) : null,
        condition: formData.condition || null,
        reason: formData.reason,
        notes: formData.notes || null,
      };

      let result;
      if (editingId) {
        result = await updateDisposal(editingId, disposalData);
      } else {
        result = await createDisposal(disposalData);
      }

      if (result.error) throw new Error(result.error.message);

      // Refresh disposals list
      const { data } = await getAllDisposals();
      if (data) {
        setDisposals(data || []);
        calculateStats(data || []);
      }

      const message = editingId ? 'Disposal record updated!' : 'Disposal record created!';
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 3000);

      // Reset form
      setFormData({
        vehicle_id: '',
        disposal_date: new Date().toISOString().slice(0, 10),
        disposal_method: 'scrap',
        disposal_value: '',
        buyer_name: '',
        final_mileage: '',
        condition: '',
        reason: '',
        notes: '',
      });

      setShowModal(false);
      setEditingId(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save disposal record');
      console.error('Error saving disposal:', err);
    }
  };

  const handleDelete = async (disposalId: string) => {
    if (!confirm('Are you sure you want to delete this disposal record?')) return;

    try {
      const result = await deleteDisposal(disposalId);
      if (result.error) throw new Error(result.error.message);

      const updatedDisposals = disposals.filter((d) => d.id !== disposalId);
      setDisposals(updatedDisposals);
      calculateStats(updatedDisposals);
      setSuccessMessage('Disposal record deleted!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete disposal record');
    }
  };

  const handleEdit = (disposal: Disposal) => {
    setFormData({
      vehicle_id: disposal.vehicle_id,
      disposal_date: disposal.disposal_date.slice(0, 10),
      disposal_method: disposal.disposal_method,
      disposal_value: disposal.disposal_value.toString(),
      buyer_name: disposal.buyer_name || '',
      final_mileage: disposal.final_mileage?.toString() || '',
      condition: disposal.condition || '',
      reason: disposal.reason,
      notes: disposal.notes || '',
    });
    setEditingId(disposal.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      vehicle_id: '',
      disposal_date: new Date().toISOString().slice(0, 10),
      disposal_method: 'scrap',
      disposal_value: '',
      buyer_name: '',
      final_mileage: '',
      condition: '',
      reason: '',
      notes: '',
    });
  };

  const getMethodBadge = (method: string) => {
    const styles: { [key: string]: string } = {
      scrap: 'bg-gray-100 text-gray-700',
      auction: 'bg-blue-100 text-blue-700',
      donation: 'bg-green-100 text-green-700',
      sale: 'bg-purple-100 text-purple-700',
      other: 'bg-yellow-100 text-yellow-700',
    };
    const labels: { [key: string]: string } = {
      scrap: 'Scrap',
      auction: 'Auction',
      donation: 'Donation',
      sale: 'Sale',
      other: 'Other',
    };
    return (
      <span className={`px-3 py-1 ${styles[method] || styles.other} rounded-full text-xs font-medium`}>
        {labels[method] || 'Unknown'}
      </span>
    );
  };

  const getConditionBadge = (condition: string | null) => {
    if (!condition) return <span className="text-gray-400 text-xs">N/A</span>;
    const styles: { [key: string]: string } = {
      poor: 'text-red-600',
      fair: 'text-yellow-600',
      good: 'text-blue-600',
      excellent: 'text-green-600',
    };
    const labels: { [key: string]: string } = {
      poor: 'Poor',
      fair: 'Fair',
      good: 'Good',
      excellent: 'Excellent',
    };
    return <span className={`text-xs font-medium ${styles[condition]}`}>{labels[condition]}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Trash className="w-12 h-12 mx-auto text-[#EA7B7B] mb-4 animate-pulse" />
          <p className="text-gray-600">Loading disposal records...</p>
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
            <Trash className="w-8 h-8 text-[#EA7B7B]" />
            Vehicle Disposal Tracking
          </h1>
          <p className="text-gray-600 mt-1">Track vehicle disposal and track recovery value</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              vehicle_id: '',
              disposal_date: new Date().toISOString().slice(0, 10),
              disposal_method: 'scrap',
              disposal_value: '',
              buyer_name: '',
              final_mileage: '',
              condition: '',
              reason: '',
              notes: '',
            });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-[#EA7B7B] text-white rounded-lg hover:bg-[#D65A5A] transition-colors duration-200 flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Record Disposal
        </button>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-green-900">Success</h3>
            <p className="text-sm text-green-700 mt-1">{successMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-900">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Disposed</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalDisposed}</p>
              </div>
              <Trash className="w-12 h-12 text-[#EA7B7B] opacity-20" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">This Month</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">{stats.disposedThisMonth}</p>
              </div>
              <Calendar className="w-12 h-12 text-purple-400 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">This Year</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">{stats.disposedThisYear}</p>
              </div>
              <TrendingDown className="w-12 h-12 text-blue-400 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Total Recovered</p>
                <p className="text-2xl font-bold text-green-900 mt-2">K{stats.totalRecovered.toLocaleString()}</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-400 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium">Average Value</p>
                <p className="text-2xl font-bold text-orange-900 mt-2">K{Math.round(stats.averageRecoveryValue).toLocaleString()}</p>
              </div>
              <Wrench className="w-12 h-12 text-orange-400 opacity-30" />
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by vehicle, buyer, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Disposal Method</label>
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
            >
              <option value="all">All Methods</option>
              <option value="scrap">Scrap</option>
              <option value="auction">Auction</option>
              <option value="donation">Donation</option>
              <option value="sale">Sale</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Disposal Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {filteredDisposals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Disposal Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Buyer/Buyer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Value (MWK)</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Mileage</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Condition</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDisposals.map((disposal) => {
                  const vehicle = vehicles.find((v) => v.id === disposal.vehicle_id);

                  return (
                    <tr key={disposal.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex flex-col">
                          <span className="font-semibold">{vehicle?.registration_number || '-'}</span>
                          <span className="text-xs text-gray-500">
                            {vehicle?.year} {vehicle?.make} {vehicle?.model}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(disposal.disposal_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{getMethodBadge(disposal.disposal_method)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {disposal.buyer_name ? (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            {disposal.buyer_name}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        K{disposal.disposal_value.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {disposal.final_mileage ? `${disposal.final_mileage.toLocaleString()} km` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">{getConditionBadge(disposal.condition)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="truncate max-w-xs">{disposal.reason}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(disposal)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(disposal.id)}
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
          <div className="text-center py-12">
            <Trash className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No disposal records found</p>
            <p className="text-gray-400 text-sm mt-1">Start by recording your first vehicle disposal</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Disposal Record' : 'New Disposal Record'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl font-light">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vehicle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle *</label>
                  <select
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                    required
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.registration_number} - {vehicle.make} {vehicle.model}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Disposal Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disposal Date *</label>
                  <input
                    type="date"
                    value={formData.disposal_date}
                    onChange={(e) => setFormData({ ...formData, disposal_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                    required
                  />
                </div>

                {/* Disposal Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disposal Method</label>
                  <select
                    value={formData.disposal_method}
                    onChange={(e) => setFormData({ ...formData, disposal_method: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                  >
                    <option value="scrap">Scrap</option>
                    <option value="auction">Auction</option>
                    <option value="donation">Donation</option>
                    <option value="sale">Sale</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Disposal Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recovery Value (MWK)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.disposal_value}
                    onChange={(e) => setFormData({ ...formData, disposal_value: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                  />
                </div>

                {/* Buyer Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buyer/Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g., ABC Scrap Yard"
                    value={formData.buyer_name}
                    onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                  />
                </div>

                {/* Final Mileage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Final Mileage (km)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.final_mileage}
                    onChange={(e) => setFormData({ ...formData, final_mileage: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                  />
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition at Disposal</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                  >
                    <option value="">Select Condition</option>
                    <option value="poor">Poor</option>
                    <option value="fair">Fair</option>
                    <option value="good">Good</option>
                    <option value="excellent">Excellent</option>
                  </select>
                </div>

                {/* Reason for Disposal */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Disposal *</label>
                  <input
                    type="text"
                    placeholder="e.g., End of life, High repair costs, Accident damage"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                    required
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                  <textarea
                    placeholder="Any additional information about the disposal..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#EA7B7B] text-white rounded-lg hover:bg-[#D65A5A] transition-colors font-medium"
                >
                  {editingId ? 'Update Record' : 'Record Disposal'}
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
