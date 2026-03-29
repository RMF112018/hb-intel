import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      // Subpath alias MUST come before the parent alias
      '@hbc/auth/spfx': resolve(__dirname, '../../packages/auth/src/spfx/index.ts'),
      '@hbc/auth': resolve(__dirname, '../../packages/auth/src/index.ts'),
      '@hbc/ui-kit': resolve(__dirname, '../../packages/ui-kit/src/index.ts'),
      '@hbc/models': resolve(__dirname, '../../packages/models/src/index.ts'),
      '@hbc/spfx/project-sites': resolve(__dirname, '../../packages/spfx/src/webparts/projectSites'),
    },
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
            name: '__hbIntel_projectSites',
            formats: ['iife'],
            fileName: () => 'project-sites-app.js',
          },
        }
      : {}),
    rollupOptions: {
      external: [
        '@microsoft/sp-webpart-base',
        '@microsoft/sp-property-pane',
        '@microsoft/sp-core-library',
        '@microsoft/sp-loader',
        /^@msinternal\//,
      ],
      ...(isProduction || command === 'build'
        ? {
            output: {
              globals: {
                '@microsoft/sp-webpart-base': 'window.__spWebpartBase',
                '@microsoft/sp-property-pane': 'window.__spPropertyPane',
                '@microsoft/sp-core-library': 'window.__spCoreLibrary',
                '@microsoft/sp-loader': 'window.__spLoader',
              },
            },
          }
        : {}),
    },
  },
  define: {
    'process.env.HBC_ADAPTER_MODE': '"proxy"',
    'process.env.HBC_AUTH_MODE': '"spfx"',
    'process.env.NODE_ENV': JSON.stringify(command === 'serve' ? 'development' : 'production'),
  },
}));
