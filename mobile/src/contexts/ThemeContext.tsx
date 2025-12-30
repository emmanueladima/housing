import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Theme {
    dark: boolean;
    colors: {
        primary: string;
        primaryLight: string;
        background: string;
        backgroundSecondary: string;
        card: string;
        text: string;
        textSecondary: string;
        textMuted: string;
        border: string;
        success: string;
        error: string;
        warning: string;
    };
}

export const lightTheme: Theme = {
    dark: false,
    colors: {
        primary: '#FF6B35',
        primaryLight: '#FFF0EB',
        background: '#F8F9FA',
        backgroundSecondary: '#F1F3F5',
        card: '#FFFFFF',
        text: '#1A1A2E',
        textSecondary: '#6C757D',
        textMuted: '#ADB5BD',
        border: '#E9ECEF',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
    },
};

export const darkTheme: Theme = {
    dark: true,
    colors: {
        primary: '#FF6B35',
        primaryLight: '#3D2620',
        background: '#0D0D0D',
        backgroundSecondary: '#1A1A1A',
        card: '#252525',
        text: '#FFFFFF',
        textSecondary: '#A0A0A0',
        textMuted: '#666666',
        border: '#333333',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
    },
};

interface ThemeContextType {
    theme: Theme;
    isDark: boolean;
    toggleTheme: () => void;
    setDarkMode: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (stored !== null) {
                setIsDark(stored === 'dark');
            } else {
                setIsDark(systemColorScheme === 'dark');
            }
        } catch (error) {
            console.error('Error loading theme:', error);
            setIsDark(systemColorScheme === 'dark');
        }
    };

    const saveThemePreference = async (dark: boolean) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const toggleTheme = () => {
        const newValue = !isDark;
        setIsDark(newValue);
        saveThemePreference(newValue);
    };

    const setDarkMode = (dark: boolean) => {
        setIsDark(dark);
        saveThemePreference(dark);
    };

    const theme = isDark ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
