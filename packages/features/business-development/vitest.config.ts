import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
    setupFiles: [resolve(__dirname, './src/score-benchmark/components/setupTests.ts')],
  },
  resolve: {
    alias: {
      '@hbc/score-benchmark': resolve(__dirname, '../../score-benchmark/src/index.ts'),
      '@hbc/bic-next-move': resolve(__dirname, '../../bic-next-move/src/index.ts'),
      '@hbc/project-canvas': resolve(__dirname, '../../project-canvas/src/index.ts'),
      '@hbc/complexity': resolve(__dirname, '../../complexity/src/index.ts'),
      '@hbc/versioned-record': resolve(__dirname, '../../versioned-record/src/index.ts'),
      '@hbc/related-items': resolve(__dirname, '../../related-items/src/index.ts'),
      '@hbc/notification-intelligence': resolve(__dirname, '../../notification-intelligence/src/index.ts'),
      '@hbc/health-indicator': resolve(__dirname, '../../health-indicator/src/index.ts'),
      '@hbc/ai-assist': resolve(__dirname, '../../ai-assist/src/index.ts'),
      '@hbc/post-bid-autopsy': resolve(__dirname, '../../post-bid-autopsy/src/index.ts'),
    },
  },
});
