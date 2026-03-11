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
        'src/**/*.stories.{ts,tsx}',
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
      '@hbc/smart-empty-state/testing': resolve(__dirname, './testing/index.ts'),
      '@hbc/features-estimating': resolve(__dirname, '../features/estimating/src/index.ts'),
      '@hbc/features-business-development': resolve(__dirname, '../features/business-development/src/index.ts'),
      '@hbc/features-project-hub': resolve(__dirname, '../features/project-hub/src/index.ts'),
      '@hbc/features-admin': resolve(__dirname, '../features/admin/src/index.ts'),
      '@hbc/complexity': resolve(__dirname, '../complexity/src/index.ts'),
      '@hbc/ui-kit/icons': resolve(__dirname, '../ui-kit/src/icons/index.tsx'),
      '@hbc/ui-kit/app-shell': resolve(__dirname, '../ui-kit/src/app-shell.ts'),
      '@hbc/ui-kit': resolve(__dirname, '../ui-kit/src/index.ts'),
    },
  },
});
