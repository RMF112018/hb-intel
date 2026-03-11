import { describe, it, expect } from 'vitest';
import { createMockEmptyStateContext } from '@hbc/smart-empty-state/testing';
import type { ISmartEmptyStateConfig, IEmptyStateConfig } from '../types/ISmartEmptyState.js';
import { estimatingPursuitsEmptyStateConfig } from '@hbc/features-estimating';
import { bdScorecardsEmptyStateConfig } from '@hbc/features-business-development';
import { projectHubProjectsEmptyStateConfig } from '@hbc/features-project-hub';
import { adminProvisioningEmptyStateConfig } from '@hbc/features-admin';

type ConfigEntry = {
  name: string;
  config: ISmartEmptyStateConfig;
  module: string;
  view: string;
  roleAwareRole: string;
  roleAwareField: 'description' | 'heading';
  roleAwareContextOverrides: Record<string, unknown>;
};

const configs: ConfigEntry[] = [
  {
    name: 'estimatingPursuitsEmptyStateConfig',
    config: estimatingPursuitsEmptyStateConfig,
    module: 'estimating',
    view: 'pursuits',
    roleAwareRole: 'estimator',
    roleAwareField: 'description',
    roleAwareContextOverrides: { isFirstVisit: true },
  },
  {
    name: 'bdScorecardsEmptyStateConfig',
    config: bdScorecardsEmptyStateConfig,
    module: 'business-development',
    view: 'scorecards',
    roleAwareRole: 'executive',
    roleAwareField: 'description',
    roleAwareContextOverrides: { isFirstVisit: true },
  },
  {
    name: 'projectHubProjectsEmptyStateConfig',
    config: projectHubProjectsEmptyStateConfig,
    module: 'project-hub',
    view: 'projects',
    roleAwareRole: 'project-manager',
    roleAwareField: 'description',
    roleAwareContextOverrides: { isFirstVisit: true },
  },
  {
    name: 'adminProvisioningEmptyStateConfig',
    config: adminProvisioningEmptyStateConfig,
    module: 'admin',
    view: 'provisioning',
    roleAwareRole: 'admin',
    roleAwareField: 'description',
    roleAwareContextOverrides: { hasPermission: false },
  },
];

describe.each(configs)('$name', ({ config, module, view, roleAwareRole, roleAwareField, roleAwareContextOverrides }) => {
  it('resolves loading-failed classification when isLoadError is true', () => {
    const context = createMockEmptyStateContext({ module, view, isLoadError: true });
    const result = config.resolve(context);

    expect(result.classification).toBe('loading-failed');
    expect(result.heading).toBeTruthy();
    expect(result.filterClearAction).toBeUndefined();
  });

  it('resolves permission-empty classification when hasPermission is false', () => {
    const context = createMockEmptyStateContext({ module, view, hasPermission: false });
    const result = config.resolve(context);

    expect(result.classification).toBe('permission-empty');
    expect(result.heading).toBeTruthy();
  });

  it('resolves filter-empty classification with filterClearAction when hasActiveFilters is true', () => {
    const context = createMockEmptyStateContext({ module, view, hasActiveFilters: true });
    const result = config.resolve(context);

    expect(result.classification).toBe('filter-empty');
    expect(result.filterClearAction).toBeDefined();
    expect(result.filterClearAction!.label).toBeTruthy();
  });

  it('resolves first-use classification with coachingTip when isFirstVisit is true', () => {
    const context = createMockEmptyStateContext({ module, view, isFirstVisit: true });
    const result = config.resolve(context);

    expect(result.classification).toBe('first-use');
    expect(result.coachingTip).toBeTruthy();
    expect(result.primaryAction).toBeDefined();
  });

  it('resolves truly-empty classification by default', () => {
    const context = createMockEmptyStateContext({ module, view });
    const result = config.resolve(context);

    expect(result.classification).toBe('truly-empty');
    expect(result.primaryAction).toBeDefined();
  });

  it('produces role-aware variant for specific role', () => {
    const defaultContext = createMockEmptyStateContext({ module, view, ...roleAwareContextOverrides });
    const roleContext = createMockEmptyStateContext({
      module,
      view,
      ...roleAwareContextOverrides,
      currentUserRole: roleAwareRole,
    });

    const defaultResult = config.resolve(defaultContext);
    const roleResult = config.resolve(roleContext);

    expect(roleResult[roleAwareField]).not.toBe(defaultResult[roleAwareField]);
  });

  it('has correct module and view and all required fields', () => {
    const context = createMockEmptyStateContext({ module, view });
    const result = config.resolve(context);

    expect(result.module).toBe(module);
    expect(result.view).toBe(view);
    expect(result.classification).toBeTruthy();
    expect(result.heading).toBeTruthy();
    expect(result.description).toBeTruthy();
  });
});

describe('Cross-config integration', () => {
  it('D-01 precedence: loading-failed wins when all flags are true', () => {
    for (const { config, module, view } of configs) {
      const context = createMockEmptyStateContext({
        module,
        view,
        isLoadError: true,
        hasPermission: false,
        hasActiveFilters: true,
        isFirstVisit: true,
      });
      const result = config.resolve(context);
      expect(result.classification).toBe('loading-failed');
    }
  });

  it('filterClearAction is only present for filter-empty classification', () => {
    const classifications = ['loading-failed', 'permission-empty', 'first-use', 'truly-empty'] as const;

    for (const { config, module, view } of configs) {
      for (const classification of classifications) {
        let context;
        switch (classification) {
          case 'loading-failed':
            context = createMockEmptyStateContext({ module, view, isLoadError: true });
            break;
          case 'permission-empty':
            context = createMockEmptyStateContext({ module, view, hasPermission: false });
            break;
          case 'first-use':
            context = createMockEmptyStateContext({ module, view, isFirstVisit: true });
            break;
          case 'truly-empty':
            context = createMockEmptyStateContext({ module, view });
            break;
        }
        const result = config.resolve(context);
        expect(result.filterClearAction).toBeUndefined();
      }
    }
  });

  it('coachingTip is only present for first-use classification', () => {
    const nonFirstUseContexts = [
      { isLoadError: true },
      { hasPermission: false },
      { hasActiveFilters: true },
      {},
    ];

    for (const { config, module, view } of configs) {
      for (const overrides of nonFirstUseContexts) {
        const context = createMockEmptyStateContext({ module, view, ...overrides });
        const result = config.resolve(context);
        expect(result.coachingTip).toBeUndefined();
      }
    }
  });
});
