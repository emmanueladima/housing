export const theme = {
    colors: {
        primary: '#F97316', // Orange-500
        background: {
            light: '#ffffff',
            dark: '#0f172a', // Slate-900
        },
        text: {
            light: '#1e293b', // Slate-800
            dark: '#f8fafc', // Slate-50
        },
        glass: {
            light: 'rgba(255, 255, 255, 0.7)',
            dark: 'rgba(15, 23, 42, 0.6)',
            border: 'rgba(255, 255, 255, 0.25)',
            borderDark: 'rgba(255, 255, 255, 0.1)',
            highlight: 'rgba(255, 255, 255, 0.4)',
            highlightDark: 'rgba(255, 255, 255, 0.15)',
        }
    },
    blur: {
        intensity: {
            light: 25,
            dark: 40,
            strong: 80,  // For liquid glass effect
            subtle: 15,  // For subtle glass effect
        }
    },
    shadows: {
        glass: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 8,
        },
        glassStrong: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.25,
            shadowRadius: 24,
            elevation: 12,
        }
    }
};
