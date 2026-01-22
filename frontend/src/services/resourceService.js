import api from './api';

const resourceService = {
    getVibeTags: async () => {
        try {
            const { data } = await api.get('/resources/vibes');
            return data.vibes || [];
        } catch (error) {
            console.error('Error fetching vibe tags:', error);
            return [];
        }
    },

    getInterests: async () => {
        try {
            const { data } = await api.get('/resources/interests');
            return data.interests || [];
        } catch (error) {
            console.error('Error fetching interests:', error);
            return [];
        }
    }
};

export default resourceService;
