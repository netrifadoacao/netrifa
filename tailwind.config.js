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
          50: '#FCF9EE',
          100: '#F6EFD5',
          200: '#EBDDA3',
          300: '#E0C86E',
          400: '#D4AF37', // Gold Base
          500: '#B89628',
          600: '#96781C',
          700: '#755C14',
          800: '#5C4814',
          900: '#4D3C14',
          950: '#2E2208',
        },
        accent: {
          50: '#F5F7FA',
          100: '#EAEFF5',
          200: '#D0D9E6',
          300: '#A6B6CF',
          400: '#7390B3',
          500: '#4F6D96',
          600: '#3A5278',
          700: '#2F4161',
          800: '#28364F',
          900: '#242F42', // Rich Blue/Slate
          950: '#0F172A',
        },
        gold: {
          light: '#F4E06D',
          DEFAULT: '#D4AF37',
          dark: '#AA6C39',
          metallic: '#C5A028',
        },
        rich: {
          black: '#050505',
          gray: '#1A1A1A',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #F4E06D 50%, #AA6C39 100%)',
        'rich-gradient': 'linear-gradient(to bottom, #0F172A, #000000)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-slow': 'bounce 3s infinite',
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
      },
    },
  },
  plugins: [],
}
