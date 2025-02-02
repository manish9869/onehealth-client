import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    global: {},
  },
  server: {
    proxy: {
      ["/one-health-dev"]: {
        target: "http://localhost:3000/api/",
        changeOrigin: true,
      },
      ["/one-health-prod"]: {
        target: "http://localhost:3001/api/",
        changeOrigin: true,
      },
    },
  },
});
