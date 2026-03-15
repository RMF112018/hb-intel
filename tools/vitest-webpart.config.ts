/**
 * Shared Vitest factory for all 11 SPFx webpart apps.
 * Each app's vitest.config.ts is a one-liner calling this factory.
 *
 * @decision D-PH7-BW-10
 * @see docs/architecture/plans/PH7-BW-10-Testing-Infrastructure.md
 */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export function createWebpartVitestConfig(appDir: string) {
  const root = resolve(appDir, '../..');

  return defineConfig({
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      exclude: ['dist/**', 'node_modules/**'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov', 'html'],
        thresholds: {
          global: {
            statements: 80,
            branches: 80,
            functions: 80,
            lines: 80,
          },
        },
        exclude: [
          '**/node_modules/**',
          '**/dist/**',
          '**/*.config.ts',
          '**/test/**',
          '**/*.d.ts',
        ],
      },
    },
    resolve: {
      alias: {
        // Shared packages
        '@hbc/models': resolve(root, 'packages/models/src/index.ts'),
        '@hbc/data-access': resolve(root, 'packages/data-access/src/index.ts'),
        '@hbc/query-hooks': resolve(root, 'packages/query-hooks/src/index.ts'),
        '@hbc/auth/spfx': resolve(root, 'packages/auth/src/spfx/index.ts'),
        '@hbc/auth': resolve(root, 'packages/auth/src/index.ts'),
        '@hbc/shell': resolve(root, 'packages/shell/src/index.ts'),
        '@hbc/ui-kit/app-shell': resolve(root, 'packages/ui-kit/src/app-shell.ts'),
        '@hbc/ui-kit/theme': resolve(root, 'packages/ui-kit/src/theme/index.ts'),
        '@hbc/ui-kit': resolve(root, 'packages/ui-kit/src/index.ts'),
        '@hbc/provisioning': resolve(root, 'packages/provisioning/src/index.ts'),
        '@hbc/complexity': resolve(root, 'packages/complexity/src/index.ts'),
        '@hbc/step-wizard': resolve(root, 'packages/step-wizard/src/index.ts'),
        '@hbc/workflow-handoff': resolve(root, 'packages/workflow-handoff/src/index.ts'),
        '@hbc/bic-next-move': resolve(root, 'packages/bic-next-move/src/index.ts'),
        '@hbc/session-state': resolve(root, 'packages/session-state/src/index.ts'),
        '@hbc/post-bid-autopsy': resolve(root, 'packages/post-bid-autopsy/src/index.ts'),
        '@hbc/notification-intelligence': resolve(root, 'packages/notification-intelligence/src/index.ts'),
        '@hbc/acknowledgment': resolve(root, 'packages/acknowledgment/src/index.ts'),
        '@hbc/ai-assist': resolve(root, 'packages/ai-assist/src/index.ts'),
        '@hbc/app-shell': resolve(root, 'packages/app-shell/src/index.ts'),
        '@hbc/data-seeding': resolve(root, 'packages/data-seeding/src/index.ts'),
        '@hbc/field-annotations': resolve(root, 'packages/field-annotations/src/index.ts'),
        '@hbc/health-indicator': resolve(root, 'packages/health-indicator/src/index.ts'),
        '@hbc/project-canvas': resolve(root, 'packages/project-canvas/src/index.ts'),
        '@hbc/related-items': resolve(root, 'packages/related-items/src/index.ts'),
        '@hbc/score-benchmark': resolve(root, 'packages/score-benchmark/src/index.ts'),
        '@hbc/sharepoint-docs': resolve(root, 'packages/sharepoint-docs/src/index.ts'),
        '@hbc/smart-empty-state': resolve(root, 'packages/smart-empty-state/src/index.ts'),
        '@hbc/strategic-intelligence': resolve(root, 'packages/strategic-intelligence/src/index.ts'),
        '@hbc/versioned-record': resolve(root, 'packages/versioned-record/src/index.ts'),
        // Feature packages
        '@hbc/features-accounting': resolve(root, 'packages/features/accounting/src/index.ts'),
        '@hbc/features-estimating': resolve(root, 'packages/features/estimating/src/index.ts'),
        '@hbc/features-project-hub': resolve(root, 'packages/features/project-hub/src/index.ts'),
        '@hbc/features-business-development': resolve(root, 'packages/features/business-development/src/index.ts'),
        '@hbc/features-leadership': resolve(root, 'packages/features/leadership/src/index.ts'),
        '@hbc/features-admin': resolve(root, 'packages/features/admin/src/index.ts'),
        '@hbc/features-safety': resolve(root, 'packages/features/safety/src/index.ts'),
        '@hbc/features-quality-control-warranty': resolve(root, 'packages/features/quality-control-warranty/src/index.ts'),
        '@hbc/features-risk-management': resolve(root, 'packages/features/risk-management/src/index.ts'),
        '@hbc/features-operational-excellence': resolve(root, 'packages/features/operational-excellence/src/index.ts'),
        '@hbc/features-human-resources': resolve(root, 'packages/features/human-resources/src/index.ts'),
        // Mock SPFx SDK — not available in jsdom
        '@microsoft/sp-core-library': resolve(root, 'tools/mocks/sp-core-library.ts'),
        '@microsoft/sp-webpart-base': resolve(root, 'tools/mocks/sp-webpart-base.ts'),
        '@microsoft/sp-property-pane': resolve(root, 'tools/mocks/sp-property-pane.ts'),
      },
    },
  });
}
