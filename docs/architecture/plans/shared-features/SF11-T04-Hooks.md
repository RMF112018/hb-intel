# SF11-T04 — Hooks: `@hbc/smart-empty-state`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-11-Shared-Feature-Smart-Empty-State.md`
**Decisions Applied:** D-01, D-02, D-04, D-05
**Estimated Effort:** 0.2 sprint-weeks
**Depends On:** T03

> **Doc Classification:** Canonical Normative Plan — SF11-T04 hooks task; sub-plan of `SF11-Smart-Empty-State.md`.

---

## Objective

Implement composable hooks for first-visit lifecycle and final resolved empty-state output.

---

## `useFirstVisit`

**File:** `src/hooks/useFirstVisit.ts`

```typescript
interface UseFirstVisitParams {
  module: string;
  view: string;
  store?: IEmptyStateVisitStore;
}

function useFirstVisit(params: UseFirstVisitParams): IUseFirstVisitResult;
```

Behavior:

- Computes initial `isFirstVisit` from store on mount.
- Exposes `markVisited()` that updates store and local state.
- Default store: browser adapter from T03.

---

## `useEmptyState`

**File:** `src/hooks/useEmptyState.ts`

```typescript
interface UseEmptyStateParams {
  config: ISmartEmptyStateConfig;
  context: Omit<IEmptyStateContext, 'isFirstVisit'> & { isFirstVisit?: boolean };
  firstVisitStore?: IEmptyStateVisitStore;
}

function useEmptyState(params: UseEmptyStateParams): IUseEmptyStateResult;
```

Behavior:

- Resolves first-visit via `useFirstVisit` when not passed explicitly.
- Applies D-01 classification helper.
- Calls `config.resolve()` with normalized context.
- Returns `{ classification, resolved }`.

---

## Hook Invariants

- Hook output is deterministic for equivalent input state.
- Hook does not own data-fetching; caller supplies load/error/filter/permission context.
- Hook does not mutate navigation; CTA behavior belongs to component/caller.

---

## Verification Commands

```bash
pnpm --filter @hbc/smart-empty-state check-types
pnpm --filter @hbc/smart-empty-state test -- useFirstVisit useEmptyState
```
