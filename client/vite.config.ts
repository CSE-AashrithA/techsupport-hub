import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // while developing, send /api requests to the express server
    proxy: { "/api": "http://localhost:4000" },
  },
});
