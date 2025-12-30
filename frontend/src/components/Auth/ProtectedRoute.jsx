import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 * For admin routes, also checks if user is an admin
 */
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (!isAuthenticated) {
    // Redirect to admin login page
    return <Navigate to="/admin/login" replace />;
  }

  // If admin is required but user is not admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

