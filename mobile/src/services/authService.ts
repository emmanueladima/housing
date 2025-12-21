import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export interface User {
    _id: string;
    email: string;
    name: string;
    role: string;
    isEmailVerified: boolean;
    profilePhoto?: string;
    phone?: string;
    bio?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
    message?: string;
}

const authService = {
    // Sign up
    async signup(userData: { name: string; email: string; password: string }): Promise<AuthResponse> {
        const response = await api.post('/auth/signup', userData);
        // Don't store token yet - user needs to verify email
        return response.data;
    },

    // Login
    async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
        const response = await api.post('/auth/login', credentials);
        if (response.data.token) {
            await AsyncStorage.setItem('token', response.data.token);
            await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
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
