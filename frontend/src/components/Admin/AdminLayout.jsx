import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiAlertTriangle,
  FiActivity,
  FiMail,
  FiLogOut,
  FiArrowLeft
} from 'react-icons/fi';
import ModernBackground from '../shared/ModernBackground';
import { useAuth } from '../../contexts/AuthContext';
import adminService from '../../services/adminService';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {
    // Check if we are currently impersonating (adminToken exists in session)
    const adminToken = sessionStorage.getItem('adminToken');
    if (adminToken) {
      setIsImpersonating(true);
    }
  }, []);

  const handleRevert = async () => {
    const success = adminService.revertToAdmin();
    if (success) {
      await refreshUser();
      navigate('/admin/dashboard');
      window.location.reload(); // Reload to clear any user-specific state
    }
  };

  const navItems = [
    { icon: FiHome, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: FiUsers, label: 'Users', path: '/admin/users' },
    { icon: FiFileText, label: 'Listings', path: '/admin/listings' },
    { icon: FiAlertTriangle, label: 'Reports', path: '/admin/reports' },
    { icon: FiActivity, label: 'Audit Logs', path: '/admin/logs' },
    { icon: FiMail, label: 'Messaging', path: '/admin/messaging' },
  ];

  if (isImpersonating) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={handleRevert}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-bold animate-pulse"
        >
          <FiArrowLeft /> Return to Admin
        </button>
      </div>
    );
  }


  return (
    <div className="min-h-screen text-white relative">
      {/* Fixed Background - Full Opacity with Overlay */}
      <div className="fixed inset-0 z-0">
        <ModernBackground />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Admin Header & Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-400 mt-1">
                Manage users, content, and system settings
              </p>
            </div>


          </div>

          {/* Horizontal Navigation Grid */}
          <nav className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all border ${isActive
                    ? 'bg-orange-600/20 border-orange-500/50 text-white shadow-lg shadow-orange-500/10'
                    : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10 hover:text-white'
                    }`}
                >
                  <Icon className={`w-6 h-6 mb-2 ${isActive ? 'text-orange-400' : ''}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Warning - Impersonation */}
          {isImpersonating && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiAlertTriangle className="text-red-400 w-5 h-5" />
                <span className="text-red-200 text-sm">You are currently impersonating a user.</span>
              </div>
              <button
                onClick={handleRevert}
                className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-colors"
              >
                Revert
              </button>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <main className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6 min-h-[500px]">
          <Outlet />
        </main>
      </div>

      {/* Floating Revert Button (Sticky) */}
      {isImpersonating && (
        <div className="fixed bottom-8 right-8 z-50 animate-bounce">
          <button
            onClick={handleRevert}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-bold"
          >
            <FiArrowLeft /> Exit Impersonation
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
