/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'glass': {
          50: 'rgba(255, 255, 255, 0.1)',
          100: 'rgba(255, 255, 255, 0.2)',
          200: 'rgba(255, 255, 255, 0.3)',
          300: 'rgba(255, 255, 255, 0.4)',
          500: 'rgba(255, 255, 255, 0.6)',
        },
        'dark-glass': {
          50: 'rgba(0, 0, 0, 0.1)',
          100: 'rgba(0, 0, 0, 0.2)',
          200: 'rgba(0, 0, 0, 0.3)',
          300: 'rgba(0, 0, 0, 0.4)',
          500: 'rgba(0, 0, 0, 0.6)',
        },
        'voice': {
          primary: '#4F46E5',
          secondary: '#7C3AED',
          accent: '#06B6D4',
          glow: '#3B82F6',
        }
      },
      fontFamily: {
        'cursive': ['Brush Script MT', 'cursive'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'wave': 'wave 1.5s ease-in-out infinite',
        'gradient-border': 'gradient-border 3s linear infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { 
            opacity: '0.5',
            transform: 'scale(1)',
            boxShadow: '0 0 20px rgba(79, 70, 229, 0.3)'
          },
          '50%': { 
            opacity: '1',
            transform: 'scale(1.05)',
            boxShadow: '0 0 40px rgba(79, 70, 229, 0.6)'
          },
        },
        'wave': {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(1.5)' },
        },
        'gradient-border': {
          '0%': { 
            background: 'linear-gradient(0deg, #8B5CF6, #EC4899, #8B5CF6)',
          },
          '25%': { 
            background: 'linear-gradient(90deg, #8B5CF6, #EC4899, #8B5CF6)',
          },
          '50%': { 
            background: 'linear-gradient(180deg, #8B5CF6, #EC4899, #8B5CF6)',
          },
          '75%': { 
            background: 'linear-gradient(270deg, #8B5CF6, #EC4899, #8B5CF6)',
          },
          '100%': { 
            background: 'linear-gradient(360deg, #8B5CF6, #EC4899, #8B5CF6)',
          },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0px)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0px)', opacity: '1' },
        }
      },
      boxShadow: {
        'glow': '0 0 20px rgba(79, 70, 229, 0.3)',
        'glow-lg': '0 0 40px rgba(79, 70, 229, 0.4)',
      }
    },
  },
  plugins: [],
} 