import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { loadEnvFileIntoProcessEnv } from '../../tools/load-env-file';

const isProduction = process.env.NODE_ENV === 'production';

// Align Vite build/runtime env with the SPFx packaging chain by loading the
// repo-root `.env` and bridging non-VITE keys into Vite-prefixed keys.
loadEnvFileIntoProcessEnv(resolve(__dirname, '../../.env'));
if (!process.env.VITE_FUNCTION_APP_URL && process.env.FUNCTION_APP_URL) {
  process.env.VITE_FUNCTION_APP_URL = process.env.FUNCTION_APP_URL;
}
if (!process.env.VITE_API_AUDIENCE && process.env.API_AUDIENCE) {
  process.env.VITE_API_AUDIENCE = process.env.API_AUDIENCE;
}
if (!process.env.VITE_BACKEND_MODE && process.env.BACKEND_MODE) {
  process.env.VITE_BACKEND_MODE = process.env.BACKEND_MODE;
}
if (!process.env.VITE_ALLOW_BACKEND_MODE_SWITCH && process.env.ALLOW_BACKEND_MODE_SWITCH) {
  process.env.VITE_ALLOW_BACKEND_MODE_SWITCH = process.env.ALLOW_BACKEND_MODE_SWITCH;
}

export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: [
      // Subpath aliases first (Vite resolves top-to-bottom).
      { find: '@hbc/ui-kit/app-shell', replacement: resolve(__dirname, '../../packages/ui-kit/src/app-shell.ts') },
      { find: '@hbc/ui-kit/theme', replacement: resolve(__dirname, '../../packages/ui-kit/src/theme/index.ts') },
      { find: '@hbc/ui-kit/icons', replacement: resolve(__dirname, '../../packages/ui-kit/src/icons/index.tsx') },
      { find: '@hbc/ui-kit', replacement: resolve(__dirname, '../../packages/ui-kit/src/index.ts') },
      // Subpath alias must come before the root alias. Otherwise imports like
      // `@hbc/models/myWork` can be concatenated onto `index.ts` as
      // `.../index.ts/myWork`, which fails with ENOTDIR.
      { find: /^@hbc\/models\/(.*)/, replacement: resolve(__dirname, '../../packages/models/src/$1/index.ts') },
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
