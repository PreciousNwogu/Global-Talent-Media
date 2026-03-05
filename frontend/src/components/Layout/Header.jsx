import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md">
      <nav className="w-full px-8 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/images/global talent logo.jpeg"
              alt="Global Talent Media Hub"
              className="h-16 w-auto object-contain"
            />
            <span className="text-2xl font-bold text-gray-800 hidden sm:block">
              Global Talent Media Hub
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-gray-900">Home</Link>
            <Link to="/events" className="text-gray-700 hover:text-gray-900">Events</Link>
            {user ? (
              <>
                <Link to="/my-bookings" className="text-gray-700 hover:text-gray-900">My Bookings</Link>
                <span className="text-gray-400 text-sm hidden md:block">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-gray-900">Login</Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
            {user?.is_admin && (
              <a
                href="http://localhost:8000/admin"
                target="_blank"
                rel="noreferrer"
                className="bg-violet-600 text-white px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-violet-700 transition-colors"
              >
                Admin Panel
              </a>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;

