/**
 * vite.config.ts — @hbc/ui-kit library build
 * PH4.16 §Step 4 | Blueprint §1d
 *
 * Used for Storybook dev/build and bundle analysis.
 * Production build uses tsc (see package.json "build" script).
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@fluentui/react-components',
        '@griffel/react',
        '@tanstack/react-table',
        '@tanstack/react-virtual',
        'pdfjs-dist',
      ],
      output: {
        manualChunks: {
          echarts: ['echarts', 'echarts-for-react'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@hbc/ui-kit/theme': resolve(__dirname, 'src/theme/index.ts'),
      '@hbc/ui-kit/icons': resolve(__dirname, 'src/icons/index.ts'),
    },
  },
});
