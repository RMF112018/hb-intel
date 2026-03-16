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
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/test/**',
        'src/**/index.ts',
        'src/types/**',
        'testing/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.stories.tsx',
        'src/server.ts',
        'src/config/**',
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
      '@hbc/acknowledgment/testing': resolve(__dirname, './testing/index.ts'),
      '@hbc/session-state/testing': resolve(__dirname, '../session-state/testing/index.ts'),
      '@hbc/session-state': resolve(__dirname, '../session-state/src/index.ts'),
      '@hbc/ui-kit/app-shell': resolve(__dirname, '../ui-kit/src/app-shell.ts'),
      '@hbc/ui-kit/theme': resolve(__dirname, '../ui-kit/src/theme/index.ts'),
      '@hbc/ui-kit': resolve(__dirname, '../ui-kit/src/index.ts'),
      '@hbc/complexity': resolve(__dirname, '../complexity/src/index.ts'),
    },
  },
});
