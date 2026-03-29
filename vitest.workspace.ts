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
        '@hbc/ui-kit': resolve(__dirname, './packages/ui-kit/src/index.ts'),
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
  {
    name: '@hbc/pwa',
    root: path.resolve(__dirname, 'apps/pwa'),
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      exclude: ['dist/**', 'node_modules/**'],
      setupFiles: ['./src/test/setup.ts'],
      testTimeout: 10000,
      hookTimeout: 10000,
    },
    resolve: {
      alias: {
        '@hbc/models': resolve(__dirname, './packages/models/src/index.ts'),
        '@hbc/auth': resolve(__dirname, './packages/auth/src'),
        '@hbc/shell': resolve(__dirname, './packages/shell/src'),
        '@hbc/ui-kit': resolve(__dirname, './packages/ui-kit/src'),
        '@hbc/provisioning': resolve(__dirname, './packages/provisioning/src/index.ts'),
        '@hbc/session-state': resolve(__dirname, './packages/session-state/src/index.ts'),
        '@hbc/step-wizard': resolve(__dirname, './packages/step-wizard/src/index.ts'),
        '@hbc/smart-empty-state': resolve(__dirname, './packages/smart-empty-state/src/index.ts'),
        '@hbc/complexity': resolve(__dirname, './packages/complexity/src/index.ts'),
        '@hbc/features-estimating': resolve(__dirname, './packages/features/estimating/src/index.ts'),
        '@hbc/query-hooks': resolve(__dirname, './packages/query-hooks/src/index.ts'),
        '@hbc/notification-intelligence': resolve(__dirname, './packages/notification-intelligence/src/index.ts'),
      },
    },
  },
  {
    name: '@hbc/spfx',
    root: path.resolve(__dirname, 'packages/spfx'),
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      exclude: ['dist/**', 'node_modules/**'],
      setupFiles: ['./src/__tests__/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/webparts/projectSites/**/*.ts', 'src/webparts/projectSites/**/*.tsx'],
        exclude: [
          'src/**/*.test.ts',
          'src/**/*.test.tsx',
          'src/__tests__/**',
          'src/**/index.ts',
          'src/**/types.ts',
        ],
        all: true,
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
      testTimeout: 10000,
      hookTimeout: 10000,
    },
    resolve: {
      alias: {
        '@hbc/auth/spfx': resolve(__dirname, './packages/auth/src/spfx/index.ts'),
        '@hbc/auth': resolve(__dirname, './packages/auth/src/index.ts'),
        '@hbc/ui-kit': resolve(__dirname, './packages/ui-kit/src/index.ts'),
        '@hbc/sharepoint-docs': resolve(__dirname, './packages/sharepoint-docs/src/index.ts'),
      },
    },
  },
]);
