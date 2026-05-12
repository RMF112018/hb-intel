import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: [
      // Subpath aliases first (Vite resolves top-to-bottom).
      { find: '@hbc/ui-kit/app-shell', replacement: resolve(__dirname, '../../packages/ui-kit/src/app-shell.ts') },
      { find: '@hbc/ui-kit/theme', replacement: resolve(__dirname, '../../packages/ui-kit/src/theme/index.ts') },
      { find: '@hbc/ui-kit/icons', replacement: resolve(__dirname, '../../packages/ui-kit/src/icons/index.tsx') },
      { find: '@hbc/ui-kit', replacement: resolve(__dirname, '../../packages/ui-kit/src/index.ts') },
      { find: '@hbc/models', replacement: resolve(__dirname, '../../packages/models/src/index.ts') },
    ],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: command === 'serve',
    chunkSizeWarningLimit: 800,
    ...(isProduction || command === 'build'
      ? {
          lib: {
            entry: resolve(__dirname, 'src/mount.tsx'),
            name: '__hbIntel_myDashboard',
            formats: ['iife'],
            fileName: () => 'my-dashboard-app.js',
          },
        }
      : {}),
    rollupOptions: {
      external: [/^@microsoft\/sp-/, /^@msinternal\//],
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(command === 'serve' ? 'development' : 'production'),
  },
}));
