/**
 * W0-G5-T08: Vitest configuration for PWA unit and integration tests.
 * Follows the P1 package pattern from vitest.workspace.ts.
 */
import { defineConfig } from 'vitest/config';
import path from 'node:path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const resolve = (p: string) => path.resolve(__dirname, p);

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['dist/**', 'node_modules/**'],
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 10_000,
    hookTimeout: 10_000,
  },
  resolve: {
    alias: {
      '@hbc/models': resolve('../../packages/models/src/index.ts'),
      '@hbc/data-access': resolve('../../packages/data-access/src/index.ts'),
      '@hbc/query-hooks': resolve('../../packages/query-hooks/src/index.ts'),
      '@hbc/auth': resolve('../../packages/auth/src'),
      '@hbc/shell/dev-toolbar': resolve('../../packages/shell/src/devToolbar/index.ts'),
      '@hbc/shell': resolve('../../packages/shell/src'),
      '@hbc/ui-kit': resolve('../../packages/ui-kit/src'),
      '@hbc/provisioning': resolve('../../packages/provisioning/src/index.ts'),
      '@hbc/session-state': resolve('../../packages/session-state/src/index.ts'),
      '@hbc/step-wizard': resolve('../../packages/step-wizard/src/index.ts'),
      '@hbc/smart-empty-state': resolve('../../packages/smart-empty-state/src/index.ts'),
      '@hbc/complexity': resolve('../../packages/complexity/src/index.ts'),
      '@hbc/features-estimating': resolve('../../packages/features/estimating/src/index.ts'),
      '@hbc/notification-intelligence': resolve('../../packages/notification-intelligence/src/index.ts'),
      '@hbc/bic-next-move': resolve('../../packages/bic-next-move/src/index.ts'),
    },
  },
});
