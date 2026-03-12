import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      '@hbc/score-benchmark': resolve(__dirname, '../../score-benchmark/src/index.ts'),
      '@hbc/bic-next-move': resolve(__dirname, '../../bic-next-move/src/index.ts'),
      '@hbc/project-canvas': resolve(__dirname, '../../project-canvas/src/index.ts'),
    },
  },
});
