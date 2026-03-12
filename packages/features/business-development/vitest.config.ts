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
    exclude: ['e2e/**', 'node_modules/**'],
    setupFiles: [resolve(__dirname, './src/score-benchmark/components/setupTests.ts')],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/score-benchmark/integrations/**/*.{ts,tsx}'],
      exclude: [
        'src/score-benchmark/**/*.d.ts',
        'src/score-benchmark/**/index.ts',
        'src/score-benchmark/integrations/bicNextMoveAdapter.ts',
        'src/score-benchmark/integrations/healthIndicatorAdapter.ts',
        'src/score-benchmark/integrations/projectCanvasAdapter.ts',
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
      '@hbc/score-benchmark/testing': resolve(__dirname, '../../score-benchmark/testing/index.ts'),
      '@hbc/score-benchmark': resolve(__dirname, '../../score-benchmark/src/index.ts'),
      '@hbc/strategic-intelligence/testing': resolve(
        __dirname,
        '../../strategic-intelligence/testing/index.ts'
      ),
      '@hbc/strategic-intelligence': resolve(__dirname, '../../strategic-intelligence/src/index.ts'),
      '@hbc/features-business-development/testing': resolve(__dirname, './testing/index.ts'),
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
