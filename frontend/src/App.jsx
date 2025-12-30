import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import EventList from './components/Events/EventList';
import EventDetail from './pages/EventDetail';
import Booking from './pages/Booking';
import BookingConfirmation from './pages/BookingConfirmation';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<EventList />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/bookings/new" element={<Booking />} />
          <Route path="/bookings/:id/confirmation" element={<BookingConfirmation />} />
          <Route path="/admin" element={<div className="container mx-auto px-4 py-8 text-center"><h1 className="text-2xl">Admin Dashboard - Coming Soon</h1></div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
