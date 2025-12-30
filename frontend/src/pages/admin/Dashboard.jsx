import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Dashboard component mounted, loading data...');
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('Loading dashboard data...');
      const [statsResponse, revenueResponse] = await Promise.all([
        adminApi.getStats(),
        adminApi.getRevenue(),
      ]);
      console.log('Stats response:', statsResponse);
      console.log('Stats data:', statsResponse.data);
      console.log('Revenue response:', revenueResponse);
      console.log('Revenue data:', revenueResponse.data);
      setStats(statsResponse.data);
      setRevenue(revenueResponse.data);
      console.log('Dashboard data loaded successfully');
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      console.error('Error response:', error.response);
      console.error('Error details:', error.response?.data || error.message);
      setError(error.response?.data?.message || error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount || 0);
  };

  console.log('Dashboard render - loading:', loading, 'error:', error, 'stats:', stats);

  if (loading) {
    return (
      <div className="w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-gray-600 text-lg mb-2">Loading dashboard...</div>
            <div className="text-gray-400 text-sm">Please wait while we fetch your data</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="bg-white p-3 rounded text-xs text-gray-600 mb-4">
            <strong>Debug Info:</strong>
            <pre className="mt-2 overflow-auto">{JSON.stringify(error, null, 2)}</pre>
          </div>
          <button
            onClick={loadDashboardData}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">No Data Available</h2>
          <p className="text-yellow-800 mb-4">Stats may be loading or there may be no data yet.</p>
          <div className="bg-white p-3 rounded text-xs text-gray-600 mb-4">
            <strong>Debug Info:</strong> Stats is {stats === null ? 'null' : 'undefined'}
          </div>
          <button
            onClick={loadDashboardData}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          >
            Reload Data
          </button>
        </div>
      </div>
    );
  }

  console.log('Rendering dashboard with stats:', stats);
  
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue Today */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Revenue Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats?.revenue?.today)}
              </p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        {/* Revenue This Month */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Revenue This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats?.revenue?.this_month)}
              </p>
            </div>
            <div className="text-3xl">📈</div>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.bookings?.total || 0}
              </p>
            </div>
            <div className="text-3xl">📋</div>
          </div>
        </div>

        {/* Published Events */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Published Events</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.events?.published || 0}
              </p>
            </div>
            <div className="text-3xl">🎫</div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Pending Bookings</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stats?.pending_bookings || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Active Bookings</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stats?.active_bookings || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stats?.events?.upcoming || 0}
          </p>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Today</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(stats?.revenue?.today)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">This Week</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(stats?.revenue?.this_week)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">This Month</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(stats?.revenue?.this_month)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(stats?.revenue?.total)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

