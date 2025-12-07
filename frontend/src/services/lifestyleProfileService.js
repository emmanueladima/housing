import api from './api';

const lifestyleProfileService = {
  // Get my lifestyle profile
  getMyProfile: async () => {
    const { data } = await api.get('/lifestyle-profiles/me');
    return data.profile;
  },

  // Update my lifestyle profile
  updateMyProfile: async (profileData) => {
    const { data } = await api.post('/lifestyle-profiles/me', profileData);
    return data.profile;
  },

  // Save my lifestyle profile (create or update)
  saveMyProfile: async (profileData) => {
    // If there's a new photo, use FormData
    if (profileData.newPhoto) {
      const formData = new FormData();
      formData.append('image', profileData.newPhoto);

      // Append other fields
      Object.keys(profileData).forEach(key => {
        if (key !== 'newPhoto' && key !== 'image') {
          if (typeof profileData[key] === 'object') {
            formData.append(key, JSON.stringify(profileData[key]));
          } else {
            formData.append(key, profileData[key]);
          }
        }
      });

      const { data } = await api.post('/lifestyle-profiles/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data.profile;
    }

    const { data } = await api.post('/lifestyle-profiles/me', profileData);
    return data.profile;
  },

  // Get all profiles (discovery)
  getAllProfiles: async () => {
    const { data } = await api.get('/lifestyle-profiles/all');
    return data;
  },

  // Get matches with filters
  getMatches: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const { data } = await api.get(`/lifestyle-profiles/matches?${params.toString()}`);
    return data;
  },

  // Get specific profile by ID
  getProfile: async (id) => {
    const { data } = await api.get(`/lifestyle-profiles/${id}`);
    return data;
  },

  // Get profile by user ID (legacy support or specific use case)
  getProfileByUserId: async (userId) => {
    // The backend might not have this exact route anymore if we consolidated, 
    // but let's keep it if it maps to something or remove if unused.
    // Actually, let's map it to the new getProfile if the ID passed is a profile ID, 
    // or assume the backend handles user ID lookup if implemented.
    // For now, let's assume we use getProfile with profile ID.
    // If we need by User ID, we might need a specific endpoint or filter.
    // Checking backend routes... we have /user/:userId in lifestyleProfiles.js
    const { data } = await api.get(`/lifestyle-profiles/user/${userId}`);
    return data;
  },

  // Calculate compatibility with another user
  calculateCompatibility: async (hostUserId) => {
    const { data } = await api.post('/lifestyle-profiles/compatibility', {
      hostUserId,
    });
    return data;
  },

  // Toggle saved status
  toggleSavedProfile: async (id) => {
    const { data } = await api.post(`/lifestyle-profiles/save/${id}`);
    return data;
  },

  // Get saved profiles
  getSavedProfiles: async () => {
    const { data } = await api.get('/lifestyle-profiles/saved');
    return data;
  },

  // Update compatibility test answers
  updateCompatibility: async (answers) => {
    const { data } = await api.post('/lifestyle-profiles/compatibility-test', { answers });
    return data.profile;
  },
};

export default lifestyleProfileService;

