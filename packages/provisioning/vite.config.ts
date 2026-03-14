import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'es2022',
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    sourcemap: true,
    rollupOptions: {
      external: [
        'react',
        'zustand',
        '@hbc/models',
        '@hbc/bic-next-move',
        '@hbc/workflow-handoff',
      ],
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['dist/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/notification-registrations.ts',
        'src/notification-templates.ts',
        'src/bic-config.ts',
        'src/bic-registration.ts',
        'src/handoff-config.ts',
      ],
      exclude: ['src/**/*.test.ts'],
      all: true,
      lines: 95,
      functions: 95,
      branches: 95,
      statements: 95,
    },
  },
});
