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
        taskbar: "rgba(25, 25, 25, 1)",
        "taskbar-hover": "rgba(63, 63, 63, 0.7)",
      },
    },
  },
  plugins: [],
};
export default config;
