import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Eye, X, AlertCircle, Search, MoreVertical, Filter, Download, Shield, Users, Clock, UserCheck, UserCog } from 'lucide-react';
import { PieChart, Pie, BarChart, Bar, Cell, ResponsiveContainer, Legend, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { createUserProfile, deleteUserProfile, getAllActivityLogs, getAllUsers, logActivity, updateUserProfile } from '../lib/firebaseQueries';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { firebaseAuth } from '../lib/firebase';
import { canCreateUsers, getRoleKey } from '../lib/access';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'system_admin' | 'court_administrator' | 'transport_officer';
  status: 'active' | 'inactive';
  position: string;
  jurisdiction: string;
  created_at: string;
  last_login: string | null;
  profile_image?: string | null;
  firebase_uid?: string | null;
  auth_provider?: string | null;
}

interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

const roleColors: { [key: string]: { bg: string; text: string; badge: string } } = {
  system_admin: { bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800' },
  court_administrator: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
  transport_officer: { bg: 'bg-gray-50', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-800' },
};

const statusColors: { [key: string]: { bg: string; text: string; badge: string } } = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' },
  inactive: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
};

const roles = ['system_admin', 'court_administrator', 'transport_officer'];
const statuses = ['active', 'inactive'];
const DEFAULT_PROFILE_IMAGE = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';

export default function UsersManagement({ currentRole = 'system_admin', readOnly = false }: { currentRole?: string; readOnly?: boolean }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [pendingUpdate, setPendingUpdate] = useState<{ id: string; payload: Record<string, any> } | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'created'>('name');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const roleKey = getRoleKey(currentRole);
  const canManageUsers = canCreateUsers(roleKey);
  const isReadOnlyView = readOnly || !canManageUsers;
  const normalizedUserCount = users.filter((u) => getRoleKey(u.role) === 'system_admin').length;
  const normalizedCourtAdminCount = users.filter((u) => getRoleKey(u.role) === 'court_administrator').length;
  const normalizedTransportOfficerCount = users.filter((u) => getRoleKey(u.role) === 'transport_officer').length;

  const [formData, setFormData] = useState<Partial<User> & { password?: string }>({
    email: '',
    name: '',
    role: 'transport_officer',
    status: 'active',
    position: '',
    jurisdiction: '',
    password: '',
  });

  const normalizeUser = useCallback((record: any): User => ({
    id: record.id || '',
    email: record.email || '',
    name: record.name || 'Unnamed User',
    role: (record.role as User['role']) || 'transport_officer',
    status: (record.status as User['status']) || 'active',
    position: record.position || '',
    jurisdiction: record.jurisdiction || '',
    created_at: record.created_at || new Date().toISOString(),
    last_login: record.last_login || null,
    profile_image: record.profile_image || null,
    firebase_uid: record.firebase_uid || null,
    auth_provider: record.auth_provider || null,
  }), []);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: loadError } = await getAllUsers();
      if (loadError) {
        throw loadError;
      }

      setUsers((data || []).map(normalizeUser));
    } catch (err: any) {
      console.error('❌ Error loading users:', err);
      setError(err?.message || 'Failed to load users from Firebase');
    } finally {
      setLoading(false);
    }
  }, [normalizeUser]);

  const loadActivityLogs = useCallback(async () => {
    try {
      setLoadingLogs(true);
      const { data, error: loadError } = await getAllActivityLogs();
      if (loadError) {
        throw loadError;
      }
      setActivityLogs(data || []);
    } catch (err: any) {
      console.error('❌ Error loading activity logs:', err);
      setActivityLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
    void loadActivityLogs();
  }, [loadUsers, loadActivityLogs]);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = window.setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3200);
    return () => window.clearTimeout(timer);
  }, [toasts]);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      role: 'transport_officer',
      status: 'active',
      position: '',
      jurisdiction: '',
      password: '',
    });
    setSubmitError(null);
  };

  const handleOpenForm = (user?: User) => {
    if (user) {
      setEditingId(user.id);
      setFormData({
        ...user,
        role: getRoleKey(user.role) as User['role'],
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

    if (!formData.email?.trim()) {
      setSubmitError('Email is required');
      return;
    }
    if (!formData.name?.trim()) {
      setSubmitError('Name is required');
      return;
    }

    if (!editingId && !formData.password?.trim()) {
      setSubmitError('Password is required to create a new user');
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        const existingUser = users.find((u) => u.id === editingId);
        const payload = {
          ...existingUser,
          email: formData.email || '',
          name: formData.name || '',
          role: getRoleKey(formData.role as string) as 'system_admin' | 'court_administrator' | 'transport_officer',
          status: formData.status as 'active' | 'inactive',
          position: formData.position || '',
          jurisdiction: formData.jurisdiction || '',
          created_at: existingUser?.created_at || new Date().toISOString(),
          last_login: existingUser?.last_login || null,
        };

        setPendingUpdate({ id: editingId, payload });
        return;
      }

      const payload = {
        email: formData.email || '',
        name: formData.name || '',
        role: getRoleKey(formData.role as string) as 'system_admin' | 'court_administrator' | 'transport_officer',
        status: formData.status as 'active' | 'inactive',
        position: formData.position || '',
        jurisdiction: formData.jurisdiction || '',
      };

      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, payload.email, formData.password!.trim());
      const { data, error: createError } = await createUserProfile(payload, userCredential.user.uid);
      if (createError || !data) {
        throw createError || new Error('Unable to create user');
      }

      await logActivity({
        actor_id: firebaseAuth.currentUser?.uid || null,
        actor_email: firebaseAuth.currentUser?.email || null,
        actor_name: firebaseAuth.currentUser?.displayName || firebaseAuth.currentUser?.email?.split('@')[0] || 'System',
        action: 'create_user',
        category: 'user_management',
        severity: 'info',
        details: `Created user ${payload.name || payload.email}`,
        target_user_id: data.id,
        target_user_email: payload.email,
        metadata: { role: payload.role, status: payload.status },
      });

      showToast('User created successfully', 'success');
      await loadUsers();
      handleCloseForm();
    } catch (err: any) {
      console.error('❌ Error:', err);
      setSubmitError(`Error: ${err?.message || 'Unknown error'}`);
      showToast(err?.message || 'Unable to complete the request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmPendingUpdate = async () => {
    if (!pendingUpdate) return;

    try {
      setSubmitting(true);
      const { data, error: updateError } = await updateUserProfile(pendingUpdate.id, pendingUpdate.payload);
      if (updateError || !data) {
        throw updateError || new Error('Unable to update user');
      }

      await logActivity({
        actor_id: firebaseAuth.currentUser?.uid || null,
        actor_email: firebaseAuth.currentUser?.email || null,
        actor_name: firebaseAuth.currentUser?.displayName || firebaseAuth.currentUser?.email?.split('@')[0] || 'System',
        action: 'update_user',
        category: 'user_management',
        severity: 'info',
        details: `Updated user ${pendingUpdate.payload.name || pendingUpdate.payload.email}`,
        target_user_id: pendingUpdate.id,
        target_user_email: pendingUpdate.payload.email,
        metadata: { role: pendingUpdate.payload.role, status: pendingUpdate.payload.status },
      });

      showToast('User updated successfully', 'success');
      await loadUsers();
      setPendingUpdate(null);
      handleCloseForm();
    } catch (err: any) {
      console.error('❌ Error updating user:', err);
      showToast(err?.message || 'Unable to update user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error: deleteError } = await deleteUserProfile(id);
      if (deleteError) {
        throw deleteError;
      }
      const deletedUser = users.find((u) => u.id === id);
      await logActivity({
        actor_id: firebaseAuth.currentUser?.uid || null,
        actor_email: firebaseAuth.currentUser?.email || null,
        actor_name: firebaseAuth.currentUser?.displayName || firebaseAuth.currentUser?.email?.split('@')[0] || 'System',
        action: 'delete_user',
        category: 'user_management',
        severity: 'warning',
        details: `Deleted user ${deletedUser?.name || deletedUser?.email || id}`,
        target_user_id: id,
        target_user_email: deletedUser?.email || null,
      });
      await loadUsers();
      setDeleteConfirm(null);
      showToast('User deleted successfully', 'success');
    } catch (err: any) {
      showToast(`Delete failed: ${err?.message || 'Unknown error'}`, 'error');
    }
  };

  const handleToggleStatus = async (id: string) => {
    const userToToggle = users.find((user) => user.id === id);
    if (!userToToggle) return;

    try {
      const nextStatus = userToToggle.status === 'active' ? 'inactive' : 'active';
      const { data, error } = await updateUserProfile(id, { status: nextStatus });
      if (error || !data) {
        throw error || new Error('Unable to update user status');
      }

      await logActivity({
        actor_id: firebaseAuth.currentUser?.uid || null,
        actor_email: firebaseAuth.currentUser?.email || null,
        actor_name: firebaseAuth.currentUser?.displayName || firebaseAuth.currentUser?.email?.split('@')[0] || 'System',
        action: nextStatus === 'active' ? 'activate_user' : 'deactivate_user',
        category: 'user_management',
        severity: 'info',
        details: `Updated ${userToToggle.name || userToToggle.email} status to ${nextStatus}`,
        target_user_id: id,
        target_user_email: userToToggle.email,
        metadata: { status: nextStatus },
      });
      await loadUsers();
      setOpenDropdown(null);
      showToast(`User ${nextStatus === 'active' ? 'activated' : 'deactivated'} successfully`, 'success');
    } catch (err: any) {
      showToast(`Status update failed: ${err?.message || 'Unknown error'}`, 'error');
    }
  };

  const handleResetPassword = async (email: string) => {
    if (!email) {
      setError('No email address found for this user.');
      return;
    }

    try {
      await sendPasswordResetEmail(firebaseAuth, email.trim());
      const matchingUser = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      await logActivity({
        actor_id: firebaseAuth.currentUser?.uid || null,
        actor_email: firebaseAuth.currentUser?.email || null,
        actor_name: firebaseAuth.currentUser?.displayName || firebaseAuth.currentUser?.email?.split('@')[0] || 'System',
        action: 'reset_password',
        category: 'user_management',
        severity: 'info',
        details: `Sent password reset email to ${email.trim()}`,
        target_user_id: matchingUser?.id || null,
        target_user_email: email.trim(),
      });
      setOpenDropdown(null);
      showToast('Password reset email sent successfully', 'success');
    } catch (err: any) {
      showToast(`Password reset failed: ${err?.message || 'Unknown error'}`, 'error');
    }
  };

  const formatDateTime = (value: string | null) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filtered = users
    .filter(u => {
      const matchesSearch = searchTerm === '' ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || u.role === filterRole;
      const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'email') return a.email.localeCompare(b.email);
      if (sortBy === 'created') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return 0;
    });

  const handleToggleUserSelect = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filtered.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filtered.map(u => u.id)));
    }
  };

  return (
    <div className="space-y-4">
      {/* ===== HEADER ===== */}
      <div className="bg-gradient-to-r from-[#44444E] via-[#3A3A42] to-[#303036] rounded-lg p-4 text-white shadow-md">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold">User Management</h1>
            <p className="text-gray-300 text-xs mt-1">Manage system users and permissions</p>
          </div>
          {!isReadOnlyView && (
            <button
              onClick={() => handleOpenForm()}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Add User
            </button>
          )}
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          <div className="bg-white/10 rounded p-2">
            <p className="text-xs text-gray-300">Total Users</p>
            <p className="text-lg font-bold">{users.length}</p>
          </div>
          <div className="bg-white/10 rounded p-2">
            <p className="text-xs text-gray-300">Active</p>
            <p className="text-lg font-bold text-green-300">{users.filter(u => u.status === 'active').length}</p>
          </div>
          <div className="bg-white/10 rounded p-2">
            <p className="text-xs text-gray-300">System Admins</p>
            <p className="text-lg font-bold text-purple-300">{normalizedUserCount}</p>
          </div>
          <div className="bg-white/10 rounded p-2">
            <p className="text-xs text-gray-300">Court Admins</p>
            <p className="text-lg font-bold text-blue-300">{normalizedCourtAdminCount}</p>
          </div>
        </div>
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

      <div className="fixed right-4 top-4 z-[60] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-[280px] rounded-lg border px-4 py-3 shadow-lg ${
              toast.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : toast.type === 'info'
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium">{toast.message}</p>
              <button
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}
                className="text-sm font-semibold opacity-70 hover:opacity-100"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===== LOADING STATE ===== */}
      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#EA7B7B] mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading users...</p>
        </div>
      )}

      {/* ===== CONTENT ===== */}
      {!loading && (
        <>
          {/* ===== USER ACTIVITY GRAPHS ===== */}
          <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4">
            {/* Role Distribution Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Role Distribution</h3>
                  <p className="text-xs text-gray-500">Platform access across administrators and officers</p>
                </div>
                <div className="rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-semibold text-purple-700">Live snapshot</div>
              </div>
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'System Admin', value: users.filter(u => u.role === 'system_admin').length },
                      { name: 'Court Admin', value: users.filter(u => u.role === 'court_administrator').length },
                      { name: 'Transport Officer', value: users.filter(u => u.role === 'transport_officer').length },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={84}
                    paddingAngle={2}
                    dataKey="value"
                    cornerRadius={8}
                  >
                    <Cell fill="#8b5cf6" />
                    <Cell fill="#3b82f6" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip formatter={(value) => `${value} user${Number(value) === 1 ? '' : 's'}`} />
                  <Legend verticalAlign="bottom" height={30} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="font-semibold text-purple-700">{users.filter(u => u.role === 'system_admin').length}</p>
                  <p className="text-gray-600">System Admin</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="font-semibold text-blue-700">{users.filter(u => u.role === 'court_administrator').length}</p>
                  <p className="text-gray-600">Court Admin</p>
                </div>
                <div className="text-center p-2 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="font-semibold text-amber-700">{users.filter(u => u.role === 'transport_officer').length}</p>
                  <p className="text-gray-600">Transport Officer</p>
                </div>
              </div>
            </div>

            {/* Status Distribution Bar Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">User Status Overview</h3>
                  <p className="text-xs text-gray-500">Account activity in the current roster</p>
                </div>
                <div className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">Healthy mix</div>
              </div>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart
                  data={[
                    { name: 'Active', value: users.filter(u => u.status === 'active').length },
                    { name: 'Inactive', value: users.filter(u => u.status === 'inactive').length },
                  ]}
                  margin={{ top: 8, right: 8, left: -8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} isAnimationActive={true}>
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="text-center p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                  <p className="font-semibold text-emerald-700">{users.filter(u => u.status === 'active').length}</p>
                  <p className="text-gray-600">Active</p>
                </div>
                <div className="text-center p-2 bg-red-50 rounded-lg border border-red-100">
                  <p className="font-semibold text-red-700">{users.filter(u => u.status === 'inactive').length}</p>
                  <p className="text-gray-600">Inactive</p>
                </div>
              </div>
            </div>

            {/* User Statistics */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">User Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase">Total Users</p>
                      <p className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-0.5">{users.length}</p>
                    </div>
                    <Users size={20} className="text-blue-500" />
                  </div>
                </div>
                <div className="p-2 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-green-600 font-semibold uppercase">Active Now</p>
                      <p className="text-xl font-bold text-green-700 mt-0.5">{users.filter(u => u.status === 'active').length}</p>
                    </div>
                    <UserCheck size={20} className="text-green-500" />
                  </div>
                </div>
                <div className="p-2 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-purple-600 font-semibold uppercase">System Admins</p>
                      <p className="text-xl font-bold text-purple-700 mt-0.5">{normalizedUserCount}</p>
                    </div>
                    <Shield size={20} className="text-purple-500" />
                  </div>
                </div>
                <div className="p-2 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-amber-600 font-semibold uppercase">Court Admins</p>
                      <p className="text-xl font-bold text-amber-700 mt-0.5">{normalizedCourtAdminCount}</p>
                    </div>
                    <UserCog size={20} className="text-amber-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== SYSTEM ACTIVITY LOG ===== */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">System Activity Log</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Track sign-ins and user management actions across the system</p>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                {activityLogs.length} entries
              </span>
            </div>

            {loadingLogs ? (
              <div className="p-6 text-center text-sm text-gray-500">Loading activity log...</div>
            ) : activityLogs.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">No activity has been recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left font-bold text-gray-900">👤 Actor</th>
                      <th className="px-6 py-3 text-left font-bold text-gray-900">⚡ Action</th>
                      <th className="px-6 py-3 text-left font-bold text-gray-900">📂 Category</th>
                      <th className="px-6 py-3 text-left font-bold text-gray-900">📝 Details</th>
                      <th className="px-6 py-3 text-left font-bold text-gray-900">🕒 Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activityLogs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-100 hover:bg-blue-50 transition-all">
                        <td className="px-6 py-3 text-gray-900 font-medium">
                          {log.actor_name || log.actor_email || 'System'}
                        </td>
                        <td className="px-6 py-3">
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold uppercase text-gray-700">
                            {log.action || 'unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-700">{log.category || 'general'}</td>
                        <td className="px-6 py-3 text-gray-700">{log.details || 'No details provided'}</td>
                        <td className="px-6 py-3 text-gray-600">{formatDateTime(log.created_at || log.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ===== USERS TABLE ===== */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Users Onboard
              </h2>
              
              {/* Search Component */}
              <div className="flex items-center gap-2 relative w-64">
                <Search size={18} className="absolute left-3 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="font-medium">No users found</p>
                <p className="text-sm mt-1">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left font-bold text-gray-900">✉️ Email</th>
                      <th className="px-6 py-3 text-left font-bold text-gray-900">👤 Name</th>
                      <th className="px-6 py-3 text-left font-bold text-gray-900">🎯 Role</th>
                      <th className="px-6 py-3 text-left font-bold text-gray-900">✓ Status</th>
                      <th className="px-6 py-3 text-left font-bold text-gray-900">📅 Last Login</th>
                      <th className="px-6 py-3 text-center font-bold text-gray-900">⚙️ Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((user) => {
                      const normalizedRole = getRoleKey(user.role);
                      return (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-blue-50 transition-all">
                          <td className="px-6 py-3 text-gray-900 font-medium">{user.email}</td>
                          <td className="px-6 py-3 text-gray-700">{user.name}</td>
                          <td className="px-6 py-3">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${roleColors[normalizedRole].badge}`}>
                              {normalizedRole.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${statusColors[user.status].badge}`}>
                              {user.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-gray-600">
                            {user.last_login ? new Date(user.last_login).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-6 py-3 text-center">
                            <div className="relative inline-block">
                              <button
                                onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                              >
                                <MoreVertical size={16} className="text-gray-600" />
                              </button>
                              {openDropdown === user.id && (
                                <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                  <button
                                    onClick={() => {
                                      setViewingId(user.id);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Eye size={16} />
                                    View Details
                                  </button>
                                  {!isReadOnlyView && (
                                    <button
                                      onClick={() => {
                                        handleOpenForm(user);
                                        setOpenDropdown(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Edit2 size={16} />
                                      Edit User
                                    </button>
                                  )}
                                  <div className="border-t border-gray-200"></div>
                                  {!isReadOnlyView && (
                                    <button
                                      onClick={() => {
                                        void handleToggleStatus(user.id);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      {user.status === 'active' ? <Shield size={16} /> : <UserCheck size={16} />}
                                      {user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                                    </button>
                                  )}
                                  {!isReadOnlyView && (
                                    <button
                                      onClick={() => {
                                        void handleResetPassword(user.email);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                      <Shield size={16} />
                                      Reset Password
                                    </button>
                                  )}
                                  <div className="border-t border-gray-200"></div>
                                  {!isReadOnlyView && (
                                    <button
                                      onClick={() => {
                                        setDeleteConfirm(user.id);
                                        setOpenDropdown(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 last:rounded-b-lg"
                                    >
                                      <Trash2 size={16} />
                                      Remove Profile
                                    </button>
                                  )}
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
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingId ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={handleCloseForm}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
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
                {!editingId && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-900 mb-1">Temporary Password *</label>
                    <input
                      type="password"
                      value={formData.password || ''}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B]"
                      placeholder="Create a secure password"
                    />
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B]"
                    placeholder="user@judiciary.mw"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B]"
                    placeholder="Full Name"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">Role</label>
                  <select
                    value={formData.role || 'transport_officer'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B]"
                  >
                    {roles.map(r => (
                      <option key={r} value={r}>{r.replace(/_/g, ' ').toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">Status</label>
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B]"
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                {/* Position */}
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">Position *</label>
                  <input
                    type="text"
                    value={formData.position || ''}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B]"
                    placeholder="e.g. Fleet Manager"
                  />
                </div>

                {/* Jurisdiction */}
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">Jurisdiction *</label>
                  <input
                    type="text"
                    value={formData.jurisdiction || ''}
                    onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B]"
                    placeholder="e.g. Lilongwe, National"
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
                  {submitting ? 'Saving...' : editingId ? 'Update User' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== VIEW DETAILS MODAL ===== */}
      {viewingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col">
            {(() => {
              const user = users.find(u => u.id === viewingId);
              if (!user) return null;

              return (
                <>
                  <div className="sticky top-0 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center flex-shrink-0">
                    <div>
                      <h2 className="text-base font-bold text-gray-900 dark:text-white">👤 User Details</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user.email}</p>
                    </div>
                    <button
                      onClick={() => setViewingId(null)}
                      className="text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="p-4 space-y-3 overflow-y-auto flex-1">
                    {/* Basic Info */}
                    <div className="flex items-start justify-between pb-3 border-b border-gray-200">
                      <div className="flex items-center gap-3 flex-1">
                        <img
                          src={user.profile_image || DEFAULT_PROFILE_IMAGE}
                          alt={user.name || user.email}
                          className="h-16 w-16 rounded-full object-cover border border-gray-200 shadow-sm"
                        />
                        <div>
                          <h3 className="text-base font-bold text-gray-900">{user.name}</h3>
                          <p className="text-xs text-gray-600 mt-0.5">{user.email}</p>
                        </div>
                      </div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${statusColors[user.status].badge}`}>
                        {user.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Key Information */}
                    <div className="grid grid-cols-2 gap-2 bg-gradient-to-br from-blue-50 to-blue-50/50 p-3 rounded-lg border border-blue-100">
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase">🎯 Role</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{user.role.replace(/_/g, ' ').toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase">✓ Status</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{user.status.toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase">💼 Position</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{user.position}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase">📍 Jurisdiction</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{user.jurisdiction}</p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div>
                      <h4 className="text-xs font-bold uppercase text-gray-700 mb-2 tracking-wide">📅 Dates</h4>
                      <div className="grid grid-cols-1 gap-1.5 space-y-0">
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors">
                          <span className="text-xs text-gray-600">Created</span>
                          <span className="text-xs font-semibold text-gray-900">
                            {new Date(user.created_at).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors">
                          <span className="text-xs text-gray-600">Last Login</span>
                          <span className="text-xs font-semibold text-gray-900">
                            {user.last_login ? new Date(user.last_login).toLocaleDateString('en-GB') : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

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
                        handleOpenForm(user);
                        setViewingId(null);
                      }}
                      className="px-2.5 py-1 text-xs bg-[#EA7B7B] hover:bg-[#D65A5A] text-white rounded-lg font-medium transition-colors"
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ===== UPDATE CONFIRMATION ===== */}
      {pendingUpdate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[70]">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Confirm update</h3>
                <p className="text-sm text-gray-600">You are about to update this user profile.</p>
              </div>
            </div>
            <p className="mb-4 text-sm text-gray-700">
              Are you sure you want to save the changes for <span className="font-semibold">{pendingUpdate.payload.name || pendingUpdate.payload.email}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPendingUpdate(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => void confirmPendingUpdate()}
                className="rounded-lg bg-[#EA7B7B] px-4 py-2 text-sm font-medium text-white hover:bg-[#D65A5A]"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION ===== */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[70]">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete user?</h3>
                <p className="text-sm text-gray-600">This action cannot be undone.</p>
              </div>
            </div>
            <p className="mb-4 text-sm text-gray-700">
              Are you sure you want to permanently remove <span className="font-semibold">{users.find(u => u.id === deleteConfirm)?.name || 'this user'}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
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
