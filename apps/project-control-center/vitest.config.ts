import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    setupFiles: ['./src/test-setup.ts'],
  },
  resolve: {
    alias: {
      '@hbc/ui-kit/app-shell': resolve(__dirname, '../../packages/ui-kit/src/app-shell.ts'),
      '@hbc/ui-kit/theme': resolve(__dirname, '../../packages/ui-kit/src/theme/index.ts'),
      '@hbc/ui-kit': resolve(__dirname, '../../packages/ui-kit/src/index.ts'),
      '@hbc/models/pcc': resolve(__dirname, '../../packages/models/src/pcc/index.ts'),
      '@hbc/models': resolve(__dirname, '../../packages/models/src/index.ts'),
    },
  },
});
