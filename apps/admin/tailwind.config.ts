import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#b3d3ff',
          300: '#83b7ff',
          400: '#4a8dff',
          500: '#1f64ff',
          600: '#0a47db',
          700: '#0832a8',
          800: '#082b83',
          900: '#0b2569',
        },
      },
      fontFamily: {
        sans: ['"Inter var"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 12px 32px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
