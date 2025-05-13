import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],           // SIN @tailwindcss/vite: lo gestiona PostCSS
    server: {
      port: 5174,
      proxy: env.VITE_API_URL
        ? undefined                 // en prod no hay proxy
        : {
            "/api": {
              target: "http://localhost:4000",
              changeOrigin: true,
              secure: false,
            },
          },
    },
  };
});
