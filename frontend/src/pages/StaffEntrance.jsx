import { useState, useRef, useEffect } from 'react';
import { adminApi, bookingsApi } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const StaffEntrance = () => {
  const { user } = useAuth();
  const [bookingRef, setBookingRef] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toggling, setToggling] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const inputRef = useRef(null);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const searchBooking = async (ref) => {
    if (!ref.trim()) {
      setError('Please enter a booking reference');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');
    setBooking(null);

    try {
      const response = await bookingsApi.getByReference(ref.trim());
      setBooking(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking not found');
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchBooking(bookingRef);
  };

  const handleCheckIn = async () => {
    if (!booking) return;

    // Only allow check-in for paid bookings
    if (booking.payment_status !== 'paid') {
      setError('Only paid bookings can be checked in. Please collect payment first.');
      return;
    }

    // Don't allow check-in if already checked in
    if (booking.checked_in) {
      setError('This booking is already checked in.');
      return;
    }

    const next = !booking.checked_in;
    setToggling(true);
    setError('');

    try {
      await adminApi.updateBooking(booking.id, { checked_in: next });
      setBooking((b) => ({
        ...b,
        checked_in: next,
        checked_in_at: next ? new Date().toISOString() : null,
      }));
      setSuccessMsg(
        next
          ? `✓ ${booking.customer_name} has been checked in!`
          : `${booking.customer_name} check-in reversed.`
      );
      // Reset form after successful check-in
      if (next) {
        setTimeout(() => {
          setBookingRef('');
          setBooking(null);
          setSuccessMsg('');
          inputRef.current?.focus();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update check-in status');
    } finally {
      setToggling(false);
    }
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-800 border-green-300',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      failed: 'bg-red-100 text-red-800 border-red-300',
      refunded: 'bg-purple-100 text-purple-800 border-purple-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Redirect if not admin
  if (!user?.is_admin) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-600 text-lg font-semibold">Access Denied</p>
        <p className="text-gray-600 mt-2">Only staff members can access this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Event Entrance Check-In</h1>
          <p className="text-gray-600">Scan QR code or enter booking reference</p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Booking Reference
              </label>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value.toUpperCase())}
                  placeholder="e.g., GTM-2026-XXXXX"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg tracking-wider font-mono"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Searching…' : 'Search'}
                </button>
              </div>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="mt-4 p-4 bg-green-50 border border-green-300 text-green-700 rounded-lg text-center font-semibold">
              {successMsg}
            </div>
          )}
        </div>

        {/* Booking Details Card */}
        {booking && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header with Payment Status */}
            <div className={`p-6 border-b-4 ${booking.payment_status === 'paid' ? 'border-green-500 bg-green-50' : booking.payment_status === 'pending' ? 'border-yellow-500 bg-yellow-50' : 'border-red-500 bg-red-50'}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{booking.customer_name}</h2>
                  <p className="text-gray-600 text-sm mt-1">{booking.customer_email}</p>
                  {booking.customer_phone && (
                    <p className="text-gray-600 text-sm">{booking.customer_phone}</p>
                  )}
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getPaymentStatusColor(
                    booking.payment_status
                  )}`}
                >
                  {booking.payment_status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Booking Details */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Event</p>
                  <p className="text-lg text-gray-800">{booking.event?.title}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Date</p>
                  <p className="text-lg text-gray-800">{formatDate(booking.event?.starts_at)}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Tickets</p>
                  <p className="text-lg text-gray-800">{booking.ticket_quantity}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Amount</p>
                  <p className="text-lg font-bold text-gray-800">{formatCurrency(booking.total_amount)}</p>
                </div>
              </div>

              {/* Booking Reference */}
              <div className="bg-gray-50 rounded-lg p-4 mt-6">
                <p className="text-gray-600 text-sm font-semibold">Booking Reference</p>
                <p className="text-lg font-mono font-bold text-blue-600 tracking-wider">
                  {booking.booking_reference}
                </p>
              </div>

              {/* Check-In Status */}
              <div className="border-t pt-6">
                {booking.checked_in ? (
                  <div className="bg-green-50 border border-green-300 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">✓ Checked In</p>
                    <p className="text-sm text-green-700 mt-2">
                      Entry verified on {new Date(booking.checked_in_at).toLocaleString()}
                    </p>
                  </div>
                ) : booking.payment_status !== 'paid' ? (
                  <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-center">
                    <p className="text-lg font-semibold text-red-700">Payment Required</p>
                    <p className="text-sm text-red-600 mt-2">
                      This booking cannot be checked in until payment is received. Current status: <strong>{booking.payment_status.toUpperCase()}</strong>
                    </p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-center">
                    <p className="text-lg font-semibold text-yellow-700">Ready to Check-In</p>
                    <p className="text-sm text-yellow-600 mt-1">Payment confirmed. Proceed with verification.</p>
                  </div>
                )}
              </div>

              {/* Check-In Button */}
              <button
                onClick={handleCheckIn}
                disabled={toggling || booking.checked_in || booking.payment_status !== 'paid'}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-colors mt-6 ${
                  booking.checked_in
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : booking.payment_status !== 'paid'
                    ? 'bg-red-400 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                } disabled:opacity-50`}
              >
                {toggling
                  ? 'Processing…'
                  : booking.checked_in
                  ? '✓ Already Checked In'
                  : booking.payment_status !== 'paid'
                  ? '✗ Payment Required'
                  : '✓ Verify & Check-In'}
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!booking && !loading && bookingRef && (
          <div className="text-center text-gray-500 mt-8">
            <p>Enter a booking reference to view attendee details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffEntrance;
