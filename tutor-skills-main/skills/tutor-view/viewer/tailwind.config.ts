import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontSize: {
        display: ['var(--fs-display)', { lineHeight: 'var(--lh-display)', letterSpacing: 'var(--ls-display)', fontWeight: 'var(--fw-display)' }],
        h1: ['var(--fs-h1)', { lineHeight: 'var(--lh-h1)', letterSpacing: 'var(--ls-h1)', fontWeight: 'var(--fw-h1)' }],
        h2: ['var(--fs-h2)', { lineHeight: 'var(--lh-h2)', letterSpacing: 'var(--ls-h2)', fontWeight: 'var(--fw-h2)' }],
        h3: ['var(--fs-h3)', { lineHeight: 'var(--lh-h3)', letterSpacing: 'var(--ls-h3)', fontWeight: 'var(--fw-h3)' }],
        h4: ['var(--fs-h4)', { lineHeight: 'var(--lh-h4)', letterSpacing: 'var(--ls-h4)', fontWeight: 'var(--fw-h4)' }],
        body: ['var(--fs-body)', { lineHeight: 'var(--lh-body)', letterSpacing: 'var(--ls-body)', fontWeight: 'var(--fw-body)' }],
        ui: ['var(--fs-ui)', { lineHeight: 'var(--lh-ui)', letterSpacing: 'var(--ls-ui)', fontWeight: 'var(--fw-ui)' }],
        small: ['var(--fs-small)', { lineHeight: 'var(--lh-small)', letterSpacing: 'var(--ls-small)', fontWeight: 'var(--fw-small)' }],
        micro: ['var(--fs-micro)', { lineHeight: 'var(--lh-micro)', letterSpacing: 'var(--ls-micro)', fontWeight: 'var(--fw-micro)' }],
        code: ['var(--fs-code)', { lineHeight: 'var(--lh-code)', letterSpacing: 'var(--ls-code)', fontWeight: 'var(--fw-code)' }],
      },
      fontFamily: {
        sans: [
          '"Pretendard Variable"',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          '"Helvetica Neue"',
          '"Segoe UI"',
          '"Apple SD Gothic Neo"',
          '"Noto Sans KR"',
          '"Malgun Gothic"',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'SFMono-Regular',
          'Menlo',
          'Consolas',
          '"Liberation Mono"',
          'monospace',
        ],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'stagger': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 260ms cubic-bezier(0.2, 0.6, 0.2, 1) both',
        'scale-in': 'scale-in 160ms cubic-bezier(0.2, 0.6, 0.2, 1) both',
        'stagger': 'stagger 320ms cubic-bezier(0.2, 0.6, 0.2, 1) both',
      },
    },
  },
  plugins: [],
} satisfies Config
