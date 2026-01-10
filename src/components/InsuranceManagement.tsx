import { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Trash2,
  Edit,
  AlertCircle,
  CheckCircle,
  Filter,
  AlertTriangle,
  Calendar,
  Building2,
  FileText,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import {
  getAllInsurance,
  createInsurancePolicy,
  updateInsurancePolicy,
  deleteInsurancePolicy,
  getAllVehicles,
} from '../lib/supabaseQueries';

interface Insurance {
  id: string;
  vehicle_id: string;
  provider: string;
  policy_number: string;
  coverage_amount: number;
  premium_amount: number;
  start_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'expiring_soon';
  notes: string | null;
  created_at: string;
}

interface Vehicle {
  id: string;
  registration_number: string;
  make: string;
  model: string;
}

interface InsuranceStats {
  totalPolicies: number;
  activePolicies: number;
  expiredPolicies: number;
  expiringPolicies: number;
  totalCoverage: number;
  totalPremiums: number;
}

export default function InsuranceManagement() {
  const [policies, setPolicies] = useState<Insurance[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [stats, setStats] = useState<InsuranceStats | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'expiring_soon'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    vehicle_id: '',
    provider: '',
    policy_number: '',
    coverage_amount: '',
    premium_amount: '',
    start_date: new Date().toISOString().slice(0, 10),
    expiry_date: '',
    notes: '',
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [vehiclesRes, policiesRes] = await Promise.all([
          getAllVehicles(),
          getAllInsurance(),
        ]);

        if (vehiclesRes.data) setVehicles(vehiclesRes.data);
        if (policiesRes.data) {
          const enrichedPolicies = (policiesRes.data || []).map((policy: any) => ({
            ...policy,
            status: determineStatus(policy.expiry_date),
          }));
          setPolicies(enrichedPolicies);
          calculateStats(enrichedPolicies);
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

  const determineStatus = (expiryDate: string): 'active' | 'expired' | 'expiring_soon' => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring_soon';
    return 'active';
  };

  const calculateStats = (policies: Insurance[]) => {
    const stats: InsuranceStats = {
      totalPolicies: policies.length,
      activePolicies: policies.filter((p) => p.status === 'active').length,
      expiredPolicies: policies.filter((p) => p.status === 'expired').length,
      expiringPolicies: policies.filter((p) => p.status === 'expiring_soon').length,
      totalCoverage: policies.reduce((sum, p) => sum + (p.coverage_amount || 0), 0),
      totalPremiums: policies.reduce((sum, p) => sum + (p.premium_amount || 0), 0),
    };
    setStats(stats);
  };

  const filteredPolicies = policies
    .filter((policy) => {
      if (filterStatus !== 'all' && policy.status !== filterStatus) return false;
      if (searchTerm) {
        const vehicle = vehicles.find((v) => v.id === policy.vehicle_id);
        const searchLower = searchTerm.toLowerCase();
        return (
          policy.provider.toLowerCase().includes(searchLower) ||
          policy.policy_number.toLowerCase().includes(searchLower) ||
          vehicle?.registration_number.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vehicle_id || !formData.provider || !formData.policy_number || !formData.expiry_date) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const policyData = {
        vehicle_id: formData.vehicle_id,
        provider: formData.provider,
        policy_number: formData.policy_number,
        coverage_amount: parseFloat(formData.coverage_amount) || 0,
        premium_amount: parseFloat(formData.premium_amount) || 0,
        start_date: formData.start_date,
        expiry_date: formData.expiry_date,
        notes: formData.notes || null,
      };

      let result;
      if (editingId) {
        result = await updateInsurancePolicy(editingId, policyData);
      } else {
        result = await createInsurancePolicy(policyData);
      }

      if (result.error) throw new Error(result.error.message);

      // Refresh policies list
      const { data } = await getAllInsurance();
      if (data) {
        const enrichedPolicies = data.map((policy: any) => ({
          ...policy,
          status: determineStatus(policy.expiry_date),
        }));
        setPolicies(enrichedPolicies);
        calculateStats(enrichedPolicies);
      }

      const message = editingId ? 'Insurance policy updated!' : 'Insurance policy created!';
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 3000);

      // Reset form
      setFormData({
        vehicle_id: '',
        provider: '',
        policy_number: '',
        coverage_amount: '',
        premium_amount: '',
        start_date: new Date().toISOString().slice(0, 10),
        expiry_date: '',
        notes: '',
      });

      setShowModal(false);
      setEditingId(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save policy');
      console.error('Error saving policy:', err);
    }
  };

  const handleDelete = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this insurance policy?')) return;

    try {
      const result = await deleteInsurancePolicy(policyId);
      if (result.error) throw new Error(result.error.message);

      const updatedPolicies = policies.filter((p) => p.id !== policyId);
      setPolicies(updatedPolicies);
      calculateStats(updatedPolicies);
      setSuccessMessage('Insurance policy deleted!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete policy');
    }
  };

  const handleEdit = (policy: Insurance) => {
    setFormData({
      vehicle_id: policy.vehicle_id,
      provider: policy.provider,
      policy_number: policy.policy_number,
      coverage_amount: policy.coverage_amount.toString(),
      premium_amount: policy.premium_amount.toString(),
      start_date: policy.start_date.slice(0, 10),
      expiry_date: policy.expiry_date.slice(0, 10),
      notes: policy.notes || '',
    });
    setEditingId(policy.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      vehicle_id: '',
      provider: '',
      policy_number: '',
      coverage_amount: '',
      premium_amount: '',
      start_date: new Date().toISOString().slice(0, 10),
      expiry_date: '',
      notes: '',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>;
      case 'expired':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Expired</span>;
      case 'expiring_soon':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Expiring Soon</span>;
      default:
        return null;
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto text-[#EA7B7B] mb-4 animate-pulse" />
          <p className="text-gray-600">Loading insurance policies...</p>
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
            <Shield className="w-8 h-8 text-[#EA7B7B]" />
            Insurance Management
          </h1>
          <p className="text-gray-600 mt-1">Track vehicle insurance policies and coverage</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              vehicle_id: '',
              provider: '',
              policy_number: '',
              coverage_amount: '',
              premium_amount: '',
              start_date: new Date().toISOString().slice(0, 10),
              expiry_date: '',
              notes: '',
            });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-[#EA7B7B] text-white rounded-lg hover:bg-[#D65A5A] transition-colors duration-200 flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Policy
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Policies</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPolicies}</p>
              </div>
              <Shield className="w-12 h-12 text-[#EA7B7B] opacity-20" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Active</p>
                <p className="text-3xl font-bold text-green-900 mt-2">{stats.activePolicies}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-400 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 font-medium">Expiring Soon</p>
                <p className="text-3xl font-bold text-yellow-900 mt-2">{stats.expiringPolicies}</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-yellow-400 opacity-30" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium">Expired</p>
                <p className="text-3xl font-bold text-red-900 mt-2">{stats.expiredPolicies}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-400 opacity-30" />
            </div>
          </div>
        </div>
      )}

      {/* Coverage & Premium Summary */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Total Coverage
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">K{stats.totalCoverage.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Annual Premiums
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">K{stats.totalPremiums.toLocaleString()}</p>
              </div>
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
              placeholder="Search by provider, policy #, or vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="expiring_soon">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Policies Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {filteredPolicies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Provider</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Policy #</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Coverage</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Premium</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Expiry Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPolicies.map((policy) => {
                  const vehicle = vehicles.find((v) => v.id === policy.vehicle_id);

                  return (
                    <tr key={policy.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {vehicle?.registration_number || '-'} - {vehicle?.make} {vehicle?.model}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {policy.provider}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          {policy.policy_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">K{policy.coverage_amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">K{policy.premium_amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(policy.expiry_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{getStatusBadge(policy.status)}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(policy)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(policy.id)}
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
            <Shield className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No insurance policies found</p>
            <p className="text-gray-400 text-sm mt-1">Start by adding a new insurance policy</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Insurance Policy' : 'New Insurance Policy'}
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

                {/* Provider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider *</label>
                  <input
                    type="text"
                    placeholder="e.g., FIDELITY, ZIMNAT"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                    required
                  />
                </div>

                {/* Policy Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number *</label>
                  <input
                    type="text"
                    placeholder="e.g., POL-2024-001"
                    value={formData.policy_number}
                    onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                    required
                  />
                </div>

                {/* Coverage Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Amount (MWK)</label>
                  <input
                    type="number"
                    placeholder="1000000"
                    value={formData.coverage_amount}
                    onChange={(e) => setFormData({ ...formData, coverage_amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                  />
                </div>

                {/* Premium Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Premium Amount (MWK)</label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={formData.premium_amount}
                    onChange={(e) => setFormData({ ...formData, premium_amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                    required
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    placeholder="Additional notes about this policy..."
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
                  {editingId ? 'Update Policy' : 'Save Policy'}
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
