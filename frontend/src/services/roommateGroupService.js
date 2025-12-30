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

    // ==============================
    // Timeline Events
    // ==============================

    // Add a shared event
    addEvent: async (groupId, eventData) => {
        const { data } = await api.post(`/roommate-groups/${groupId}/events`, eventData);
        return data;
    },

    // Delete a shared event
    deleteEvent: async (groupId, eventId) => {
        const { data } = await api.delete(`/roommate-groups/${groupId}/events/${eventId}`);
        return data;
    },

    // ==============================
    // Chores
    // ==============================

    // Add a chore
    addChore: async (groupId, choreData) => {
        const { data } = await api.post(`/roommate-groups/${groupId}/chores`, choreData);
        return data;
    },

    // Update a chore (toggle completed, etc.)
    updateChore: async (groupId, choreId, choreData) => {
        const { data } = await api.put(`/roommate-groups/${groupId}/chores/${choreId}`, choreData);
        return data;
    },

    // Delete a chore
    deleteChore: async (groupId, choreId) => {
        const { data } = await api.delete(`/roommate-groups/${groupId}/chores/${choreId}`);
        return data;
    },

    // ==============================
    // Expenses
    // ==============================

    // Add an expense
    addExpense: async (groupId, expenseData) => {
        const { data } = await api.post(`/roommate-groups/${groupId}/expenses`, expenseData);
        return data;
    },

    // Update an expense (settle, etc.)
    updateExpense: async (groupId, expenseId, expenseData) => {
        const { data } = await api.put(`/roommate-groups/${groupId}/expenses/${expenseId}`, expenseData);
        return data;
    },

    // Delete an expense
    deleteExpense: async (groupId, expenseId) => {
        const { data } = await api.delete(`/roommate-groups/${groupId}/expenses/${expenseId}`);
        return data;
    },

    // ==============================
    // Rules
    // ==============================

    // Add a rule
    addRule: async (groupId, ruleData) => {
        const { data } = await api.post(`/roommate-groups/${groupId}/rules`, ruleData);
        return data;
    },

    // Delete my group
    deleteMyGroup: async () => {
        const { data } = await api.delete('/roommate-groups/my-group');
        return data;
    },
};

export default roommateGroupService;
