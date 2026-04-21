import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: [
      // Subpath aliases MUST come before parent aliases. Order matters in
      // Vite's alias resolver because it walks the list top-to-bottom.
      // W01r-P11 (Project Sites compliance closure):
      //   - Layered `@hbc/ui-kit/*` entry points are the canonical imports.
      //     The root `@hbc/ui-kit` alias is intentionally NOT declared here
      //     — Project Sites must import from the narrower entry points.
      //   - `HbcThemeProvider` is now exported from `@hbc/ui-kit/app-shell`,
      //     so SPFx productive-lane consumers have a narrow sanctioned path.
      //   - `@hbc/spfx/project-sites` resolves to the package-oriented
      //     barrel (packages/spfx/src/webparts/projectSites/index.ts),
      //     replacing the previous relative source reach from mount.tsx.
      { find: '@hbc/auth/spfx', replacement: resolve(__dirname, '../../packages/auth/src/spfx/index.ts') },
      { find: '@hbc/auth', replacement: resolve(__dirname, '../../packages/auth/src/index.ts') },
      { find: '@hbc/ui-kit/app-shell', replacement: resolve(__dirname, '../../packages/ui-kit/src/app-shell.ts') },
      { find: '@hbc/ui-kit/primitives', replacement: resolve(__dirname, '../../packages/ui-kit/src/primitives.ts') },
      { find: '@hbc/ui-kit/theme', replacement: resolve(__dirname, '../../packages/ui-kit/src/theme/index.ts') },
      { find: '@hbc/ui-kit/icons', replacement: resolve(__dirname, '../../packages/ui-kit/src/icons/index.tsx') },
      { find: '@hbc/models', replacement: resolve(__dirname, '../../packages/models/src/index.ts') },
      { find: /^@hbc\/spfx\/project-sites$/, replacement: resolve(__dirname, '../../packages/spfx/src/webparts/projectSites/index.ts') },
      { find: '@hbc/spfx/project-sites', replacement: resolve(__dirname, '../../packages/spfx/src/webparts/projectSites') },
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
        '@microsoft/sp-http',
        '@microsoft/sp-http-base',
        '@microsoft/sp-page-context',
        '@microsoft/sp-component-base',
        '@microsoft/sp-diagnostics',
        '@microsoft/sp-odata-types',
        /^@microsoft\/sp-/,
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
                '@microsoft/sp-http': 'window.__spHttp',
                '@microsoft/sp-http-base': 'window.__spHttpBase',
                '@microsoft/sp-page-context': 'window.__spPageContext',
                '@microsoft/sp-component-base': 'window.__spComponentBase',
                '@microsoft/sp-diagnostics': 'window.__spDiagnostics',
                '@microsoft/sp-odata-types': 'window.__spODataTypes',
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
