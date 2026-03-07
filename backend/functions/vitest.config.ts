import { defineConfig } from 'vitest/config';

/**
 * D-PH6-15 Layer 1 + Layer 2 Vitest projects for backend provisioning coverage.
 * Unit project is required on every PR; smoke project is opt-in via SMOKE_TEST.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 20000,
    hookTimeout: 20000,
    include: ['src/**/*.test.ts'],
    exclude: ['dist/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/functions/provisioningSaga/saga-orchestrator.ts',
        'src/functions/provisioningSaga/steps/**/*.ts',
        'src/middleware/validateToken.ts',
        'src/services/table-storage-service.ts',
        'src/state-machine.ts',
      ],
      exclude: ['src/**/*.test.ts'],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    projects: [
      {
        test: {
          name: 'unit',
          testTimeout: 20000,
          hookTimeout: 20000,
          include: [
            'src/functions/provisioningSaga/**/*.test.ts',
            'src/functions/provisioningSaga/steps/**/*.test.ts',
            'src/middleware/validateToken.test.ts',
            'src/services/*.test.ts',
            'src/state-machine.test.ts',
          ],
          exclude: ['src/functions/provisioningSaga/**/__tests__/smoke.test.ts'],
        },
      },
      {
        test: {
          name: 'smoke',
          include: ['src/functions/provisioningSaga/**/__tests__/smoke.test.ts'],
          testTimeout: 180000,
          hookTimeout: 180000,
        },
      },
    ],
  },
});
