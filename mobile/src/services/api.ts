import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =================================================================
// API URL CONFIGURATION
// =================================================================
// For LOCAL development (backend running on your computer):
//   1. Find your computer's local IP: run 'ipconfig getifaddr en0' in terminal
//   2. Replace 'YOUR_LOCAL_IP' below with that IP (e.g., '192.168.1.100')
//   3. Make sure backend is running: cd backend && npm run dev
//
// For DEPLOYED backend (Render, etc.):
//   Replace with your deployed URL, e.g., 'https://your-app.onrender.com/api'
// =================================================================

// CHANGE THIS to your backend URL:
const API_URL = 'http://172.16.46.110:5001/api'; // Local development
// const API_URL = 'https://your-deployed-backend.onrender.com/api'; // Production

console.log('📡 Mobile API configured to:', API_URL);

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
});

// Request interceptor to add token
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response) {
            // Token expired or invalid
            if (error.response.status === 401) {
                await AsyncStorage.removeItem('token');
                await AsyncStorage.removeItem('user');
                // Navigation to login will be handled by AuthContext
            }

            // Extract error message
            const message =
                error.response.data?.error ||
                error.response.data?.message ||
                'An error occurred';
            return Promise.reject(new Error(message));
        }

        if (error.request) {
            return Promise.reject(new Error('No response from server. Please check your connection.'));
        }

        return Promise.reject(error);
    }
);

export default api;
