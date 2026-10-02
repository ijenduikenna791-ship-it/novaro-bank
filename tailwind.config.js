/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#060a17',
          900: '#0a1022',
          850: '#0d1530',
          800: '#111a38',
          700: '#18234a',
          600: '#22305f',
          500: '#33447f',
          400: '#4c5f9e',
          300: '#7383bd',
          200: '#a7b2d8',
          100: '#d6dcf0',
        },
        brand: {
          50: '#eef1ff',
          100: '#dfe4ff',
          200: '#c3cbfb',
          300: '#9eabf5',
          400: '#7a89ec',
          500: '#5b6ce0',
          600: '#4654c7',
          700: '#3a45a1',
        },
        canvas: '#f3f5fb',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        glass: 'inset 0 1px 0 0 rgba(255,255,255,0.08), 0 10px 40px -12px rgba(0,0,0,0.6)',
        soft: '0 1px 2px rgba(16,24,40,.04), 0 8px 24px -8px rgba(16,24,40,.08)',
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } },
        shimmer: { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        'spin-slow': { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        marquee: 'marquee 32s linear infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.2s linear infinite',
        'spin-slow': 'spin-slow 40s linear infinite',
      },
    },
  },
  plugins: [],
};
