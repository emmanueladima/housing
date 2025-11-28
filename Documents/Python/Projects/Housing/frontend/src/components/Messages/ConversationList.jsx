import { useState } from 'react';
import { FiSearch, FiMessageCircle, FiUser, FiHome, FiUsers } from 'react-icons/fi';
import { useThreads } from '../../contexts/ThreadContext';
import { useAuth } from '../../contexts/AuthContext';

const ConversationList = () => {
  const { threads, activeThreadId, setActiveThreadId, loading, fetchThreads } = useThreads();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredThreads = threads.filter(thread => {
    // Search logic depends on thread type
    let name = '';
    if (thread.type === 'dm') {
      const otherUser = thread.participants.find(p => p._id !== user?._id);
      name = otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown';
    } else if (thread.type === 'listing') {
      name = thread.listingId?.title || 'Listing Inquiry';
    } else if (thread.type === 'group') {
      name = thread.metadata?.name || 'Group Chat';
    }
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const truncateMessage = (text, maxLength = 50) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getThreadIcon = (thread) => {
    if (thread.type === 'listing') return <FiHome className="text-orange-600" size={24} />;
    if (thread.type === 'group') return <FiUsers className="text-orange-600" size={24} />;

    // DM fallback
    const otherUser = thread.participants.find(p => p._id !== user?._id);
    if (otherUser?.avatarUrl) {
      return <img src={otherUser.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />;
    }
    return <FiUser className="text-orange-600" size={24} />;
  };

  const getThreadName = (thread) => {
    if (thread.type === 'listing') return thread.listingId?.title || 'Listing Inquiry';
    if (thread.type === 'group') return thread.metadata?.name || 'Group Chat';

    const otherUser = thread.participants.find(p => p._id !== user?._id);
    return otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User';
  };

  if (loading && threads.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>

        {/* Search Bar */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto">
        {filteredThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <FiMessageCircle className="text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </p>
            {!searchQuery && (
              <p className="text-sm text-gray-500 mt-2">
                Start a conversation from a listing or roommate profile
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredThreads.map((thread) => {
              const isActive = thread._id === activeThreadId;
              const hasUnread = thread.unreadCount > 0;
              const name = getThreadName(thread);
              const icon = getThreadIcon(thread);

              return (
                <div
                  key={thread._id}
                  onClick={() => setActiveThreadId(thread._id)}
                  className={`p-4 cursor-pointer transition-colors ${isActive
                      ? 'bg-orange-50 border-l-4 border-orange-600'
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                    }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Avatar/Icon */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
                      {icon}
                    </div>

                    {/* Thread Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`text-sm font-semibold truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                          {name}
                        </h3>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {formatTimestamp(thread.lastMessageAt)}
                        </span>
                      </div>

                      {/* Last Message Preview */}
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${hasUnread ? 'text-gray-900 font-medium' : 'text-gray-600'
                          }`}>
                          {thread.lastMessage?.sender === user?._id && 'You: '}
                          {truncateMessage(thread.lastMessage?.content || 'No messages yet')}
                        </p>

                        {/* Unread Badge */}
                        {hasUnread && (
                          <span className="ml-2 flex-shrink-0 bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
                          </span>
                        )}
                      </div>

                      {/* Context Tag */}
                      {thread.type === 'listing' && (
                        <div className="mt-1 text-xs text-orange-600 truncate bg-orange-50 inline-block px-1 rounded">
                          Listing Inquiry
                        </div>
                      )}
                      {thread.type === 'group' && (
                        <div className="mt-1 text-xs text-blue-600 truncate bg-blue-50 inline-block px-1 rounded">
                          Group Chat
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;

