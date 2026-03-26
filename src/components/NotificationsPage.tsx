import { useState, useEffect } from 'react';
import { Bell, Trash2, CheckCircle, AlertCircle, Info, Eye, Search, MoreVertical, X } from 'lucide-react';
import { getNotificationsForUser, markNotificationAsRead, deleteNotification } from '../lib/firebaseQueries';

interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: 'alert' | 'warning' | 'info' | 'success';
  is_read: boolean;
  created_at: string;
  related_entity?: string;
  related_id?: string;
}

interface NotificationsPageProps {
  userId: string;
}

const notificationTypeConfig = {
  alert: {
    icon: AlertCircle,
    bgGradient: 'bg-gradient-to-br from-red-50 to-red-100/50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    iconColor: 'text-red-600',
    badge: 'bg-red-100',
    label: 'Alert',
  },
  warning: {
    icon: AlertCircle,
    bgGradient: 'bg-gradient-to-br from-amber-50 to-amber-100/50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    iconColor: 'text-amber-600',
    badge: 'bg-amber-100',
    label: 'Warning',
  },
  info: {
    icon: Info,
    bgGradient: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-600',
    badge: 'bg-blue-100',
    label: 'Info',
  },
  success: {
    icon: CheckCircle,
    bgGradient: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    iconColor: 'text-emerald-600',
    badge: 'bg-emerald-100',
    label: 'Success',
  },
};

export default function NotificationsPage({ userId }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'alert' | 'warning' | 'info' | 'success'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔔 Loading notifications for userId:', userId);
      const { data, error: err } = await getNotificationsForUser(userId);
      
      console.log('📊 Notifications response:', { data, error: err });
      
      if (err) {
        console.error('❌ Error loading notifications:', err);
        setError(err.message);
        return;
      }
      
      console.log(`✅ Loaded ${(data || []).length} notifications`);
      setNotifications(data || []);
    } catch (err: any) {
      console.error('❌ Exception loading notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { error: err } = await markNotificationAsRead(notificationId);
      if (err) {
        setError(err.message);
        return;
      }
      
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      setOpenDropdown(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const { error: err } = await deleteNotification(notificationId);
      if (err) {
        setError(err.message);
        return;
      }
      
      setNotifications(notifications.filter(n => n.id !== notificationId));
      setOpenDropdown(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter !== 'all' && n.type !== filter) return false;
    if (searchTerm && !n.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.is_read).length,
    alerts: notifications.filter(n => n.type === 'alert').length,
    warnings: notifications.filter(n => n.type === 'warning').length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#44444E] via-[#3A3A42] to-[#303036] rounded-lg p-3 text-white shadow-md">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bell size={18} />
              <h1 className="text-lg font-bold">Notifications</h1>
            </div>
            <p className="text-gray-300 text-xs">Manage and view all your system notifications</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-gray-300 text-xs">Total notifications</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-gradient-to-br from-red-50 to-red-100/50 rounded-lg p-2.5 border border-red-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-tight">Alerts</p>
              <p className="text-base font-bold text-red-600 mt-1.5">{stats.alerts}</p>
            </div>
            <div className="p-1.5 bg-red-100 rounded-lg">
              <AlertCircle size={14} className="text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg p-2.5 border border-amber-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-tight">Warnings</p>
              <p className="text-base font-bold text-amber-600 mt-1.5">{stats.warnings}</p>
            </div>
            <div className="p-1.5 bg-amber-100 rounded-lg">
              <AlertCircle size={14} className="text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-2.5 border border-blue-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-tight">Unread</p>
              <p className="text-base font-bold text-blue-600 mt-1.5">{stats.unread}</p>
            </div>
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Bell size={14} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg p-2.5 border border-emerald-200 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-tight">Read</p>
              <p className="text-base font-bold text-emerald-600 mt-1.5">{stats.total - stats.unread}</p>
            </div>
            <div className="p-1.5 bg-emerald-100 rounded-lg">
              <CheckCircle size={14} className="text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
            <Search size={16} className="text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-500 flex-1"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all' as const, label: 'All' },
              { key: 'unread' as const, label: 'Unread' },
              { key: 'alert' as const, label: 'Alerts' },
              { key: 'warning' as const, label: 'Warnings' },
              { key: 'info' as const, label: 'Info' },
              { key: 'success' as const, label: 'Success' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
          <p className="text-sm font-medium">Error loading notifications</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <CheckCircle size={40} className="text-gray-400 mb-3" />
          <p className="text-gray-600 font-medium">No notifications found</p>
          <p className="text-gray-500 text-sm mt-1">
            {searchTerm ? 'Try adjusting your search' : 'You\'re all caught up!'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => {
            const config = notificationTypeConfig[notification.type as keyof typeof notificationTypeConfig];
            const Icon = config.icon;

            return (
              <div
                key={notification.id}
                className={`rounded-lg border ${config.borderColor} shadow-sm hover:shadow-md transition-all overflow-hidden ${
                  !notification.is_read ? config.bgGradient : 'bg-white'
                }`}
              >
                <div className="p-3 flex gap-3">
                  <div className={`mt-0.5 flex-shrink-0 p-2.5 rounded-lg ${config.badge}`}>
                    <Icon size={18} className={config.iconColor} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          !notification.is_read ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${config.badge} ${config.textColor}`}>
                            {config.label}
                          </span>
                          <p className="text-xs text-gray-500">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Dropdown Menu */}
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === notification.id ? null : notification.id)}
                          className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {openDropdown === notification.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-10">
                            {!notification.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                              >
                                <Eye size={14} />
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-gray-100"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
