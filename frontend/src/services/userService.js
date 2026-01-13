import api from './api';

const userService = {
  // Get users with lifestyle profiles
  getUsersWithProfiles: async (filters = {}) => {
    const { data } = await api.get('/users/with-profiles', { params: filters });
    return data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const { data } = await api.get(`/users/${userId}`);
    return data;
  },

  // ============ USERNAME OPERATIONS ============

  // Check if username is available
  checkUsername: async (username) => {
    const { data } = await api.get(`/users/check-username/${username}`);
    return data;
  },

  // Set or update username
  setUsername: async (username) => {
    const { data } = await api.patch('/users/username', { username });
    return data;
  },

  // Search users by username or name
  searchUsers: async (query) => {
    const { data } = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return data;
  },

  // Get user by username
  getUserByUsername: async (username) => {
    const { data } = await api.get(`/users/by-username/${username}`);
    return data;
  },
};

export default userService;




