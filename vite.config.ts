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
          manualChunks: {
            'react-vendor': [
              'react',
              'react-dom',
              'react-router-dom',
              'react-router',
              'react-helmet-async',
            ],
            'ui-vendor': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-slot',
              '@radix-ui/react-toast',
              '@radix-ui/react-tooltip',
              'framer-motion',
              'lucide-react',
            ],
            'utils-vendor': [
              'date-fns',
              'clsx',
              'tailwind-merge',
              '@tanstack/react-query',
              'zod',
            ],
          },
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
        },
      },
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@supabase/supabase-js',
        '@tanstack/react-query',
        'framer-motion',
        'lucide-react',
        'date-fns',
        'clsx',
        'tailwind-merge',
        'zod',
        'react-helmet-async',
      ],
      esbuildOptions: {
        target: 'es2020',
      },
    },
  };
});
