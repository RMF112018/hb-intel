# SF11-T08 — Testing Strategy: `@hbc/smart-empty-state`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-11-Shared-Feature-Smart-Empty-State.md`
**Decisions Applied:** D-01, D-04, D-05, D-10
**Estimated Effort:** 0.2 sprint-weeks
**Depends On:** T01–T07

> **Doc Classification:** Canonical Normative Plan — SF11-T08 testing strategy task; sub-plan of `SF11-Smart-Empty-State.md`.

---

## Objective

Define canonical fixtures and test coverage for classification logic, persistence adapters, hooks, components, Storybook states, and end-to-end empty-state behavior.

---

## Testing Sub-Path: `testing/`

### `testing/createMockEmptyStateContext.ts`

```typescript
export function createMockEmptyStateContext(
  overrides: Partial<IEmptyStateContext> = {}
): IEmptyStateContext {
  return {
    module: 'estimating',
    view: 'pursuits',
    hasActiveFilters: false,
    hasPermission: true,
    isFirstVisit: false,
    currentUserRole: 'Estimator',
    isLoadError: false,
    ...overrides,
  };
}
```

### `testing/createMockEmptyStateConfig.ts`

```typescript
export function createMockEmptyStateConfig(
  overrides: Partial<IEmptyStateConfig> = {}
): IEmptyStateConfig {
  return {
    module: 'estimating',
    view: 'pursuits',
    classification: 'truly-empty',
    heading: 'No items yet',
    description: 'Create your first record to get started.',
    primaryAction: { label: 'Create', href: '/new' },
    ...overrides,
  };
}
```

### `testing/mockEmptyStateClassifications.ts`

```typescript
export const mockEmptyStateClassifications: EmptyStateClassification[] = [
  'first-use',
  'truly-empty',
  'filter-empty',
  'permission-empty',
  'loading-failed',
];
```

---

## Unit Tests

- `classifyEmptyState.test.ts`
  - validates D-01 precedence with overlapping flags.
- `emptyStateVisitStore.test.ts`
  - validates persisted and fallback behavior.
- `useFirstVisit.test.ts`
  - validates mark-and-read first-visit lifecycle.
- `useEmptyState.test.ts`
  - validates deterministic resolution and context normalization.

---

## Component Tests

- `HbcSmartEmptyState.test.tsx`
  - all 5 classifications
  - CTA rendering and callback behavior
  - coaching tip behavior across complexity tiers
  - full-page vs inline variants
- `HbcEmptyStateIllustration.test.tsx`
  - classification default icon mapping
  - custom key override and fallback handling

---

## Storybook Matrix

- 5 classifications × 2 variants
- complexity scenarios:
  - Essential (tip visible)
  - Standard (collapsible hint)
  - Expert (tip hidden)

---

## Playwright Scenarios

1. First-use onboarding state with create/import CTAs.
2. Filter-empty state with working “Clear Filters”.
3. Permission-empty state with no create CTA.
4. Loading-failed state with retry action.

---

## Verification Commands

```bash
pnpm --filter @hbc/smart-empty-state test --coverage
pnpm --filter @hbc/smart-empty-state storybook
pnpm exec playwright test --grep "smart-empty-state"
```
