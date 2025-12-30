import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User } from '../services/authService';

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
    login: (email: string, password: string) => Promise<void>;
    signup: (data: SignupData) => Promise<{ needsVerification: boolean }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
                    // Use stored user immediately for fast app load
                    setUser(storedUser);
                    console.log('✅ Session restored for:', storedUser.email);
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
    };

    const signup = async (data: SignupData) => {
        await authService.signup(data);
        // User needs to verify email before logging in
        return { needsVerification: true };
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    const refreshUser = async () => {
        try {
            const freshUser = await authService.getCurrentUser();
            setUser(freshUser);
        } catch (error) {
            console.error('Error refreshing user:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                signup,
                logout,
                refreshUser,
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
