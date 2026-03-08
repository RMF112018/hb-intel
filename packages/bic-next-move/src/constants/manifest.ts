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
