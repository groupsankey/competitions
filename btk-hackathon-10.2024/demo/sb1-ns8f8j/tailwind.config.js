/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'San Francisco',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
      colors: {
        indigo: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#b3c5ff',
          400: '#809fff',
          500: '#4d7fff',
          600: '#1a5fff',
          700: '#0047ff',
          800: '#0036cc',
          900: '#002999',
        },
      },
      borderRadius: {
        '2xl': '1.25rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
};