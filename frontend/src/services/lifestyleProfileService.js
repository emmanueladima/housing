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

    // First, create a clean JSON object (no special types)
    const cleanData = {};
    for (const key of Object.keys(profileData)) {
      // Skip photo-related keys
      if (key === 'newPhoto' || key === 'image' || key === 'photo' || key === 'photoPreview') continue;

      const value = profileData[key];
      if (value == null) continue; // Skip null/undefined

      // Convert special types to plain types
      if (value instanceof Set) {
        cleanData[key] = [...value];
      } else if (value instanceof Map) {
        cleanData[key] = Object.fromEntries(value);
      } else if (value instanceof File) {
        // Skip files in regular data
        continue;
      } else {
        cleanData[key] = value;
      }
    }

    console.log('saveMyProfile - cleanData:', cleanData);
    console.log('saveMyProfile - hasPhoto:', !!newPhoto, newPhoto instanceof File);

    // If there's a new photo, use FormData
    if (newPhoto && newPhoto instanceof File) {
      const formData = new FormData();
      formData.append('image', newPhoto);

      // Append each field as string
      for (const [key, value] of Object.entries(cleanData)) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else {
          formData.append(key, String(value));
        }
      }

      console.log('saveMyProfile - sending FormData with photo');

      // Let axios handle Content-Type for FormData
      const { data } = await api.post('/lifestyle-profiles/me', formData);
      return data.profile;
    }

    // No photo - send as JSON
    console.log('saveMyProfile - sending JSON (no photo)');
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

