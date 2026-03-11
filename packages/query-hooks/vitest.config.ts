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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/__tests__/**',
        'src/**/index.ts',
        'src/types/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@hbc/session-state/testing': resolve(__dirname, '../session-state/testing/index.ts'),
      '@hbc/session-state': resolve(__dirname, '../session-state/src/index.ts'),
      '@hbc/data-access': resolve(__dirname, '../data-access/src/index.ts'),
      '@hbc/models': resolve(__dirname, '../models/src/index.ts'),
    },
  },
});
