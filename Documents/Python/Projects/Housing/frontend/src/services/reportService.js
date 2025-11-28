import api from './api';

const reportService = {
    // Create a report
    createReport: async (reportData) => {
        // reportData: { targetType, targetId, reason, description, evidence }
        const { data } = await api.post('/reports', reportData);
        return data;
    },

    // Get reports (admin)
    getReports: async () => {
        const { data } = await api.get('/reports');
        return data;
    },
};

export default reportService;
