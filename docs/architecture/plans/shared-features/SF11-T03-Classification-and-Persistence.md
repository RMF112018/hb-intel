# SF11-T03 — Classification and Persistence: `@hbc/smart-empty-state`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-11-Shared-Feature-Smart-Empty-State.md`
**Decisions Applied:** D-01, D-04
**Estimated Effort:** 0.3 sprint-weeks
**Depends On:** T02

> **Doc Classification:** Canonical Normative Plan — SF11-T03 classification/persistence task; sub-plan of `SF11-Smart-Empty-State.md`.

---

## Objective

Implement the deterministic classification utility and the first-visit persistence adapter with safe browser fallback behavior.

---

## Classification Utility

**File:** `src/classification/classifyEmptyState.ts`

```typescript
import type { EmptyStateClassification, IEmptyStateContext } from '../types/ISmartEmptyState';

export function classifyEmptyState(context: IEmptyStateContext): EmptyStateClassification {
  if (context.isLoadError) return 'loading-failed';
  if (!context.hasPermission) return 'permission-empty';
  if (context.hasActiveFilters) return 'filter-empty';
  if (context.isFirstVisit) return 'first-use';
  return 'truly-empty';
}
```

Precedence is locked by D-01 and must never be reordered without a superseding ADR.

---

## Visit Store Adapter

**File:** `src/classification/emptyStateVisitStore.ts`

Implement:

- `createEmptyStateVisitStore(storage?: Storage): IEmptyStateVisitStore`
- key builder: `hbc::empty-state::visited::{module}::{view}`
- behavior:
  - storage read/write guarded by try/catch
  - if storage unavailable, use in-memory `Set<string>` fallback

---

## Failure Modes

- Storage blocked (SPFx/private mode): fallback store prevents runtime failure.
- Corrupted value in storage: treated as not visited.
- Missing module/view: throw development error in non-production builds.

---

## Verification Commands

```bash
pnpm --filter @hbc/smart-empty-state check-types
pnpm --filter @hbc/smart-empty-state test -- classifyEmptyState emptyStateVisitStore
```
