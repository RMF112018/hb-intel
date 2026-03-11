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

<!-- IMPLEMENTATION PROGRESS & NOTES
SF11-T08 completed: 2026-03-11
Implementation:
- createMockEmptyStateConfig rewritten: returns IEmptyStateConfig (flat) with Partial<IEmptyStateConfig> overrides; defaults match plan (estimating/pursuits/truly-empty)
- createMockEmptyStateContext defaults updated: module='estimating', view='pursuits', currentUserRole='Estimator'
- useEmptyState.test.ts: 10 call sites updated to use inline ISmartEmptyStateConfig resolver wrappers
- mockEmptyStateClassifications: unchanged (already matched plan)

Storybook:
- .storybook/main.ts: Storybook 8 config (react-vite, essentials + a11y addons)
- .storybook/preview.tsx: preview with centered layout
- src/stories/HbcSmartEmptyState.stories.tsx: 13 stories total
  - 5 classifications × full-page variant
  - 5 classifications × inline variant
  - 3 complexity scenarios (Essential/Standard/Expert)
- package.json: @storybook/react-vite, addon-essentials, addon-a11y, storybook devDeps + script

Playwright:
- Scenarios documented in T08 plan; actual E2E implementation deferred to T09/dev-harness

Gates:
- check-types: 0 errors (47/47)
- build: 0 errors (35/35)
- lint: 0 errors (smart-empty-state clean; @hbc/acknowledgment has pre-existing warning — not T08)
- tests: 118 pass (8 test files)
- coverage: 100% statements, branches, functions, lines (exceeds 95% threshold)

Lint fix (2026-03-11):
- setup.ts:23 — replaced `require('react')` with `await import('react')` in async vi.mock factory
  to resolve @typescript-eslint/no-var-requires error
-->
