/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          900: '#0c4a6e',
        },
        'danger': {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
          900: '#7f1d1d',
        },
        'warning': {
          50: '#fffbeb',
          500: '#f59e0b',
          900: '#78350f',
        },
        'success': {
          50: '#f0fdf4',
          500: '#22c55e',
          900: '#14532d',
        }
      }
    },
  },
  plugins: [],
}
