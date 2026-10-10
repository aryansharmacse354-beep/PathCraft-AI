import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0B0F19",
        card: "#111827",
        border: "#1F2937",
        accent: {
          emerald: "#10B981",
          cyan: "#06B6D4",
          amber: "#F59E0B",
          slate: "#475569",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(6, 182, 212, 0.4)" },
          "100%": { boxShadow: "0 0 20px rgba(6, 182, 212, 0.8)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
