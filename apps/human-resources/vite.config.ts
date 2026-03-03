import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@hbc/models': path.resolve(__dirname, '../../packages/models/src'),
      '@hbc/data-access': path.resolve(__dirname, '../../packages/data-access/src'),
      '@hbc/query-hooks': path.resolve(__dirname, '../../packages/query-hooks/src'),
      '@hbc/auth': path.resolve(__dirname, '../../packages/auth/src'),
      '@hbc/shell': path.resolve(__dirname, '../../packages/shell/src'),
      '@hbc/ui-kit': path.resolve(__dirname, '../../packages/ui-kit/src'),
    },
  },
  define: {
    'process.env.HBC_ADAPTER_MODE': mode === 'development' ? '"mock"' : '"proxy"',
    'process.env.HBC_AUTH_MODE': mode === 'development' ? '"mock"' : '"spfx"',
  },
  server: { port: 4011 },
}));
