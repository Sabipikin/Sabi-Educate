import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        primary: "var(--color-primary)",
        "primary-dark": "var(--color-primary-dark)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        surface: "var(--color-surface)",
        "surface-light": "var(--color-surface-light)",
        "text-muted": "var(--color-text-muted)",
        border: "var(--color-border)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
        display: "var(--font-display)",
      },
      boxShadow: {
        glow: "var(--shadow)",
        "glow-strong": "var(--shadow-strong)",
      },
    },
  },
  plugins: [],
};

export default config;
