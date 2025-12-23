import api from './api';

export interface LifestyleProfile {
    _id: string;
    user: {
        _id: string;
        name?: string;
        firstName?: string;
        lastName?: string;
        profilePhoto?: string;
    };
    bio?: string;
    age?: number;
    gender?: string;
    year?: string;
    major?: string;
    budget?: {
        min: number;
        max: number;
    };
    budgetMin?: number;
    budgetMax?: number;
    sleepSchedule?: string;
    bedtime?: number;
    wakeup?: number;
    sleepTime?: string;
    wakeTime?: string;
    noiseLevel?: number | string;
    cleanliness?: number | string;
    guests?: string;
    guestsFrequency?: string;
    smoking?: boolean | string;
    drinking?: boolean;
    hasPets?: boolean;
    pets?: boolean;
    petAllergies?: boolean;
    interests?: string[];
    vibeTags?: string[];
    lookingForRoommate?: boolean;
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
        try {
            const response = await api.get('/lifestyle-profiles/all');
            const data = response.data;
            // Handle different response formats
            if (Array.isArray(data)) return data;
            if (Array.isArray(data?.profiles)) return data.profiles;
            console.warn('Unexpected getAllProfiles response:', data);
            return [];
        } catch (error) {
            console.error('getAllProfiles error:', error);
            return [];
        }
    },

    // Get matches with filters
    async getMatches(filters: ProfileFilters = {}): Promise<LifestyleProfile[]> {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) params.append(key, String(value));
            });
            const response = await api.get(`/lifestyle-profiles/matches?${params.toString()}`);
            const data = response.data;
            // Handle different response formats
            if (Array.isArray(data)) return data;
            if (Array.isArray(data?.profiles)) return data.profiles;
            console.warn('Unexpected getMatches response:', data);
            return [];
        } catch (error) {
            console.error('getMatches error:', error);
            return [];
        }
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
        try {
            const response = await api.get('/lifestyle-profiles/saved');
            const data = response.data;
            if (Array.isArray(data)) return data;
            if (Array.isArray(data?.profiles)) return data.profiles;
            return [];
        } catch {
            return [];
        }
    },
};

export default lifestyleProfileService;
