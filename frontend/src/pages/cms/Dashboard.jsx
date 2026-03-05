import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import { Link } from 'react-router-dom';

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className={`bg-white rounded-xl shadow-sm border-l-4 ${color} p-6 flex items-center gap-4`}>
    <span className="text-4xl">{icon}</span>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          adminApi.getStats(),
          adminApi.getBookings({ per_page: 5 }),
        ]);
        setStats(statsRes.data.data ?? statsRes.data);
        const b = bookingsRes.data.data ?? bookingsRes.data;
        setRecent(Array.isArray(b) ? b.slice(0, 5) : b.data?.slice(0, 5) ?? []);
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="text-gray-500 animate-pulse">Loading dashboard…</p>;
  if (error)   return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon="🎭" label="Total Events"    value={stats?.total_events}    color="border-blue-500" />
        <StatCard icon="🎟️" label="Total Bookings"  value={stats?.total_bookings}  color="border-green-500" />
        <StatCard icon="💰" label="Total Revenue"   value={stats?.total_revenue ? `$${Number(stats.total_revenue).toLocaleString()}` : '—'} color="border-yellow-500" />
        <StatCard icon="👥" label="Total Users"     value={stats?.total_users}     color="border-purple-500" />
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Bookings</h2>
          <Link to="/cms/bookings" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-gray-400 text-sm">No bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2">Ref</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Event</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map((b) => (
                  <tr key={b.id} className="py-2">
                    <td className="py-2 font-mono text-xs text-gray-500">{b.booking_reference}</td>
                    <td className="py-2">{b.customer_name}</td>
                    <td className="py-2 truncate max-w-[150px]">{b.event?.title ?? '—'}</td>
                    <td className="py-2">${b.total_amount}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        b.booking_status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        b.booking_status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{b.booking_status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
