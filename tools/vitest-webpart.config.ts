/**
 * Shared Vitest configuration for SPFx webpart apps.
 *
 * Provides resolve aliases for all @hbc/* workspace packages including
 * the 11 @hbc/features-* domain packages. Import this config in each
 * webpart app's vitest.config.ts via mergeConfig().
 *
 * @see docs/architecture/plans/PH7-BW-0-Shared-Feature-Package.md
 */
import { defineConfig } from 'vitest/config';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

export default defineConfig({
  resolve: {
    alias: {
      // Core workspace packages
      '@hbc/models': path.resolve(root, 'packages/models/src'),
      '@hbc/data-access': path.resolve(root, 'packages/data-access/src'),
      '@hbc/query-hooks': path.resolve(root, 'packages/query-hooks/src'),
      '@hbc/auth': path.resolve(root, 'packages/auth/src'),
      '@hbc/shell': path.resolve(root, 'packages/shell/src'),
      '@hbc/ui-kit': path.resolve(root, 'packages/ui-kit/src'),
      '@hbc/provisioning': path.resolve(root, 'packages/provisioning/src'),

      // Feature domain packages
      '@hbc/features-accounting': path.resolve(root, 'packages/features/accounting/src/index.ts'),
      '@hbc/features-estimating': path.resolve(root, 'packages/features/estimating/src/index.ts'),
      '@hbc/features-project-hub': path.resolve(root, 'packages/features/project-hub/src/index.ts'),
      '@hbc/features-business-development': path.resolve(root, 'packages/features/business-development/src/index.ts'),
      '@hbc/features-leadership': path.resolve(root, 'packages/features/leadership/src/index.ts'),
      '@hbc/features-admin': path.resolve(root, 'packages/features/admin/src/index.ts'),
      '@hbc/features-safety': path.resolve(root, 'packages/features/safety/src/index.ts'),
      '@hbc/features-quality-control-warranty': path.resolve(root, 'packages/features/quality-control-warranty/src/index.ts'),
      '@hbc/features-risk-management': path.resolve(root, 'packages/features/risk-management/src/index.ts'),
      '@hbc/features-operational-excellence': path.resolve(root, 'packages/features/operational-excellence/src/index.ts'),
      '@hbc/features-human-resources': path.resolve(root, 'packages/features/human-resources/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
