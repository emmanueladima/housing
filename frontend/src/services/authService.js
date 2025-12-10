import api from './api';

const authService = {
  // Sign up
  async signup(userData) {
    console.log('📡 authService.signup: Making API call...');
    const response = await api.post('/auth/signup', userData);
    console.log('📡 authService.signup: API response received:', response.data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('📡 authService.signup: Token and user saved to localStorage');
    }
    return response.data;
  },

  // Login
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data.user;
  },

  // Verify email
  async verifyEmail(token) {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  // Update profile
  async updateProfile(profileData) {
    const response = await api.put('/auth/profile', profileData);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Resend verification email
  async resendVerification() {
    const response = await api.post('/auth/resend-verification');
    return response.data;
  },

  // Get stored user
  getStoredUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get stored token
  getToken() {
    return localStorage.getItem('token');
  },

  // Check if authenticated
  isAuthenticated() {
    return !!this.getToken();
  },
};

export default authService;

