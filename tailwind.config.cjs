/** @type {import('tailwindcss').Config} */
const typography = require('@tailwindcss/typography');

module.exports = {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
    "./services/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // Scandinavian-inspired typography
      fontFamily: {
        sans: ['Söhne', 'ui-sans-serif', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.5' }],
        'xl': ['1.25rem', { lineHeight: '1.4' }],
        '2xl': ['1.5rem', { lineHeight: '1.35' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.15' }],
      },
      // Soft, muted color palette
      colors: {
        // Primary brand - subtle teal/sage
        primary: {
          DEFAULT: '#10a37f',
          50: '#f0fdf9',
          100: '#d0fae8',
          200: '#a3f3d3',
          300: '#6ee6ba',
          400: '#36d09c',
          500: '#10a37f',
          600: '#089467',
          700: '#087555',
          800: '#095c45',
          900: '#084c3a',
        },
        // Neutral grays - warm undertone
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#ececec',
          300: '#d9d9d9',
          400: '#b4b4b4',
          500: '#8e8e8e',
          600: '#6b6b6b',
          700: '#565656',
          800: '#353535',
          900: '#212121',
          950: '#0d0d0d',
        },
        // Background colors
        background: '#ffffff',
        foreground: '#0d0d0d',
        muted: '#f5f5f5',
        'muted-foreground': '#6b6b6b',
        // Surface colors for cards
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#fafafa',
          tertiary: '#f5f5f5',
        },
        // Border colors - very subtle
        border: {
          DEFAULT: '#ececec',
          light: '#f5f5f5',
          dark: '#d9d9d9',
        },
        // Accent colors
        accent: {
          DEFAULT: '#10a37f',
          light: '#d0fae8',
        },
        // Semantic colors
        success: '#10a37f',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      // Soft shadows
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
        'DEFAULT': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
        'md': '0 4px 12px -4px rgba(0, 0, 0, 0.06), 0 2px 6px -2px rgba(0, 0, 0, 0.04)',
        'lg': '0 8px 24px -8px rgba(0, 0, 0, 0.08), 0 4px 8px -4px rgba(0, 0, 0, 0.04)',
        'xl': '0 16px 40px -12px rgba(0, 0, 0, 0.1), 0 8px 16px -8px rgba(0, 0, 0, 0.05)',
        'inner': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'none': 'none',
      },
      // Border radius
      borderRadius: {
        'sm': '0.375rem',
        'DEFAULT': '0.5rem',
        'md': '0.625rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      // Spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      // Animations
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-up': 'fadeUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      // Transitions
      transitionDuration: {
        DEFAULT: '150ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [typography],
};
