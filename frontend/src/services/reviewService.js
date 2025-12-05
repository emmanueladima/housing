import api from './api';

const reviewService = {
  // Create review
  async createReview(reviewData) {
    const response = await api.post('/reviews', reviewData);
    return response.data.review;
  },

  // Get listing reviews
  async getListingReviews(listingId, page = 1) {
    const response = await api.get(`/reviews/listing/${listingId}?page=${page}`);
    return response.data;
  },

  // Get user reviews
  async getUserReviews(userId, type = 'landlord') {
    const response = await api.get(`/reviews/user/${userId}?type=${type}`);
    return response.data.reviews;
  },

  // Respond to review
  async respondToReview(reviewId, responseText) {
    const response = await api.post(`/reviews/${reviewId}/response`, { responseText });
    return response.data.review;
  },

  // Report review
  async reportReview(reviewId) {
    const response = await api.post(`/reviews/${reviewId}/report`);
    return response.data;
  },

  // Delete review
  async deleteReview(reviewId) {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },
};

export default reviewService;

