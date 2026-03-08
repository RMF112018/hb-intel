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
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/__tests__/**',
        'src/**/index.ts',
        'src/**/__stories__/**',
        'src/types/**',
        'src/vite-env.d.ts',
      ],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      },
    },
  },
  resolve: {
    alias: {
      '@hbc/bic-next-move/testing': resolve(__dirname, './testing/index.ts'),
      '@hbc/ui-kit/app-shell': resolve(__dirname, '../ui-kit/src/app-shell.ts'),
      '@hbc/ui-kit': resolve(__dirname, '../ui-kit/src/index.ts'),
      // Stub — package not yet scaffolded; vi.mock in setup.ts provides test double
      '@hbc/notification-intelligence': resolve(__dirname, './src/__tests__/__mocks__/notification-intelligence.ts'),
    },
  },
});
