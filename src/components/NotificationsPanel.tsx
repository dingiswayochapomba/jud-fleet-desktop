import { useState, useEffect } from 'react';
import { X, Trash2, CheckCircle, AlertCircle, Info, Eye, EyeOff } from 'lucide-react';
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

interface NotificationsPanelProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

const notificationTypeConfig = {
  alert: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    iconColor: 'text-red-600',
    badge: 'bg-red-100',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    iconColor: 'text-amber-600',
    badge: 'bg-amber-100',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-600',
    badge: 'bg-blue-100',
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    iconColor: 'text-emerald-600',
    badge: 'bg-emerald-100',
  },
};

export default function NotificationsPanel({ userId, isOpen, onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, userId]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const unreadOnly = filter === 'unread';
      const { data, error: err } = await getNotificationsForUser(userId, unreadOnly);
      
      if (err) {
        setError(err.message);
        return;
      }

      setNotifications(data || []);
    } catch (err: any) {
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
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!isOpen) return null;

  const NotificationIcon = notificationTypeConfig[notifications[0]?.type as keyof typeof notificationTypeConfig]?.icon || Info;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black bg-opacity-30"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-16 right-4 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col max-h-[calc(100vh-100px)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-600 mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 px-4 py-2 border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              setFilter('all');
              loadNotifications();
            }}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => {
              setFilter('unread');
              loadNotifications();
            }}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading notifications...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="px-4 py-3 bg-red-50 border-b border-red-200 text-red-700 text-sm">
              <p className="font-medium">Error loading notifications</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          )}

          {!loading && filteredNotifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <CheckCircle size={32} className="mb-2 opacity-50" />
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs mt-1">You're all caught up!</p>
            </div>
          )}

          {filteredNotifications.map((notification) => {
            const config = notificationTypeConfig[notification.type as keyof typeof notificationTypeConfig];
            const Icon = config.icon;

            return (
              <div
                key={notification.id}
                className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors group ${
                  !notification.is_read ? config.bgColor : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className={`mt-1 flex-shrink-0 p-2 rounded-lg ${config.badge}`}>
                    <Icon size={16} className={config.iconColor} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notification.is_read ? 'text-gray-600' : 'font-semibold text-gray-900'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                        title="Mark as read"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="p-1.5 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {filteredNotifications.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-center">
            <p className="text-xs text-gray-600">
              {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
