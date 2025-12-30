import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventsApi } from '../services/api';
import { formatDate, formatDateTime, formatCurrency } from '../utils/formatters';
import Loading from '../components/Common/Loading';
import VideoSlider from '../components/Events/VideoSlider';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState(null);

  useEffect(() => {
    loadEvent();
    checkAvailability();
  }, [id]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const response = await eventsApi.getById(id);
      setEvent(response.data);
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    try {
      const response = await eventsApi.checkAvailability(id);
      setAvailability(response.data);
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 text-lg">Event not found.</p>
        <Link to="/events" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          Back to Events
        </Link>
      </div>
    );
  }

  const canBook = availability && availability.is_available && event.status === 'published';

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/events" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← Back to Events
      </Link>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Video/Image Slider */}
        <VideoSlider event={event} />

        <div className="p-8">
          <div className="flex items-center justify-between mb-4">
            {event.category && (
              <span className="text-blue-600 font-semibold">{event.category.name}</span>
            )}
            {event.is_featured && (
              <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded text-sm font-semibold">
                Featured
              </span>
            )}
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-4">{event.title}</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Event Details</h3>
              <div className="space-y-2 text-gray-600">
                <p>
                  <span className="font-semibold">Date:</span> {formatDate(event.starts_at)}
                </p>
                <p>
                  <span className="font-semibold">Time:</span> {formatDateTime(event.starts_at)}
                </p>
                <p>
                  <span className="font-semibold">Location:</span> {event.location}
                </p>
                {event.venue_address && (
                  <p>
                    <span className="font-semibold">Address:</span> {event.venue_address}
                  </p>
                )}
                <p>
                  <span className="font-semibold">Price:</span>{' '}
                  <span className="text-2xl font-bold text-gray-800">
                    {formatCurrency(event.price)}
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Tickets Available:</span>{' '}
                  {event.available_tickets} / {event.capacity}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Booking</h3>
              {canBook ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    {availability.available_tickets} tickets available
                  </p>
                  <Link
                    to={`/bookings/new?event_id=${event.id}`}
                    className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="text-red-600 font-semibold mb-2">
                    {event.status === 'sold_out' || availability?.available_tickets === 0
                      ? 'Sold Out'
                      : event.status === 'cancelled'
                      ? 'Cancelled'
                      : 'Not Available'}
                  </p>
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Book Now
                  </button>
                </div>
              )}
            </div>
          </div>

          {event.description && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Description</h3>
              <div
                className="text-gray-600 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </div>
          )}

          {event.terms_and_conditions && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Terms & Conditions
              </h3>
              <p className="text-gray-600 whitespace-pre-line">
                {event.terms_and_conditions}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;

