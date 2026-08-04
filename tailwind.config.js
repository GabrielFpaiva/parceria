/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink:   { 900: '#0A0A0B', 700: '#2E2E33', 500: '#6B6B75', 300: '#A8A8B3', 100: '#E8E8ED' },
        paper: { 0: '#FFFFFF', 50: '#FAFAFC', 100: '#F4F4F7' },
        brand: { 600: '#4A3AFF', 500: '#5B4BFF', 400: '#7C6FFF', 100: '#EDEBFF' },
        temp:  {
          burning: '#FF4D4D', warm: '#FF9A3C', mild: '#FFD166',
          cooling: '#7CC4FF', hibernating: '#B8C4D9',
        },
      },
      borderRadius: { sheet: '32px' },
    },
  },
  plugins: [],
};
