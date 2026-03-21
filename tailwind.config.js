/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        bg: {
          DEFAULT: '#0a0f1e',
          2: '#111827',
          3: '#1a2234',
        },
        accent: {
          DEFAULT: '#4f8ef7',
          2: '#7c5cbf',
        },
        gold: '#f0a93a',
        teal: '#2dd4bf',
        coral: '#f87171',
        success: '#4ade80',
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        bounce: 'bounce 1.4s infinite',
        spin: 'spin 0.8s linear infinite',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
      },
    },
  },
  plugins: [],
}
