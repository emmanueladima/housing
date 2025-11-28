import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(userId) {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        auth: {
          token: localStorage.getItem('token'),
        },
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected');
        if (userId) {
          this.socket.emit('join', userId);
        }
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
    }

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a conversation room
  joinConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('join_conversation', conversationId);
    }
  }

  // Leave a conversation room
  leaveConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('leave_conversation', conversationId);
    }
  }

  // Send typing indicator
  sendTyping(conversationId, userId, userName) {
    if (this.socket) {
      this.socket.emit('typing', { conversationId, userId, userName });
    }
  }

  // Stop typing indicator
  stopTyping(conversationId, userId) {
    if (this.socket) {
      this.socket.emit('stop_typing', { conversationId, userId });
    }
  }

  // Listen for new messages
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  // Listen for new notifications
  onNewNotification(callback) {
    if (this.socket) {
      this.socket.on('new_notification', callback);
    }
  }

  // Listen for typing indicator
  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  // Listen for stop typing
  onUserStopTyping(callback) {
    if (this.socket) {
      this.socket.on('user_stop_typing', callback);
    }
  }

  // Listen for user status changes
  onUserStatus(callback) {
    if (this.socket) {
      this.socket.on('user_status', callback);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketService();

