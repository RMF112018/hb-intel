import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(command === 'build' ? 'production' : 'development'),
  },
  resolve: {
    alias: {
      '@hbc/ui-kit/app-shell': resolve(__dirname, '../../packages/ui-kit/src/app-shell.ts'),
      '@hbc/ui-kit/icons': resolve(__dirname, '../../packages/ui-kit/src/icons/index.tsx'),
      '@hbc/ui-kit/theme': resolve(__dirname, '../../packages/ui-kit/src/theme/index.ts'),
      '@hbc/ui-kit': resolve(__dirname, '../../packages/ui-kit/src/index.ts'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/mount.tsx'),
      formats: ['iife'],
      name: '__hbIntel_hbShellExtension',
      fileName: () => 'hb-shell-extension-app.js',
    },
    rollupOptions: {
      external: [
        '@microsoft/sp-application-base',
        '@microsoft/sp-core-library',
      ],
      output: {
        globals: {
          '@microsoft/sp-application-base': 'window.__spApplicationBase',
          '@microsoft/sp-core-library': 'window.__spCoreLibrary',
        },
        inlineDynamicImports: true,
      },
    },
  },
}));
