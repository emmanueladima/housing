import { useState, useEffect, useRef } from 'react';
import { FiSend, FiUser, FiArrowLeft, FiMoreVertical, FiTrash2, FiHome, FiUsers, FiSlash, FiFlag, FiPaperclip, FiX } from 'react-icons/fi';
import { useThreads } from '../../contexts/ThreadContext';
import { useAuth } from '../../contexts/AuthContext';
import { blockUser, reportUser, uploadFile } from '../../services/messageService';

const ChatWindow = ({ onBack }) => {
  const { activeThread, messages, sendMessage, loadingMessages, typingUsers, sendTyping } = useThreads();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // ... existing handlers ...

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => uploadFile(file));
      const uploadedAttachments = await Promise.all(uploadPromises);
      setAttachments(prev => [...prev, ...uploadedAttachments]);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && attachments.length === 0) || sending) return;

    setSending(true);
    try {
      const attachmentIds = attachments.map(a => a._id);
      await sendMessage(newMessage, attachmentIds);
      setNewMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // ... rest of component ...

  const handleBlockUser = async (userId) => {
    if (!userId) return;
    if (!confirm('Are you sure you want to block this user? You will no longer receive messages from them.')) return;

    try {
      await blockUser(userId);
      alert('User blocked successfully');
      setShowMenu(false);
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Failed to block user');
    }
  };

  const handleReportUser = async (userId) => {
    if (!userId) return;
    const reason = prompt('Please provide a reason for reporting this user:');
    if (!reason) return;

    try {
      await reportUser(userId, { reason, description: reason });
      alert('User reported successfully');
      setShowMenu(false);
    } catch (error) {
      console.error('Error reporting user:', error);
      alert('Failed to report user');
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return `Yesterday ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  const getThreadHeader = () => {
    if (!activeThread) return null;

    if (activeThread.type === 'listing') {
      return {
        name: activeThread.listingId?.title || 'Listing Inquiry',
        subtext: activeThread.listingId?.city || 'Property',
        icon: <FiHome className="text-orange-600" size={20} />
      };
    }

    if (activeThread.type === 'group') {
      return {
        name: activeThread.metadata?.name || 'Group Chat',
        subtext: `${activeThread.participants?.length || 0} members`,
        icon: <FiUsers className="text-orange-600" size={20} />
      };
    }

    // DM
    const otherUser = activeThread.participants?.find(p => p._id !== user?._id);
    return {
      name: otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User',
      subtext: otherUser?.email || '',
      icon: otherUser?.avatarUrl ? (
        <img src={otherUser.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <FiUser className="text-orange-600" size={20} />
      )
    };
  };

  if (!activeThread) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-6 text-center">
        <FiUser className="text-gray-400 mb-4" size={64} />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Conversation Selected</h3>
        <p className="text-gray-500">
          Select a conversation from the list to start messaging
        </p>
      </div>
    );
  }

  if (loadingMessages) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const headerInfo = getThreadHeader();
  const otherUser = activeThread?.participants?.find(p => p._id !== user?._id);

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20 bg-white/10 backdrop-blur-md shadow-sm">
        <div className="flex items-center space-x-3">
          {/* Back Button (Mobile) */}
          <button
            onClick={onBack}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
          >
            <FiArrowLeft size={20} />
          </button>

          {/* Avatar/Icon */}
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/20">
            {headerInfo.icon}
          </div>

          {/* Thread Info */}
          <div>
            <h3 className="font-bold text-white">
              {headerInfo.name}
            </h3>
            <p className="text-xs text-white/60">
              {headerInfo.subtext}
            </p>
          </div>
        </div>

        {/* Options Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <FiMoreVertical size={20} className="text-white/70" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900/90 backdrop-blur-xl rounded-lg shadow-xl py-1 z-10 border border-white/20">
              <button
                onClick={() => {
                  setShowMenu(false);
                  // TODO: Implement view profile navigation
                  // navigate(`/profile/${otherUser?._id}`);
                }}
                className="w-full text-left px-4 py-2 text-sm text-white/90 hover:bg-white/10 flex items-center gap-2"
              >
                <FiUser size={16} />
                View Profile
              </button>
              <button
                onClick={() => handleBlockUser(otherUser?._id)}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
              >
                <FiSlash size={16} />
                Block User
              </button>
              <button
                onClick={() => handleReportUser(otherUser?._id)}
                className="w-full text-left px-4 py-2 text-sm text-white/90 hover:bg-white/10 flex items-center gap-2"
              >
                <FiFlag size={16} />
                Report User
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-transparent custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FiUser className="text-white/30 mb-4" size={48} />
            <p className="text-white/70">No messages yet</p>
            <p className="text-sm text-white/50 mt-2">
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              // Fix: Handle cases where sender is populated object or just ID string
              const senderId = message.sender?._id || message.sender;
              const currentUserId = user?._id || user?.id;

              // Robust check for own message - compare both _id and id fields
              const isOwnMessage = (senderId && currentUserId) && (
                senderId.toString() === currentUserId.toString() ||
                senderId === currentUserId
              );

              const showTimestamp = index === 0 ||
                new Date(messages[index].createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() > 300000; // 5 minutes

              return (
                <div key={message._id}>
                  {/* Timestamp Divider */}
                  {showTimestamp && (
                    <div className="flex justify-center mb-2">
                      <span className="text-xs text-white/60 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/5">
                        {formatTimestamp(message.createdAt)}
                      </span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}>
                    <div className={`max-w-xs md:max-w-md lg:max-w-lg relative ${isOwnMessage ? 'order-2' : 'order-1'
                      }`}>
                      <div className={`px-4 py-2 rounded-2xl ${isOwnMessage
                        ? 'bg-orange-600 text-white rounded-br-sm shadow-lg'
                        : 'bg-white/10 text-white rounded-bl-sm backdrop-blur-md border border-white/10'
                        }`}>
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mb-2 space-y-2">
                            {message.attachments.map(att => (
                              <div key={att._id} className="bg-black/20 rounded p-2">
                                {att.type.startsWith('image/') ? (
                                  <img
                                    src={att.url}
                                    alt={att.filename}
                                    className="max-w-full rounded max-h-48 object-cover"
                                    onError={(e) => e.target.style.display = 'none'}
                                  />
                                ) : (
                                  <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm hover:underline text-white"
                                  >
                                    <FiPaperclip size={14} />
                                    {att.filename}
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-sm break-words leading-relaxed opacity-95 text-shadow-sm">{message.content}</p>
                      </div>

                      {/* Read Receipts */}
                      {isOwnMessage && index === messages.length - 1 && activeThread?.participants && (
                        <div className="flex justify-end mt-1 gap-1">
                          {activeThread.participants
                            .filter(p => p?.user?._id && p.user._id !== user._id && p.lastReadAt && new Date(p.lastReadAt) >= new Date(message.createdAt))
                            .map(p => (
                              <div key={p.user._id} className="relative group/tooltip">
                                <div className="w-4 h-4 rounded-full bg-white/20 overflow-hidden border border-white/40">
                                  {p.user.avatarUrl ? (
                                    <img src={p.user.avatarUrl} alt={p.user.firstName} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-orange-500/20 text-[8px] font-bold text-orange-200">
                                      {p.user.firstName?.[0] || '?'}
                                    </div>
                                  )}
                                </div>
                                <div className="absolute bottom-full right-0 mb-1 hidden group-hover/tooltip:block whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg border border-white/10">
                                  Read by {p.user.firstName}
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {Object.keys(typingUsers).length > 0 && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 rounded-bl-sm border border-white/10">
                  <p className="text-xs text-white/70">
                    {Object.values(typingUsers).map(u => u.firstName).join(', ')} is typing...
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white/10 backdrop-blur-md border-t border-white/20">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map((att, index) => (
              <div key={att._id} className="relative bg-white/20 border border-white/20 rounded-lg p-2 flex items-center gap-2">
                <span className="text-xs text-white truncate max-w-[150px]">{att.filename}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-white/60 hover:text-red-400"
                >
                  <FiX size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || sending}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Attach file"
          >
            <FiPaperclip size={20} />
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              sendTyping(e.target.value.length > 0);
            }}
            onBlur={() => sendTyping(false)}
            placeholder={uploading ? "Uploading..." : "Type a message..."}
            disabled={sending || uploading}
            className="flex-1 px-4 py-2 border border-white/20 bg-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent disabled:bg-white/5 text-white placeholder-white/50 transition-all font-medium"
          />
          <button
            type="submit"
            disabled={(!newMessage.trim() && attachments.length === 0) || sending || uploading}
            className={`p-2 rounded-full ${(!newMessage.trim() && attachments.length === 0) || sending || uploading
              ? 'bg-white/10 text-white/30 cursor-not-allowed'
              : 'bg-orange-600 text-white hover:bg-orange-700 shadow-md hover:scale-105 active:scale-95'
              } transition-all duration-200`}
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FiSend size={20} className="ml-0.5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;

