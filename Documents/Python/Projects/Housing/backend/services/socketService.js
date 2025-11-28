/**
 * Socket Service
 * Handles Socket.io event management and real-time features
 */

class SocketService {
  constructor() {
    this.io = null;
  }

  /**
   * Initialize Socket.io with server
   */
  initialize(io) {
    this.io = io;
    
    io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.id}`);

      // User joins their personal room
      socket.on('join', (userId) => {
        socket.join(userId);
        socket.userId = userId;
        console.log(`👤 User ${userId} joined their room`);
      });

      // Join a conversation room
      socket.on('join_conversation', (conversationId) => {
        socket.join(conversationId);
        console.log(`💬 User joined conversation: ${conversationId}`);
      });

      // Leave a conversation room
      socket.on('leave_conversation', (conversationId) => {
        socket.leave(conversationId);
        console.log(`💬 User left conversation: ${conversationId}`);
      });

      // Typing indicator
      socket.on('typing', ({ conversationId, userId, userName }) => {
        socket.to(conversationId).emit('user_typing', { userId, userName });
      });

      // Stop typing indicator
      socket.on('stop_typing', ({ conversationId, userId }) => {
        socket.to(conversationId).emit('user_stop_typing', { userId });
      });

      // Mark user as online
      socket.on('user_online', (userId) => {
        socket.broadcast.emit('user_status', { userId, status: 'online' });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        if (socket.userId) {
          socket.broadcast.emit('user_status', { 
            userId: socket.userId, 
            status: 'offline' 
          });
        }
        console.log(`🔌 User disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * Emit a new message event
   */
  emitNewMessage(conversationId, message) {
    if (this.io) {
      this.io.to(conversationId).emit('new_message', message);
    }
  }

  /**
   * Emit a notification to a specific user
   */
  emitNotification(userId, notification) {
    if (this.io) {
      this.io.to(userId.toString()).emit('new_notification', notification);
    }
  }

  /**
   * Emit notification to multiple users
   */
  emitBulkNotifications(userIds, notification) {
    if (this.io) {
      userIds.forEach(userId => {
        this.io.to(userId.toString()).emit('new_notification', notification);
      });
    }
  }

  /**
   * Get Socket.io instance
   */
  getIO() {
    return this.io;
  }
}

export default new SocketService();

