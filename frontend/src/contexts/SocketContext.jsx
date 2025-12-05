import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useAuth } from './AuthContext';
import socketService from '../services/socketService';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Memoize user ID to prevent unnecessary effect triggers
  const userId = useMemo(() => user?.id || user?._id, [user?.id, user?._id]);

  useEffect(() => {
    if (isAuthenticated && userId) {
      // Only connect if not already connected
      if (!socket) {
        console.log('🔌 Connecting socket for user:', userId);
        const socketInstance = socketService.connect(userId);
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
          console.log('✅ Socket connected');
          setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
          console.log('❌ Socket disconnected');
          setIsConnected(false);
        });
      }

      // Cleanup on unmount or logout
      return () => {
        if (socket) {
          console.log('🔌 Cleaning up socket connection');
          socketService.disconnect();
          setSocket(null);
          setIsConnected(false);
        }
      };
    } else {
      // Disconnect if not authenticated
      if (socket) {
        console.log('🔌 Disconnecting socket (not authenticated)');
        socketService.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, userId]); // Only depend on isAuthenticated and stable userId

  const value = {
    socket,
    isConnected,
    socketService,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

