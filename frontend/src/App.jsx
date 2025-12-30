import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import AdminLayout from './components/admin/AdminLayout';
import Home from './pages/Home';
import EventList from './components/Events/EventList';
import EventDetail from './pages/EventDetail';
import Booking from './pages/Booking';
import BookingConfirmation from './pages/BookingConfirmation';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Events from './pages/admin/Events';
import Bookings from './pages/admin/Bookings';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/events" element={<Layout><EventList /></Layout>} />
        <Route path="/events/:id" element={<Layout><EventDetail /></Layout>} />
        <Route path="/bookings/new" element={<Layout><Booking /></Layout>} />
        <Route path="/bookings/:id/confirmation" element={<Layout><BookingConfirmation /></Layout>} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout><Dashboard /></AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout><Events /></AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout><Bookings /></AdminLayout>
            </ProtectedRoute>
          }
        />
        {/* Redirect /admin to /admin/dashboard */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
