import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export default defineConfig({
  test: {
    environment: 'node',
    include: ['scripts/**/*.test.ts'],
    exclude: ['node_modules/**', 'dist/**', 'coverage/**'],
  },
  resolve: {
    // Script tests that exercise modules importing `@hbc/models` (a pnpm
    // workspace package) need the built dist resolved explicitly — the
    // existing self-contained script tests do not, so this only adds
    // resolution capability.
    alias: {
      '@hbc/models/myWork/fixtures': resolve(
        repoRoot,
        'packages/models/dist/myWork/fixtures/index.js',
      ),
      '@hbc/models/myWork': resolve(repoRoot, 'packages/models/dist/myWork/index.js'),
      '@hbc/models': resolve(repoRoot, 'packages/models/dist/index.js'),
    },
  },
});
