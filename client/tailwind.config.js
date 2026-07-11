export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        neutral: '#F4F7F6',
        'accent-teal': '#50C8C2',
        'accent-teal-dark': '#3FAFA9',
        'accent-teal-light': '#7DDBD6',
        'accent-teal-glow': 'rgba(80, 200, 194, 0.25)',
        'text-charcoal': '#2C3E50',
        'text-muted': '#6B7B8D',
        'text-light': '#9BAEBF',
        'border-soft': '#E8EDEB',
        brand: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          dark: '#1D4ED8',
          dim: 'rgba(59, 130, 246, 0.12)',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(44, 62, 80, 0.06)',
        'card-hover': '0 12px 40px rgba(44, 62, 80, 0.12)',
        'glow-cyan': '0 0 24px rgba(34, 211, 238, 0.35)',
        'glow-cyan-lg': '0 0 48px rgba(34, 211, 238, 0.25)',
        'glow-indigo': '0 0 24px rgba(99, 102, 241, 0.35)',
        'glow-brand': '0 0 24px rgba(59, 130, 246, 0.4)',
        'glow-brand-lg': '0 0 56px rgba(59, 130, 246, 0.22)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
