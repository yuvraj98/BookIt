/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff1f0',
          100: '#ffded9',
          200: '#ffc2b9',
          300: '#ff9a8b',
          400: '#ff6652',
          500: '#ff3d25',
          600: '#f01e0b',
          700: '#c91408',
          800: '#a5130b',
          900: '#881710',
          950: '#4a0603',
        },
        surface: {
          DEFAULT: '#0f0f0f',
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          700: '#1a1a1a',
          800: '#141414',
          900: '#0f0f0f',
          950: '#080808',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-syne)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      animation: {
        'fade-in':      'fadeIn 0.4s ease-out',
        'slide-up':     'slideUp 0.4s ease-out',
        'slide-in':     'slideIn 0.35s ease-out',
        'scale-in':     'scaleIn 0.3s ease-out',
        'pulse-glow':   'pulseGlow 2s ease-in-out infinite',
        'shimmer':      'shimmer 1.5s infinite',
        'float':        'float 3s ease-in-out infinite',
        'spin-slow':    'spin 8s linear infinite',
        'gradient':     'gradient 4s ease infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' },                             to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn:   { from: { opacity: '0', transform: 'translateX(-16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.95)' },  to: { opacity: '1', transform: 'scale(1)' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 20px rgba(255,61,37,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(255,61,37,0.6)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float:     { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        gradient:  { '0%, 100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
      },
      backgroundSize: {
        '200%': '200%',
        '400%': '400%',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow':       '0 0 20px rgba(255,61,37,0.3)',
        'glow-lg':    '0 0 40px rgba(255,61,37,0.4)',
        'card':       '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        'card-hover': '0 10px 40px rgba(0,0,0,0.4)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      opacity: {
        '8':  '0.08',
        '12': '0.12',
        '15': '0.15',
        '16': '0.16',
      },
    },
  },
  plugins: [],
}
