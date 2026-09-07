export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F6F5F1',
        paper: '#FFFFFF',
        'paper-soft': '#FBFAF7',
        ink: '#1D1F1A',
        slate: '#6B6D64',
        mist: '#9C9E93',
        line: '#E6E3D8',
        'line-strong': '#D8D4C6',
        indigo: {
          DEFAULT: '#5850E6',
          soft: '#EEEDFB',
          dark: '#413AC2',
        },
        clover: {
          DEFAULT: '#2F8F6B',
          soft: '#E7F4EC',
        },
        amber: {
          DEFAULT: '#B8873D',
          soft: '#F7EEDE',
        },
        rust: {
          DEFAULT: '#C1543D',
          soft: '#FBEBE6',
        },
        // --- Legacy tokens: kept only so pages not yet migrated to the new
        // light system (Admin, Marketplace, Snippets, Profile, auth, modals)
        // keep rendering correctly. Remove once every page has been redesigned. ---
        brand: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          dark: '#1D4ED8',
          dim: 'rgba(59, 130, 246, 0.12)',
        },
        'accent-teal': '#50C8C2',
      },
      fontFamily: {
        display: ['"Manrope"', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        shell: '1240px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(29, 31, 26, 0.04), 0 8px 24px rgba(29, 31, 26, 0.05)',
        'card-hover': '0 2px 4px rgba(29, 31, 26, 0.05), 0 16px 40px rgba(29, 31, 26, 0.09)',
        raised: '0 1px 2px rgba(29, 31, 26, 0.04), 0 20px 48px rgba(29, 31, 26, 0.08)',
        ring: '0 0 0 3px rgba(88, 80, 230, 0.14)',
        // --- Legacy glow shadows: kept for not-yet-migrated pages only. ---
        'glow-cyan': '0 0 24px rgba(34, 211, 238, 0.35)',
        'glow-cyan-lg': '0 0 48px rgba(34, 211, 238, 0.25)',
        'glow-indigo': '0 0 24px rgba(99, 102, 241, 0.35)',
        'glow-brand': '0 0 24px rgba(59, 130, 246, 0.4)',
        'glow-brand-lg': '0 0 56px rgba(59, 130, 246, 0.22)',
      },
      borderRadius: {
        md: '10px',
        lg: '14px',
        xl: '18px',
        '2xl': '22px',
      },
      transitionTimingFunction: {
        soft: 'cubic-bezier(0.22, 1, 0.36, 1)',
        // --- Legacy: used by the not-yet-migrated .btn-primary/.btn-outline definitions in index.css. ---
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
