import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiHome, FiUsers, FiMessageSquare, FiBell, FiUser, FiLogOut,
  FiMenu, FiX, FiMap, FiTool, FiGrid, FiSettings, FiHeart,
  FiMessageCircle, FiChevronDown, FiSearch, FiPlus
} from 'react-icons/fi';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import messageService from '../../services/messageService';
import Modal from '../shared/Modal';
import Login from '../Auth/Login';
import SignUp from '../Auth/SignUp';
import ForgotPassword from '../Auth/ForgotPassword';



const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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
    // Only location change logic if needed
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
                  <nav className="flex items-center gap-2">
                    <Dropdown
                      classNames={{
                        content: "bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl rounded-2xl min-w-[200px] p-2"
                      }}
                    >
                      <DropdownTrigger>
                        <button className="flex items-center gap-1 px-3 py-2 text-white/90 hover:text-white font-medium transition-colors outline-none data-[hover=true]:text-white">
                          <span>Listings</span>
                          <FiChevronDown size={14} />
                        </button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Listings" onAction={(key) => navigate(key)}>
                        {listingsDropdown.map((item) => (
                          <DropdownItem
                            key={item.to}
                            startContent={<item.icon size={18} className="text-white/60" />}
                            className="text-white data-[hover=true]:bg-white/10 data-[hover=true]:text-white data-[hover=true]:backdrop-blur-md rounded-xl"
                          >
                            {item.label}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>

                    {isStudent && (
                      <>
                        <Dropdown
                          classNames={{
                            content: "bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl rounded-2xl min-w-[200px] p-2"
                          }}
                        >
                          <DropdownTrigger>
                            <button className="flex items-center gap-1 px-3 py-2 text-white/90 hover:text-white font-medium transition-colors outline-none data-[hover=true]:text-white">
                              <span>Roommates</span>
                              <FiChevronDown size={14} />
                            </button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Roommates" onAction={(key) => navigate(key)}>
                            {roommatesDropdown.map((item) => (
                              <DropdownItem
                                key={item.to}
                                startContent={<item.icon size={18} className="text-white/60" />}
                                className="text-white data-[hover=true]:bg-white/10 data-[hover=true]:text-white data-[hover=true]:backdrop-blur-md rounded-xl"
                              >
                                {item.label}
                              </DropdownItem>
                            ))}
                          </DropdownMenu>
                        </Dropdown>
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

                  <div className="ml-2">
                    <Dropdown
                      placement="bottom-end"
                      openDelay={0}
                      closeDelay={0}
                      classNames={{
                        content: "bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl rounded-2xl min-w-[240px] p-2 duration-100 ease-in-out"
                      }}
                    >
                      <DropdownTrigger>
                        <button className="flex items-center gap-2 p-1.5 pr-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all outline-none group data-[hover=true]:bg-white/20">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white group-hover:bg-white group-hover:text-orange-600 transition-colors">
                            <FiUser size={16} />
                          </div>
                          <FiChevronDown size={14} className="text-white/80 transition-transform group-data-[aria-expanded=true]:rotate-180" />
                        </button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Profile Actions" variant="flat" onAction={(key) => {
                        if (key === 'logout') {
                          logout();
                          navigate('/');
                        } else {
                          navigate(key);
                        }
                      }}>
                        <DropdownItem key="profile-info" className="h-14 gap-2 opacity-100" textValue={`Signed in as ${user?.firstName}`}>
                          <p className="font-semibold text-white">Signed in as</p>
                          <p className="font-semibold text-white/70">{user?.email}</p>
                        </DropdownItem>
                        <DropdownItem key="divider-profile" className="h-px bg-white/10 opacity-50 p-0 my-1 pointer-events-none" textValue="-"></DropdownItem>

                        <DropdownItem key="/profile" startContent={<FiUser size={18} className="text-white/60" />} className="text-white data-[hover=true]:bg-white/10 data-[hover=true]:text-white">Your Profile</DropdownItem>

                        {isStudent && (
                          <DropdownItem key="/saved" startContent={<FiHeart size={18} className="text-white/60" />} className="text-white data-[hover=true]:bg-white/10 data-[hover=true]:text-white">Saved Items</DropdownItem>
                        )}
                        {isStudent && (
                          <DropdownItem key="/applications" startContent={<FiGrid size={18} className="text-white/60" />} className="text-white data-[hover=true]:bg-white/10 data-[hover=true]:text-white">Applications</DropdownItem>
                        )}
                        {isStudent && (
                          <DropdownItem key="/roommate-toolkit" startContent={<FiTool size={18} className="text-white/60" />} className="text-white data-[hover=true]:bg-white/10 data-[hover=true]:text-white">Toolkit</DropdownItem>
                        )}

                        <DropdownItem key="/settings" startContent={<FiSettings size={18} className="text-white/60" />} className="text-white data-[hover=true]:bg-white/10 data-[hover=true]:text-white">Settings</DropdownItem>

                        <DropdownItem key="divider-logout" className="h-px bg-white/10 opacity-50 p-0 my-1 pointer-events-none" textValue="-"></DropdownItem>

                        <DropdownItem key="logout" startContent={<FiLogOut size={18} className="text-red-500" />} className="text-red-600 data-[hover=true]:bg-red-500/10 data-[hover=true]:text-red-700">Sign Out</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
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

            {/* Mobile Menu Dropdown */}
            <div className="md:hidden">
              <Dropdown
                classNames={{
                  content: "bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl rounded-2xl min-w-[240px] p-2"
                }}
              >
                <DropdownTrigger>
                  <button className="p-2 text-white bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all outline-none">
                    <FiMenu size={24} />
                  </button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Mobile Navigation"
                  onAction={(key) => {
                    if (key === 'logout') {
                      logout();
                      navigate('/');
                    } else if (key === 'login') {
                      setShowLogin(true);
                    } else if (key === 'signup') {
                      setShowSignUp(true);
                    } else {
                      navigate(key);
                    }
                  }}
                >
                  {isAuthenticated ? [
                    // Main Navigation
                    <DropdownItem key="/listings" startContent={<FiHome size={18} className="text-white/60" />} className="text-white data-[hover=true]:bg-white/10 data-[hover=true]:text-white">Listings</DropdownItem>,
                    ...(isStudent ? [
                      <DropdownItem key="/roommates" startContent={<FiUsers size={18} className="text-white/60" />} className="text-white data-[hover=true]:bg-white/10 data-[hover=true]:text-white">Roommates</DropdownItem>,
                      <DropdownItem key="/community" startContent={<FiMessageCircle size={18} className="text-white/60" />} className="text-white data-[hover=true]:bg-white/10 data-[hover=true]:text-white">Community</DropdownItem>
                    ] : []),
                    ...(isLandlord ? [
                      <DropdownItem key="/landlord/dashboard" startContent={<FiGrid size={18} className="text-white/60" />} className="text-white data-[hover=true]:bg-white/10 data-[hover=true]:text-white">Dashboard</DropdownItem>
                    ] : []),

                    // Divider
                    <DropdownItem key="divider-1" className="h-px bg-white/10 opacity-50 p-0 my-1 pointer-events-none" textValue="-"></DropdownItem>,

                    // Account Section
                    <DropdownItem key="/profile" startContent={<FiUser size={18} className="text-white/60" />} className="text-white data-[hover=true]:bg-white/10 data-[hover=true]:text-white">Profile</DropdownItem>,
                    <DropdownItem
                      key="/messages"
                      startContent={<FiMessageSquare size={18} className="text-white/60" />}
                      endContent={unreadCount > 0 ? <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span> : null}
                      className="text-white data-[hover=true]:bg-white/10 data-[hover=true]:text-white"
                    >
                      Messages
                    </DropdownItem>,
                    ...(isStudent ? [
                      <DropdownItem key="/saved" startContent={<FiHeart size={18} className="text-white/60" />} className="text-white data-[hover=true]:bg-white/10 data-[hover=true]:text-white">Saved</DropdownItem>,
                      <DropdownItem key="/roommate-toolkit" startContent={<FiTool size={18} className="text-white/60" />} className="text-white data-[hover=true]:bg-white/10 data-[hover=true]:text-white">Toolkit</DropdownItem>
                    ] : []),
                    <DropdownItem key="/settings" startContent={<FiSettings size={18} className="text-white/60" />} className="text-white data-[hover=true]:bg-white/10 data-[hover=true]:text-white">Settings</DropdownItem>,

                    // Divider
                    <DropdownItem key="divider-2" className="h-px bg-white/10 opacity-50 p-0 my-1 pointer-events-none" textValue="-"></DropdownItem>,

                    <DropdownItem key="logout" startContent={<FiLogOut size={18} className="text-white/60" />} className="text-red-400 data-[hover=true]:bg-red-500/20 data-[hover=true]:text-red-200">Sign Out</DropdownItem>
                  ] : [
                    <DropdownItem key="login" className="text-white data-[hover=true]:bg-white/10 data-[hover=true]:text-white font-bold">Log In</DropdownItem>,
                    <DropdownItem key="signup" className="bg-white/90 text-orange-600 font-bold data-[hover=true]:bg-white data-[hover=true]:text-orange-700 rounded-lg text-center justify-center">Sign Up Free</DropdownItem>
                  ]}
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modals */}
      <Modal isOpen={showLogin} onClose={() => setShowLogin(false)}>
        <Login
          onSuccess={() => setShowLogin(false)}
          onSwitchToSignUp={() => {
            setShowLogin(false);
            setShowSignUp(true);
          }}
          onForgotPassword={() => {
            setShowLogin(false);
            setShowForgotPassword(true);
          }}
        />
      </Modal>

      <Modal isOpen={showSignUp} onClose={() => setShowSignUp(false)}>
        <SignUp
          onSuccess={() => setShowSignUp(false)}
          onSwitchToLogin={() => {
            setShowSignUp(false);
            setShowLogin(true);
          }}
        />
      </Modal>

      <Modal isOpen={showForgotPassword} onClose={() => setShowForgotPassword(false)}>
        <ForgotPassword
          onBack={() => {
            setShowForgotPassword(false);
            setShowLogin(true);
          }}
          onSwitchToLogin={() => {
            setShowForgotPassword(false);
            setShowLogin(true);
          }}
        />
      </Modal>
    </>
  );
};

export default Header;
