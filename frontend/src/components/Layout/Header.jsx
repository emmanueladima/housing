import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiHome, FiUsers, FiMessageSquare, FiBell, FiUser, FiLogOut,
  FiMenu, FiX, FiMap, FiTool, FiGrid, FiSettings, FiHeart,
  FiMessageCircle, FiChevronDown, FiSearch, FiPlus
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import messageService from '../../services/messageService';
import Modal from '../shared/Modal';
import Login from '../Auth/Login';
import SignUp from '../Auth/SignUp';

const DropdownMenu = ({ label, items, isOpen, onToggle, onClose }) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-3 py-2 text-white/90 hover:text-white font-medium transition-colors ${isOpen ? 'text-white' : ''}`}
      >
        <span>{label}</span>
        <FiChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.to}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
            >
              <item.icon size={18} className="text-gray-400" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(null);

  const isLandlord = user?.userType === 'landlord' || user?.userType === 'both';
  const isStudent = user?.userType === 'student' || user?.userType === 'both' || !user?.userType;

  // Dropdown configurations
  const listingsDropdown = [
    { to: '/listings', icon: FiSearch, label: 'Browse Listings' },
    { to: '/listings/create', icon: FiPlus, label: 'List a Place' },
    ...(isStudent ? [{ to: '/saved', icon: FiHeart, label: 'Saved Listings' }] : []),
  ];

  const roommatesDropdown = [
    { to: '/roommates', icon: FiSearch, label: 'Find Roommates' },
    { to: '/roommates#groups', icon: FiUsers, label: 'Find Groups' },
    { to: '/profile#lifestyle', icon: FiUser, label: 'My Profile' },
  ];

  // Close dropdowns on route change
  useEffect(() => {
    setOpenDropdown(null);
    setShowMobileMenu(false);
  }, [location.pathname]);

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

  const handleDropdownToggle = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const closeDropdowns = () => {
    setOpenDropdown(null);
  };

  return (
    <>
      <header className="absolute top-0 w-full z-50 transition-all duration-300 bg-gradient-to-b from-black/50 via-black/25 to-transparent">
        <div className="w-full px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            {/* Left Section: Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-colors">
              <img
                src="/favicon.png"
                alt="Collegio Logo"
                className="w-7 h-7 rounded-full"
              />
              <span
                className="text-xl text-white"
                style={{
                  fontFamily: "'Archivo Black', sans-serif",
                  fontWeight: 900,
                  letterSpacing: '-0.02em'
                }}
              >
                collegio
              </span>
            </Link>

            {/* Right Section: Nav + Profile */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated && (
                <>
                  {/* Main Navigation Dropdowns */}
                  <nav className="flex items-center">
                    <DropdownMenu
                      label="Listings"
                      items={listingsDropdown}
                      isOpen={openDropdown === 'listings'}
                      onToggle={() => handleDropdownToggle('listings')}
                      onClose={closeDropdowns}
                    />

                    {isStudent && (
                      <>
                        <DropdownMenu
                          label="Roommates"
                          items={roommatesDropdown}
                          isOpen={openDropdown === 'roommates'}
                          onToggle={() => handleDropdownToggle('roommates')}
                          onClose={closeDropdowns}
                        />
                        <Link
                          to="/community"
                          className="flex items-center gap-1.5 px-3 py-2 text-white/90 hover:text-white font-medium transition-colors"
                        >
                          <span>Community</span>
                        </Link>
                      </>
                    )}

                    {isLandlord && (
                      <Link
                        to="/landlord/dashboard"
                        className="flex items-center gap-1.5 px-3 py-2 text-white/90 hover:text-white font-medium transition-colors"
                      >
                        <span>Dashboard</span>
                      </Link>
                    )}
                  </nav>

                  {/* Icons: Messages & Notifications */}
                  <div className="flex items-center gap-1 ml-4">
                    <Link
                      to="/messages"
                      className="relative p-2.5 text-white/80 hover:text-white transition-colors"
                    >
                      <FiMessageSquare size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/notifications"
                      className="relative p-2.5 text-white/80 hover:text-white transition-colors"
                    >
                      <FiBell size={20} />
                    </Link>
                  </div>

                  {/* Profile Dropdown - hover to show */}
                  <div
                    className="relative ml-2"
                    onMouseEnter={() => setShowUserMenu(true)}
                    onMouseLeave={() => setShowUserMenu(false)}
                  >
                    <button className="flex items-center gap-2 p-1.5 pr-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all group">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white group-hover:bg-white group-hover:text-orange-600 transition-colors">
                        <FiUser size={16} />
                      </div>
                      <FiChevronDown size={14} className={`text-white/80 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                        <div className="px-4 py-3 border-b border-gray-50">
                          <p className="text-sm font-bold text-gray-900">{user?.firstName || 'User'}</p>
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

                          {/* Student-only items */}
                          {isStudent && (
                            <>
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
                                to="/roommate-toolkit"
                                className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                onClick={() => setShowUserMenu(false)}
                              >
                                <FiTool size={18} />
                                <span className="font-medium">Toolkit</span>
                              </Link>
                            </>
                          )}

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
                </>
              )}

              {!isAuthenticated && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowLogin(true)}
                    className="text-white font-medium hover:text-white/80 transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => setShowSignUp(true)}
                    className="bg-white text-orange-600 px-5 py-2 rounded-full font-bold hover:bg-orange-50 transition-all shadow-lg"
                  >
                    Sign Up Free
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-white bg-white/20 backdrop-blur-md rounded-full"
            >
              {showMobileMenu ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
            <div className="px-4 py-4 space-y-1">
              {isAuthenticated && (
                <>
                  {/* Listings Section */}
                  <div className="pb-3 mb-3 border-b border-gray-100">
                    <p className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Listings</p>
                    {listingsDropdown.map((item, index) => (
                      <Link
                        key={index}
                        to={item.to}
                        className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <item.icon size={18} className="text-gray-400" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    ))}
                  </div>

                  {isStudent && (
                    <>
                      {/* Roommates Section */}
                      <div className="pb-3 mb-3 border-b border-gray-100">
                        <p className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Roommates</p>
                        {roommatesDropdown.map((item, index) => (
                          <Link
                            key={index}
                            to={item.to}
                            className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                            onClick={() => setShowMobileMenu(false)}
                          >
                            <item.icon size={18} className="text-gray-400" />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        ))}
                      </div>

                      {/* Community Section */}
                      <div className="pb-3 mb-3 border-b border-gray-100">
                        <Link
                          to="/community"
                          className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          <FiMessageCircle size={18} className="text-gray-400" />
                          <span className="font-medium">Community</span>
                        </Link>
                      </div>

                      {/* Tools Section */}
                      <div className="pb-3 mb-3 border-b border-gray-100">
                        <Link
                          to="/roommate-toolkit"
                          className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                          onClick={() => setShowMobileMenu(false)}
                        >
                          <FiTool size={18} className="text-gray-400" />
                          <span className="font-medium">Toolkit</span>
                        </Link>
                      </div>
                    </>
                  )}

                  {isLandlord && (
                    <div className="pb-3 mb-3 border-b border-gray-100">
                      <Link
                        to="/landlord/dashboard"
                        className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <FiGrid size={18} className="text-gray-400" />
                        <span className="font-medium">Landlord Dashboard</span>
                      </Link>
                    </div>
                  )}

                  {/* Profile Section */}
                  <div className="pt-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <FiUser size={18} className="text-gray-400" />
                      <span className="font-medium">Your Profile</span>
                    </Link>
                    <Link
                      to="/messages"
                      className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <FiMessageSquare size={18} className="text-gray-400" />
                      <span className="font-medium">Messages</span>
                      {unreadCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowMobileMenu(false);
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiLogOut size={18} />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                </>
              )}

              {!isAuthenticated && (
                <div className="pt-4 flex flex-col gap-3">
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
