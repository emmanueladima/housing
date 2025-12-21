import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API URL - update this to your deployed backend URL
const API_URL = 'https://housing-1-qm1p.onrender.com/api';
// For local development: 'http://localhost:5001/api'

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
