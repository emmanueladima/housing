import api from './api';

const checklistService = {
    // Personal checklist
    getPersonalChecklist: async () => {
        const response = await api.get('/checklists/personal');
        return response.data;
    },

    updatePersonalChecklist: async (items) => {
        const response = await api.put('/checklists/personal', { items });
        return response.data;
    },

    addPersonalItem: async (text, category = 'custom') => {
        const response = await api.post('/checklists/personal/items', { text, category });
        return response.data;
    },

    deletePersonalItem: async (itemId) => {
        const response = await api.delete(`/checklists/personal/items/${itemId}`);
        return response.data;
    },

    resetPersonalChecklist: async () => {
        const response = await api.post('/checklists/personal/reset');
        return response.data;
    },

    // Listing-specific checklist
    getListingChecklist: async (listingId) => {
        const response = await api.get(`/checklists/listing/${listingId}`);
        return response.data;
    },

    updateListingChecklist: async (listingId, items) => {
        const response = await api.put(`/checklists/listing/${listingId}`, { items });
        return response.data;
    },

    addListingItem: async (listingId, text) => {
        const response = await api.post(`/checklists/listing/${listingId}/items`, { text });
        return response.data;
    },
};

export default checklistService;
