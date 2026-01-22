import api from './api';

const notificationService = {
  // Get notifications
  async getNotifications(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/notifications?${params.toString()}`);
    return response.data;
  },

  // Get unread count
  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  },

  // Mark as read
  async markAsRead(notificationId) {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    window.dispatchEvent(new Event('notification_updated'));
    return response.data.notification;
  },

  // Mark all as read
  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all');
    window.dispatchEvent(new Event('notification_updated'));
    return response.data;
  },

  // Delete notification
  async deleteNotification(notificationId) {
    const response = await api.delete(`/notifications/${notificationId}`);
    window.dispatchEvent(new Event('notification_updated'));
    return response.data;
  },
};

export default notificationService;

