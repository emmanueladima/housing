// Theme constants - Dynamic theme with ORANGE accents throughout
import { useTheme } from '../contexts/ThemeContext';

// Light theme colors
export const LIGHT_COLORS = {
    // Primary brand color (used for accents, buttons, active states)
    primary: '#DB4A2B',
    primaryLight: '#E86B4F',
    primaryDark: '#C43D22',

    // Clean white backgrounds
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    backgroundTertiary: '#F3F4F6',

    // Card and surface colors
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',

    // Text colors
    text: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',

    // Border colors
    border: '#E5E7EB',
    borderLight: '#F3F4F6',

    // Status colors
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // For liked/saved state
    heart: '#EF4444',

    // White with opacity (for overlays on images)
    white60: 'rgba(255, 255, 255, 0.6)',
    white80: 'rgba(255, 255, 255, 0.8)',
    white90: 'rgba(255, 255, 255, 0.9)',

    // Black with opacity
    black10: 'rgba(0, 0, 0, 0.1)',
    black40: 'rgba(0, 0, 0, 0.4)',

    // Orange accents (for pills, badges, highlights)
    accentBg: 'rgba(219, 74, 43, 0.1)',
    accentBgStrong: 'rgba(219, 74, 43, 0.15)',
};

// Dark theme colors
export const DARK_COLORS = {
    // Primary brand color
    primary: '#DB4A2B',
    primaryLight: '#E86B4F',
    primaryDark: '#C43D22',

    // Dark backgrounds
    background: '#0A0A0A',
    backgroundSecondary: '#141414',
    backgroundTertiary: '#1F1F1F',

    // Card and surface colors
    card: '#1A1A1A',
    cardElevated: '#252525',

    // Text colors
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    textMuted: '#666666',

    // Border colors
    border: '#2A2A2A',
    borderLight: '#333333',

    // Status colors
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // For liked/saved state
    heart: '#EF4444',

    // White with opacity
    white60: 'rgba(255, 255, 255, 0.6)',
    white80: 'rgba(255, 255, 255, 0.8)',
    white90: 'rgba(255, 255, 255, 0.9)',

    // Black with opacity
    black10: 'rgba(255, 255, 255, 0.1)',
    black40: 'rgba(255, 255, 255, 0.4)',

    // Orange accents
    accentBg: 'rgba(219, 74, 43, 0.2)',
    accentBgStrong: 'rgba(219, 74, 43, 0.25)',
};

// Default export for backwards compatibility (light theme)
export const COLORS = LIGHT_COLORS;

// Hook to get dynamic colors based on theme
export const useColors = () => {
    try {
        const { isDark } = useTheme();
        return isDark ? DARK_COLORS : LIGHT_COLORS;
    } catch {
        // Fallback if used outside ThemeProvider
        return LIGHT_COLORS;
    }
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export const BORDER_RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
};

export const FONT_SIZES = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    xxxl: 28,
    title: 32,
};

export const SHADOWS = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 6,
    },
};
