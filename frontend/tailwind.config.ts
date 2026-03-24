import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cortex: {
          bg: "#0a0e1a",
          panel: "#111827",
          border: "#1f2937",
          accent: "#3b82f6",
          green: "#10b981",
          red: "#ef4444",
          amber: "#f59e0b",
          text: "#e5e7eb",
          muted: "#9ca3af",
        },
      },
    },
  },
  plugins: [],
};

export default config;
