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
      include: ['src/**/*.{ts,tsx}'],
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
      '@hbc/score-benchmark/testing': resolve(__dirname, './testing/index.ts'),
      '@hbc/post-bid-autopsy': resolve(__dirname, '../post-bid-autopsy/src/index.ts'),
    }
  }
});
