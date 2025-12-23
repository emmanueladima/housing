import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export interface User {
    id: string;
    _id?: string; // Some endpoints return _id
    email: string;
    firstName: string;
    lastName: string;
    name?: string; // Computed field
    userType: string;
    isVerified: boolean;
    profilePhoto?: string;
    phone?: string;
    bio?: string;
    favorites?: string[];
    savedProfiles?: string[];
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: User;
    message?: string;
    error?: string;
    needsVerification?: boolean;
}

const authService = {
    // Sign up
    async signup(userData: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        phone: string;
        school: string;
        graduationYear: number;
    }): Promise<AuthResponse> {
        const response = await api.post('/auth/signup', userData);
        // Don't store token yet - user needs to verify email
        return response.data;
    },

    // Login
    async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
        console.log('🔐 Attempting login for:', credentials.email);
        const response = await api.post('/auth/login', credentials);
        console.log('📡 Login response:', response.data.success ? 'Success' : 'Failed');

        if (response.data.success && response.data.token) {
            // Add computed name field
            const user = {
                ...response.data.user,
                name: `${response.data.user.firstName} ${response.data.user.lastName}`,
                _id: response.data.user.id,
            };
            await AsyncStorage.setItem('token', response.data.token);
            await AsyncStorage.setItem('user', JSON.stringify(user));
            return { ...response.data, user };
        }

        // Handle error responses
        if (!response.data.success) {
            throw new Error(response.data.error || 'Login failed');
        }

        return response.data;
    },

    // Logout
    async logout(): Promise<void> {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
    },

    // Get current user from API
    async getCurrentUser(): Promise<User> {
        const response = await api.get('/auth/me');
        if (response.data.user) {
            await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data.user;
    },

    // Verify email
    async verifyEmail(token: string): Promise<{ message: string }> {
        const response = await api.get(`/auth/verify-email/${token}`);
        return response.data;
    },

    // Update profile
    async updateProfile(profileData: Partial<User>): Promise<User> {
        const response = await api.put('/auth/profile', profileData);
        if (response.data.user) {
            await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data.user;
    },

    // Resend verification email
    async resendVerification(): Promise<{ message: string }> {
        const response = await api.post('/auth/resend-verification');
        return response.data;
    },

    // Get stored user from AsyncStorage
    async getStoredUser(): Promise<User | null> {
        try {
            const userStr = await AsyncStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch {
            return null;
        }
    },

    // Get stored token
    async getToken(): Promise<string | null> {
        return await AsyncStorage.getItem('token');
    },

    // Check if authenticated
    async isAuthenticated(): Promise<boolean> {
        const token = await this.getToken();
        return !!token;
    },
};

export default authService;
