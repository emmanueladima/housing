import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import messageService from '../services/messageService';

const ThreadContext = createContext(null);

export const useThreads = () => {
    const context = useContext(ThreadContext);
    if (!context) {
        throw new Error('useThreads must be used within ThreadProvider');
    }
    return context;
};

export const ThreadProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const { socket } = useSocket();

    const [threads, setThreads] = useState([]);
    const [activeThreadId, setActiveThreadId] = useState(null);
    const [activeThread, setActiveThread] = useState(null);
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Fetch threads list
    const fetchThreads = useCallback(async (pageNum = 1, refresh = false) => {
        if (!isAuthenticated) return;

        setLoading(true);
        try {
            const data = await messageService.getThreads(pageNum);

            if (refresh || pageNum === 1) {
                setThreads(data.threads);
            } else {
                setThreads(prev => [...prev, ...data.threads]);
            }

            setHasMore(data.page < data.totalPages);
            setPage(pageNum);
        } catch (error) {
            console.error('Error fetching threads:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Fetch global unread count
    const fetchUnreadCount = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const count = await messageService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, [isAuthenticated]);

    // Initial load
    useEffect(() => {
        if (isAuthenticated) {
            fetchThreads(1, true);
            fetchUnreadCount();
        } else {
            setThreads([]);
            setUnreadCount(0);
        }
    }, [isAuthenticated, fetchThreads, fetchUnreadCount]);

    // Load active thread details and messages
    useEffect(() => {
        const loadActiveThread = async () => {
            if (!activeThreadId) {
                setActiveThread(null);
                setMessages([]);
                return;
            }

            setLoadingMessages(true);
            try {
                // Get thread details if not already in list or needs full details
                let thread = threads.find(t => t._id === activeThreadId);
                if (!thread || !thread.participants) {
                    const data = await messageService.getThread(activeThreadId);
                    thread = data.thread;
                    // Merge participants from response if needed
                }
                setActiveThread(thread);

                // Get messages
                const msgData = await messageService.getMessages(activeThreadId);
                setMessages(msgData.messages);

                // Mark as read
                if (thread.unreadCount > 0) {
                    await messageService.markThreadRead(activeThreadId);
                    // Update local state
                    setThreads(prev => prev.map(t =>
                        t._id === activeThreadId ? { ...t, unreadCount: 0 } : t
                    ));
                    fetchUnreadCount();
                }
            } catch (error) {
                console.error('Error loading thread:', error);
            } finally {
                setLoadingMessages(false);
            }
        };

        loadActiveThread();
    }, [activeThreadId, threads, fetchUnreadCount]);

    const [typingUsers, setTypingUsers] = useState({});

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message) => {
            // If message belongs to active thread, append it
            if (activeThreadId && message.thread === activeThreadId) {
                setMessages(prev => [message, ...prev]);
                // Clear typing indicator for sender
                setTypingUsers(prev => {
                    const newState = { ...prev };
                    delete newState[message.sender._id];
                    return newState;
                });
            }

            // Update threads list
            setThreads(prev => {
                const threadIndex = prev.findIndex(t => t._id === message.thread);
                if (threadIndex > -1) {
                    // Move to top and update last message
                    const updatedThread = {
                        ...prev[threadIndex],
                        lastMessage: message,
                        lastMessageAt: message.createdAt,
                        unreadCount: (activeThreadId === message.thread) ? 0 : (prev[threadIndex].unreadCount + 1)
                    };
                    const newThreads = [...prev];
                    newThreads.splice(threadIndex, 1);
                    return [updatedThread, ...newThreads];
                } else {
                    // New thread, fetch it or reload list
                    fetchThreads(1, true);
                    return prev;
                }
            });

            if (activeThreadId !== message.thread) {
                fetchUnreadCount();
            }
        };

        const handleTypingStart = ({ userId, firstName, threadId }) => {
            if (threadId === activeThreadId) {
                setTypingUsers(prev => ({
                    ...prev,
                    [userId]: { firstName }
                }));
            }
        };

        const handleTypingStop = ({ userId, threadId }) => {
            if (threadId === activeThreadId) {
                setTypingUsers(prev => {
                    const newState = { ...prev };
                    delete newState[userId];
                    return newState;
                });
            }
        };

        socket.on('new_message', handleNewMessage);
        socket.on('message_notification', handleNewMessage);
        socket.on('typing:start', handleTypingStart);
        socket.on('typing:stop', handleTypingStop);

        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('message_notification', handleNewMessage);
            socket.off('typing:start', handleTypingStart);
            socket.off('typing:stop', handleTypingStop);
        };
    }, [socket, activeThreadId, fetchThreads, fetchUnreadCount]);

    const sendTyping = (isTyping) => {
        if (!socket || !activeThreadId || !user) return;

        if (isTyping) {
            socket.emit('typing:start', {
                threadId: activeThreadId,
                userId: user._id,
                firstName: user.firstName
            });
        } else {
            socket.emit('typing:stop', {
                threadId: activeThreadId,
                userId: user._id
            });
        }
    };

    const sendMessage = async (content, attachments = []) => {
        if (!activeThreadId) return;
        try {
            // Stop typing when sending
            sendTyping(false);

            const response = await messageService.sendMessage(activeThreadId, content, attachments);

            // Optimistically update or update with response
            const newMessage = response.message;
            setMessages(prev => [...prev, newMessage]);

            // Update threads list to move this thread to top
            setThreads(prev => {
                const threadIndex = prev.findIndex(t => t._id === activeThreadId);
                if (threadIndex > -1) {
                    const updatedThread = {
                        ...prev[threadIndex],
                        lastMessage: newMessage,
                        lastMessageAt: newMessage.createdAt,
                        unreadCount: 0
                    };
                    const newThreads = [...prev];
                    newThreads.splice(threadIndex, 1);
                    return [updatedThread, ...newThreads];
                }
                return prev;
            });

            return response.message;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    };

    const value = {
        threads,
        activeThread,
        activeThreadId,
        setActiveThreadId,
        messages,
        unreadCount,
        loading,
        loadingMessages,
        sendMessage,
        fetchThreads,
        hasMore,
        loadMoreThreads: () => fetchThreads(page + 1),
        typingUsers,
        sendTyping,
    };

    return <ThreadContext.Provider value={value}>{children}</ThreadContext.Provider>;
};
