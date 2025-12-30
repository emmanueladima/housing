import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User } from '../services/authService';
import lifestyleProfileService from '../services/lifestyleProfileService';

interface SignupData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    school: string;
    graduationYear: number;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    needsOnboarding: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (data: SignupData) => Promise<{ needsVerification: boolean }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [needsOnboarding, setNeedsOnboarding] = useState(false);

    // Check if user needs onboarding (only for new users after first login)
    const checkOnboardingStatus = async () => {
        try {
            const profile = await lifestyleProfileService.getMyProfile();
            // User needs onboarding if they don't have a profile at all
            return !profile;
        } catch {
            return true;
        }
    };

    // Restore session on app load
    useEffect(() => {
        const restoreSession = async () => {
            try {
                console.log('🔄 Restoring session...');
                const storedUser = await authService.getStoredUser();
                const token = await authService.getToken();

                console.log('📦 Stored user:', storedUser?.email || 'none');
                console.log('🎫 Token exists:', !!token);

                if (storedUser && token) {
                    setUser(storedUser);
                    console.log('✅ Session restored for:', storedUser.email);
                    // TEMPORARY: Force onboarding to show for testing
                    setNeedsOnboarding(true);
                }
            } catch (error) {
                console.error('Error restoring session:', error);
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, []);

    const login = async (email: string, password: string) => {
        console.log('🔐 AuthContext login:', email);
        const response = await authService.login({ email, password });
        console.log('✅ Login successful, setting user');
        setUser(response.user);
        // Check if user needs onboarding after login
        const needsIt = await checkOnboardingStatus();
        setNeedsOnboarding(needsIt);
    };

    const signup = async (data: SignupData) => {
        await authService.signup(data);
        // New users will need onboarding after they verify email and login
        return { needsVerification: true };
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        setNeedsOnboarding(false);
    };

    const refreshUser = async () => {
        try {
            const freshUser = await authService.getCurrentUser();
            setUser(freshUser);
        } catch (error) {
            console.error('Error refreshing user:', error);
        }
    };

    const completeOnboarding = () => {
        setNeedsOnboarding(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                needsOnboarding,
                login,
                signup,
                logout,
                refreshUser,
                completeOnboarding,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
