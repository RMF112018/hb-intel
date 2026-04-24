import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJs from 'vite-plugin-css-injected-by-js';
import path from 'node:path';
import { resolve } from 'path';
import { readGovernedSafetyDefines } from './config/runtimeDefines.js';

export default defineConfig(({ command, mode }) => {
  const isProduction = command === 'build';

  return {
    // In production (lib / IIFE), vite normally emits a sibling CSS file that
    // the SPFx shell would have to load separately. We instead inline the
    // CSS into the JS bundle via vite-plugin-css-injected-by-js so any host
    // that loads `safety-app.js` automatically gets the Safety stylesheet at
    // runtime — no extra SPFx asset wiring needed. Dev server ignores this
    // (CSS is handled by Vite HMR via `main.tsx`).
    plugins: [react(), ...(isProduction ? [cssInjectedByJs()] : [])],
    resolve: {
      alias: {
        '@hbc/models': path.resolve(__dirname, '../../packages/models/src/index.ts'),
        '@hbc/data-access': path.resolve(__dirname, '../../packages/data-access/src/index.ts'),
        '@hbc/query-hooks': path.resolve(__dirname, '../../packages/query-hooks/src/index.ts'),
        '@hbc/auth': path.resolve(__dirname, '../../packages/auth/src'),
        '@hbc/auth/spfx': resolve(__dirname, '../../packages/auth/src/spfx/index.ts'),
        '@hbc/shell': path.resolve(__dirname, '../../packages/shell/src'),
        '@hbc/ui-kit': path.resolve(__dirname, '../../packages/ui-kit/src'),
        '@hbc/ui-kit/app-shell': resolve(__dirname, '../../packages/ui-kit/src/app-shell.ts'),
        '@hbc/ui-kit/theme': resolve(__dirname, '../../packages/ui-kit/src/theme/index.ts'),
        '@hbc/provisioning': resolve(__dirname, '../../packages/provisioning/src/index.ts'),
        '@hbc/features-accounting': path.resolve(__dirname, '../../packages/features/accounting/src/index.ts'),
        '@hbc/features-estimating': path.resolve(__dirname, '../../packages/features/estimating/src/index.ts'),
        '@hbc/features-project-hub': path.resolve(__dirname, '../../packages/features/project-hub/src/index.ts'),
        '@hbc/features-business-development': path.resolve(__dirname, '../../packages/features/business-development/src/index.ts'),
        '@hbc/features-leadership': path.resolve(__dirname, '../../packages/features/leadership/src/index.ts'),
        '@hbc/features-admin': path.resolve(__dirname, '../../packages/features/admin/src/index.ts'),
        '@hbc/features-safety': path.resolve(__dirname, '../../packages/features/safety/src/index.ts'),
        '@hbc/features-quality-control-warranty': path.resolve(__dirname, '../../packages/features/quality-control-warranty/src/index.ts'),
        '@hbc/features-risk-management': path.resolve(__dirname, '../../packages/features/risk-management/src/index.ts'),
        '@hbc/features-operational-excellence': path.resolve(__dirname, '../../packages/features/operational-excellence/src/index.ts'),
        '@hbc/features-human-resources': path.resolve(__dirname, '../../packages/features/human-resources/src/index.ts'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: command === 'serve',
      chunkSizeWarningLimit: 1500,
      // Production: Vite lib mode produces an IIFE bundle with a global name.
      // The SPFx shell webpart loads this bundle and reads
      // window.__hbIntel_safety.mount().
      ...(isProduction
        ? {
            lib: {
              entry: resolve(__dirname, 'src/mount.tsx'),
              name: '__hbIntel_safety',
              formats: ['iife'],
              fileName: () => 'safety-app.js',
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
        ...(isProduction
          ? {
              output: {
                globals: {
                  '@microsoft/sp-webpart-base': 'window.__spWebpartBase',
                  '@microsoft/sp-property-pane': 'window.__spPropertyPane',
                  '@microsoft/sp-core-library': 'window.__spCoreLibrary',
                  '@microsoft/sp-loader': 'window.__spLoader',
                },
                inlineDynamicImports: true,
              },
            }
          : {
              input: {
                'safety-webpart': resolve(__dirname, 'src/webparts/safety/SafetyWebPart.tsx'),
              },
              output: {
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: '[name].[ext]',
                manualChunks: {
                  'vendor-react': ['react', 'react-dom'],
                  'vendor-tanstack': ['@tanstack/react-router', '@tanstack/react-query'],
                  'vendor-fluent': ['@fluentui/react-components'],
                  'vendor-zustand': ['zustand'],
                },
              },
            }),
      },
    },
    server: {
      port: 4007,
      https: true,
      strictPort: true,
      cors: true,
    },
    define: {
      'process.env.HBC_ADAPTER_MODE': mode === 'development' ? '"mock"' : '"proxy"',
      'process.env.HBC_AUTH_MODE': mode === 'development' ? '"mock"' : '"spfx"',
      'process.env.NODE_ENV': JSON.stringify(command === 'serve' ? 'development' : 'production'),
      ...readGovernedSafetyDefines(),
    },
  };
});
