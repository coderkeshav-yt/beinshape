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
        // @ts-ignore - Emotion plugin is needed but types are not properly exposed
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
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('@radix-ui')) {
                return 'radix';
              }
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'react';
              }
              if (id.includes('@tanstack') || id.includes('date-fns') || id.includes('framer-motion')) {
                return 'vendor';
              }
              return 'vendor';
            }
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
