import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const isProduction = process.env.NODE_ENV === 'production';
const entryFile = process.env.HB_WEBPARTS_ENTRY ?? 'src/mount.tsx';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@hbc/auth/spfx': resolve(__dirname, '../../packages/auth/src/spfx/index.ts'),
      '@hbc/auth': resolve(__dirname, '../../packages/auth/src/index.ts'),
      '@hbc/homepage-launcher': resolve(
        __dirname,
        '../../packages/homepage-launcher/src/index.ts',
      ),
      '@hbc/ui-kit/branding': resolve(__dirname, '../../packages/ui-kit/src/branding/index.ts'),
      '@hbc/ui-kit/homepage': resolve(__dirname, '../../packages/ui-kit/src/homepage.ts'),
      '@hbc/ui-kit/icons': resolve(__dirname, '../../packages/ui-kit/src/icons/index.tsx'),
      '@hbc/ui-kit/theme': resolve(__dirname, '../../packages/ui-kit/src/theme/index.ts'),
      // Root barrel alias exists only for transitive dependency resolution.
      // Homepage webpart source files must NOT import from '@hbc/ui-kit' directly —
      // ESLint no-restricted-imports enforces this at lint time. This alias ensures
      // that any internal ui-kit module-to-module imports resolve correctly at build time.
      '@hbc/ui-kit': resolve(__dirname, '../../packages/ui-kit/src/index.ts')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: command === 'serve',
    chunkSizeWarningLimit: 800,
    ...(isProduction || command === 'build'
      ? {
          lib: {
            entry: resolve(__dirname, entryFile),
            name: '__hbIntel_hbWebparts',
            formats: ['iife'],
            fileName: () => 'hb-webparts-app.js'
          }
        }
      : {}),
    rollupOptions: {
      external: [
        '@microsoft/sp-webpart-base',
        '@microsoft/sp-property-pane',
        '@microsoft/sp-core-library',
        '@microsoft/sp-loader',
        /^@msinternal\//
      ],
      ...(isProduction || command === 'build'
        ? {
            output: {
              globals: {
                '@microsoft/sp-webpart-base': 'window.__spWebpartBase',
                '@microsoft/sp-property-pane': 'window.__spPropertyPane',
                '@microsoft/sp-core-library': 'window.__spCoreLibrary',
                '@microsoft/sp-loader': 'window.__spLoader'
              }
            }
          }
        : {})
    }
  },
  define: {
    'process.env.HBC_AUTH_MODE': '"spfx"',
    'process.env.NODE_ENV': JSON.stringify(command === 'serve' ? 'development' : 'production')
  }
}));
