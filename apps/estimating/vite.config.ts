import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
  const isProduction = command === 'build';

  return {
    plugins: [react()],
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
        '@hbc/provisioning': path.resolve(__dirname, '../../packages/provisioning/src/index.ts'),
        '@hbc/workflow-handoff': path.resolve(__dirname, '../../packages/workflow-handoff/src/index.ts'),
        '@hbc/step-wizard': path.resolve(__dirname, '../../packages/step-wizard/src/index.ts'),
        '@hbc/session-state': path.resolve(__dirname, '../../packages/session-state/src/index.ts'),
        '@hbc/bic-next-move': path.resolve(__dirname, '../../packages/bic-next-move/src/index.ts'),
        '@hbc/complexity': path.resolve(__dirname, '../../packages/complexity/src/index.ts'),
        '@hbc/notification-intelligence': path.resolve(__dirname, '../../packages/notification-intelligence/src/index.ts'),
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
      // This is the correct way to get Vite/Rollup to wrap exports in a global
      // variable assignment: `var __hbIntel_estimating = (function(externals){...})(deps);`
      // The SPFx shell webpart loads this bundle and reads window.__hbIntel_estimating.mount().
      ...(isProduction
        ? {
            lib: {
              entry: resolve(__dirname, 'src/mount.tsx'),
              name: '__hbIntel_estimating',
              formats: ['iife'],
              fileName: () => 'estimating-app.js',
            },
          }
        : {}),
      rollupOptions: {
        external: [
          /^@microsoft\//,
          /^@msinternal\//,
        ],
        ...(isProduction
          ? {
              output: {
                // IIFE globals for external dependencies.
                // @microsoft/* packages are provided by the SPFx runtime loader.
                globals: {
                  '@microsoft/sp-webpart-base': 'window.__spWebpartBase',
                  '@microsoft/sp-property-pane': 'window.__spPropertyPane',
                  '@microsoft/sp-core-library': 'window.__spCoreLibrary',
                  '@microsoft/sp-loader': 'window.__spLoader',
                  '@microsoft/signalr': 'signalR',
                },
                inlineDynamicImports: true,
              },
            }
          : {
              input: {
                'estimating-webpart': resolve(__dirname, 'src/webparts/estimating/EstimatingWebPart.tsx'),
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
      port: 4002,
      https: true,
      strictPort: true,
      cors: true,
    },
    define: {
      'process.env.HBC_ADAPTER_MODE': mode === 'development' ? '"mock"' : '"proxy"',
      'process.env.HBC_AUTH_MODE': mode === 'development' ? '"mock"' : '"spfx"',
      'process.env.NODE_ENV': JSON.stringify(command === 'serve' ? 'development' : 'production'),
    },
  };
});
