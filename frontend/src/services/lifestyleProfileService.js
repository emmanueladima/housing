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
    console.log('DEBUG: saveMyProfile called');
    try {
      // Get photo from either 2nd argument OR from profileData.newPhoto
      const newPhoto = photoArg || profileData.newPhoto;
      console.log('DEBUG: newPhoto present:', !!newPhoto, newPhoto instanceof File);

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

      console.log('DEBUG: cleanData prepared. Keys:', Object.keys(cleanData));

      // Get token for auth
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

      // If there's a new photo, use FormData with native fetch
      if (newPhoto && newPhoto instanceof File) {
        console.log('DEBUG: Preparing FormData upload');
        const formData = new FormData();
        formData.append('image', newPhoto);

        // Add each clean field to FormData
        const cleanKeys = Object.keys(cleanData);
        for (let i = 0; i < cleanKeys.length; i++) {
          const key = cleanKeys[i];
          const value = cleanData[key];

          // Safety check for objects
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // If it's a generic object but NOT array (and not null), stringify it
            formData.append(key, JSON.stringify(value));
          } else if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }

        console.log('DEBUG: FormData ready. Sending fetch...');
        console.log('DEBUG: Fetch URL:', `${baseUrl}/lifestyle-profiles/me`);

        // Use native fetch - strictly no axios polyfills if possible
        const response = await fetch(`${baseUrl}/lifestyle-profiles/me`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
            // Don't set Content-Type for FormData, browser sets boundary
          },
          body: formData
        });

        console.log('DEBUG: Fetch complete. Status:', response.status);

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'No error text');
          console.error('DEBUG: Server error response:', errorText);
          try {
            const errorData = JSON.parse(errorText);
            throw new Error(errorData.error || errorData.message || 'Failed to save profile');
          } catch (e) {
            throw new Error(`Failed to save profile: ${response.status} ${response.statusText}`);
          }
        }

        const data = await response.json();
        return data.profile;
      }

      // No photo - send as JSON with native fetch
      console.log('DEBUG: No photo, using JSON fetch');

      const response = await fetch(`${baseUrl}/lifestyle-profiles/me`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cleanData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DEBUG: Server error response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || errorData.message || 'Failed to save profile');
        } catch {
          throw new Error(`Failed to save profile: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      return data.profile;
    } catch (e) {
      console.error('DEBUG: ERROR in saveMyProfile:', e);
      throw e;
    }
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
