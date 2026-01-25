/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-poppins)', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8', // Neon Blue Base
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        secondary: {
          50: '#fff0f0',
          100: '#ffdede',
          200: '#ffc2c2',
          300: '#ff9696',
          400: '#ff5c5c',
          500: '#ff2929', // Neon Red Base
          600: '#ed0000',
          700: '#c70000',
          800: '#a30000',
          900: '#850505',
          950: '#4a0000',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        'rich-black': '#020205', // Deep space black
        'rich-gray': '#0a0a12', // Dark tech gray
        'neon-red': '#FF0000',
        'neon-blue': '#0088FF',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-red': 'glowRed 2s ease-in-out infinite alternate',
        'glow-amber': 'glowAmber 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #0ea5e9, 0 0 10px #0ea5e9' },
          '100%': { boxShadow: '0 0 20px #0ea5e9, 0 0 30px #0ea5e9' },
        },
        glowRed: {
          '0%': { boxShadow: '0 0 5px #ff2929, 0 0 10px #ff2929' },
          '100%': { boxShadow: '0 0 20px #ff2929, 0 0 30px #ff2929' },
        },
        glowAmber: {
          '0%': { boxShadow: '0 0 5px #f59e0b, 0 0 10px #f59e0b' },
          '100%': { boxShadow: '0 0 20px #f59e0b, 0 0 30px #f59e0b' },
        }
      },
      backgroundImage: {
        'cyber-grid': "linear-gradient(to right, #1f2937 1px, transparent 1px), linear-gradient(to bottom, #1f2937 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}
