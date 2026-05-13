import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tools/**/*.test.ts'],
    exclude: ['node_modules/**', 'dist/**', 'coverage/**', 'tools/pnp-runner-local/**'],
  },
});
