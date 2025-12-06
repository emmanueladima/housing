import api from './api';

const roommateGroupService = {
    // Create a new group
    createGroup: async (groupData) => {
        const { data } = await api.post('/roommate-groups', groupData);
        return data;
    },

    // Update group details
    updateGroup: async (groupId, groupData) => {
        const { data } = await api.put(`/roommate-groups/${groupId}`, groupData);
        return data;
    },

    // Get my group (Toolkit)
    getMyGroup: async () => {
        const { data } = await api.get('/roommate-groups/my-group');
        return data;
    },

    // Get all groups (Discovery)
    getAllGroups: async () => {
        const { data } = await api.get('/roommate-groups');
        return data;
    },

    // Get a single group by ID
    getGroupById: async (groupId) => {
        const { data } = await api.get(`/roommate-groups/${groupId}`);
        return data;
    },

    // Request to join a group
    requestJoin: async (groupId, message = '') => {
        const { data } = await api.post(`/roommate-groups/${groupId}/request-join`, { message });
        return data;
    },

    // Get pending join requests (admin only)
    getJoinRequests: async (groupId) => {
        const { data } = await api.get(`/roommate-groups/${groupId}/requests`);
        return data;
    },

    // Accept or reject a join request (admin only)
    handleJoinRequest: async (groupId, requestId, action) => {
        const { data } = await api.put(`/roommate-groups/${groupId}/requests/${requestId}`, { action });
        return data;
    },

    // Add a chore
    addChore: async (groupId, choreData) => {
        const { data } = await api.post(`/roommate-groups/${groupId}/chores`, choreData);
        return data;
    },

    // Add an expense
    addExpense: async (groupId, expenseData) => {
        const { data } = await api.post(`/roommate-groups/${groupId}/expenses`, expenseData);
        return data;
    },

    // Add a rule
    addRule: async (groupId, ruleData) => {
        const { data } = await api.post(`/roommate-groups/${groupId}/rules`, ruleData);
        return data;
    },
};

export default roommateGroupService;
