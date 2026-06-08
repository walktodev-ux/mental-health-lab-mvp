import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#f7f6f3",
        card: "#FFFFFF",
        text: "#2E2E2E",
        muted: "#77736D",
        accent: "#9A8C7A",
        softGreen: "#DDE8DF",
        softYellow: "#F3E6C8",
        softRed: "#E7C7BE"
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    },
  },
  plugins: [],
};

export default config;
