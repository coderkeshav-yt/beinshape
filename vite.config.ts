import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Vite config with client-side routing support
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    historyApiFallback: true  // This enables client-side routing
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
});
