import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { eventsApi, bookingsApi } from '../services/api';
import { formatDate, formatCurrency } from '../utils/formatters';
import Loading from '../components/Common/Loading';

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const eventId = searchParams.get('event_id');

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    ticket_quantity: 1,
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    special_requests: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (eventId) {
      loadEvent();
    } else {
      navigate('/events');
    }
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const response = await eventsApi.getById(eventId);
      setEvent(response.data);
    } catch (error) {
      console.error('Error loading event:', error);
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Name is required';
    }

    if (!formData.customer_email.trim()) {
      newErrors.customer_email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.customer_email)) {
      newErrors.customer_email = 'Email is invalid';
    }

    if (formData.ticket_quantity < 1) {
      newErrors.ticket_quantity = 'At least 1 ticket is required';
    }

    if (event && formData.ticket_quantity > event.available_tickets) {
      newErrors.ticket_quantity = `Only ${event.available_tickets} tickets available`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await bookingsApi.create({
        event_id: eventId,
        ...formData,
        ticket_quantity: parseInt(formData.ticket_quantity),
      });

      // Navigate to confirmation page with booking reference
      navigate(`/bookings/${response.data.booking.id}/confirmation?ref=${response.data.booking.booking_reference}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert('Failed to create booking. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!event) {
    return null;
  }

  const totalAmount = event.price * formData.ticket_quantity;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Book Event</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Booking Details</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Tickets *
                </label>
                <input
                  type="number"
                  name="ticket_quantity"
                  min="1"
                  max={event.available_tickets}
                  value={formData.ticket_quantity}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.ticket_quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.ticket_quantity && (
                  <p className="text-red-500 text-sm mt-1">{errors.ticket_quantity}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {event.available_tickets} tickets available
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.customer_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.customer_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="customer_email"
                  value={formData.customer_email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.customer_email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.customer_email && (
                  <p className="text-red-500 text-sm mt-1">{errors.customer_email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests
                </label>
                <textarea
                  name="special_requests"
                  value={formData.special_requests}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Processing...' : 'Continue to Payment'}
              </button>
            </form>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Booking Summary</h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800">{event.title}</h4>
                <p className="text-sm text-gray-600">{formatDate(event.starts_at)}</p>
                <p className="text-sm text-gray-600">{event.location}</p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">
                    {formData.ticket_quantity} x {formatCurrency(event.price)}
                  </span>
                  <span className="font-semibold">{formatCurrency(event.price * formData.ticket_quantity)}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Total</span>
                  <span className="text-2xl font-bold text-gray-800">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;

