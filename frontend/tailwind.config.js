/** @type {import('tailwindcss').Config} */
// Cache bust v2 - Force Tailwind rebuild
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#E4E2DD', // User requested beige
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#DB4A2B', // User requested orange
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Override default orange to apply changes globally
        orange: {
          50: '#E4E2DD', // User requested beige
          100: '#F5EBE0', // Slightly darker beige/warm gray
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#E85D3F', // Lighter version of DB4A2B
          600: '#DB4A2B', // User requested orange
          700: '#B0361C', // Darker version for hover
          800: '#9a3412',
          900: '#7c2d12',
        },
        accent: {
          orange: {
            light: '#fed7aa',
            DEFAULT: '#DB4A2B', // Updated to new orange
            dark: '#B0361C',
          },
          red: {
            light: '#fecaca',
            DEFAULT: '#ef4444',
            dark: '#dc2626',
          },
          purple: {
            light: '#c4b5fd',
            DEFAULT: '#8b5cf6',
            dark: '#7c3aed',
          },
          pink: {
            light: '#fbcfe8',
            DEFAULT: '#ec4899',
            dark: '#db2777',
          },
          coral: {
            light: '#fecdd3',
            DEFAULT: '#fb7185',
            dark: '#f43f5e',
          },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(251, 146, 60, 0.5)',
        'glow-lg': '0 0 40px rgba(251, 146, 60, 0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        blob: {
          '0%, 100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
        },
      },
    },
  },
  plugins: [],
};

