# SF11-T07 — Reference Implementations: `@hbc/smart-empty-state`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-11-Shared-Feature-Smart-Empty-State.md`
**Decisions Applied:** D-02, D-03, D-08, D-09
**Estimated Effort:** 0.15 sprint-weeks
**Depends On:** T06

> **Doc Classification:** Canonical Normative Plan — SF11-T07 integration/reference task; sub-plan of `SF11-Smart-Empty-State.md`.

---

## Objective

Provide canonical empty-state config examples for four high-priority modules to standardize adoption patterns.

---

## Required Reference Configs

1. `bdScorecardsEmptyStateConfig`
2. `estimatingPursuitsEmptyStateConfig`
3. `projectHubProjectsEmptyStateConfig`
4. `adminProvisioningEmptyStateConfig`

Each config must include all five classifications and at least one role-aware copy variant.

---

## Config Pattern (Canonical)

```typescript
export const estimatingPursuitsEmptyStateConfig: ISmartEmptyStateConfig = {
  resolve: (context) => {
    if (context.isLoadError) {
      return {
        module: 'estimating',
        view: 'pursuits',
        classification: 'loading-failed',
        heading: 'Unable to load pursuits',
        description: 'Check your connection and retry.',
        primaryAction: { label: 'Retry', onClick: () => {/* refetch */} },
      };
    }

    if (!context.hasPermission) {
      return {
        module: 'estimating',
        view: 'pursuits',
        classification: 'permission-empty',
        heading: "You don't have access to Estimating Pursuits",
        description: 'Contact your coordinator or administrator.',
      };
    }

    if (context.hasActiveFilters) {
      return {
        module: 'estimating',
        view: 'pursuits',
        classification: 'filter-empty',
        heading: 'No pursuits match your filters',
        description: 'Adjust search or clear filters.',
        filterClearAction: { label: 'Clear Filters', onClick: () => {/* clear */} },
      };
    }

    if (context.isFirstVisit) {
      return {
        module: 'estimating',
        view: 'pursuits',
        classification: 'first-use',
        heading: 'Welcome to Estimating Pursuits',
        description: 'Track active bids from approval to award.',
        primaryAction: { label: 'Create Pursuit', href: '/estimating/pursuits/new' },
        secondaryAction: { label: 'Import from Excel', href: '/admin/data-seeding?type=estimating-pursuit' },
        coachingTip: 'Tip: Most first pursuits arrive from BD handoff after Go/No-Go approval.',
      };
    }

    return {
      module: 'estimating',
      view: 'pursuits',
      classification: 'truly-empty',
      heading: 'No active pursuits',
      description: 'Create a pursuit to begin tracking bids.',
      primaryAction: { label: 'Create Pursuit', href: '/estimating/pursuits/new' },
    };
  },
};
```

---

## Boundary Rules

- `@hbc/smart-empty-state` remains domain-agnostic.
- Domain modules own route links and module-specific copy.
- No imports from feature packages into `@hbc/smart-empty-state`.

---

## Verification Commands

```bash
rg -n "ISmartEmptyStateConfig" packages/features
pnpm turbo run check-types --filter packages/features/business-development...
pnpm turbo run check-types --filter packages/features/estimating...
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF11-T07 completed: 2026-03-11
Implementation:
- estimatingPursuitsEmptyStateConfig: estimator role-aware first-use variant
- bdScorecardsEmptyStateConfig: executive role-aware first-use variant
- projectHubProjectsEmptyStateConfig: project-manager role-aware first-use variant
- adminProvisioningEmptyStateConfig: non-admin role-aware permission-empty variant
- All configs implement full D-01 precedence chain
- filterClearAction only on filter-empty; coachingTip only on first-use
- 4× barrel exports, package.json deps, tsconfig references wired
- vitest.config.ts aliases added for cross-package integration tests

Testing:
- 31 new integration tests (referenceConfigs.integration.test.ts)
- 7 per-config tests × 4 configs + 3 cross-config tests
- 118 total package tests passing

Gates:
- check-types: 0 errors (47/47)
- build: 0 errors (35/35)
- tests: 118 pass
- Pre-existing lint error in setup.ts:23 (not from T07)
-->
