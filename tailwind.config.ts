import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          pink: "#FF10F0",
          blue: "#00FFF0",
          purple: "#BD00FF",
          yellow: "#FFE600",
        },
        cyber: {
          black: "#0D0D0D",
          dark: "#1A1A1A",
          gray: "#2D2D2D",
          light: "#3D3D3D",
        },
        'neon-purple': '#B026FF',
        'neon-blue': '#4D94FF',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "cyber-grid": "linear-gradient(transparent 0%, rgba(0, 255, 240, 0.1) 100%)",
        "neon-glow": "linear-gradient(90deg, rgba(189,0,255,0) 0%, rgba(189,0,255,0.3) 50%, rgba(189,0,255,0) 100%)",
      },
      animation: {
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        'swipe-left': 'swipe-left 0.3s ease-out forwards',
        'swipe-right': 'swipe-right 0.3s ease-out forwards',
      },
      keyframes: {
        "neon-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        'swipe-left': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(-100%)', opacity: '0' },
        },
        'swipe-right': {
          '0%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
      },
      boxShadow: {
        "neon": "0 0 10px rgba(189,0,255,0.5), 0 0 20px rgba(189,0,255,0.3), 0 0 30px rgba(189,0,255,0.1)",
        "neon-hover": "0 0 15px rgba(189,0,255,0.7), 0 0 30px rgba(189,0,255,0.5), 0 0 45px rgba(189,0,255,0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
