# SF02-T04 — Hooks: `useBicNextMove` & `useBicMyItems`

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-02-Shared-Feature-BIC-Next-Move.md`
**Decisions Applied:** D-01 (urgency thresholds), D-03 (transfer detection), D-04 (null owner), D-06 (fan-out), D-07 (staleness)
**Estimated Effort:** 1.0 sprint-week
**Depends On:** T01, T02, T03

---

## Objective

Implement the two primary hooks that all consumer modules use:
- `useBicNextMove<T>` — resolves complete `IBicNextMoveState` for a single item, performs hook-level transfer diff detection (D-03), and applies staleness strategy (D-07).
- `useBicMyItems` — fan-out aggregation across all registered modules using `executeBicFanOut` from T03, with tiered staleness (D-07).

Also exports `resolveFullBicState` — a pure utility used by module `queryFn` implementations (T03 module adoption).

---

## 3-Line Plan

1. Implement `resolveFullBicState` as a pure function — runs all config resolvers and returns `IBicNextMoveState`.
2. Implement `useBicNextMove` — wraps `resolveFullBicState` in a TanStack Query, adds ref-based diff detection, fires `recordBicTransfer` on ownership change.
3. Implement `useBicMyItems` — calls `executeBicFanOut` (or server stub) via TanStack Query with 3-minute staleness + window focus refetch.

---

## `src/hooks/useBicNextMove.ts`

```typescript
import { useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { IBicNextMoveConfig, IBicNextMoveState, IBicOwner } from '../types/IBicNextMove';
import { computeUrgencyTier, computeIsOverdue } from '../constants/urgencyThresholds';
import { BIC_STALE_TIME_SINGLE_ITEM_MS } from '../constants/manifest';
import { recordBicTransfer } from '../transfer/recordBicTransfer';

// ─────────────────────────────────────────────────────────────────────────────
// Pure state resolver (also exported for module queryFn use in T03)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolves a complete IBicNextMoveState from a config + item snapshot.
 * Pure function — no side effects. Safe to call in queryFn implementations.
 *
 * Rules applied:
 * - D-01: urgency tier computed via computeUrgencyTier with per-config threshold overrides
 * - D-04: null currentOwner forces urgencyTier to 'immediate'
 * - D-08: transferHistory resolved from optional config.resolveTransferHistory
 */
export function resolveFullBicState<T>(
  item: T,
  config: IBicNextMoveConfig<T>
): IBicNextMoveState {
  const currentOwner = config.resolveCurrentOwner(item);
  const dueDate = config.resolveDueDate(item);
  const isBlocked = config.resolveIsBlocked(item);
  const transferHistory = config.resolveTransferHistory
    ? config.resolveTransferHistory(item)
    : [];

  // D-01: Compute urgency with per-config threshold overrides
  let urgencyTier = computeUrgencyTier(dueDate, config.urgencyThresholds);

  // D-04: Null owner always forces 'immediate' urgency regardless of due date
  if (currentOwner === null) {
    urgencyTier = 'immediate';
  }

  return {
    currentOwner,
    expectedAction: config.resolveExpectedAction(item),
    dueDate,
    isOverdue: computeIsOverdue(dueDate),
    isBlocked,
    blockedReason: isBlocked ? config.resolveBlockedReason(item) : null,
    previousOwner: config.resolvePreviousOwner(item),
    nextOwner: config.resolveNextOwner(item),
    escalationOwner: config.resolveEscalationOwner(item),
    transferHistory,
    urgencyTier,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export interface UseBicNextMoveOptions {
  /**
   * Unique key for this item instance, e.g. "bd-scorecard::a1b2c3".
   * Used as the TanStack Query cache key and as the deduplication key for transfers.
   */
  itemKey: string;
  /**
   * When true, hook performs background refetches on the standard stale schedule.
   * Set to false for items that are not currently visible to the user.
   * @default true
   */
  enabled?: boolean;
}

export interface UseBicNextMoveResult {
  state: IBicNextMoveState | undefined;
  isLoading: boolean;
  isError: boolean;
}

/**
 * Resolves and caches BIC state for a single item. Performs hook-level ownership
 * diff detection — fires recordBicTransfer() when currentOwner changes (D-03).
 *
 * Stale time: 60 seconds (BIC_STALE_TIME_SINGLE_ITEM_MS) (D-07).
 *
 * @example
 * const { state } = useBicNextMove(scorecard, scorecardBicConfig, {
 *   itemKey: `bd-scorecard::${scorecard.id}`,
 * });
 */
export function useBicNextMove<T>(
  item: T,
  config: IBicNextMoveConfig<T>,
  options: UseBicNextMoveOptions
): UseBicNextMoveResult {
  const { itemKey, enabled = true } = options;

  // Resolve state synchronously in query function — no async needed since
  // resolution runs entirely from cached item data (no additional API calls).
  const { data: state, isLoading, isError } = useQuery({
    queryKey: ['bic-next-move', itemKey],
    queryFn: () => resolveFullBicState(item, config),
    staleTime: BIC_STALE_TIME_SINGLE_ITEM_MS,
    enabled,
    // Re-resolve whenever item reference changes (upstream query invalidation)
    // by using item as part of the query key is intentionally avoided —
    // instead, the upstream module invalidates this query when it refreshes its data.
  });

  // ── D-03: Hook-level transfer diff detection ──────────────────────────────
  const previousOwnerRef = useRef<IBicOwner | null | undefined>(undefined);

  useEffect(() => {
    if (!state) return;

    const previousUserId = previousOwnerRef.current?.userId ?? null;
    const currentUserId = state.currentOwner?.userId ?? null;

    // Skip on first mount (undefined → first value is not a transfer)
    if (previousOwnerRef.current === undefined) {
      previousOwnerRef.current = state.currentOwner;
      return;
    }

    // Only fire if userId actually changed
    if (previousUserId !== currentUserId) {
      recordBicTransfer({
        itemKey,
        fromOwner: previousOwnerRef.current,
        toOwner: state.currentOwner,
        action: state.expectedAction,
      });
    }

    previousOwnerRef.current = state.currentOwner;
  }, [state?.currentOwner?.userId, itemKey]);
  // Note: state?.currentOwner?.userId is the precise dep — avoids firing on
  // unrelated state changes (dueDate updates, blockedReason changes, etc.)

  return { state, isLoading, isError };
}
```

---

## `src/hooks/useBicMyItems.ts`

```typescript
import { useQuery } from '@tanstack/react-query';
import type { IBicMyItemsResult, IBicRegisteredItem } from '../types/IBicNextMove';
import {
  BIC_AGGREGATION_MODE,
  BIC_STALE_TIME_MY_ITEMS_MS,
} from '../constants/manifest';
import { executeBicFanOut, executeServerAggregation } from '../registry/BicModuleRegistry';

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export interface UseBicMyItemsOptions {
  /** Azure AD user object ID of the authenticated user */
  userId: string;
  /**
   * Filter results to a specific module key, e.g. 'bd-scorecard'.
   * When absent, returns items from all registered modules.
   */
  moduleKey?: string;
  /**
   * Filter results to a specific urgency tier.
   * When absent, returns items of all urgency tiers.
   */
  urgencyTier?: 'immediate' | 'watch' | 'upcoming';
  /**
   * Polling interval override in milliseconds (D-07).
   * Pass BIC_REFETCH_INTERVAL_IMMEDIATE_MS (45_000) for My Work Feed rows
   * that display 'immediate'-tier items and require near-real-time freshness.
   * When absent, standard 3-minute staleness applies.
   */
  refetchInterval?: number | false;
  /**
   * When false, hook does not execute. Useful for authenticated-only surfaces.
   * @default true
   */
  enabled?: boolean;
}

/**
 * Returns all actionable items across registered modules where the given user
 * is the current BIC owner.
 *
 * Aggregation: client-side fan-out via Promise.allSettled (BIC_AGGREGATION_MODE = 'client').
 * Failed modules are reported in result.failedModules — they do not fail the hook.
 *
 * Stale time: 3 minutes + refetch on window focus (D-07).
 * For 'immediate'-tier feeds, pass refetchInterval: BIC_REFETCH_INTERVAL_IMMEDIATE_MS.
 *
 * See docs/how-to/developer/bic-server-aggregation-migration.md for future
 * migration to server-side aggregation (BIC_AGGREGATION_MODE = 'server').
 *
 * @example — My Work Feed usage
 * const { items, failedModules, isLoading } = useBicMyItems({
 *   userId: authenticatedUser.id,
 *   refetchInterval: BIC_REFETCH_INTERVAL_IMMEDIATE_MS,
 * });
 *
 * @example — Project Canvas widget (project-scoped)
 * const { items } = useBicMyItems({
 *   userId: authenticatedUser.id,
 *   moduleKey: 'project-hub-constraints',
 * });
 */
export function useBicMyItems(options: UseBicMyItemsOptions): IBicMyItemsResult {
  const {
    userId,
    moduleKey,
    urgencyTier,
    refetchInterval = false,
    enabled = true,
  } = options;

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['bic-my-items', userId, moduleKey ?? 'all', urgencyTier ?? 'all'],
    queryFn: async () => {
      // Route through BIC_AGGREGATION_MODE flag (D-06)
      if (BIC_AGGREGATION_MODE === 'server') {
        return executeServerAggregation(userId);
      }
      return executeBicFanOut(userId);
    },
    staleTime: BIC_STALE_TIME_MY_ITEMS_MS,
    refetchOnWindowFocus: true,
    refetchInterval,
    enabled: enabled && !!userId,
  });

  // Apply client-side filters (moduleKey, urgencyTier)
  const rawItems: IBicRegisteredItem[] = data?.items ?? [];
  const failedModules: string[] = data?.failedModules ?? [];

  const items = rawItems.filter((item) => {
    if (moduleKey && item.moduleKey !== moduleKey) return false;
    if (urgencyTier && item.state.urgencyTier !== urgencyTier) return false;
    return true;
  });

  return {
    items,
    failedModules,
    isLoading,
    isError,
    refetch,
  };
}
```

---

## `src/hooks/index.ts`

```typescript
export * from './useBicNextMove';
export { resolveFullBicState } from './useBicNextMove';
export * from './useBicMyItems';
```

---

## Key Behavioral Notes

### Why `useBicNextMove` uses a synchronous `queryFn`

The spec explicitly states: "BIC state resolution (`useBicNextMove`) runs entirely client-side from cached item data — no additional API calls required at render time." This means the query function is intentionally synchronous — it just runs the config resolvers against the already-fetched item. The `staleTime` controls how often the upstream data triggers re-resolution, not a network call.

When the upstream module invalidates its item query (e.g., after a workflow stage change), it should also call:
```typescript
queryClient.invalidateQueries({ queryKey: ['bic-next-move', itemKey] });
```
This triggers a fresh resolution cycle in `useBicNextMove`.

### Partial Results Pattern (D-06)

`useBicMyItems` never throws when individual modules fail. Instead:
- `result.items` contains all successfully loaded items
- `result.failedModules` contains the keys of modules that errored
- My Work Feed displays a subdued warning: "Some items could not be loaded ([module names]). Retry?"

This matches the SF01 offline queue's "Informed Queue" philosophy — transparency over silent failure.

### Transfer Detection Guard (D-03)

The `previousOwnerRef` is initialized to `undefined` (not `null`) deliberately. This sentinel value means "first mount — no transfer has occurred." A `null` owner on first mount is a valid state (unassigned item) and must not be treated as a transfer from a previous owner.

The transfer only fires when `previousUserId !== currentUserId` AND `previousOwnerRef.current !== undefined`. This prevents the false-positive transfer on mount.

---

## Verification Commands

```bash
# 1. Typecheck
pnpm --filter @hbc/bic-next-move typecheck

# 2. Run hook unit tests (written in T07)
pnpm --filter @hbc/bic-next-move test -- useBicNextMove
pnpm --filter @hbc/bic-next-move test -- useBicMyItems

# 3. Verify resolveFullBicState is exported from package root
node -e "
  import('@hbc/bic-next-move').then(m => {
    console.log('resolveFullBicState exported:', typeof m.resolveFullBicState === 'function');
    console.log('useBicNextMove exported:', typeof m.useBicNextMove === 'function');
    console.log('useBicMyItems exported:', typeof m.useBicMyItems === 'function');
  });
"

# 4. Verify BIC_AGGREGATION_MODE defaults to 'client'
node -e "
  import('@hbc/bic-next-move').then(m => {
    console.log('Aggregation mode:', m.BIC_AGGREGATION_MODE); // expected: 'client'
  });
"
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF02-T04 Hooks: COMPLETE — 2026-03-08
Files populated:
  - src/hooks/useBicNextMove.ts — resolveFullBicState pure function (D-01, D-04, D-08) +
    useBicNextMove hook with TanStack Query caching (D-07) and ref-based transfer diff detection (D-03)
  - src/hooks/useBicMyItems.ts — useBicMyItems hook with BIC_AGGREGATION_MODE routing (D-06),
    3-minute staleness + window focus refetch (D-07), client-side moduleKey/urgencyTier filters
  - src/hooks/index.ts — updated barrel with explicit resolveFullBicState re-export
  - src/transfer/recordBicTransfer.ts — minimal typed stub (no-op) for T04 compilation;
    full implementation deferred to SF02-T06
Verification: typecheck zero errors, build produces dist/ with .d.ts declarations
-->
