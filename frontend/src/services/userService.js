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
};

export default userService;




