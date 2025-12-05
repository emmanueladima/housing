import api from './api';

const applicationService = {
  // Submit application
  async submitApplication(applicationData) {
    const response = await api.post('/applications', applicationData);
    return response.data.application;
  },

  // Get my applications
  async getMyApplications() {
    const response = await api.get('/applications');
    return response.data.applications;
  },

  // Get received applications (landlord)
  async getReceivedApplications(status = null) {
    const params = status ? `?status=${status}` : '';
    const response = await api.get(`/applications/received${params}`);
    return response.data.applications;
  },

  // Get applications for specific listing
  async getListingApplications(listingId) {
    const response = await api.get(`/applications/listing/${listingId}`);
    return response.data.applications;
  },

  // Update application status
  async updateApplicationStatus(applicationId, statusData) {
    const response = await api.patch(`/applications/${applicationId}`, statusData);
    return response.data.application;
  },

  // Schedule tour
  async scheduleTour(applicationId, tourData) {
    const response = await api.post(`/applications/${applicationId}/tour`, tourData);
    return response.data.application;
  },
};

export default applicationService;

