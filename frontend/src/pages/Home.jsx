import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi } from '../services/api';
import EventCard from '../components/Events/EventCard';
import HeroCarousel from '../components/HeroCarousel';
import Loading from '../components/Common/Loading';

const Home = () => {
  const [carouselEvents, setCarouselEvents] = useState([]);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);

      // Carousel: first 6 upcoming events with category data
      const carouselRes = await eventsApi.getAll({ per_page: 6 });
      const carouselData = carouselRes.data.data || carouselRes.data;
      setCarouselEvents(Array.isArray(carouselData) ? carouselData : []);

      // Featured events for the grid section
      const featuredResponse = await eventsApi.getAll({ featured: 'true', per_page: 3 });
      const featuredData = featuredResponse.data.data || featuredResponse.data;
      setFeaturedEvents(Array.isArray(featuredData) ? featuredData : []);

      // Upcoming events grid
      const upcomingResponse = await eventsApi.getAll({ per_page: 6 });
      const upcomingData = upcomingResponse.data.data || upcomingResponse.data;
      setUpcomingEvents(Array.isArray(upcomingData) ? upcomingData : []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      {/* Hero Carousel */}
      <HeroCarousel events={carouselEvents} />

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

