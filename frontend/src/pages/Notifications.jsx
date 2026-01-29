import { FiBell, FiCheck, FiMessageCircle, FiHome, FiUsers, FiStar, FiCalendar, FiTrash2, FiXCircle, FiUserPlus } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';

import LoadingSpinner from '../components/shared/LoadingSpinner';
import notificationService from '../services/notificationService';
import roommateGroupService from '../services/roommateGroupService';
import { useAuth } from '../contexts/AuthContext';

const notificationIcons = {
  message: FiMessageCircle,
  match: FiUsers,
  application: FiHome,
  new_listing: FiHome,
  tour: FiCalendar,
  review: FiStar,
  community_reply: FiMessageCircle,
  system_announcement: FiBell,
  group_invite: FiUserPlus,
};

const notificationColors = {
  message: 'bg-blue-500/20 text-blue-200',
  match: 'bg-green-500/20 text-green-200',
  application: 'bg-orange-500/20 text-orange-200',
  new_listing: 'bg-purple-500/20 text-purple-200',
  tour: 'bg-teal-500/20 text-teal-200',
  review: 'bg-yellow-500/20 text-yellow-200',
  community_reply: 'bg-pink-500/20 text-pink-200',
  system_announcement: 'bg-red-500/20 text-red-200',
  group_invite: 'bg-indigo-500/20 text-indigo-200',
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

  // ... inside Notifications component
  const [selectedNotification, setSelectedNotification] = useState(null);

  // ... (handleDelete, etc)

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [processingInvite, setProcessingInvite] = useState(false);

  // ... (handleDelete, etc)

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }

    if (notification.type === 'system_announcement') {
      setSelectedNotification(notification);
    } else if (notification.type === 'group_invite') {
      setSelectedNotification(notification);
      setInviteModalOpen(true);
    } else if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleAcceptInvite = async () => {
    if (!selectedNotification?.relatedId) return;
    setProcessingInvite(true);
    try {
      await roommateGroupService.acceptGroupInvite(selectedNotification.relatedId);
      // Delete notification after accepting
      await notificationService.deleteNotification(selectedNotification._id);
      setNotifications(prev => prev.filter(n => n._id !== selectedNotification._id));
      setInviteModalOpen(false);
      navigate('/group-dashboard'); // Go to new group
    } catch (error) {
      console.error('Error accepting invite:', error);
      alert('Failed to join group: ' + (error.response?.data?.message || error.message));
    } finally {
      setProcessingInvite(false);
    }
  };

  const handleDeclineInvite = async () => {
    if (!selectedNotification?.relatedId) return;
    setProcessingInvite(true);
    try {
      await roommateGroupService.declineGroupInvite(selectedNotification.relatedId);
      // Delete notification after declining
      await notificationService.deleteNotification(selectedNotification._id);
      setNotifications(prev => prev.filter(n => n._id !== selectedNotification._id));
      setInviteModalOpen(false);
    } catch (error) {
      console.error('Error declining invite:', error);
    } finally {
      setProcessingInvite(false);
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Filter Bar */}
          <div className="relative flex items-center justify-center mb-8">
            <div className="flex items-center bg-white/10 backdrop-blur-md p-1.5 rounded-full border border-white/20">
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

            {/* Mark as read button - Absolute positioned on desktop, stacked on mobile? 
                Actually, simpler to keep it absolute right for this width since it's 2xl now.
            */}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-sm text-white/60 hover:text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all"
              >
                <FiCheck size={16} />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}
          </div>
        </div>

        {/* ... (loading/empty state code unchanged) ... */}

        {!loading && notifications.length > 0 && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
                      {/* Render Title if exists (System Announcements) */}
                      {notification.title && (
                        <h4 className={`text-sm font-bold mb-1 ${notification.isRead ? 'text-white/80' : 'text-white'}`}>
                          {notification.title}
                        </h4>
                      )}
                      <p className={`text-sm ${notification.isRead ? 'text-white/60' : 'text-white font-medium'} line-clamp-2`}>
                        {notification.content}
                      </p>
                      <span className="text-xs text-white/40 mt-1 block">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    {/* ... (delete button code unchanged) ... */}
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
          </div>
        )}
      </div>

      {/* Announcement Modal */}
      {
        selectedNotification && !inviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setSelectedNotification(null)}>
            <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border border-white/20 ${notificationColors[selectedNotification.type] || notificationColors.system_announcement}`}>
                  <FiBell size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{selectedNotification.title || 'Notification'}</h3>
                  <p className="text-white/50 text-sm">{formatTimeAgo(selectedNotification.createdAt)}</p>
                </div>
                <button onClick={() => setSelectedNotification(null)} className="text-white/50 hover:text-white transition-colors">
                  <FiXCircle size={24} />
                </button>
              </div>

              <div className="bg-white/5 rounded-2xl p-5 border border-white/10 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <p className="text-white/90 whitespace-pre-wrap leading-relaxed">
                  {selectedNotification.content}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Invite Modal */}
      {
        inviteModalOpen && selectedNotification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setInviteModalOpen(false)}>
            <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200"
              onClick={e => e.stopPropagation()}>

              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                  <FiUserPlus size={40} className="text-indigo-200" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Group Invitation</h3>
                <p className="text-white/80 leading-relaxed">
                  {selectedNotification.content}
                </p>
                <div className="text-white/40 text-sm mt-2">
                  {formatTimeAgo(selectedNotification.createdAt)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button
                  onClick={handleDeclineInvite}
                  disabled={processingInvite}
                  className="px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-100 transition-all"
                >
                  Decline
                </button>
                <button
                  onClick={handleAcceptInvite}
                  disabled={processingInvite}
                  className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {processingInvite ? 'Joining...' : 'Accept'}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Notifications;
