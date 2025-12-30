import api from './api';

export interface Application {
    _id: string;
    listingId: {
        _id: string;
        title: string;
        rent: number;
        images?: string[];
        city?: string;
        state?: string;
    };
    userId?: any;
    status: 'submitted' | 'under_review' | 'interview_scheduled' | 'approved' | 'rejected' | 'withdrawn';
    moveInDate?: string;
    leaseTerm?: string;
    coverLetter?: string;
    createdAt: string;
    updatedAt: string;
    tourScheduled?: {
        date: string;
        confirmed: boolean;
    };
    landlordResponse?: {
        message: string;
    };
}

export interface ApplicationsByStatus {
    submitted?: Application[];
    under_review?: Application[];
    interview_scheduled?: Application[];
    approved?: Application[];
    rejected?: Application[];
    withdrawn?: Application[];
}

const applicationService = {
    // Get user's applications (grouped by status)
    async getMyApplications(grouped: boolean = false): Promise<ApplicationsByStatus | Application[]> {
        const response = await api.get(`/applications/me${grouped ? '?grouped=true' : ''}`);
        return response.data.applications || response.data || [];
    },

    // Get single application
    async getApplication(id: string): Promise<Application> {
        const response = await api.get(`/applications/${id}`);
        return response.data.application || response.data;
    },

    // Submit application
    async submitApplication(data: {
        listingId: string;
        moveInDate: string;
        leaseTerm: string;
        coverLetter?: string;
    }): Promise<Application> {
        const response = await api.post('/applications', data);
        return response.data.application || response.data;
    },

    // Withdraw application
    async withdrawApplication(id: string): Promise<void> {
        await api.patch(`/applications/${id}/withdraw`);
    },

    // For landlords: Get received applications
    async getReceivedApplications(options?: { listingId?: string; grouped?: boolean }): Promise<{
        applications: ApplicationsByStatus;
        listings: any[];
    }> {
        const params = new URLSearchParams();
        if (options?.listingId) params.append('listingId', options.listingId);
        if (options?.grouped) params.append('grouped', 'true');
        const response = await api.get(`/applications/received?${params.toString()}`);
        return response.data;
    },

    // For landlords: Update application status
    async updateApplicationStatus(id: string, data: { status: string; message?: string }): Promise<Application> {
        const response = await api.patch(`/applications/${id}/status`, data);
        return response.data.application || response.data;
    },
};

export default applicationService;
