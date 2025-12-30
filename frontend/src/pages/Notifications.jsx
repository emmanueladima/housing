import { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiMessageCircle, FiHome, FiUsers, FiStar, FiCalendar, FiTrash2 } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

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
  message: 'bg-blue-500/20 text-blue-200',
  match: 'bg-green-500/20 text-green-200',
  application: 'bg-orange-500/20 text-orange-200',
  new_listing: 'bg-purple-500/20 text-purple-200',
  tour: 'bg-teal-500/20 text-teal-200',
  review: 'bg-yellow-500/20 text-yellow-200',
  community_reply: 'bg-pink-500/20 text-pink-200',
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
    <div className="min-h-screen relative">
      {/* Hero Header */}
      <div className="relative overflow-hidden pt-32 pb-8">
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
      <div className="relative z-10 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-6 bg-white/10 backdrop-blur-md p-1.5 rounded-full border border-white/20 inline-flex w-full sm:w-auto">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${filter === 'all'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${filter === 'unread'
                  ? 'bg-white text-gray-900 shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
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
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                const colorClass = notificationColors[notification.type] || 'bg-gray-500/20 text-gray-200';

                return (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] ${notification.isRead
                      ? 'bg-white/10 border-white/10 backdrop-blur-md'
                      : 'bg-white/20 border-white/30 backdrop-blur-xl shadow-lg'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notification.isRead ? 'text-white/60' : 'text-white font-bold'}`}>
                        {notification.content}
                      </p>
                      <span className="text-xs text-white/40 mt-1 block">
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
