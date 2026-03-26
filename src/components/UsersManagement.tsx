import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, X, AlertCircle, Search, MoreVertical, Filter, Download, Shield, Users, Clock, UserCheck, UserCog } from 'lucide-react';
import { PieChart, Pie, BarChart, Bar, Cell, ResponsiveContainer, Legend, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive';
  position: string;
  jurisdiction: string;
  created_at: string;
  last_login: string | null;
}

const roleColors: { [key: string]: { bg: string; text: string; badge: string } } = {
  admin: { bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800' },
  manager: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
  user: { bg: 'bg-gray-50', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-800' },
};

const statusColors: { [key: string]: { bg: string; text: string; badge: string } } = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' },
  inactive: { bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
};

const roles = ['admin', 'manager', 'user'];
const statuses = ['active', 'inactive'];

export default function UsersManagement() {
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
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'created'>('name');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<Partial<User>>({
    email: '',
    name: '',
    role: 'user',
    status: 'active',
    position: '',
    jurisdiction: '',
  });

  // Load mock users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Mock data for demonstration
        const mockUsers: User[] = [
          {
            id: '1',
            email: 'admin@judiciary.mw',
            name: 'Administrator',
            role: 'admin',
            status: 'active',
            position: 'System Administrator',
            jurisdiction: 'National',
            created_at: '2025-01-01',
            last_login: '2026-01-11',
          },
          {
            id: '2',
            email: 'manager@judiciary.mw',
            name: 'Fleet Manager',
            role: 'manager',
            status: 'active',
            position: 'Fleet Manager',
            jurisdiction: 'National',
            created_at: '2025-02-15',
            last_login: '2026-01-10',
          },
          {
            id: '3',
            email: 'user@judiciary.mw',
            name: 'Regular User',
            role: 'user',
            status: 'active',
            position: 'Operations Officer',
            jurisdiction: 'Lilongwe',
            created_at: '2025-03-20',
            last_login: '2026-01-09',
          },
        ];
        
        setUsers(mockUsers);
      } catch (err: any) {
        console.error('❌ Error loading users:', err);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      role: 'user',
      status: 'active',
    });
    setSubmitError(null);
  };

  const handleOpenForm = (user?: User) => {
    if (user) {
      setEditingId(user.id);
      setFormData(user);
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

    try {
      setSubmitting(true);
      
      if (editingId) {
        // Update user
        const updatedUser: User = {
          id: editingId,
          email: formData.email || '',
          name: formData.name || '',
          role: formData.role as 'admin' | 'manager' | 'user',
          status: formData.status as 'active' | 'inactive',
          position: formData.position || '',
          jurisdiction: formData.jurisdiction || '',
          created_at: users.find(u => u.id === editingId)?.created_at || new Date().toISOString(),
          last_login: users.find(u => u.id === editingId)?.last_login || null,
        };
        setUsers(users.map(u => u.id === editingId ? updatedUser : u));
        setSuccessMessage('✅ User updated successfully!');
      } else {
        // Create new user
        const newUser: User = {
          id: Date.now().toString(),
          email: formData.email || '',
          name: formData.name || '',
          role: formData.role as 'admin' | 'manager' | 'user',
          status: formData.status as 'active' | 'inactive',
          position: formData.position || '',
          jurisdiction: formData.jurisdiction || '',
          created_at: new Date().toISOString(),
          last_login: null,
        };
        setUsers([newUser, ...users]);
        setSuccessMessage('✅ User added successfully!');
      }

      handleCloseForm();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('❌ Error:', err);
      setSubmitError(`Error: ${err?.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    try {
      setUsers(users.filter(u => u.id !== id));
      setDeleteConfirm(null);
      setSuccessMessage('✅ User deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(`Delete failed: ${err?.message || 'Unknown error'}`);
    }
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
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Add User
          </button>
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
            <p className="text-xs text-gray-300">Administrators</p>
            <p className="text-lg font-bold text-purple-300">{users.filter(u => u.role === 'admin').length}</p>
          </div>
          <div className="bg-white/10 rounded p-2">
            <p className="text-xs text-gray-300">Managers</p>
            <p className="text-lg font-bold text-blue-300">{users.filter(u => u.role === 'manager').length}</p>
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
          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading users...</p>
        </div>
      )}

      {/* ===== CONTENT ===== */}
      {!loading && (
        <>
          {/* ===== USER ACTIVITY GRAPHS ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Role Distribution Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Role Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Admins', value: users.filter(u => u.role === 'admin').length },
                      { name: 'Managers', value: users.filter(u => u.role === 'manager').length },
                      { name: 'Users', value: users.filter(u => u.role === 'user').length },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    <Cell fill="#a855f7" />
                    <Cell fill="#3b82f6" />
                    <Cell fill="#6b7280" />
                  </Pie>
                  <Tooltip formatter={(value) => `${value} users`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-purple-50 rounded">
                  <p className="font-semibold text-purple-700">{users.filter(u => u.role === 'admin').length}</p>
                  <p className="text-gray-600">Admins</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <p className="font-semibold text-blue-700">{users.filter(u => u.role === 'manager').length}</p>
                  <p className="text-gray-600">Managers</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="font-semibold text-gray-700">{users.filter(u => u.role === 'user').length}</p>
                  <p className="text-gray-600">Users</p>
                </div>
              </div>
            </div>

            {/* Status Distribution Bar Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">User Status Overview</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={[
                    { name: 'Active', value: users.filter(u => u.status === 'active').length },
                    { name: 'Inactive', value: users.filter(u => u.status === 'inactive').length },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="text-center p-2 bg-green-50 rounded">
                  <p className="font-semibold text-green-700">{users.filter(u => u.status === 'active').length}</p>
                  <p className="text-gray-600">Active</p>
                </div>
                <div className="text-center p-2 bg-red-50 rounded">
                  <p className="font-semibold text-red-700">{users.filter(u => u.status === 'inactive').length}</p>
                  <p className="text-gray-600">Inactive</p>
                </div>
              </div>
            </div>

            {/* User Statistics */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
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
                      <p className="text-xs text-purple-600 font-semibold uppercase">Admin Accounts</p>
                      <p className="text-xl font-bold text-purple-700 mt-0.5">{users.filter(u => u.role === 'admin').length}</p>
                    </div>
                    <Shield size={20} className="text-purple-500" />
                  </div>
                </div>
                <div className="p-2 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-amber-600 font-semibold uppercase">Manager Accounts</p>
                      <p className="text-xl font-bold text-amber-700 mt-0.5">{users.filter(u => u.role === 'manager').length}</p>
                    </div>
                    <UserCog size={20} className="text-amber-500" />
                  </div>
                </div>
              </div>
            </div>
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
                    {filtered.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-blue-50 transition-all">
                        <td className="px-6 py-3 text-gray-900 font-medium">{user.email}</td>
                        <td className="px-6 py-3 text-gray-700">{user.name}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${roleColors[user.role].badge}`}>
                            {user.role.toUpperCase()}
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
                                <div className="border-t border-gray-200"></div>
                                <button
                                  onClick={() => {
                                    setDeleteConfirm(user.id);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 last:rounded-b-lg"
                                >
                                  <Trash2 size={16} />
                                  Delete User
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
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
                    value={formData.role || 'user'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B]"
                  >
                    {roles.map(r => (
                      <option key={r} value={r}>{r.toUpperCase()}</option>
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
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-900">{user.name}</h3>
                        <p className="text-xs text-gray-600 mt-0.5">{user.email}</p>
                      </div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${statusColors[user.status].badge}`}>
                        {user.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Key Information */}
                    <div className="grid grid-cols-2 gap-2 bg-gradient-to-br from-blue-50 to-blue-50/50 p-3 rounded-lg border border-blue-100">
                      <div>
                        <p className="text-xs text-gray-600 font-semibold uppercase">🎯 Role</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{user.role.toUpperCase()}</p>
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

      {/* ===== DELETE CONFIRMATION ===== */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Delete User?</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-4">
              <p className="font-semibold text-gray-900 dark:text-white">
                {users.find(u => u.id === deleteConfirm)?.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {users.find(u => u.id === deleteConfirm)?.email}
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
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
