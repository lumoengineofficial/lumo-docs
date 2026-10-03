import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#cf6dfc",
          hover: "#b955e8",
          soft: "#cf6dfc1a",
          light: "#c1bfff",
        },
        olive: "#bdb96a",
        cream: "#fdfbd4",
        ink: "#0a0e17",
        panel: "#111726",
        panel2: "#161d30",
        line: "#1f2740",
        mist: "#e6eaf5",
        muted: "#8b93ad",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(207, 109, 252, 0.55)",
        card: "0 18px 40px -24px rgba(0, 0, 0, 0.9)",
      },
      backgroundImage: {
        grid: "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        fadeUp: "fadeUp 0.6s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
