import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
    exclude: ['e2e/**', 'node_modules/**'],
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/health-pulse/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.stories.{ts,tsx}',
        'src/__tests__/**',
        'src/health-pulse/types/**',
        'testing/**',
      ],
      thresholds: {
        lines: 95,
        branches: 95,
        functions: 95,
        statements: 95,
      },
    },
  },
  resolve: {
    alias: {
      '@hbc/features-project-hub/testing': resolve(__dirname, './testing/index.ts'),
    },
  },
});
