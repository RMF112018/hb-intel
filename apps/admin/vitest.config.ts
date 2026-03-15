import { createWebpartVitestConfig } from '../../tools/vitest-webpart.config.js';
import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { createRequire } from 'module';

const base = createWebpartVitestConfig(__dirname);
const root = resolve(__dirname, '../..');

// Resolve @tanstack/react-virtual from the ui-kit package context
// so vi.mock can intercept it in tests (jsdom virtualizer renders 0 rows)
const require_ = createRequire(resolve(root, 'packages/ui-kit/package.json'));
const reactVirtualEntry = require_.resolve('@tanstack/react-virtual');

export default mergeConfig(base, {
  resolve: {
    alias: {
      '@tanstack/react-virtual': reactVirtualEntry,
    },
  },
});
