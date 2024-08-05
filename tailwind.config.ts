import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      spacing: {
        "taskbar-height": "40px",
      },
      colors: {
        "hover-item-menu": "hsla(0, 0%, 35%, 70%)",
        taskbar: "rgba(25, 25, 25, 1)",
        "taskbar-hover": "rgba(63, 63, 63, 0.7)",
        "windows-border": "hsla(0, 0%, 50%, 50%)",
      },
    },
  },
  plugins: [],
};
export default config;
