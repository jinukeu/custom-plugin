import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Source Serif 4"', '"Source Serif Pro"', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f7f5f0',
          100: '#ebe6dc',
          200: '#d4ccba',
          300: '#b8ac93',
          400: '#998c72',
          500: '#7a6e58',
          600: '#5c5340',
          700: '#3e382b',
          800: '#26221b',
          900: '#14120d',
          950: '#0a0907',
        },
        accent: {
          DEFAULT: '#c4634a',
          muted: '#a85235',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '68ch',
          },
        },
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { maxHeight: '0', opacity: '0' },
          '100%': { maxHeight: '1000px', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'slide-down': 'slide-down 300ms ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config
