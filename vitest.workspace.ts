// vitest.workspace.ts — Root workspace configuration for auth & shell testing
// D-PH5C-05: Root-cause Vitest fix with explicit absolute paths
// Version: 1.0
// Last Updated: 2026-03-07

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defineWorkspace } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineWorkspace([
  {
    name: '@hbc/auth',
    root: path.resolve(__dirname, 'packages/auth'),
    test: {
      globals: true,
      environment: 'node',
      include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      exclude: ['dist/**', 'node_modules/**'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.ts'],
        exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/index.ts'],
        all: true,
        lines: 95,
        functions: 95,
        branches: 90,
        statements: 95,
      },
      testTimeout: 10000,
      hookTimeout: 10000,
    },
  },
  {
    name: '@hbc/shell',
    root: path.resolve(__dirname, 'packages/shell'),
    test: {
      globals: true,
      environment: 'happy-dom',
      include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      exclude: ['dist/**', 'node_modules/**'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.ts', 'src/**/*.tsx'],
        exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/index.ts'],
        all: true,
        lines: 95,
        functions: 95,
        branches: 90,
        statements: 95,
      },
      testTimeout: 10000,
      hookTimeout: 10000,
    },
  },
]);
