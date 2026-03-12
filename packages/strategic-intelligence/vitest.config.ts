import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true,
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: [
        'src/hooks/queryKeys.ts',
        'src/hooks/selectors.ts',
        'src/hooks/stateStore.ts',
        'src/model/governance/indexing.ts',
        'src/model/lifecycle/versioning.ts',
        'src/model/storage/queue.ts',
      ],
      exclude: [
        'src/**/*.d.ts',
        'src/**/index.ts',
        'src/types/**',
        'testing/**'
      ],
      thresholds: {
        lines: 95,
        branches: 95,
        functions: 95,
        statements: 95
      }
    }
  },
  resolve: {
    alias: {
      '@hbc/strategic-intelligence/testing': resolve(__dirname, './testing/index.ts')
    }
  }
});
