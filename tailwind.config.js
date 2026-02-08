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
        steel: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        primary: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        'rich-black': '#09090b',
        'rich-gray': '#18181b',
        gold: {
          50: '#FDF8ED',
          100: '#F5E6C8',
          200: '#E8D5A3',
          300: '#D4AF37',
          400: '#C5A028',
          500: '#B8860B',
          600: '#9A7B00',
          700: '#7D6200',
          800: '#634D00',
          900: '#4A3A00',
          950: '#2E2400',
        },
        silver: {
          50: '#FAFAFC',
          100: '#F0F0F4',
          200: '#E2E2EA',
          300: '#C8C8D4',
          400: '#A8A8B8',
          500: '#88889C',
          600: '#6C6C80',
          700: '#505066',
          800: '#38384A',
          900: '#242432',
          950: '#14141C',
        },
      },
      boxShadow: {
        'gleam': 'inset 0 1px 0 0 rgba(255,255,255,0.2)',
        'gleam-gold': 'inset 0 1px 0 0 rgba(255,255,255,0.35), 0 0 20px rgba(212,175,55,0.15)',
        'gleam-silver': 'inset 0 1px 0 0 rgba(255,255,255,0.25)',
        'glass': '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 0 rgba(255,255,255,0.08)',
        'glass-gold': '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 0 rgba(255,255,255,0.2), 0 0 24px rgba(212,175,55,0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-gold': 'glow-gold 2s ease-in-out infinite alternate',
        'glow-silver': 'glow-silver 2.5s ease-in-out infinite alternate',
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
          '0%': { boxShadow: '0 0 5px rgba(255,255,255,0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(255,255,255,0.15)' },
        },
        'glow-gold': {
          '0%': { boxShadow: '0 0 12px rgba(212,175,55,0.2), inset 0 1px 0 0 rgba(255,255,255,0.15)' },
          '100%': { boxShadow: '0 0 28px rgba(212,175,55,0.35), inset 0 1px 0 0 rgba(255,255,255,0.25)' },
        },
        'glow-silver': {
          '0%': { boxShadow: '0 0 10px rgba(255,255,255,0.06), inset 0 1px 0 0 rgba(255,255,255,0.12)' },
          '100%': { boxShadow: '0 0 22px rgba(255,255,255,0.12), inset 0 1px 0 0 rgba(255,255,255,0.18)' },
        }
      },
      backgroundImage: {
        'cyber-grid': "linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)",
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.04) 100%)',
        'gold-gradient': 'linear-gradient(180deg, #E8D5A3 0%, #D4AF37 28%, #B8860B 60%, #9A7B00 100%)',
        'gold-gradient-subtle': 'linear-gradient(135deg, rgba(212,175,55,0.25) 0%, rgba(184,134,11,0.15) 100%)',
        'silver-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 50%, rgba(200,200,212,0.08) 100%)',
      }
    },
  },
  plugins: [],
}
