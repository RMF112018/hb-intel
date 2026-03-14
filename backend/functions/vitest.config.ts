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
        'src/functions/provisioningSaga/notification-dispatch.ts',
        'src/middleware/validateToken.ts',
        'src/services/table-storage-service.ts',
        'src/services/graph-service.ts',
        'src/services/notification-service.ts',
        'src/config/entra-group-definitions.ts',
        'src/config/template-file-manifest.ts',
        'src/config/wave0-env-registry.ts',
        'src/utils/validate-config.ts',
        'src/utils/diagnose-permissions.ts',
        'src/state-machine.ts',
      ],
      exclude: ['src/**/*.test.ts'],
      all: true,
      lines: 95,
      functions: 95,
      branches: 95,
      statements: 95,
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
            'src/config/*.test.ts',
            'src/utils/*.test.ts',
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
