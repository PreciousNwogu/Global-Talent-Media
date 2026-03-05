import { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';

const STATUS_COLORS = {
  confirmed: 'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  pending:    'bg-yellow-100 text-yellow-700',
  attended:   'bg-blue-100 text-blue-700',
};

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [msg, setMsg]           = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getBookings({ search });
      const d = res.data.data ?? res.data;
      setBookings(Array.isArray(d) ? d : d.data ?? []);
    } catch {
      setMsg('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const handleStatusChange = async (id, field, value) => {
    try {
      await adminApi.updateBooking(id, { [field]: value });
      setBookings((prev) =>
        prev.map((b) => b.id === id ? { ...b, [field]: value } : b)
      );
    } catch {
      setMsg('Failed to update booking.');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Bookings</h1>

      {msg && <div className="bg-blue-50 text-blue-700 text-sm px-4 py-2 rounded-lg">{msg}</div>}

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Search by name, email, reference…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700">
          Search
        </button>
      </form>

      {loading ? (
        <p className="text-gray-400 animate-pulse">Loading…</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Reference</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Event</th>
                <th className="px-4 py-3 text-left">Tickets</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Booking Status</th>
                <th className="px-4 py-3 text-left">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">No bookings found.</td></tr>
              ) : bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.booking_reference}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{b.customer_name}</p>
                    <p className="text-xs text-gray-400">{b.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 max-w-[160px]">
                    <div className="truncate text-gray-700">{b.event?.title ?? '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-center">{b.number_of_tickets}</td>
                  <td className="px-4 py-3">${b.total_amount}</td>
                  <td className="px-4 py-3">
                    <select
                      value={b.booking_status}
                      onChange={(e) => handleStatusChange(b.id, 'booking_status', e.target.value)}
                      className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[b.booking_status] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {['pending','confirmed','cancelled','attended'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={b.payment_status}
                      onChange={(e) => handleStatusChange(b.id, 'payment_status', e.target.value)}
                      className="text-xs px-2 py-1 rounded-full border border-gray-200 cursor-pointer"
                    >
                      {['pending','paid','failed','refunded'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Bookings;
