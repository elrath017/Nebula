/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vlc: {
          orange: '#FF8800',
          'orange-hover': '#FFA033',
          dark: '#121316',
          panel: '#1A1C23',
          'panel-light': '#252833',
          border: '#333745',
          accent: '#007ACC',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-orange': '0 0 15px rgba(255, 136, 0, 0.4)',
        'glow-blue': '0 0 15px rgba(0, 122, 204, 0.4)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
