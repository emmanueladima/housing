import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =================================================================
// API URL CONFIGURATION
// =================================================================
// PRODUCTION: Uses the deployed Render backend
// LOCAL DEV: Change USE_LOCAL to true and update LOCAL_IP
// =================================================================

const USE_LOCAL = false; // Set to true for local development
const LOCAL_IP = '172.16.46.110'; // Your Mac's IP (run: ipconfig getifaddr en0)

const API_URL = USE_LOCAL
    ? `http://${LOCAL_IP}:5001/api`
    : 'https://collegio-backend-j053.onrender.com/api';

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
