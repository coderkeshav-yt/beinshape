import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin'],
        },
      }),
      mode === 'development' && componentTagger(),
      isProduction && visualizer({
        open: true,
        filename: 'bundle-analyzer.html',
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      sourcemap: isProduction ? 'hidden' : false,
      minify: isProduction ? 'esbuild' : false,
      cssMinify: isProduction ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            vendor: ['@tanstack/react-query', 'date-fns', 'framer-motion'],
            ui: ['@radix-ui/*', 'class-variance-authority', 'clsx'],
          },
        },
      },
      chunkSizeWarningLimit: 1000, // Increase chunk size warning limit
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      esbuildOptions: {
        target: 'es2020',
      },
    },
  };
});
