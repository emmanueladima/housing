import api from './api';

const listingService = {
  // Get all listings with filters
  async getListings(filters = {}) {
    const params = new URLSearchParams();

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '' && filters[key] !== false) {
        if (Array.isArray(filters[key])) {
          filters[key].forEach(value => params.append(key, value));
        } else {
          params.append(key, filters[key]);
        }
      }
    });

    const response = await api.get(`/listings?${params.toString()}`);
    return response.data;
  },

  // Get single listing
  async getListing(id) {
    const response = await api.get(`/listings/${id}`);
    return response.data.listing;
  },

  // Create listing
  async createListing(listingData) {
    const formData = new FormData();

    // Append all fields
    Object.keys(listingData).forEach(key => {
      if (key === 'images') {
        // Append each image file
        listingData.images.forEach(image => {
          formData.append('images', image);
        });
      } else if (typeof listingData[key] === 'object') {
        formData.append(key, JSON.stringify(listingData[key]));
      } else {
        formData.append(key, listingData[key]);
      }
    });

    const response = await api.post('/listings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update listing
  async updateListing(id, listingData) {
    const formData = new FormData();

    Object.keys(listingData).forEach(key => {
      if (key === 'images' && Array.isArray(listingData.images)) {
        listingData.images.forEach(image => {
          if (image instanceof File) {
            formData.append('images', image);
          }
        });
      } else if (typeof listingData[key] === 'object') {
        formData.append(key, JSON.stringify(listingData[key]));
      } else {
        formData.append(key, listingData[key]);
      }
    });

    const response = await api.put(`/listings/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete listing
  async deleteListing(id) {
    const response = await api.delete(`/listings/${id}`);
    return response.data;
  },

  // Toggle favorite
  async toggleFavorite(id) {
    const response = await api.post(`/listings/${id}/favorite`);
    return response.data;
  },

  // Convert to sublease
  async convertToSublease(id, subleaseData) {
    const response = await api.post(`/listings/${id}/sublease`, subleaseData);
    return response.data;
  },

  // Get my listings (landlord)
  async getMyListings() {
    const response = await api.get('/listings/my/listings');
    return response.data.listings;
  },
};

export default listingService;

