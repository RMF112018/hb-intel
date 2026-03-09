// vitest.workspace.ts — Root workspace configuration for P1 package testing
// D-PH5C-05: Root-cause Vitest fix with explicit absolute paths
// PH7.8: Expanded to all five P1 packages with alias blocks
// Version: 1.1
// Last Updated: 2026-03-09

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { resolve } from 'node:path';
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
    resolve: {
      alias: {
        '@hbc/complexity': resolve(__dirname, './packages/complexity/src/index.ts'),
      },
    },
  },
  {
    name: '@hbc/sharepoint-docs',
    root: path.resolve(__dirname, 'packages/sharepoint-docs'),
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.spec.ts', 'src/**/*.spec.tsx'],
      exclude: ['dist/**', 'node_modules/**'],
      setupFiles: ['./src/__tests__/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.ts', 'src/**/*.tsx'],
        exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.spec.ts', 'src/**/*.spec.tsx', 'src/index.ts', 'src/types/**', 'src/constants/**'],
        all: true,
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      },
      testTimeout: 10000,
      hookTimeout: 10000,
    },
  },
  {
    name: '@hbc/bic-next-move',
    root: path.resolve(__dirname, 'packages/bic-next-move'),
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.spec.ts', 'src/**/*.spec.tsx'],
      exclude: ['dist/**', 'node_modules/**'],
      setupFiles: ['./src/__tests__/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.ts', 'src/**/*.tsx'],
        exclude: ['src/**/*.d.ts', 'src/__tests__/**', 'src/**/index.ts', 'src/**/__stories__/**', 'src/types/**'],
        all: true,
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      },
      testTimeout: 10000,
      hookTimeout: 10000,
    },
    resolve: {
      alias: {
        '@hbc/bic-next-move/testing': resolve(__dirname, './packages/bic-next-move/testing/index.ts'),
        '@hbc/complexity': resolve(__dirname, './packages/complexity/src/index.ts'),
        '@hbc/ui-kit/app-shell': resolve(__dirname, './packages/ui-kit/src/app-shell.ts'),
        '@hbc/ui-kit': resolve(__dirname, './packages/ui-kit/src/index.ts'),
        '@hbc/notification-intelligence': resolve(__dirname, './packages/bic-next-move/src/__tests__/__mocks__/notification-intelligence.ts'),
      },
    },
  },
  {
    name: '@hbc/complexity',
    root: path.resolve(__dirname, 'packages/complexity'),
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.spec.ts', 'src/**/*.spec.tsx'],
      exclude: ['dist/**', 'node_modules/**'],
      setupFiles: ['./src/__tests__/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.ts', 'src/**/*.tsx'],
        exclude: ['src/**/*.d.ts', 'src/__tests__/**', 'src/**/index.ts', 'src/**/__stories__/**', 'src/types/**', 'src/config/roleComplexityMap.ts'],
        all: true,
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      },
      testTimeout: 10000,
      hookTimeout: 10000,
    },
    resolve: {
      alias: {
        '@hbc/complexity/testing': resolve(__dirname, './packages/complexity/testing/index.ts'),
        '@hbc/ui-kit/app-shell': resolve(__dirname, './packages/ui-kit/src/app-shell.ts'),
        '@hbc/ui-kit': resolve(__dirname, './packages/ui-kit/src/index.ts'),
      },
    },
  },
]);
