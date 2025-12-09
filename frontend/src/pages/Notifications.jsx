import { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiMessageCircle, FiHome, FiUsers, FiStar, FiCalendar, FiTrash2 } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import ModernBackground from '../components/shared/ModernBackground';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import notificationService from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

const notificationIcons = {
  message: FiMessageCircle,
  match: FiUsers,
  application: FiHome,
  new_listing: FiHome,
  tour: FiCalendar,
  review: FiStar,
  community_reply: FiMessageCircle,
};

const notificationColors = {
  message: 'bg-blue-100 text-blue-600',
  match: 'bg-green-100 text-green-600',
  application: 'bg-orange-100 text-orange-600',
  new_listing: 'bg-purple-100 text-purple-600',
  tour: 'bg-teal-100 text-teal-600',
  review: 'bg-yellow-100 text-yellow-600',
  community_reply: 'bg-pink-100 text-pink-600',
};

const formatTimeAgo = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const filters = filter === 'unread' ? { unread: true } : {};
      const data = await notificationService.getNotifications(filters);
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="relative overflow-hidden pt-32 pb-16">
        <ModernBackground />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-6">
              <FiBell className="text-yellow-200" size={16} />
              <span className="text-yellow-100 text-sm font-bold uppercase tracking-wider">Stay Updated</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Notifications
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Stay on top of messages, community replies, and activity on your listings.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${filter === 'all'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all flex items-center gap-2 ${filter === 'unread'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                <FiCheck size={16} />
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-50 rounded-full flex items-center justify-center mb-6">
                <FiBell className="text-orange-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No notifications yet</h3>
              <p className="text-gray-500 mb-8 max-w-md text-center">
                {filter === 'unread'
                  ? "You're all caught up! No unread notifications."
                  : "When you receive messages or updates, they'll appear here."
                }
              </p>
              <Link
                to="/community"
                className="inline-flex items-center gap-2 px-8 py-3 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <span>Explore Community</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(notification => {
                const Icon = notificationIcons[notification.type] || FiBell;
                const colorClass = notificationColors[notification.type] || 'bg-gray-100 text-gray-600';

                return (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${notification.isRead
                        ? 'bg-white border-gray-100'
                        : 'bg-orange-50 border-orange-200'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                        {notification.content}
                      </p>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification._id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
