import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    setupFiles: ['./src/test-setup.ts']
  },
  resolve: {
    alias: {
      '@hbc/foleon-reader': resolve(__dirname, '../../packages/foleon-reader/src/index.ts'),
      '@hbc/homepage-launcher': resolve(__dirname, '../../packages/homepage-launcher/src/index.ts'),
      '@hbc/ui-kit/branding': resolve(__dirname, '../../packages/ui-kit/src/branding/index.ts'),
      '@hbc/ui-kit/homepage': resolve(__dirname, '../../packages/ui-kit/src/homepage.ts'),
      '@hbc/ui-kit/theme': resolve(__dirname, '../../packages/ui-kit/src/theme/index.ts'),
      '@hbc/ui-kit/icons': resolve(__dirname, '../../packages/ui-kit/src/icons/index.tsx'),
      '@hbc/ui-kit': resolve(__dirname, '../../packages/ui-kit/src/index.ts'),
      '@hbc/sharepoint-platform': resolve(__dirname, '../../packages/sharepoint-platform/src/index.ts')
    }
  }
});
