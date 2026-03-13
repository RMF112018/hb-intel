import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: [
        'src/constants/index.ts',
        'src/model/evidence/index.ts',
        'src/model/confidence/index.ts',
        'src/model/taxonomy/index.ts',
        'src/model/governance/index.ts',
        'src/model/governance/blockers.ts',
        'src/model/publication/index.ts',
        'src/model/publication/projections.ts',
        'src/model/lifecycle/*.ts',
        'src/model/storage/*.ts',
        'src/model/index.ts',
        'src/api/index.ts',
        'src/hooks/*.ts',
        'src/telemetry/index.ts',
        'src/integrations/*.ts',
        'testing/index.ts',
      ],
      exclude: ['**/*.test.ts', '**/*.test.tsx'],
      thresholds: {
        lines: 95,
        branches: 95,
        functions: 95,
        statements: 95,
      },
    },
  },
  resolve: {
    alias: [
      {
        find: '@hbc/post-bid-autopsy/testing',
        replacement: resolve(__dirname, './testing/index.ts'),
      },
      {
        find: '@hbc/post-bid-autopsy',
        replacement: resolve(__dirname, './src/index.ts'),
      },
    ],
  },
});
