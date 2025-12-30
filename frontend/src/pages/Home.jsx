import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi } from '../services/api';
import EventCard from '../components/Events/EventCard';
import Loading from '../components/Common/Loading';

const Home = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // Load featured events
      const featuredResponse = await eventsApi.getAll({ featured: 'true', per_page: 3 });
      const featuredData = featuredResponse.data.data || featuredResponse.data;
      const featuredArray = Array.isArray(featuredData) ? featuredData : [];
      console.log('Featured events:', featuredArray);
      setFeaturedEvents(featuredArray);
      
      // Load upcoming events
      const upcomingResponse = await eventsApi.getAll({ per_page: 6 });
      const upcomingData = upcomingResponse.data.data || upcomingResponse.data;
      const upcomingArray = Array.isArray(upcomingData) ? upcomingData : [];
      console.log('Upcoming events:', upcomingArray);
      setUpcomingEvents(upcomingArray);
    } catch (error) {
      console.error('Error loading events:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to Global Talent Media Hub</h1>
          <p className="text-xl mb-8">Discover and book amazing talent events</p>
          <Link
            to="/events"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Browse Events
          </Link>
        </div>
      </section>

      {/* Featured Events */}
      {featuredEvents.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Featured Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Upcoming Events</h2>
            <Link
              to="/events"
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              View All →
            </Link>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No upcoming events at the moment.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

