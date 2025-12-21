import api from './api';

export interface LifestyleProfile {
    _id: string;
    user: {
        _id: string;
        name: string;
        profilePhoto?: string;
    };
    bio?: string;
    year?: string;
    major?: string;
    budget?: {
        min: number;
        max: number;
    };
    sleepSchedule?: string;
    noiseLevel?: string;
    cleanliness?: string;
    guests?: string;
    smoking?: boolean;
    pets?: boolean;
    interests?: string[];
    matchScore?: number;
    isSaved?: boolean;
}

export interface ProfileFilters {
    major?: string;
    year?: string;
    budgetMin?: number;
    budgetMax?: number;
}

const lifestyleProfileService = {
    // Get my lifestyle profile
    async getMyProfile(): Promise<LifestyleProfile | null> {
        try {
            const response = await api.get('/lifestyle-profiles/me');
            return response.data.profile;
        } catch {
            return null;
        }
    },

    // Update my lifestyle profile
    async updateMyProfile(profileData: Partial<LifestyleProfile>): Promise<LifestyleProfile> {
        const response = await api.post('/lifestyle-profiles/me', profileData);
        return response.data.profile;
    },

    // Get all profiles (discovery)
    async getAllProfiles(): Promise<LifestyleProfile[]> {
        const response = await api.get('/lifestyle-profiles/all');
        return response.data.profiles || response.data;
    },

    // Get matches with filters
    async getMatches(filters: ProfileFilters = {}): Promise<LifestyleProfile[]> {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) params.append(key, String(value));
        });
        const response = await api.get(`/lifestyle-profiles/matches?${params.toString()}`);
        return response.data.profiles || response.data;
    },

    // Get specific profile by ID
    async getProfile(id: string): Promise<LifestyleProfile> {
        const response = await api.get(`/lifestyle-profiles/${id}`);
        return response.data.profile || response.data;
    },

    // Toggle saved status
    async toggleSavedProfile(id: string): Promise<{ isSaved: boolean }> {
        const response = await api.post(`/lifestyle-profiles/save/${id}`);
        return response.data;
    },

    // Get saved profiles
    async getSavedProfiles(): Promise<LifestyleProfile[]> {
        const response = await api.get('/lifestyle-profiles/saved');
        return response.data.profiles || response.data;
    },
};

export default lifestyleProfileService;
