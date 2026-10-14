/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0f172a', light: '#1e293b', dark: '#020617' },
        gold: { DEFAULT: '#d97706', light: '#f59e0b', soft: '#fef3c7' }
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      boxShadow: {
        card: '0 10px 30px -10px rgba(15,23,42,.18)',
        cta: '0 10px 25px -8px rgba(217,119,6,.55)'
      }
    }
  },
  plugins: []
};
