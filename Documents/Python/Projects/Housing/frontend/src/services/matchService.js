import api from './api';

const matchService = {
    // Get my matches
    getMyMatches: async () => {
        const { data } = await api.get('/matches');
        return data;
    },

    // Request a match (Swipe Right)
    requestMatch: async (targetUserId) => {
        const { data } = await api.post('/matches/request', { targetUserId });
        return data;
    },

    // Respond to match request
    respondToMatch: async (matchId, action) => {
        // action: 'accept' or 'reject'
        const { data } = await api.put(`/matches/${matchId}/respond`, { action });
        return data;
    },
};

export default matchService;
