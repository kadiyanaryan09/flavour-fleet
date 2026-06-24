/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#23262F',
        cream: '#FFF8EF',
        fleet: {
          50: '#FFF3E8',
          100: '#FFE2C7',
          400: '#FF9A3D',
          500: '#FC8019',  // primary CTA — Swiggy-orange territory, on-brief
          600: '#E36A0A',
          700: '#B85408',
        },
        chili: '#E63946',
        leaf: '#1FA463',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 8px 24px rgba(35, 38, 47, 0.08)',
        cardHover: '0 16px 32px rgba(35, 38, 47, 0.14)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'modal-in': { '0%': { opacity: 0, transform: 'scale(0.96) translateY(8px)' }, '100%': { opacity: 1, transform: 'scale(1) translateY(0)' } },
        'badge-pop': { '0%': { transform: 'scale(0.4)' }, '100%': { transform: 'scale(1)' } },
        shimmer: { '0%': { backgroundPosition: '-300px 0' }, '100%': { backgroundPosition: '300px 0' } },
        drive: { '0%': { left: '-2%' }, '100%': { left: '100%' } },
      },
      animation: {
        'fade-up': 'fade-up 0.3s ease-out',
        'modal-in': 'modal-in 0.2s ease-out',
        'badge-pop': 'badge-pop 0.25s ease-out',
        shimmer: 'shimmer 1.4s ease infinite',
        drive: 'drive 7s linear infinite',
      },
    },
  },
  plugins: [],
};
