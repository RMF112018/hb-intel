import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
    exclude: ['e2e/**', 'node_modules/**'],
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/index.ts',
        'src/types/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/empty-state/**',
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
      '@hbc/features-estimating/testing': resolve(__dirname, './testing/index.ts'),
      '@hbc/health-indicator': resolve(__dirname, '../../health-indicator/src/index.ts'),
      '@hbc/post-bid-autopsy/testing': resolve(__dirname, '../../post-bid-autopsy/testing/index.ts'),
      '@hbc/post-bid-autopsy': resolve(__dirname, '../../post-bid-autopsy/src/index.ts'),
      '@hbc/step-wizard': resolve(__dirname, '../../step-wizard/src/index.ts'),
    },
  },
});
