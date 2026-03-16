import { Link } from 'react-router-dom';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { resolveMediaUrl } from '../../utils/media';

const EventCard = ({ event }) => {
  if (!event) {
    console.warn('EventCard: event is null or undefined');
    return null;
  }

  return (
    <Link to={`/events/${event.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        {event.cover_image && (
          <img
            src={resolveMediaUrl(event.cover_image)}
            alt={event.title || 'Event'}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=Event+Image';
            }}
          />
        )}
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            {event.category && (
              <span className="text-sm text-blue-600 font-semibold">
                {event.category.name}
              </span>
            )}
            {event.is_featured && (
              <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded">
                Featured
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
            {event.title || 'Untitled Event'}
          </h3>
          {event.short_description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {event.short_description}
            </p>
          )}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div>
              <p>{event.starts_at ? formatDate(event.starts_at, 'MMM dd, yyyy') : 'Date TBA'}</p>
              <p className="text-xs">{event.location || 'Location TBA'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-800">
              {event.price ? formatCurrency(event.price) : 'Free'}
            </span>
            <span className="text-sm text-gray-600">
              {event.available_tickets !== undefined ? `${event.available_tickets} tickets left` : ''}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
