import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ConversationList from '../components/Messages/ConversationList';
import ChatWindow from '../components/Messages/ChatWindow';
import { useAuth } from '../contexts/AuthContext';
import { ThreadProvider, useThreads } from '../contexts/ThreadContext';
import messageService from '../services/messageService';
import { FiMessageSquare, FiInbox, FiSend } from 'react-icons/fi';
import ModernBackground from '../components/shared/ModernBackground';

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
      <div className="min-h-screen bg-gray-50">
        {activeThreadId ? (
          <ChatWindow onBack={handleBackToList} />
        ) : (
          <div className="h-full">
            {/* Mobile Header */}
            <div className="relative overflow-hidden pt-24 pb-8">
              <ModernBackground />
              <div className="relative z-10 max-w-7xl mx-auto px-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                    <FiMessageSquare className="text-white" size={28} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-white">Messages</h1>
                    <p className="text-white/80 text-sm">Your conversations</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 -mt-4">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <ConversationList />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden pt-28 pb-16">
        <ModernBackground />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg">
              <FiMessageSquare className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white">Messages</h1>
              <p className="text-white/80 mt-1">Connect with landlords and roommates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
          <div className="grid grid-cols-12 h-full">
            {/* Conversation List */}
            <div className="col-span-4 border-r border-gray-100 overflow-hidden">
              <ConversationList />
            </div>

            {/* Chat Window */}
            <div className="col-span-8 overflow-hidden bg-gray-50/50">
              {activeThreadId ? (
                <ChatWindow onBack={handleBackToList} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="p-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-3xl mb-6">
                    <FiInbox className="text-orange-500" size={48} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Conversation</h3>
                  <p className="text-gray-500 max-w-sm">
                    Choose a conversation from the list to start messaging, or reach out from a listing or roommate profile.
                  </p>
                </div>
              )}
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
