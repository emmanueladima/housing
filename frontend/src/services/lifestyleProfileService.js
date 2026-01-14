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

    // Build clean data object - simplified to avoid iterator issues
    const cleanData = {};
    const keys = Object.keys(profileData);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      // Skip photo-related keys
      if (key === 'newPhoto' || key === 'image' || key === 'photo' || key === 'photoPreview') {
        continue;
      }

      const value = profileData[key];
      if (value === null || value === undefined) continue;

      // Just take the value directly. React state uses Arrays/Objects, no Maps/Sets.
      cleanData[key] = value;
    }

    console.log('saveMyProfile - cleanData prepared:', cleanData);

    // Get token for auth
    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

    // If there's a new photo, use FormData with native fetch
    if (newPhoto && newPhoto instanceof File) {
      const formData = new FormData();
      formData.append('image', newPhoto);

      // Add each clean field to FormData
      const cleanKeys = Object.keys(cleanData);
      for (let i = 0; i < cleanKeys.length; i++) {
        const key = cleanKeys[i];
        const value = cleanData[key];

        if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          formData.append(key, String(value));
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      }

      console.log('saveMyProfile - using native fetch with FormData');

      // Use native fetch - no axios
      const response = await fetch(`${baseUrl}/lifestyle-profiles/me`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to save profile');
      }

      const data = await response.json();
      return data.profile;
    }

    // No photo - send as JSON with native fetch
    console.log('saveMyProfile - using native fetch with JSON');

    const response = await fetch(`${baseUrl}/lifestyle-profiles/me`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cleanData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || 'Failed to save profile');
    }

    const data = await response.json();
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

