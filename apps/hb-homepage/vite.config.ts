import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@hbc/auth/spfx', replacement: resolve(__dirname, '../../packages/auth/src/spfx/index.ts') },
      { find: '@hbc/auth', replacement: resolve(__dirname, '../../packages/auth/src/index.ts') },
      { find: '@hbc/homepage-launcher', replacement: resolve(__dirname, '../../packages/homepage-launcher/src/index.ts') },
      { find: '@hbc/ui-kit/app-shell', replacement: resolve(__dirname, '../../packages/ui-kit/src/app-shell.ts') },
      { find: '@hbc/ui-kit/homepage', replacement: resolve(__dirname, '../../packages/ui-kit/src/homepage.ts') },
      { find: '@hbc/ui-kit/primitives', replacement: resolve(__dirname, '../../packages/ui-kit/src/primitives.ts') },
      { find: '@hbc/ui-kit/theme', replacement: resolve(__dirname, '../../packages/ui-kit/src/theme/index.ts') },
      { find: '@hbc/ui-kit/icons', replacement: resolve(__dirname, '../../packages/ui-kit/src/icons/index.tsx') },
      { find: '@hbc/models', replacement: resolve(__dirname, '../../packages/models/src/index.ts') },
      { find: '@hb-homepage/runtime', replacement: resolve(__dirname, '../hb-webparts/src/webparts/hbHomepage/HbHomepage.tsx') },
      { find: /^@hb-homepage\/runtime\/(.*)/, replacement: resolve(__dirname, '../hb-webparts/src/webparts/hbHomepage/$1') },
      { find: /^@hb-homepage\/helpers\/(.*)/, replacement: resolve(__dirname, '../hb-webparts/src/homepage/helpers/$1') },
      { find: /^@hb-homepage\/data\/(.*)/, replacement: resolve(__dirname, '../hb-webparts/src/homepage/data/$1') },
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
            name: '__hbIntel_hbHomepage',
            formats: ['iife'],
            fileName: () => 'hb-homepage-app.js',
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
