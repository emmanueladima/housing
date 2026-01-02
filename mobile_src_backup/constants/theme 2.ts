// Theme constants - WHITE theme with ORANGE accents throughout

export const COLORS = {
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
    accentBg: 'rgba(219, 74, 43, 0.1)',     // Light orange background
    accentBgStrong: 'rgba(219, 74, 43, 0.15)', // Slightly stronger
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
