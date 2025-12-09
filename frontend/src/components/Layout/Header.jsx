import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiMessageSquare, FiBell, FiUser, FiLogOut, FiMenu, FiX, FiMap, FiTool, FiGrid, FiSettings, FiHeart, FiMessageCircle } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import messageService from '../../services/messageService';
import Modal from '../shared/Modal';
import Login from '../Auth/Login';
import SignUp from '../Auth/SignUp';

const NavLink = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const active = isActive(to);

  return (
    <Link
      to={to}
      className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full transition-all duration-300 ${active
        ? 'bg-orange-600 text-white shadow-md font-bold'
        : 'text-orange-600 hover:bg-orange-50 font-bold'
        }`}
    >
      {Icon && <Icon size={18} />}
      <span>{label}</span>
    </Link>
  );
};

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread messages count
  useEffect(() => {
    if (isAuthenticated) {
      const fetchUnreadCount = async () => {
        try {
          const count = await messageService.getUnreadCount();
          setUnreadCount(count);
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      };

      fetchUnreadCount();

      // Listen for new messages
      if (socket) {
        socket.on('new_message', () => {
          fetchUnreadCount();
        });
      }

      return () => {
        if (socket) {
          socket.off('new_message');
        }
      };
    }
  }, [isAuthenticated, socket]);

  return (
    <>
      <header
        className="absolute top-0 w-full z-50 transition-all duration-300 bg-gradient-to-b from-black/50 via-black/25 to-transparent"
      >
        <div className="w-full px-6 lg:px-12">
          <div className="flex justify-between items-center h-20 relative">
            {/* Left Section: Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <img
                src="/favicon.png"
                alt="Collegio Logo"
                className="w-8 h-8 rounded-full"
              />
              <span
                className="text-2xl text-orange-600"
                style={{
                  fontFamily: "'Archivo Black', sans-serif",
                  fontWeight: 900,
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility',
                  letterSpacing: '-0.02em'
                }}
              >
                collegio
              </span>
            </Link>

            {/* Center Section: Main Navigation */}
            {isAuthenticated && (
              <nav className="hidden lg:flex items-center gap-1 p-2 bg-white/80 backdrop-blur-md rounded-full border border-white/20 shadow-sm absolute left-1/2 -translate-x-1/2">
                <NavLink to="/" icon={FiHome} label="Home" />
                <NavLink to="/listings" icon={FiMap} label="Listings" />
                {(user?.userType === 'student' || user?.userType === 'both' || !user?.userType) && (
                  <>
                    <NavLink to="/roommates" icon={FiUsers} label="Roommates" />
                    <NavLink to="/community" icon={FiMessageCircle} label="Community" />
                    <NavLink to="/roommate-toolkit" icon={FiTool} label="Tools" />
                  </>
                )}
                {(user?.userType === 'landlord' || user?.userType === 'both') && (
                  <NavLink to="/landlord/dashboard" icon={FiGrid} label="Dashboard" />
                )}
              </nav>
            )}

            {/* Right Section: Actions & Profile */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              {isAuthenticated && (
                <Link
                  to="/listings/create"
                  className="flex items-center gap-2 px-4 py-2 text-orange-600 font-bold hover:bg-white/30 rounded-full transition-all"
                >
                  <FiHome size={16} />
                  <span>List a Place</span>
                </Link>
              )}

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/messages"
                    className="relative p-2.5 text-orange-600 hover:bg-white/50 rounded-full transition-colors"
                  >
                    <FiMessageSquare size={22} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white">
                        {unreadCount}
                      </span>
                    )}
                  </Link>

                  <button className="p-2.5 text-orange-600 hover:bg-white/50 rounded-full transition-colors">
                    <FiBell size={22} />
                  </button>

                  <div className="relative ml-2">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-3 p-1.5 pr-4 bg-white/80 backdrop-blur-md rounded-full border border-white/20 hover:shadow-md transition-all group"
                    >
                      <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                        <FiUser size={18} />
                      </div>
                      <span className="font-bold text-orange-600 text-sm">
                        {user?.firstName || 'User'}
                      </span>
                    </button>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                        <div className="px-4 py-3 border-b border-gray-50">
                          <p className="text-sm font-bold text-gray-900">Signed in as</p>
                          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <FiUser size={18} />
                            <span className="font-medium">Your Profile</span>
                          </Link>
                          <Link
                            to="/saved"
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <FiHeart size={18} />
                            <span className="font-medium">Saved Items</span>
                          </Link>
                          <Link
                            to="/applications"
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <FiGrid size={18} />
                            <span className="font-medium">Applications</span>
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <FiSettings size={18} />
                            <span className="font-medium">Settings</span>
                          </Link>
                        </div>

                        <div className="border-t border-gray-50 mt-1 pt-1">
                          <button
                            onClick={() => {
                              logout();
                              setShowUserMenu(false);
                              navigate('/');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-left"
                          >
                            <FiLogOut size={18} />
                            <span className="font-medium">Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 pl-4">
                  <button
                    onClick={() => setShowLogin(true)}
                    className="text-orange-600 font-bold hover:text-orange-700 transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => setShowSignUp(true)}
                    className="bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20"
                  >
                    Sign Up Free
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-orange-600 bg-white/80 backdrop-blur-md rounded-full"
            >
              {showMobileMenu ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
            <div className="px-4 py-4 space-y-2">
              {isAuthenticated && (
                <>
                  <Link
                    to="/"
                    className="block px-4 py-3 rounded-xl text-gray-600 font-medium hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Home
                  </Link>
                  <Link
                    to="/listings"
                    className="block px-4 py-3 rounded-xl text-gray-600 font-medium hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Listings
                  </Link>
                  {(user?.userType === 'student' || user?.userType === 'both' || !user?.userType) && (
                    <>
                      <Link
                        to="/roommates"
                        className="block px-4 py-3 rounded-xl text-gray-600 font-medium hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        Roommates
                      </Link>
                      <Link
                        to="/roommate-toolkit"
                        className="block px-4 py-3 rounded-xl text-gray-600 font-medium hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        Tools
                      </Link>
                    </>
                  )}
                  {(user?.userType === 'landlord' || user?.userType === 'both') && (
                    <Link
                      to="/landlord/dashboard"
                      className="block px-4 py-3 rounded-xl text-gray-600 font-medium hover:bg-orange-50 hover:text-orange-600 transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                </>
              )}
              {!isAuthenticated && (
                <div className="pt-4 mt-4 border-t border-gray-100 flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setShowLogin(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full py-3 text-orange-600 font-bold border border-orange-200 rounded-xl"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setShowSignUp(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-600/20"
                  >
                    Sign Up Free
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
