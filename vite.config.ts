import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// @ts-ignore - lovable-tagger is a dev dependency
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }: { command: string, mode: string }): UserConfig => {
  const isProduction = mode === 'production';
  
  return {
    base: isProduction ? '/' : '/',
    define: {
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      'process.env.BASE_URL': JSON.stringify(isProduction ? '/' : '/')
    },
    publicDir: 'public',
    server: {
      headers: {
        'Content-Type': 'application/javascript',
      },
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
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: isProduction ? false : 'inline',
      minify: isProduction ? 'terser' : false,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            if (id.includes('node_modules')) {
              if (id.includes('@radix-ui')) return 'radix';
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'react';
              if (id.includes('@tanstack') || id.includes('date-fns') || id.includes('framer-motion')) return 'vendor';
              return 'vendor';
            }
          },
        },
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      esbuildOptions: {
        target: 'es2020',
      },
    },
  };
});
