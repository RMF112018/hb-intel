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
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
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
        'src/icons/**',
        'src/module-configs/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@hbc/ui-kit': resolve(__dirname, './src/index.ts'),
      '@hbc/shell': resolve(__dirname, '../shell/src/index.ts'),
    },
  },
});
