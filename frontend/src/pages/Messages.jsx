import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ConversationList from '../components/Messages/ConversationList';
import ChatWindow from '../components/Messages/ChatWindow';
import UserSearchModal from '../components/Messages/UserSearchModal';
import { useAuth } from '../contexts/AuthContext';
import { ThreadProvider, useThreads } from '../contexts/ThreadContext';
import messageService from '../services/messageService';
import { FiMessageSquare, FiInbox, FiSend, FiEdit } from 'react-icons/fi';


const MessagesContent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeThreadId, setActiveThreadId } = useThreads();
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showUserSearch, setShowUserSearch] = useState(false);
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

  const handleSelectUser = async (user) => {
    try {
      const thread = await messageService.createThread({
        type: 'dm',
        participantIds: [user._id]
      });
      if (thread && thread._id) {
        setActiveThreadId(thread._id);
        setSearchParams({ thread: thread._id });
      }
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  // Mobile view
  if (isMobileView) {
    return (
      <div className="min-h-screen relative pb-10">
        {activeThreadId ? (
          <div className="pt-20 h-screen">
            <ChatWindow onBack={handleBackToList} />
          </div>
        ) : (
          <div className="h-full">
            {/* Mobile Header */}
            <div className="relative pt-24 pb-8">
              <div className="relative z-10 max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
                      <FiMessageSquare className="text-white" size={28} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-black text-white">Messages</h1>
                      <p className="text-white/80 text-sm">Your conversations</p>
                    </div>
                  </div>
                  {/* Compose Button */}
                  <button
                    onClick={() => setShowUserSearch(true)}
                    className="p-3 bg-orange-500 rounded-full shadow-lg hover:bg-orange-600 transition-colors"
                  >
                    <FiEdit className="text-white" size={20} />
                  </button>
                </div>
              </div>
            </div>
            <div className="px-4 -mt-4 relative z-10">
              <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg overflow-hidden h-[calc(100vh-200px)]">
                <ConversationList />
              </div>
            </div>
          </div>
        )}
        <UserSearchModal
          isOpen={showUserSearch}
          onClose={() => setShowUserSearch(false)}
          onSelectUser={handleSelectUser}
        />
      </div>
    );
  }

  // Desktop view
  return (
    <div className="min-h-screen relative pb-10">
      {/* Hero Header */}
      <div className="relative pt-28 pb-16">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg border border-white/30">
                <FiMessageSquare className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white">Messages</h1>
                <p className="text-white/80 mt-1">Connect with landlords and roommates</p>
              </div>
            </div>
            {/* Compose Button */}
            <button
              onClick={() => setShowUserSearch(true)}
              className="flex items-center gap-2 px-5 py-3 bg-orange-500 rounded-xl shadow-lg hover:bg-orange-600 transition-colors font-bold text-white"
            >
              <FiEdit size={18} />
              Compose
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
        <div className="bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
          <div className="grid grid-cols-12 h-full">
            {/* Conversation List */}
            <div className="col-span-4 border-r border-white/20 overflow-hidden">
              <ConversationList />
            </div>

            {/* Chat Window */}
            <div className="col-span-8 overflow-hidden bg-black/10">
              {activeThreadId ? (
                <ChatWindow onBack={handleBackToList} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="p-6 bg-white/10 rounded-3xl mb-6 backdrop-blur-sm border border-white/20">
                    <FiInbox className="text-white/70" size={48} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Select a Conversation</h3>
                  <p className="text-white/60 max-w-sm">
                    Choose a conversation from the list to start messaging, or reach out from a listing or roommate profile.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <UserSearchModal
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        onSelectUser={handleSelectUser}
      />
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
