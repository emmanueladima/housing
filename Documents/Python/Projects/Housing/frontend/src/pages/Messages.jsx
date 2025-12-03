import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ConversationList from '../components/Messages/ConversationList';
import ChatWindow from '../components/Messages/ChatWindow';
import { useAuth } from '../contexts/AuthContext';
import { ThreadProvider, useThreads } from '../contexts/ThreadContext';
import messageService from '../services/messageService';

const MessagesContent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeThreadId, setActiveThreadId } = useThreads();
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const initThread = async () => {
      // Check for 'user' param to start new conversation
      const targetUserId = searchParams.get('user');
      if (targetUserId) {
        try {
          // Create or find thread with this user
          const thread = await messageService.createThread({
            type: 'dm',
            participantIds: [targetUserId]
          });

          if (thread && thread._id) {
            setActiveThreadId(thread._id);
            // Update URL to remove user param and add thread param
            setSearchParams({ thread: thread._id });
          }
        } catch (error) {
          console.error('Error initializing thread:', error);
        }
      }

      // Get conversation ID from URL params
      const threadId = searchParams.get('thread');
      if (threadId && threadId !== activeThreadId) {
        setActiveThreadId(threadId);
      }
    };

    initThread();
  }, [searchParams, setActiveThreadId, setSearchParams]);

  useEffect(() => {
    // Sync active thread to URL
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
      <div className="h-[calc(100vh-4rem)] bg-gray-100">
        {activeThreadId ? (
          <ChatWindow onBack={handleBackToList} />
        ) : (
          <ConversationList />
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-100">
      <div className="max-w-7xl mx-auto h-full">
        <div className="grid grid-cols-12 gap-0 h-full shadow-lg">
          <div className="col-span-4 border-r border-gray-200 bg-white overflow-hidden">
            <ConversationList />
          </div>
          <div className="col-span-8 bg-white overflow-hidden">
            <ChatWindow onBack={handleBackToList} />
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
