import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatCurrency } from '../utils/formatters';
import Loading from '../components/Common/Loading';

const statusColors = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  attended:  'bg-blue-100 text-blue-800',
};

const paymentColors = {
  pending:  'bg-gray-100 text-gray-700',
  paid:     'bg-green-100 text-green-700',
  refunded: 'bg-purple-100 text-purple-700',
  failed:   'bg-red-100 text-red-700',
};

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [message, setMessage]   = useState('');

  useEffect(() => { loadBookings(); }, []);

  const loadBookings = async () => {
    try {
      const { data } = await bookingsApi.getUserBookings();
      setBookings(data);
    } catch (err) {
      console.error('Error loading bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(id);
    try {
      await bookingsApi.cancel(id);
      setMessage('Booking cancelled successfully.');
      loadBookings();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">My Bookings</h1>
      <p className="text-gray-500 mb-8">Logged in as <span className="font-medium">{user?.email}</span></p>

      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6">
          {message}
          <button onClick={() => setMessage('')} className="float-right font-bold">×</button>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">You have no bookings yet.</p>
          <Link to="/events" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row md:items-center gap-4">
              {/* Event info */}
              <div className="flex-1">
                <Link
                  to={`/events/${booking.event?.id}`}
                  className="text-lg font-semibold text-gray-800 hover:text-blue-600"
                >
                  {booking.event?.title || 'Event'}
                </Link>
                <p className="text-sm text-gray-500 mt-1">
                  {booking.event?.starts_at ? formatDate(booking.event.starts_at) : ''}
                </p>
                <p className="text-sm text-gray-500">{booking.event?.location}</p>
                <p className="text-xs text-gray-400 mt-1">Ref: <span className="font-mono">{booking.booking_reference}</span></p>
              </div>

              {/* Quantity & amount */}
              <div className="text-center">
                <p className="text-sm text-gray-500">{booking.ticket_quantity} ticket{booking.ticket_quantity > 1 ? 's' : ''}</p>
                <p className="text-lg font-bold text-gray-800">{formatCurrency(booking.total_amount)}</p>
              </div>

              {/* Status badges */}
              <div className="flex flex-col gap-2 items-end">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[booking.booking_status] || 'bg-gray-100 text-gray-700'}`}>
                  {booking.booking_status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${paymentColors[booking.payment_status] || 'bg-gray-100 text-gray-700'}`}>
                  Payment: {booking.payment_status}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  to={`/bookings/${booking.id}/confirmation?ref=${booking.booking_reference}`}
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  View Ticket
                </Link>
                {booking.booking_status !== 'cancelled' && booking.booking_status !== 'attended' && (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancelling === booking.id}
                    className="px-4 py-2 border border-red-500 text-red-500 rounded-md text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    {cancelling === booking.id ? 'Cancelling…' : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
