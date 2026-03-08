# SF02-T02 — TypeScript Contracts

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Spec Source:** `docs/explanation/feature-decisions/PH7-SF-02-Shared-Feature-BIC-Next-Move.md`
**Decisions Applied:** D-01 (urgency thresholds), D-02 (manifest), D-03 (transfer), D-05 (complexity), D-06 (aggregation mode), D-08 (transfer history)
**Estimated Effort:** 0.5 sprint-weeks
**Depends On:** T01 (scaffold)

---

## Objective

Define and export every TypeScript interface, type, and constant that the rest of the package and all consumer modules depend on. No runtime logic in this task — only the contract layer.

---

## 3-Line Plan

1. Write all interfaces in `src/types/IBicNextMove.ts`.
2. Write urgency threshold constants in `src/constants/urgencyThresholds.ts`.
3. Write manifest and feature flag constants in `src/constants/manifest.ts`.

---

## `src/types/IBicNextMove.ts`

```typescript
// ─────────────────────────────────────────────────────────────────────────────
// Core ownership model types
// ─────────────────────────────────────────────────────────────────────────────

export type BicOwnershipModel = 'direct-assignee' | 'workflow-state-derived';

export type BicUrgencyTier = 'immediate' | 'watch' | 'upcoming';

export type BicComplexityVariant = 'essential' | 'standard' | 'expert';

// ─────────────────────────────────────────────────────────────────────────────
// Owner identity
// ─────────────────────────────────────────────────────────────────────────────

export interface IBicOwner {
  /** Azure AD user object ID */
  userId: string;
  displayName: string;
  /** Role title within the context of this item (e.g. "BD Manager", "Estimating Coordinator") */
  role: string;
  /** Optional group context shown in Expert mode (e.g. "Estimating Department") */
  groupContext?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Transfer history (D-08)
// ─────────────────────────────────────────────────────────────────────────────

export interface IBicTransfer {
  fromOwner: IBicOwner | null;
  toOwner: IBicOwner;
  /** ISO 8601 timestamp of the transfer */
  transferredAt: string;
  /** Plain-language action that triggered the transfer (e.g. "Submitted for Director Review") */
  action: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-config urgency threshold overrides (D-01)
// ─────────────────────────────────────────────────────────────────────────────

export interface IBicUrgencyThresholds {
  /**
   * Number of business days before due date at which urgency transitions from
   * 'upcoming' to 'watch'. Defaults to BIC_DEFAULT_WATCH_THRESHOLD_DAYS (3).
   */
  watchThresholdDays?: number;
  /**
   * Number of business days before due date at which urgency transitions to
   * 'immediate'. When omitted, 'immediate' is triggered only by overdue/due-today.
   * Use this for items where "2 days away" is already critical (e.g. bid deadlines).
   */
  immediateThresholdDays?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuration contract — one instance per item type (generic on T)
// ─────────────────────────────────────────────────────────────────────────────

export interface IBicNextMoveConfig<T> {
  /** Which ownership model this item type uses */
  ownershipModel: BicOwnershipModel;

  /**
   * For workflow-state-derived: computes current owner from item state.
   * For direct-assignee: returns the assignee field.
   * Return null for unowned items — renders ⚠️ Unassigned (D-04).
   */
  resolveCurrentOwner: (item: T) => IBicOwner | null;

  /** Plain-language description of what the current owner needs to do */
  resolveExpectedAction: (item: T) => string;

  /** ISO 8601 due date for the current owner's action. Null = no due date. */
  resolveDueDate: (item: T) => string | null;

  /** Returns true if the item cannot advance due to a blocking condition */
  resolveIsBlocked: (item: T) => boolean;

  /** Plain-language reason the item is blocked. Null when not blocked. */
  resolveBlockedReason: (item: T) => string | null;

  /** Previous owner before the current BIC transfer. Null for new items. */
  resolvePreviousOwner: (item: T) => IBicOwner | null;

  /** Next owner after current owner completes their action. Null when unknown. */
  resolveNextOwner: (item: T) => IBicOwner | null;

  /** Escalation rule: who is notified if action is not taken by due date */
  resolveEscalationOwner: (item: T) => IBicOwner | null;

  /**
   * Optional: returns full ownership transfer history for Expert mode display (D-08).
   * When absent, HbcBicDetail omits the "Full Ownership History" section entirely.
   * Implement only if your module's data layer stores transfer events.
   */
  resolveTransferHistory?: (item: T) => IBicTransfer[];

  /**
   * Optional urgency threshold overrides for this item type (D-01).
   * When absent, platform defaults apply (watch < 3 business days, immediate = overdue/today).
   */
  urgencyThresholds?: IBicUrgencyThresholds;
}

// ─────────────────────────────────────────────────────────────────────────────
// Resolved state — output of useBicNextMove hook
// ─────────────────────────────────────────────────────────────────────────────

export interface IBicNextMoveState {
  currentOwner: IBicOwner | null;
  expectedAction: string;
  dueDate: string | null;
  /** True when dueDate is in the past relative to current date */
  isOverdue: boolean;
  isBlocked: boolean;
  blockedReason: string | null;
  previousOwner: IBicOwner | null;
  nextOwner: IBicOwner | null;
  escalationOwner: IBicOwner | null;
  /**
   * Transfer history resolved from config.resolveTransferHistory (D-08).
   * Empty array when resolver is absent or returns no transfers.
   */
  transferHistory: IBicTransfer[];
  /**
   * Computed urgency tier based on dueDate, thresholds, and blocked/unassigned state (D-01, D-04).
   * Forced to 'immediate' when currentOwner is null (D-04).
   */
  urgencyTier: BicUrgencyTier;
}

// ─────────────────────────────────────────────────────────────────────────────
// Module registry types (D-02)
// ─────────────────────────────────────────────────────────────────────────────

export interface IBicRegisteredItem {
  /** Globally unique item identifier, e.g. "bd-scorecard::a1b2c3" */
  itemKey: string;
  /** The module registry key this item belongs to, e.g. "bd-scorecard" */
  moduleKey: string;
  /** Human-readable label for the module (used in dev-mode warnings) */
  moduleLabel: string;
  /** The resolved BIC state for this item */
  state: IBicNextMoveState;
  /**
   * Navigation href for the item's detail page.
   * Used by My Work Feed and Project Canvas to deep-link.
   */
  href: string;
  /** Display title of the item, e.g. "Highline Towers – Go/No-Go Scorecard" */
  title: string;
}

export interface IBicModuleRegistration {
  /** Must match a key in BIC_MODULE_MANIFEST */
  key: string;
  /** Human-readable label for the module, used in dev-mode warnings */
  label: string;
  /**
   * Async function that fetches all items for the given userId where that user
   * is the current BIC owner. Must return IBicRegisteredItem[].
   */
  queryFn: (userId: string) => Promise<IBicRegisteredItem[]>;
}

// ─────────────────────────────────────────────────────────────────────────────
// useBicMyItems return type (D-06, D-07)
// ─────────────────────────────────────────────────────────────────────────────

export interface IBicMyItemsResult {
  /** All items across all registered modules where user is current owner */
  items: IBicRegisteredItem[];
  /** Modules that failed to load — partial results, not a full failure */
  failedModules: string[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}
```

---

## `src/constants/urgencyThresholds.ts`

```typescript
/**
 * Platform-wide default urgency tier thresholds (D-01).
 *
 * These are used by useBicNextMove when no per-config overrides are present.
 * Override via IBicNextMoveConfig.urgencyThresholds for item types with
 * non-standard cadences (e.g. permit items, bid deadlines).
 */

/** Business days before due date at which urgency becomes 'watch' */
export const BIC_DEFAULT_WATCH_THRESHOLD_DAYS = 3;

/**
 * Business days before due date at which urgency becomes 'immediate'
 * via threshold (in addition to the always-on overdue/due-today rule).
 * Null = only overdue/due-today triggers 'immediate' by default.
 */
export const BIC_DEFAULT_IMMEDIATE_THRESHOLD_DAYS: number | null = null;

/**
 * Computes the number of business days between two dates.
 * Excludes weekends. Does not account for holidays.
 */
export function businessDaysBetween(from: Date, to: Date): number {
  let count = 0;
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);

  while (cursor < end) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

/**
 * Computes urgency tier from a due date string and optional threshold overrides.
 * Returns 'immediate' when:
 *  - dueDate is in the past (overdue)
 *  - dueDate is today
 *  - dueDate is within immediateThresholdDays (if set)
 * Returns 'watch' when within watchThresholdDays.
 * Returns 'upcoming' otherwise.
 * Returns 'upcoming' when dueDate is null (no deadline).
 *
 * Note: Caller is responsible for forcing 'immediate' when currentOwner is null (D-04).
 */
export function computeUrgencyTier(
  dueDate: string | null,
  thresholds?: {
    watchThresholdDays?: number;
    immediateThresholdDays?: number;
  }
): 'immediate' | 'watch' | 'upcoming' {
  if (!dueDate) return 'upcoming';

  const now = new Date();
  const due = new Date(dueDate);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const daysUntilDue = businessDaysBetween(today, due);
  const isOverdue = due < today;
  const isDueToday = due.getTime() === today.getTime();

  // Always 'immediate' if overdue or due today
  if (isOverdue || isDueToday) return 'immediate';

  const immediateThreshold =
    thresholds?.immediateThresholdDays ?? BIC_DEFAULT_IMMEDIATE_THRESHOLD_DAYS;
  const watchThreshold =
    thresholds?.watchThresholdDays ?? BIC_DEFAULT_WATCH_THRESHOLD_DAYS;

  if (immediateThreshold !== null && daysUntilDue <= immediateThreshold) {
    return 'immediate';
  }
  if (daysUntilDue <= watchThreshold) return 'watch';
  return 'upcoming';
}

/**
 * Computes isOverdue from a due date string.
 */
export function computeIsOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < today;
}
```

---

## `src/constants/manifest.ts`

```typescript
/**
 * BIC_MODULE_MANIFEST — typed list of all expected module registration keys (D-02).
 *
 * Every domain module that calls registerBicModule() must use a key present here.
 * In non-production builds, the registry emits console.warn if:
 *  1. A registered key is NOT in this manifest (likely a typo).
 *  2. A manifest key never registers within 5 seconds of app bootstrap
 *     (likely a forgotten bootstrap call).
 *
 * To add a new module:
 *  1. Add its key to BIC_MODULE_MANIFEST below.
 *  2. Call registerBicModule({ key, label, queryFn }) in the module's bootstrap.
 *  3. Update docs/how-to/developer/bic-module-adoption.md.
 */
export const BIC_MODULE_MANIFEST = [
  'bd-scorecard',
  'bd-department-sections',
  'estimating-pursuit',
  'estimating-kickoff',
  'project-hub-pmp',
  'project-hub-turnover',
  'project-hub-constraints',
  'project-hub-permits',
  'project-hub-monthly-review',
  'admin-provisioning',
] as const;

export type BicModuleKey = typeof BIC_MODULE_MANIFEST[number];

/**
 * BIC_AGGREGATION_MODE — controls whether useBicMyItems uses client-side fan-out
 * or a future server-side aggregation endpoint (D-06).
 *
 * 'client'  — default; Promise.allSettled fan-out across registered module queryFns.
 * 'server'  — single GET /api/bic/my-items call (server endpoint not yet built).
 *
 * See: docs/how-to/developer/bic-server-aggregation-migration.md for migration guide.
 *
 * To switch: set BIC_AGGREGATION_MODE = 'server' and implement the Azure Function
 * endpoint. No module registration changes required — the contract is preserved.
 */
export type BicAggregationMode = 'client' | 'server';

export const BIC_AGGREGATION_MODE: BicAggregationMode =
  (import.meta.env?.VITE_BIC_AGGREGATION_MODE as BicAggregationMode) ?? 'client';

/**
 * Milliseconds after app bootstrap during which the dev-mode guard waits
 * for all manifest keys to register before warning about missing registrations.
 */
export const BIC_MANIFEST_GUARD_DELAY_MS = 5_000;

/**
 * TanStack Query stale times (D-07).
 * Centralized here so consumers don't hardcode durations.
 */
export const BIC_STALE_TIME_SINGLE_ITEM_MS = 60_000;      // 60 seconds
export const BIC_STALE_TIME_MY_ITEMS_MS = 180_000;        // 3 minutes
export const BIC_REFETCH_INTERVAL_IMMEDIATE_MS = 45_000;  // 45 seconds (passed by consumer)

/**
 * Deduplication bucket duration for transfer events (D-03).
 * Transfers with the same (itemKey, fromUserId, toUserId) within this window
 * are treated as a single event and only registered once.
 */
export const BIC_TRANSFER_DEDUP_BUCKET_MS = 60_000; // 60 seconds
```

---

## Verification Commands

```bash
# Typecheck contracts with zero errors
pnpm --filter @hbc/bic-next-move typecheck

# Confirm exports resolve correctly from workspace root
node -e "
  const pkg = require('./packages/bic-next-move/dist/index.js');
  console.log('Exports:', Object.keys(pkg));
"

# After build, confirm dist contains declaration files
ls packages/bic-next-move/dist/*.d.ts
```

Expected: `IBicNextMoveConfig`, `IBicOwner`, `IBicNextMoveState`, `IBicTransfer`,
`IBicRegisteredItem`, `IBicModuleRegistration`, `IBicMyItemsResult`,
`computeUrgencyTier`, `computeIsOverdue`, `businessDaysBetween`,
`BIC_MODULE_MANIFEST`, `BIC_AGGREGATION_MODE`, `BIC_STALE_TIME_SINGLE_ITEM_MS`,
`BIC_STALE_TIME_MY_ITEMS_MS`, `BIC_REFETCH_INTERVAL_IMMEDIATE_MS`,
`BIC_TRANSFER_DEDUP_BUCKET_MS` all exported.

<!-- IMPLEMENTATION PROGRESS & NOTES
SF02-T02 TypeScript Contracts: COMPLETE — 2026-03-08
Files populated:
  - src/types/IBicNextMove.ts — all interfaces and type aliases (D-01, D-02, D-04, D-05, D-06, D-07, D-08)
  - src/constants/urgencyThresholds.ts — default thresholds + businessDaysBetween + computeUrgencyTier + computeIsOverdue (D-01)
  - src/constants/manifest.ts — BIC_MODULE_MANIFEST + BicModuleKey + BIC_AGGREGATION_MODE + stale times + dedup bucket (D-02, D-03, D-06, D-07)
  - src/vite-env.d.ts — added for import.meta.env type support
Barrel exports verified: src/types/index.ts and src/index.ts already correct from T01
Verification: typecheck zero errors, build produces dist/ with .d.ts declarations
-->
