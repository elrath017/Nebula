/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nebula: {
          red: '#FF1744',
          'red-hover': '#FF4569',
          blue: '#00F0FF',
          'blue-hover': '#38F5FF',
          purple: '#9D4EDD',
          dark: '#0B0D19',
          panel: '#121526',
          'panel-light': '#1C2038',
          border: '#262B48',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-red': '0 0 18px rgba(255, 23, 68, 0.5)',
        'glow-blue': '0 0 18px rgba(0, 240, 255, 0.5)',
        'glow-purple': '0 0 20px rgba(157, 78, 221, 0.5)',
      },
      backgroundImage: {
        'nebula-gradient': 'linear-gradient(135deg, #FF1744 0%, #7C3AED 50%, #00F0FF 100%)',
        'nebula-glass': 'linear-gradient(180deg, rgba(18, 21, 38, 0.9) 0%, rgba(11, 13, 25, 0.95) 100%)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'nebula-glow': 'nebulaPulse 4s ease-in-out infinite alternate',
      },
      keyframes: {
        nebulaPulse: {
          '0%': { filter: 'drop-shadow(0 0 10px rgba(255, 23, 68, 0.4))' },
          '100%': { filter: 'drop-shadow(0 0 15px rgba(0, 240, 255, 0.5))' },
        }
      }
    },
  },
  plugins: [],
}
