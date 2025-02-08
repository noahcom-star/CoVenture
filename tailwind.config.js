/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'navy': {
          dark: '#0A192F',
          light: '#112240',
        },
        'slate': '#8892B0',
        'light-slate': '#CCD6F6',
        'white': '#E6F1FF',
        'accent': '#64FFDA',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { textShadow: '0 0 5px #fff, 0 0 10px #fff, 0 0 15px #0ff' },
          '100%': { textShadow: '0 0 10px #fff, 0 0 20px #fff, 0 0 30px #0ff' },
        },
      },
    },
  },
  plugins: [],
} 