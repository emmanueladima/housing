import api from './api';

const adminService = {
  // Get dashboard stats
  getStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data.stats;
    } catch (error) {
      throw error.response?.data?.error || 'Error fetching admin stats';
    }
  },

  // Get paginated users
  getUsers: async (page = 1, limit = 10, search = '') => {
    try {
      const response = await api.get('/admin/users', {
        params: { page, limit, search }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error fetching users';
    }
  },

  // Ban/Unban user
  toggleBanUser: async (userId, reason) => {
    try {
      const response = await api.post(`/admin/users/${userId}/toggle-ban`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error updating user status';
    }
  },

  // Impersonate user (Login as)
  impersonateUser: async (userId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/impersonate`);
      const { token, user } = response.data;

      // Store current admin credentials in session storage to revert later
      const adminToken = localStorage.getItem('token');
      const adminUser = localStorage.getItem('user');

      sessionStorage.setItem('adminToken', adminToken);
      sessionStorage.setItem('adminUser', adminUser);

      // Set new user credentials
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return user;
    } catch (error) {
      throw error.response?.data?.error || 'Error impersonating user';
    }
  },

  // Revert to admin (Logout of impersonation)
  revertToAdmin: () => {
    const adminToken = sessionStorage.getItem('adminToken');
    const adminUser = sessionStorage.getItem('adminUser');

    if (adminToken && adminUser) {
      localStorage.setItem('token', adminToken);
      localStorage.setItem('user', adminUser);

      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminUser');

      return true;
    }
    return false;
  },

  // Get paginated listings
  getListings: async (page = 1, limit = 10, search = '', status = 'all') => {
    try {
      const response = await api.get('/admin/listings', {
        params: { page, limit, search, status }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error fetching listings';
    }
  },

  // Delete listing
  deleteListing: async (listingId) => {
    try {
      const response = await api.delete(`/admin/listings/${listingId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error deleting listing';
    }
  },

  // Delete community post
  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/admin/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error deleting post';
    }
  },

  // Get reports
  getReports: async () => {
    try {
      const response = await api.get('/reports');
      return response.data.reports;
    } catch (error) {
      throw error.response?.data?.error || 'Error fetching reports';
    }
  },

  // Update report status
  updateReportStatus: async (reportId, status, notes) => {
    try {
      const response = await api.put(`/reports/${reportId}/status`, { status, adminNotes: notes });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error updating report status';
    }
  },

  // Get audit logs
  getLogs: async (page = 1, limit = 20) => {
    try {
      const response = await api.get('/admin/logs', { params: { page, limit } });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error fetching audit logs';
    }
  },

  // Send announcement
  sendAnnouncement: async (data) => {
    try {
      const response = await api.post('/admin/messaging/send', data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Error sending announcement';
    }
  }
};

export default adminService;
