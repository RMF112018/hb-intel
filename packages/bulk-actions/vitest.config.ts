import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  test: { globals: true, environment: 'jsdom', passWithNoTests: true, exclude: ['node_modules/**'],
    coverage: { provider: 'v8', reporter: ['text', 'lcov', 'html'], include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/**/*.test.{ts,tsx}', 'src/**/index.ts', 'src/types/**'],
      thresholds: { lines: 95, functions: 95, branches: 95, statements: 95 } } },
  resolve: { alias: { '@hbc/bulk-actions/testing': resolve(__dirname, './testing/index.ts'), '@hbc/models': resolve(__dirname, '../models/src/index.ts') } },
});
