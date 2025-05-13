import type { Config } from "tailwindcss";

export default <Config>{
  /* sin darkMode por ahora */
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
};
