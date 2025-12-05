import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ConversationList from '../components/Messages/ConversationList';
import ChatWindow from '../components/Messages/ChatWindow';
import { useAuth } from '../contexts/AuthContext';
import { ThreadProvider, useThreads } from '../contexts/ThreadContext';
import messageService from '../services/messageService';
import { FiMessageSquare } from 'react-icons/fi';

const MessagesContent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeThreadId, setActiveThreadId } = useThreads();
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const initThread = async () => {
      const targetUserId = searchParams.get('user');
      if (targetUserId) {
        try {
          const thread = await messageService.createThread({
            type: 'dm',
            participantIds: [targetUserId]
          });

          if (thread && thread._id) {
            setActiveThreadId(thread._id);
            setSearchParams({ thread: thread._id });
          }
        } catch (error) {
          console.error('Error initializing thread:', error);
        }
      }

      const threadId = searchParams.get('thread');
      if (threadId && threadId !== activeThreadId) {
        setActiveThreadId(threadId);
      }
    };

    initThread();
  }, [searchParams, setActiveThreadId, setSearchParams]);

  useEffect(() => {
    if (activeThreadId) {
      setSearchParams({ thread: activeThreadId });
    } else {
      setSearchParams({});
    }
  }, [activeThreadId, setSearchParams]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleBackToList = () => {
    setActiveThreadId(null);
  };

  // Mobile view
  if (isMobileView) {
    return (
      <div className="h-screen bg-gray-50 pt-20">
        {activeThreadId ? (
          <ChatWindow onBack={handleBackToList} />
        ) : (
          <div className="h-full">
            {/* Mobile Header */}
            <div className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 px-4 py-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                  <FiMessageSquare className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-white">Messages</h1>
                  <p className="text-white/80 text-sm">Your conversations</p>
                </div>
              </div>
            </div>
            <ConversationList />
          </div>
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <div className="h-screen bg-gray-50 pt-20">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg shadow-orange-500/20">
              <FiMessageSquare className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Messages</h1>
              <p className="text-gray-500">Connect with landlords and roommates</p>
            </div>
          </div>
        </div>

        {/* Messages Grid */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
          <div className="grid grid-cols-12 h-full">
            <div className="col-span-4 border-r border-gray-200 overflow-hidden">
              <ConversationList />
            </div>
            <div className="col-span-8 overflow-hidden">
              <ChatWindow onBack={handleBackToList} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <ThreadProvider>
      <MessagesContent />
    </ThreadProvider>
  );
};

export default Messages;
