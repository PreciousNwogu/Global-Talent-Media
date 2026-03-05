import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import CmsLayout from './components/cms/CmsLayout';
import Home from './pages/Home';
import EventList from './components/Events/EventList';
import EventDetail from './pages/EventDetail';
import Booking from './pages/Booking';
import BookingConfirmation from './pages/BookingConfirmation';
import Login from './pages/Login';
import Register from './pages/Register';
import MyBookings from './pages/MyBookings';
import CmsDashboard from './pages/cms/Dashboard';
import CmsEvents from './pages/cms/Events';
import CmsEventForm from './pages/cms/EventForm';
import CmsBookings from './pages/cms/Bookings';
import CmsCategories from './pages/cms/Categories';
import CmsUsers from './pages/cms/Users';

// Wrapper: CMS pages skip the public Layout and use CmsLayout instead
const CmsPage = ({ children }) => (
  <AdminRoute>
    <CmsLayout>{children}</CmsLayout>
  </AdminRoute>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public site with header/footer Layout */}
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/events" element={<EventList />} />
                  <Route path="/events/:id" element={<EventDetail />} />
                  <Route path="/bookings/new" element={<Booking />} />
                  <Route path="/bookings/:id/confirmation" element={<BookingConfirmation />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/my-bookings"
                    element={
                      <ProtectedRoute>
                        <MyBookings />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Layout>
            }
          />

          {/* CMS — full-screen admin panel, no public Layout */}
          <Route path="/cms" element={<CmsPage><CmsDashboard /></CmsPage>} />
          <Route path="/cms/events" element={<CmsPage><CmsEvents /></CmsPage>} />
          <Route path="/cms/events/new" element={<CmsPage><CmsEventForm /></CmsPage>} />
          <Route path="/cms/events/:id/edit" element={<CmsPage><CmsEventForm /></CmsPage>} />
          <Route path="/cms/bookings" element={<CmsPage><CmsBookings /></CmsPage>} />
          <Route path="/cms/categories" element={<CmsPage><CmsCategories /></CmsPage>} />
          <Route path="/cms/users" element={<CmsPage><CmsUsers /></CmsPage>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
