import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './state/**/*.{js,ts,jsx,tsx,mdx}',
    './audio/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        state: {
          void: '#0c0d0e',
          charcoal: '#121416',
          graphite: '#1a1d21',
          slate: '#23282e',
          steel: '#2e343c',
          concrete: '#3a424c',
          fog: '#4a5560',
          paper: '#c8c2b4',
          'paper-dim': '#8f8a7e',
          olive: '#3a4038',
          brass: '#7a6f52',
          amber: '#9a8258',
          crimson: '#6e4545',
          cyan: '#5a7373',
          gold: '#8a7d58',
        },
        faction: {
          people: '#6a9090',
          elites: '#8a7d58',
          security: '#8a5a5a',
          danger: '#7a4848',
          authority: '#9a8258',
        },
        board: {
          cream: '#c8c2b4',
          ink: '#e8e4dc',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        archive: '0.14em',
        label: '0.12em',
      },
      boxShadow: {
        panel: '0 1px 0 rgba(200, 194, 180, 0.06) inset, 0 4px 24px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(200, 194, 180, 0.04)',
        'panel-deep':
          '0 1px 0 rgba(200, 194, 180, 0.08) inset, 0 8px 32px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(200, 194, 180, 0.05)',
        card: '0 2px 0 rgba(200, 194, 180, 0.04) inset, 0 6px 20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(200, 194, 180, 0.06)',
        'card-hover':
          '0 1px 0 rgba(200, 194, 180, 0.1) inset, 0 16px 40px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(154, 130, 88, 0.2), 0 0 24px rgba(154, 130, 88, 0.06)',
        'card-pressed': '0 2px 8px rgba(0, 0, 0, 0.6) inset, 0 2px 6px rgba(0, 0, 0, 0.4)',
        btn: '0 1px 0 rgba(200, 194, 180, 0.08) inset, 0 2px 8px rgba(0, 0, 0, 0.4)',
        'btn-hover': '0 1px 0 rgba(200, 194, 180, 0.12) inset, 0 4px 16px rgba(0, 0, 0, 0.5), 0 0 12px rgba(154, 130, 88, 0.08)',
      },
      transitionTimingFunction: {
        ui: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'ui-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        ui: '200ms',
        slow: '350ms',
      },
      animation: {
        'fade-in': 'fadeIn 250ms cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
        'slide-up': 'slideUp 280ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 2.4s ease-in-out infinite',
        'scan': 'scan 8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.7' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      backgroundImage: {
        'panel-metal':
          'linear-gradient(165deg, rgba(46, 52, 60, 0.95) 0%, rgba(26, 29, 33, 0.98) 45%, rgba(18, 20, 22, 1) 100%)',
        'panel-paper':
          'linear-gradient(180deg, rgba(58, 66, 76, 0.6) 0%, rgba(35, 40, 46, 0.95) 100%)',
        'card-asset':
          'linear-gradient(155deg, rgba(58, 52, 40, 0.35) 0%, rgba(26, 29, 33, 0.98) 40%, rgba(18, 20, 22, 1) 100%)',
        'card-event':
          'linear-gradient(155deg, rgba(60, 35, 35, 0.25) 0%, rgba(22, 24, 28, 0.98) 45%, rgba(14, 15, 17, 1) 100%)',
        'scene-frame':
          'linear-gradient(180deg, rgba(35, 40, 46, 0.4) 0%, rgba(18, 20, 22, 0.9) 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
