import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@hbc/ui-kit/homepage': resolve(__dirname, '../ui-kit/src/homepage.ts'),
      '@hbc/ui-kit/theme': resolve(__dirname, '../ui-kit/src/theme/index.ts'),
      '@hbc/ui-kit': resolve(__dirname, '../ui-kit/src/index.ts'),
      '@hbc/sharepoint-platform': resolve(__dirname, '../sharepoint-platform/src/index.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
  },
});
