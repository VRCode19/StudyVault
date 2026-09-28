/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#07111F',
          900: '#0A1728',
          850: '#0D1D31',
          800: '#13243B',
          750: '#192C47',
          700: '#223859',
          600: '#344C73',
        },
        navy: {
          950: '#07111F',
          900: '#0A1728',
          850: '#0D1D31',
          800: '#13243B',
          700: '#1E3557',
        },
        electric: {
          300: '#60a5fa',
          400: '#3b82f6',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        },
        cyanGlow: {
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
        },
        glass: {
          surface: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.12)',
          highlight: 'rgba(255, 255, 255, 0.22)',
        },
      },
      fontFamily: {
        sans: ['"Inter"', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'liquid-sm': '0 8px 24px -6px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)',
        'liquid-card': '0 20px 50px -15px rgba(0, 0, 0, 0.65), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.25), inset 0 0 0 1px rgba(255, 255, 255, 0.06)',
        'liquid-elevated': '0 28px 65px -15px rgba(0, 0, 0, 0.8), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.35), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'liquid-modal': '0 35px 80px -20px rgba(0, 0, 0, 0.85), inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.4)',
        'tactile': '0 10px 30px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.07), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)',
        'tactile-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 0.18)',
        'tactile-card': '0 14px 36px -12px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'tactile-pressed': '0 2px 8px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(0, 0, 0, 0.35)',
        'blue-glow': '0 0 25px -3px rgba(37, 99, 235, 0.35)',
        'blue-glow-lg': '0 0 45px -5px rgba(37, 99, 235, 0.45)',
        'cyan-glow': '0 0 25px -4px rgba(6, 182, 212, 0.35)',
        'violet-glow': '0 0 25px -4px rgba(139, 92, 246, 0.35)',
        'orange-glow': '0 0 25px -4px rgba(249, 115, 22, 0.35)',
        'teal-glow': '0 0 25px -4px rgba(20, 184, 166, 0.35)',
        'glass-border': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
      },
      borderRadius: {
        'panel': '28px',
        'panel-lg': '32px',
        'card': '24px',
        'card-lg': '28px',
        'btn': '16px',
        'input': '16px',
        'chip': '9999px',
        'card-sm': '14px',
        'tactile': '16px',
      },
      backdropBlur: {
        'xs': '2px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'shimmer': 'shimmer 2.5s infinite linear',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
