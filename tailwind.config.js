/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nebula-red': '#E62B70',
        'nebula-red-hover': '#F43F5E',
        'nebula-pink': '#EC4899',
        'nebula-purple': '#8B5CF6',
        'nebula-blue': '#38BDF8',
        'nebula-indigo': '#3B82F6',
        'nebula-dark': '#090A16',
        'nebula-panel': '#101226',
        'nebula-panel-light': '#191C36',
        'nebula-border': '#282C4F',
        nebula: {
          red: '#E62B70',
          'red-hover': '#F43F5E',
          pink: '#EC4899',
          purple: '#8B5CF6',
          blue: '#38BDF8',
          indigo: '#3B82F6',
          dark: '#090A16',
          panel: '#101226',
          'panel-light': '#191C36',
          border: '#282C4F',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-red': '0 0 20px rgba(230, 43, 112, 0.55)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.55)',
        'glow-blue': '0 0 20px rgba(56, 189, 248, 0.55)',
      },
      backgroundImage: {
        'orion-gradient': 'linear-gradient(135deg, #E62B70 0%, #8B5CF6 50%, #38BDF8 100%)',
        'orion-core': 'radial-gradient(circle, rgba(230, 43, 112, 0.3) 0%, rgba(139, 92, 246, 0.2) 40%, rgba(9, 10, 22, 0.98) 100%)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}
