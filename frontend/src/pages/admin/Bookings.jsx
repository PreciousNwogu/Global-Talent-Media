import { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ 
    booking_status: '', 
    payment_status: '', 
    search: '' 
  });

  useEffect(() => {
    loadBookings();
  }, [filters]);

  const loadBookings = async () => {
    try {
      const params = {};
      if (filters.booking_status) params.booking_status = filters.booking_status;
      if (filters.payment_status) params.payment_status = filters.payment_status;
      if (filters.search) params.search = filters.search;

      const response = await adminApi.getAllBookings(params);
      setBookings(response.data.data || response.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, statusType, statusValue) => {
    try {
      const updateData = { [statusType]: statusValue };
      await adminApi.updateBooking(id, updateData);
      loadBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Error updating booking status.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return <div className="text-center py-8">Loading bookings...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search by reference, email, or name..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="border rounded-lg px-3 py-2"
        />
        <select
          value={filters.booking_status}
          onChange={(e) => setFilters({ ...filters, booking_status: e.target.value })}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">All Booking Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={filters.payment_status}
          onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">All Payment Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">
                      {booking.booking_reference.substring(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.customer_name}</div>
                    <div className="text-sm text-gray-500">{booking.customer_email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{booking.event?.title || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.ticket_quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(booking.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={booking.booking_status}
                      onChange={(e) => handleUpdateStatus(booking.id, 'booking_status', e.target.value)}
                      className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusColor(booking.booking_status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={booking.payment_status}
                      onChange={(e) => handleUpdateStatus(booking.id, 'payment_status', e.target.value)}
                      className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusColor(booking.payment_status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(booking.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(booking.booking_reference);
                        alert('Booking reference copied!');
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Copy Ref
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {bookings.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No bookings found.
        </div>
      )}
    </div>
  );
};

export default Bookings;

