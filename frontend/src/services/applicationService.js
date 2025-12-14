import api from './api';

const applicationService = {
  // Submit application (standard flow)
  async submitApplication(applicationData) {
    const response = await api.post('/applications', applicationData);
    return response.data.application;
  },

  // Quick Apply using template
  async quickApply(listingId, templateId = null, customizations = {}) {
    const response = await api.post('/applications/quick', {
      listingId,
      templateId,
      customizations,
    });
    return response.data;
  },

  // Get pre-fill data for application form
  async getPrefillData(listingId) {
    const response = await api.get(`/applications/prefill/${listingId}`);
    return response.data.prefillData;
  },

  // Get my applications (with optional Kanban grouping)
  async getMyApplications(grouped = false) {
    const params = grouped ? '?grouped=true' : '';
    const response = await api.get(`/applications${params}`);
    return response.data.applications;
  },

  // Get single application details
  async getApplication(applicationId) {
    const response = await api.get(`/applications/${applicationId}`);
    return response.data;
  },

  // Withdraw application
  async withdrawApplication(applicationId) {
    const response = await api.patch(`/applications/${applicationId}/withdraw`);
    return response.data.application;
  },

  // Get received applications (landlord) with optional grouping
  async getReceivedApplications({ status = null, listingId = null, grouped = false } = {}) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (listingId) params.append('listingId', listingId);
    if (grouped) params.append('grouped', 'true');

    const queryString = params.toString();
    const response = await api.get(`/applications/received${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  // Get applications for specific listing
  async getListingApplications(listingId) {
    const response = await api.get(`/applications/listing/${listingId}`);
    return response.data.applications;
  },

  // Update application status (landlord)
  async updateApplicationStatus(applicationId, statusData) {
    const response = await api.patch(`/applications/${applicationId}`, statusData);
    return response.data.application;
  },

  // Bulk update status (landlord)
  async bulkUpdateStatus(applicationIds, status, landlordResponse = null) {
    const response = await api.patch('/applications/bulk-status', {
      applicationIds,
      status,
      landlordResponse,
    });
    return response.data;
  },

  // Compare applications (landlord)
  async compareApplications(applicationIds) {
    const response = await api.post('/applications/compare', { applicationIds });
    return response.data.comparison;
  },

  // Schedule tour
  async scheduleTour(applicationId, tourData) {
    const response = await api.post(`/applications/${applicationId}/tour`, tourData);
    return response.data.application;
  },

  // Confirm/update tour (landlord)
  async confirmTour(applicationId, tourData) {
    const response = await api.patch(`/applications/${applicationId}/tour`, tourData);
    return response.data.application;
  },

  // === Application Templates ===

  // Get all templates
  async getTemplates() {
    const response = await api.get('/application-templates');
    return response.data.templates;
  },

  // Get single template
  async getTemplate(templateId) {
    const response = await api.get(`/application-templates/${templateId}`);
    return response.data.template;
  },

  // Create template
  async createTemplate(templateData) {
    const response = await api.post('/application-templates', templateData);
    return response.data.template;
  },

  // Update template
  async updateTemplate(templateId, templateData) {
    const response = await api.put(`/application-templates/${templateId}`, templateData);
    return response.data.template;
  },

  // Delete template
  async deleteTemplate(templateId) {
    const response = await api.delete(`/application-templates/${templateId}`);
    return response.data;
  },

  // Set default template
  async setDefaultTemplate(templateId) {
    const response = await api.patch(`/application-templates/${templateId}/default`);
    return response.data.template;
  },
};

export default applicationService;
