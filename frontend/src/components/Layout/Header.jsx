import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const { isAdmin, isAuthenticated } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-gray-800">
            Global Talent Media Hub
          </Link>
          <div className="flex gap-6">
            <Link to="/" className="text-gray-700 hover:text-gray-900">
              Home
            </Link>
            <Link to="/events" className="text-gray-700 hover:text-gray-900">
              Events
            </Link>
            {/* Only show Admin link to authenticated admin users */}
            {isAdmin && (
              <Link to="/admin" className="text-gray-700 hover:text-gray-900">
                Admin
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;

