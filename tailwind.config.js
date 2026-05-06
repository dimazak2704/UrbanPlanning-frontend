/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{vue,js,ts}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0A0A0A',
          soft: '#1A1A1A',
          muted: '#6B6B6B',
          subtle: '#A3A3A3',
        },
        paper: {
          DEFAULT: '#FAFAF7',
          pure: '#FFFFFF',
          warm: '#F5F2EC',
        },
        accent: {
          DEFAULT: '#B8533A',
          hover: '#9D3F2A',
          soft: '#E8D4CC',
        },
        status: {
          planned: '#6B6B6B',
          approved: '#2D5F8B',
          construction: '#B8533A',
          completed: '#3A6B3A',
          suspended: '#8B2D2D',
        },
        night: {
          DEFAULT: '#0E0E0E',
          soft: '#1A1A1A',
          elevated: '#242424',
          border: '#2A2A2A',
        },
      },
    },
  },
  plugins: [],
}
