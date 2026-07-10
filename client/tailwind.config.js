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
      },
      boxShadow: {
        card: '0 4px 24px rgba(44, 62, 80, 0.06)',
        'card-hover': '0 12px 40px rgba(44, 62, 80, 0.12)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
