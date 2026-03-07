import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@hbc/models': path.resolve(__dirname, '../../packages/models/src'),
      '@hbc/data-access': path.resolve(__dirname, '../../packages/data-access/src'),
      '@hbc/query-hooks': path.resolve(__dirname, '../../packages/query-hooks/src'),
      '@hbc/auth': path.resolve(__dirname, '../../packages/auth/src'),
      // Subpath alias must come before the root @hbc/shell alias — Vite matches aliases
      // in order, so the more specific entry wins over the bare package alias.
      '@hbc/shell/dev-toolbar': path.resolve(__dirname, '../../packages/shell/src/devToolbar/index.ts'),
      '@hbc/shell': path.resolve(__dirname, '../../packages/shell/src'),
      '@hbc/ui-kit': path.resolve(__dirname, '../../packages/ui-kit/src'),
    },
  },
  define: {
    'process.env.HBC_ADAPTER_MODE': '"mock"',
    'process.env.HBC_AUTH_MODE': '"mock"',
  },
  server: {
    port: 3000,
  },
});
