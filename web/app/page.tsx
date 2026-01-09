import Link from "next/link";
import { BarChart3, Truck, Users, FileText, AlertTriangle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-indigo-600">🚗 Fleet Management System</h1>
            <p className="text-gray-600">Malawi Judiciary Transport Management</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Alert Banner */}
        <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-800">Active Alerts</p>
              <p className="text-sm text-yellow-700">2 insurance expiries, 5 maintenance overdue</p>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Fleet Status */}
          <Link href="/dashboard">
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-6 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Fleet Status</h3>
                <BarChart3 className="w-8 h-8 text-indigo-500" />
              </div>
              <p className="text-3xl font-bold text-indigo-600">42</p>
              <p className="text-sm text-gray-600 mt-2">Total Vehicles</p>
              <div className="mt-4 text-xs text-gray-500">
                <p>✓ 38 Available</p>
                <p>⚠ 3 Under Maintenance</p>
                <p>✗ 1 Out of Service</p>
              </div>
            </div>
          </Link>

          {/* Vehicles */}
          <Link href="/vehicles">
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-6 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Vehicles</h3>
                <Truck className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-600">42</p>
              <p className="text-sm text-gray-600 mt-2">Manage Fleet</p>
              <button className="mt-4 w-full bg-blue-100 text-blue-700 py-2 rounded hover:bg-blue-200 transition text-sm font-medium">
                View All
              </button>
            </div>
          </Link>

          {/* Drivers */}
          <Link href="/drivers">
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-6 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Drivers</h3>
                <Users className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-600">38</p>
              <p className="text-sm text-gray-600 mt-2">Active Drivers</p>
              <div className="mt-4 text-xs text-gray-500">
                <p>⚠ 3 Retiring Soon</p>
              </div>
            </div>
          </Link>

          {/* Reports */}
          <Link href="/reports">
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-6 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Reports</h3>
                <FileText className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-sm text-gray-600 mt-2">Generate & Export</p>
              <button className="mt-4 w-full bg-purple-100 text-purple-700 py-2 rounded hover:bg-purple-200 transition text-sm font-medium">
                Generate Report
              </button>
            </div>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-semibold text-gray-700 mb-4">Fuel Consumption (This Month)</h4>
            <p className="text-2xl font-bold text-indigo-600">2,450 L</p>
            <p className="text-sm text-gray-600 mt-2">↑ 5% from last month</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-semibold text-gray-700 mb-4">Maintenance Costs</h4>
            <p className="text-2xl font-bold text-orange-600">MWK 145,000</p>
            <p className="text-sm text-gray-600 mt-2">YTD Total</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-semibold text-gray-700 mb-4">Insurance Status</h4>
            <p className="text-2xl font-bold text-red-600">2 Expiring</p>
            <p className="text-sm text-gray-600 mt-2">Action Required</p>
          </div>
        </div>
      </main>
    </div>
  );
}
