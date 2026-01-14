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
  // Supports both: saveMyProfile(dataWithPhoto) and saveMyProfile(data, photoFile)
  saveMyProfile: async (profileData, photoArg = null) => {
    // Get photo from either 2nd argument OR from profileData.newPhoto
    const newPhoto = photoArg || profileData.newPhoto;

    // Helper function to safely serialize values for FormData
    const serializeValue = (value) => {
      if (value === null || value === undefined) return null;
      if (value instanceof Set) return JSON.stringify([...value]);
      if (value instanceof Map) return JSON.stringify(Object.fromEntries(value));
      if (Array.isArray(value)) return JSON.stringify(value);
      if (typeof value === 'object' && !(value instanceof File)) return JSON.stringify(value);
      return value;
    };

    // If there's a new photo, use FormData
    if (newPhoto && newPhoto instanceof File) {
      const formData = new FormData();
      formData.append('image', newPhoto);

      // Append other fields with safe serialization
      Object.keys(profileData).forEach(key => {
        if (key === 'newPhoto' || key === 'image' || key === 'photo') return;

        const value = profileData[key];
        if (value == null) return; // Skip null/undefined

        try {
          const serialized = serializeValue(value);
          if (serialized !== null) {
            formData.append(key, serialized);
          }
        } catch (err) {
          console.warn(`Could not serialize field ${key}:`, err);
        }
      });

      const { data } = await api.post('/lifestyle-profiles/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data.profile;
    }

    // No photo - send as JSON
    // Clean the data first
    const cleanData = {};
    Object.keys(profileData).forEach(key => {
      if (key === 'newPhoto' || key === 'image') return;
      const value = profileData[key];
      if (value == null) return;

      // Convert Sets to arrays
      if (value instanceof Set) {
        cleanData[key] = [...value];
      } else if (value instanceof Map) {
        cleanData[key] = Object.fromEntries(value);
      } else {
        cleanData[key] = value;
      }
    });

    const { data } = await api.post('/lifestyle-profiles/me', cleanData);
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

