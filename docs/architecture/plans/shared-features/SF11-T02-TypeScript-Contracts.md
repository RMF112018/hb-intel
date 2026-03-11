# SF11-T02 — TypeScript Contracts: `@hbc/smart-empty-state`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-11-Shared-Feature-Smart-Empty-State.md`
**Decisions Applied:** D-01 through D-06, D-10
**Estimated Effort:** 0.25 sprint-weeks
**Depends On:** T01

> **Doc Classification:** Canonical Normative Plan — SF11-T02 contracts task; sub-plan of `SF11-Smart-Empty-State.md`.

---

## Objective

Define the full contract layer for classification, context, configuration, actions, persistence adapter, and hook return types.

---

## Contracts (`src/types/ISmartEmptyState.ts`)

```typescript
export type EmptyStateClassification =
  | 'first-use'
  | 'truly-empty'
  | 'filter-empty'
  | 'permission-empty'
  | 'loading-failed';

export type EmptyStateVariant = 'full-page' | 'inline';

export interface IEmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'button' | 'link';
}

export interface IEmptyStateContext {
  module: string;
  view: string;
  hasActiveFilters: boolean;
  hasPermission: boolean;
  isFirstVisit: boolean;
  currentUserRole: string;
  isLoadError: boolean;
}

export interface IEmptyStateConfig {
  module: string;
  view: string;
  classification: EmptyStateClassification;
  illustration?: string;
  heading: string;
  description: string;
  primaryAction?: IEmptyStateAction;
  secondaryAction?: IEmptyStateAction;
  filterClearAction?: IEmptyStateAction;
  coachingTip?: string;
}

export interface ISmartEmptyStateConfig {
  resolve: (context: IEmptyStateContext) => IEmptyStateConfig;
}

export interface IEmptyStateVisitStore {
  hasVisited: (module: string, view: string) => boolean;
  markVisited: (module: string, view: string) => void;
}

export interface IUseFirstVisitResult {
  isFirstVisit: boolean;
  markVisited: () => void;
}

export interface IUseEmptyStateResult {
  classification: EmptyStateClassification;
  resolved: IEmptyStateConfig;
}
```

---

## Constants (`src/constants/emptyStateDefaults.ts`)

```typescript
export const EMPTY_STATE_VISIT_KEY_PREFIX = 'hbc::empty-state::visited';
export const EMPTY_STATE_COACHING_COLLAPSE_LABEL = 'Need help getting started?';

export const emptyStateClassificationLabel: Record<
  EmptyStateClassification,
  string
> = {
  'first-use': 'First Use',
  'truly-empty': 'No Data',
  'filter-empty': 'No Filter Matches',
  'permission-empty': 'No Access',
  'loading-failed': 'Load Failed',
};
```

---

## Contract Rules

- `resolve(context)` must return an `IEmptyStateConfig` with matching `module`/`view`.
- `IEmptyStateAction` must define one of `href` or `onClick`.
- `filterClearAction` is valid only for `filter-empty` classification.

---

## Verification Commands

```bash
pnpm --filter @hbc/smart-empty-state check-types
pnpm --filter @hbc/smart-empty-state build
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF11-T02 completed: 2026-03-11
- Rewrote ISmartEmptyState.ts with 5 classification values, 2 variants, 6 interfaces
- Rewrote emptyStateDefaults.ts with 3 constants (EMPTY_STATE_VISIT_KEY_PREFIX, EMPTY_STATE_COACHING_COLLAPSE_LABEL, emptyStateClassificationLabel)
- Updated all barrel exports (types/index.ts, constants/index.ts, src/index.ts)
- Updated downstream stubs: classifyEmptyState (IEmptyStateContext param), noopVisitStore (hasVisited/markVisited), useFirstVisit (IUseFirstVisitResult), useEmptyState (IUseEmptyStateResult)
- Updated testing fixtures: mockEmptyStateClassifications (5 new values), createMockEmptyStateConfig (ISmartEmptyStateConfig with resolve), createMockEmptyStateContext (IEmptyStateContext)
- Updated scaffold.test.ts for all new contracts
- All gates pass: check-types (0 errors), build (0 errors), test:coverage (100% all metrics), full monorepo build (35/35)
- Next: T03 Classification & Persistence
-->
