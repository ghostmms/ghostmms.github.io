import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        green: { DEFAULT: '#0F4D32', 900: '#082A1B', 800: '#0B3A26', 700: '#0F4D32', 600: '#2D6B4F', 100: '#E3EDE6', 50: '#F0F5F1' },
        flag: { green: '#1EB53A', gold: '#FCD116', blue: '#00A3DD', black: '#111111' },
        ocean: { DEFAULT: '#0B6E99', 700: '#095A7D', 100: '#DCEBF2' },
        ivory: '#F7F5F0',
        ink: '#111111',
        muted: '#55565A',
        line: '#DEDBD2',
        sand: '#EFEDE7',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 #DEDBD2, 0 12px 30px -18px rgba(0,0,0,.25)',
        lift: '0 18px 40px -20px rgba(15,77,50,.45)',
      },
      backgroundImage: {
        ribbon: 'linear-gradient(135deg, #1EB53A 0 42%, #FCD116 42% 45%, #111111 45% 55%, #FCD116 55% 58%, #00A3DD 58% 100%)',
      },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: { shimmer: 'shimmer 1.6s linear infinite' },
    },
  },
  plugins: [],
};
export default config;
