/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nebula-cyan': '#00E5FF',
        'nebula-blue': '#0284C7',
        'nebula-gold': '#FF8C00',
        'nebula-amber': '#F97316',
        'nebula-red': '#E11D48',
        'nebula-purple': '#A855F7',
        'nebula-dark': '#0A0D18',
        'nebula-panel': '#12172A',
        'nebula-panel-light': '#1B223C',
        'nebula-border': '#283256',
        nebula: {
          cyan: '#00E5FF',
          blue: '#0284C7',
          gold: '#FF8C00',
          amber: '#F97316',
          red: '#E11D48',
          purple: '#A855F7',
          dark: '#0A0D18',
          panel: '#12172A',
          'panel-light': '#1B223C',
          border: '#283256',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 229, 255, 0.6)',
        'glow-gold': '0 0 20px rgba(255, 140, 0, 0.6)',
        'glow-red': '0 0 20px rgba(225, 29, 72, 0.6)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.6)',
      },
      backgroundImage: {
        'nebula-gradient': 'linear-gradient(135deg, #00E5FF 0%, #FF8C00 50%, #E11D48 100%)',
        'nebula-core': 'radial-gradient(circle at center, rgba(0, 229, 255, 0.25) 0%, rgba(255, 140, 0, 0.2) 45%, rgba(10, 13, 24, 0.98) 100%)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}
