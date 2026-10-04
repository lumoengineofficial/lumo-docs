import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{md,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#cf6dfc",
          hover: "#b955e8",
          soft: "#cf6dfc1a",
          light: "rgb(var(--c-accent-light) / <alpha-value>)",
        },
        olive: "#bdb96a",
        cream: "#fdfbd4",
        ink: "rgb(var(--c-bg) / <alpha-value>)",
        panel: "rgb(var(--c-panel) / <alpha-value>)",
        panel2: "rgb(var(--c-panel2) / <alpha-value>)",
        line: "rgb(var(--c-line) / <alpha-value>)",
        mist: "rgb(var(--c-mist) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        title: "rgb(var(--c-title) / <alpha-value>)",
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
        grid: "linear-gradient(to right, var(--c-grid) 1px, transparent 1px), linear-gradient(to bottom, var(--c-grid) 1px, transparent 1px)",
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
