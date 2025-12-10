import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Developer Mode: Auto-login for testing
    const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';

    if (isDevMode) {
      console.log('🔧 Dev Mode: Attempting auto-login...');
      authService.login({
        email: 'dev@oregonstate.edu',
        password: 'devtest123'
      })
        .then((data) => {
          setUser(data.user);
          setIsAuthenticated(true);
          console.log('✅ Dev Mode: Auto-login successful');
        })
        .catch((error) => {
          console.log('⚠️ Dev Mode: Auto-login failed, checking stored credentials...');
          // Fallback to normal auth flow
          checkStoredAuth();
        })
        .finally(() => {
          setLoading(false);
        });
      return;
    }

    // Normal auth flow
    checkStoredAuth();
  }, []);

  const checkStoredAuth = () => {
    const storedUser = authService.getStoredUser();
    const token = authService.getToken();

    if (storedUser && token) {
      setUser(storedUser);
      setIsAuthenticated(true);

      // Fetch fresh user data
      authService.getCurrentUser()
        .then((freshUser) => {
          setUser(freshUser);
        })
        .catch((error) => {
          console.error('Error fetching user:', error);
          // Token might be invalid, logout
          logout();
        });
    }

    setLoading(false);
  };

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const signup = async (userData) => {
    console.log('🔐 AuthContext.signup: Starting signup...');
    const data = await authService.signup(userData);
    console.log('🔐 AuthContext.signup: Signup complete, setting user state');
    setUser(data.user);
    setIsAuthenticated(true);
    console.log('🔐 AuthContext.signup: User state set, returning data');
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    try {
      const freshUser = await authService.getCurrentUser();
      setUser(freshUser);
      return freshUser;
    } catch (error) {
      console.error('Error refreshing user:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

