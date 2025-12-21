import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { User } from '../services/authService';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<{ needsVerification: boolean }>;
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
                const storedUser = await authService.getStoredUser();
                const token = await authService.getToken();

                if (storedUser && token) {
                    // Verify token is still valid
                    try {
                        const freshUser = await authService.getCurrentUser();
                        setUser(freshUser);
                    } catch {
                        // Token invalid, clear storage
                        await authService.logout();
                        setUser(null);
                    }
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
        const response = await authService.login({ email, password });
        setUser(response.user);
    };

    const signup = async (name: string, email: string, password: string) => {
        await authService.signup({ name, email, password });
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
