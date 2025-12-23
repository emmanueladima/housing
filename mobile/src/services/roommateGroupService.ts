import api from './api';

export interface GroupMember {
    user: {
        _id: string;
        name?: string;
        firstName?: string;
        lastName?: string;
        profilePhoto?: string;
    };
    role: 'admin' | 'member';
    major?: string;
}

export interface RoommateGroup {
    _id: string;
    name: string;
    description?: string;
    members: GroupMember[];
    maxMembers: number;
    budget?: {
        min: number;
        max: number;
    };
    preferredArea?: string;
    location?: string;
    vibe?: string[];
    moveInDate?: string;
    preferences?: {
        sleepSchedule?: string;
        noiseLevel?: string;
        cleanliness?: string;
        pets?: boolean;
    };
    spotsAvailable: number;
    createdAt: string;
}

const roommateGroupService = {
    // Get all groups (Discovery)
    async getAllGroups(): Promise<RoommateGroup[]> {
        try {
            const response = await api.get('/roommate-groups');
            const data = response.data;
            // Handle different response formats
            if (Array.isArray(data)) return data;
            if (Array.isArray(data?.groups)) return data.groups;
            console.warn('Unexpected getAllGroups response:', data);
            return [];
        } catch (error) {
            console.error('getAllGroups error:', error);
            return [];
        }
    },

    // Get a single group by ID
    async getGroupById(groupId: string): Promise<RoommateGroup> {
        const response = await api.get(`/roommate-groups/${groupId}`);
        return response.data.group || response.data;
    },

    // Get my group (Toolkit)
    async getMyGroup(): Promise<RoommateGroup | null> {
        try {
            const response = await api.get('/roommate-groups/my-group');
            return response.data.group || response.data;
        } catch {
            return null;
        }
    },

    // Create a new group
    async createGroup(groupData: Partial<RoommateGroup>): Promise<RoommateGroup> {
        const response = await api.post('/roommate-groups', groupData);
        return response.data.group || response.data;
    },

    // Request to join a group
    async requestJoin(groupId: string, message: string = ''): Promise<{ message: string }> {
        const response = await api.post(`/roommate-groups/${groupId}/request-join`, { message });
        return response.data;
    },

    // Leave group
    async leaveGroup(groupId: string): Promise<{ message: string }> {
        const response = await api.post(`/roommate-groups/${groupId}/leave`);
        return response.data;
    },
};

export default roommateGroupService;
