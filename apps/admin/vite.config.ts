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
  define: {
    'process.env.HBC_ADAPTER_MODE': mode === 'development' ? '"mock"' : '"proxy"',
    'process.env.HBC_AUTH_MODE': mode === 'development' ? '"mock"' : '"spfx"',
  },
  server: { port: 4006 },
}));
