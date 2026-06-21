/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#14532D', dark: '#0F3D21', light: '#1F6B3A' },
        secondary: '#1F6B3A',
        accent: '#6FA888',
        cream: '#F6FAF7',
      },
      fontFamily: {
        display: ['Baloo 2', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
        sans: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0F3D21 0%, #14532D 50%, #1F6B3A 100%)',
        'gradient-soft': 'linear-gradient(135deg, #6FA888 0%, #B8D9C5 100%)',
        'gradient-hero': 'linear-gradient(160deg, #F6FAF7 0%, #E3EFE8 50%, #D2E6DB 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
      },
    },
  },
  plugins: [],
};