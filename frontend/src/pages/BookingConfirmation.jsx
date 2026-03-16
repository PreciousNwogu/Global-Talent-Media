import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { bookingsApi, paymentsApi } from '../services/api';
import { formatDate, formatDateTime, formatCurrency } from '../utils/formatters';
import Loading from '../components/Common/Loading';

const BookingConfirmation = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('ref'); // Get reference from URL if provided
  
  const [booking, setBooking] = useState(null);
  const [bankDetails, setBankDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load by reference (id in URL is actually the booking reference)
    if (reference || id) {
      loadBookingByReference();
    }
  }, [id, reference]);

  const loadBookingByReference = async () => {
    try {
      const bookingRef = reference || id;
      const response = await bookingsApi.getByReference(bookingRef);
      setBooking(response.data);
      // Load bank details using booking reference
      await loadBankDetails(response.data.booking_reference);
      setLoading(false);
    } catch (error) {
      console.error('Error loading booking:', error);
      setLoading(false);
    }
  };

  const loadBankDetails = async (bookingReference) => {
    try {
      const response = await paymentsApi.getBankDetails(bookingReference);
      setBankDetails(response.data);
      if (response.data.booking && !booking) {
        setBooking(response.data.booking);
      }
    } catch (error) {
      console.error('Error loading bank details:', error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 text-lg">Booking not found.</p>
        <Link to="/events" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">
            Your booking has been created. Please complete payment to confirm your tickets.
          </p>
          <p className="text-lg font-semibold text-gray-800 mt-4">
            Booking Reference: <span className="text-blue-600">{booking.booking_reference}</span>
          </p>
        </div>

        {/* QR Code Ticket */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex flex-col items-center text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-1">Your Ticket</h2>
          <p className="text-gray-500 text-sm mb-4">Show this QR code at the venue entrance</p>
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg inline-block">
            <QRCodeSVG
              value={`GTM:${booking.booking_reference}:${booking.customer_email}`}
              size={160}
              level="H"
              includeMargin={true}
            />
          </div>
          <p className="mt-3 font-mono text-sm text-gray-600 tracking-widest">{booking.booking_reference}</p>
          <p className="text-xs text-gray-400 mt-1">{booking.ticket_quantity} ticket{booking.ticket_quantity > 1 ? 's' : ''} · {booking.event?.title}</p>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Booking Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Event:</span>
              <span className="font-semibold">{booking.event?.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-semibold">{formatDate(booking.event?.starts_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-semibold">{booking.event?.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tickets:</span>
              <span className="font-semibold">{booking.ticket_quantity}</span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="text-lg font-semibold text-gray-800">Total Amount:</span>
              <span className="text-xl font-bold text-gray-800">
                {formatCurrency(booking.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        {bankDetails && bankDetails.bank_details && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Payment Instructions</h2>
            <p className="text-gray-700 mb-4">
              Please transfer the payment amount to the following bank account. Use your booking
              reference as the payment reference.
            </p>

            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Account Name:</span>
                  <span className="font-semibold">{bankDetails.bank_details.account_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Account Number:</span>
                  <span className="font-semibold font-mono">
                    {bankDetails.bank_details.account_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Sort Code:</span>
                  <span className="font-semibold font-mono">
                    {bankDetails.bank_details.sort_code}
                  </span>
                </div>
                {bankDetails.bank_details.iban && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">IBAN:</span>
                    <span className="font-semibold font-mono text-sm">
                      {bankDetails.bank_details.iban}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-600 font-medium">Amount:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(bankDetails.bank_details.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Reference:</span>
                  <span className="font-semibold font-mono text-blue-600">
                    {bankDetails.bank_details.reference}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Please include your booking reference{' '}
                <strong>{booking.booking_reference}</strong> in the payment reference field when
                making the transfer. This helps us match your payment to your booking.
              </p>
            </div>
          </div>
        )}

        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Customer Information</h2>
          <div className="space-y-2 text-gray-600">
            <p>
              <span className="font-semibold">Name:</span> {booking.customer_name}
            </p>
            <p>
              <span className="font-semibold">Email:</span> {booking.customer_email}
            </p>
            {booking.customer_phone && (
              <p>
                <span className="font-semibold">Phone:</span> {booking.customer_phone}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            to="/events"
            className="flex-1 bg-gray-200 text-gray-800 text-center py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Browse More Events
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Print Confirmation
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
