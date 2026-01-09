import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fleet: {
          primary: "#1e40af",
          secondary: "#7c3aed",
          danger: "#dc2626",
          success: "#16a34a",
          warning: "#ea580c",
        },
      },
    },
  },
  plugins: [],
};
export default config;
