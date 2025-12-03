import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiMail, FiBell, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { getUnreadCount } from '../../services/messageService';
import Modal from '../shared/Modal';
import Login from '../Auth/Login';
import SignUp from '../Auth/SignUp';
import Button from '../shared/Button';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (socket && isAuthenticated) {
      // Listen for new messages to update badge
      socket.on('new_message', () => {
        fetchUnreadCount();
      });

      // Listen for message notification (for non-active threads)
      socket.on('message_notification', () => {
        fetchUnreadCount();
      });

      return () => {
        socket.off('new_message');
        socket.off('message_notification');
      };
    }
  }, [socket, isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadMessageCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setUnreadMessageCount(0);
    navigate('/');
  };

  const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <img src="/assets/logo.png" alt="collegio" className="h-10 w-10" />
              <span className="text-2xl font-bold text-orange-600" style={{ fontFamily: 'Archivo Black, sans-serif' }}>collegio</span>
              {isDevMode && (
                <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-yellow-400 text-gray-900 rounded">
                  DEV
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/listings"
                className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                Listings
              </Link>
              <Link
                to="/roommates"
                className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                Roommates
              </Link>
              <Link
                to="/roommate-toolkit"
                className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                Toolkit
              </Link>
            </nav>

            {/* Desktop Auth/User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated && (
                <Link
                  to="/listings/create"
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                  <FiHome size={18} />
                  <span>List a Place</span>
                </Link>
              )}
              {isAuthenticated ? (
                <>
                  <Link
                    to="/messages"
                    className="text-orange-600 hover:text-orange-700 transition-colors relative"
                  >
                    <FiMail size={22} />
                    {unreadMessageCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                        {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/notifications"
                    className="text-orange-600 hover:text-orange-700 transition-colors relative"
                  >
                    <FiBell size={22} />
                    {user?.unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {user.unreadNotifications}
                      </span>
                    )}
                  </Link>

                  {/* User Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition-colors"
                    >
                      <FiUser size={22} />
                      <span className="font-medium">{user?.firstName}</span>
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          to="/applications"
                          className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                          onClick={() => setShowUserMenu(false)}
                        >
                          My Applications
                        </Link>
                        <Link
                          to="/saved-searches"
                          className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Saved Searches
                        </Link>
                        {(user?.userType === 'landlord' || user?.userType === 'both') && (
                          <Link
                            to="/landlord/dashboard"
                            className="block px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                            onClick={() => setShowUserMenu(false)}
                          >
                            Landlord Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        >
                          <FiLogOut />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowLogin(true)}
                    className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => setShowSignUp(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-orange-600"
            >
              {showMobileMenu ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-3">
              <Link
                to="/listings"
                className="block text-orange-600 hover:text-orange-700 font-medium"
                onClick={() => setShowMobileMenu(false)}
              >
                Listings
              </Link>
              <Link
                to="/roommates"
                className="block text-orange-600 hover:text-orange-700 font-medium"
                onClick={() => setShowMobileMenu(false)}
              >
                Roommates
              </Link>
              <Link
                to="/roommate-toolkit"
                className="block text-orange-600 hover:text-orange-700 font-medium"
                onClick={() => setShowMobileMenu(false)}
              >
                Toolkit
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/messages"
                    className="block text-orange-600 hover:text-orange-700 font-medium"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Messages
                  </Link>
                  <Link
                    to="/profile"
                    className="block text-orange-600 hover:text-orange-700 font-medium"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                    className="block w-full text-left text-red-600 hover:text-red-700 font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={() => {
                      setShowLogin(true);
                      setShowMobileMenu(false);
                    }}
                    className="flex-1 text-orange-600 hover:text-orange-700 font-medium text-center py-2 border border-orange-600 rounded-lg"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setShowSignUp(true);
                      setShowMobileMenu(false);
                    }}
                    className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modals */}
      <Modal isOpen={showLogin} onClose={() => setShowLogin(false)} title="Log In to collegio">
        <Login
          onSuccess={() => setShowLogin(false)}
          onSwitchToSignUp={() => {
            setShowLogin(false);
            setShowSignUp(true);
          }}
        />
      </Modal>

      <Modal isOpen={showSignUp} onClose={() => setShowSignUp(false)} title="Join collegio">
        <SignUp
          onSuccess={() => setShowSignUp(false)}
          onSwitchToLogin={() => {
            setShowSignUp(false);
            setShowLogin(true);
          }}
        />
      </Modal>
    </>
  );
};

export default Header;

