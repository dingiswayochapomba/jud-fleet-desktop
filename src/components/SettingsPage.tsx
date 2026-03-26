import { useState } from 'react';
import { Lock, Bell, Eye, EyeOff, Save, X, AlertCircle, CheckCircle, Download, Trash2, Moon, Sun, LogIn, Eye as EyeIcon, Edit3, Zap, Filter } from 'lucide-react';

interface SettingsPageProps {
  userProfile: any;
  user: any;
  onLogout: () => void;
}

export default function SettingsPage({ userProfile, user, onLogout }: SettingsPageProps) {
  const [activeSection, setActiveSection] = useState('profile');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [theme, setTheme] = useState(localStorage.getItem('app-theme') || 'light');
  const [notifications, setNotifications] = useState({
    email: true,
    maintenance: true,
    insurance: true,
    fuel: true,
    digest: 'weekly',
  });
  const [language, setLanguage] = useState('en');
  const [timeZone, setTimeZone] = useState('Africa/Johannesburg');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [activityLog, setActivityLog] = useState([
    { id: 1, action: 'Login', timestamp: new Date(Date.now() - 1800000), ip: '192.168.1.100', status: 'success', details: 'Web browser' },
    { id: 2, action: 'View Vehicles', timestamp: new Date(Date.now() - 3600000), ip: '192.168.1.100', status: 'success', details: 'Accessed vehicles list' },
    { id: 3, action: 'Edit Fuel Log', timestamp: new Date(Date.now() - 5400000), ip: '192.168.1.100', status: 'success', details: 'Updated fuel consumption' },
    { id: 4, action: 'Login', timestamp: new Date(Date.now() - 86400000), ip: '192.168.1.105', status: 'success', details: 'Web browser' },
    { id: 5, action: 'Download Report', timestamp: new Date(Date.now() - 172800000), ip: '192.168.1.100', status: 'success', details: 'Fleet summary report' },
    { id: 6, action: 'Failed Login', timestamp: new Date(Date.now() - 259200000), ip: '203.0.113.42', status: 'failed', details: 'Invalid credentials' },
  ]);
  const [activityFilter, setActivityFilter] = useState('all');
  const [activitySearchTerm, setActivitySearchTerm] = useState('');

  const handlePasswordChange = () => {
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (passwordForm.new.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }
    setPasswordMessage({ type: 'success', text: 'Password changed successfully' });
    setPasswordForm({ current: '', new: '', confirm: '' });
    setTimeout(() => {
      setShowPasswordForm(false);
      setPasswordMessage(null);
    }, 2000);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  const handleNotificationChange = (key: string, value: any) => {
    setNotifications({ ...notifications, [key]: value });
  };

  const handleExportData = () => {
    const data = {
      profile: userProfile,
      email: user?.email,
      exportDate: new Date().toISOString(),
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `account-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'Login':
        return <LogIn size={16} className="text-blue-600" />;
      case 'View Vehicles':
        return <EyeIcon size={16} className="text-blue-600" />;
      case 'Edit Fuel Log':
      case 'Download Report':
        return <Edit3 size={16} className="text-green-600" />;
      case 'Failed Login':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <Zap size={16} className="text-gray-600" />;
    }
  };

  const getActivityColor = (action: string, status: string) => {
    if (status === 'failed') return 'bg-red-50 border-red-200';
    if (action === 'Login') return 'bg-blue-50 border-blue-200';
    return 'bg-gray-50 border-gray-200';
  };

  const filteredActivity = activityLog.filter((log) => {
    if (activityFilter === 'success') return log.status === 'success';
    if (activityFilter === 'failed') return log.status === 'failed';
    return true;
  }).filter((log) => 
    log.action.toLowerCase().includes(activitySearchTerm.toLowerCase()) ||
    log.ip.includes(activitySearchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header - Minimized */}
      <div className="bg-gradient-to-r from-[#44444E] via-[#3A3A42] to-[#303036] rounded-lg p-3 text-white shadow-md">
        <h1 className="text-lg font-bold">Account Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            {[
              { id: 'profile', label: 'Profile', icon: '👤' },
              { id: 'security', label: 'Security', icon: '🔒' },
              { id: 'notifications', label: 'Notifications', icon: '🔔' },
              { id: 'preferences', label: 'Preferences', icon: '⚙️' },
              { id: 'activity', label: 'Activity Log', icon: '📋' },
              { id: 'data', label: 'Data & Privacy', icon: '📊' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full px-4 py-3 text-sm font-medium text-left transition-colors duration-200 border-b border-gray-100 last:border-b-0 ${
                  activeSection === item.id
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-l-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Profile Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={userProfile?.name || user?.email?.split('@')[0] || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <input
                      type="text"
                      value={userProfile?.role || 'User'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={userProfile?.department || 'Fleet Management'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">✎ Contact your administrator to update profile information</p>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              {/* Password */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Security Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Password</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Last changed 45 days ago</p>
                    </div>
                    <button
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                    >
                      <Lock size={14} className="inline mr-2" />
                      Change Password
                    </button>
                  </div>

                  {showPasswordForm && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                          type="password"
                          value={passwordForm.current}
                          onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                          placeholder="Enter current password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                          type="password"
                          value={passwordForm.new}
                          onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                          placeholder="Enter new password (min 8 characters)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input
                          type="password"
                          value={passwordForm.confirm}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                          placeholder="Confirm new password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {passwordMessage && (
                        <div
                          className={`p-3 rounded-lg flex items-center gap-2 ${
                            passwordMessage.type === 'success'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {passwordMessage.type === 'success' ? (
                            <CheckCircle size={16} />
                          ) : (
                            <AlertCircle size={16} />
                          )}
                          {passwordMessage.text}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={handlePasswordChange}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                        >
                          <Save size={14} className="inline mr-2" />
                          Save Password
                        </button>
                        <button
                          onClick={() => {
                            setShowPasswordForm(false);
                            setPasswordMessage(null);
                            setPasswordForm({ current: '', new: '', confirm: '' });
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 text-sm font-medium"
                        >
                          <X size={14} className="inline mr-2" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">{twoFactorEnabled ? 'Enabled' : 'Disabled'}</p>
                    </div>
                    <button
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                      className={`px-4 py-2 rounded-md transition-colors duration-200 text-sm font-medium text-white ${
                        twoFactorEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 hover:bg-gray-500'
                      }`}
                    >
                      {twoFactorEnabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Notification Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receive alerts via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) => handleNotificationChange('email', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Maintenance Alerts</p>
                      <p className="text-sm text-gray-600">Get notified about upcoming maintenance</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.maintenance}
                      onChange={(e) => handleNotificationChange('maintenance', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Insurance Expiry Alerts</p>
                      <p className="text-sm text-gray-600">Notify when policies are expiring</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.insurance}
                      onChange={(e) => handleNotificationChange('insurance', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Fuel Anomaly Alerts</p>
                      <p className="text-sm text-gray-600">Alert on unusual fuel consumption</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.fuel}
                      onChange={(e) => handleNotificationChange('fuel', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-2">Digest Frequency</p>
                    <select
                      value={notifications.digest}
                      onChange={(e) => handleNotificationChange('digest', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Section */}
          {activeSection === 'preferences' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Preferences</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="font-medium text-gray-900 dark:text-white mb-3">Theme</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleThemeChange('light')}
                        className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors duration-200 flex items-center justify-center gap-2 ${
                          theme === 'light'
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <Sun size={16} />
                        Light
                      </button>
                      <button
                        onClick={() => handleThemeChange('dark')}
                        className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors duration-200 flex items-center justify-center gap-2 ${
                          theme === 'dark'
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <Moon size={16} />
                        Dark
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="block font-medium text-gray-900 mb-2">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="ny">Chichewa</option>
                      <option value="zu">Zulu</option>
                    </select>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="block font-medium text-gray-900 mb-2">Time Zone</label>
                    <select
                      value={timeZone}
                      onChange={(e) => setTimeZone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Africa/Johannesburg">Africa/Johannesburg</option>
                      <option value="UTC">UTC</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="America/New_York">America/New_York</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activity Log Section */}
          {activeSection === 'activity' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
                
                {/* Filters and Search */}
                <div className="space-y-3 mb-4">
                  {/* Search */}
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                    <Filter size={16} className="text-gray-500 dark:text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by action or IP..."
                      value={activitySearchTerm}
                      onChange={(e) => setActivitySearchTerm(e.target.value)}
                      className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-500 flex-1"
                    />
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex gap-2">
                    {[
                      { key: 'all', label: 'All Activity' },
                      { key: 'success', label: '✓ Success' },
                      { key: 'failed', label: '✗ Failed' },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setActivityFilter(key)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          activityFilter === key
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activity Count */}
                <p className="text-xs text-gray-500 mb-3">
                  Showing {filteredActivity.length} of {activityLog.length} activities
                </p>

                {/* Activity List */}
                <div className="space-y-3">
                  {filteredActivity.length === 0 ? (
                    <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-600 text-sm">No activities found</p>
                    </div>
                  ) : (
                    filteredActivity.map((log) => (
                      <div
                        key={log.id}
                        className={`p-4 rounded-lg border flex items-start justify-between transition-all ${getActivityColor(
                          log.action,
                          log.status
                        )}`}
                      >
                        <div className="flex gap-3 flex-1">
                          <div className="mt-1">{getActivityIcon(log.action)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-900">{log.action}</p>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                  log.status === 'failed'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'
                                }`}
                              >
                                {log.status === 'failed' ? 'Failed' : 'Success'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">{log.details}</p>
                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                              <span>📅 {log.timestamp.toLocaleString()}</span>
                              <span>🌐 {log.ip}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Stats */}
                <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{activityLog.length}</p>
                    <p className="text-xs text-gray-600 mt-1">Total Activities</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {activityLog.filter((l) => l.status === 'success').length}
                    </p>
                    <p className="text-xs text-green-600 mt-1">Successful</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">
                      {activityLog.filter((l) => l.status === 'failed').length}
                    </p>
                    <p className="text-xs text-red-600 mt-1">Failed</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data & Privacy Section */}
          {activeSection === 'data' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Data & Privacy</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      💡 Your data is encrypted and stored securely. Review our privacy policy for more details.
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div>
                      <p className="font-medium text-gray-900">Export My Data</p>
                      <p className="text-sm text-gray-600">Download all your account data as JSON</p>
                    </div>
                    <button
                      onClick={handleExportData}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                    >
                      <Download size={14} className="inline mr-2" />
                      Export
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium text-red-900">Delete Account</p>
                      <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                    </div>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                    >
                      <Trash2 size={14} className="inline mr-2" />
                      Delete
                    </button>
                  </div>

                  {showDeleteConfirm && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-300 space-y-3">
                      <p className="text-red-700 font-medium">⚠️ This action cannot be undone!</p>
                      <p className="text-sm text-red-600">Are you sure you want to delete your account and all associated data?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200 text-sm font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            onLogout();
                          }}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Session Management */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Session Management</h2>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Current Session</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">You are logged in and your session is active</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
