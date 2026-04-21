/**
 * Priority Actions — homepage-flagship curation.
 *
 * Replaces the naïve top-N slice used by the default-context rail with a
 * deterministic curation stage designed for the homepage flagship command
 * band. The flagship surface needs a visible primary field that:
 *
 *   - honors explicit featured-action promotion,
 *   - avoids a primary dominated by a single group,
 *   - spreads visibility across groups when multiple groups are eligible,
 *   - preserves authored sortOrder within each group,
 *   - remains fully deterministic and testable.
 *
 * Default-context consumers continue to use `resolveByBreakpoint` from
 * `priorityActionsNormalization.ts`. This module is only invoked when the
 * rail runs under `surfaceContext === 'homepage-flagship'`.
 */
import type {
  PriorityActionsConfigResolved,
  PriorityActionsItemNormalized,
} from './priorityActionsContracts.js';
import type { DeviceClass } from './priorityActionsNormalization.js';
import type { PriorityActionsBreakpointResult } from './priorityActionsNormalization.js';

export interface FlagshipCurationOptions {
  readonly featuredActionKeys?: readonly string[];
}

function getMaxVisibleForDevice(
  config: PriorityActionsConfigResolved,
  device: DeviceClass,
): number {
  switch (device) {
    case 'desktop': return config.maxVisibleDesktop;
    case 'laptop': return config.maxVisibleLaptop;
    case 'tabletLandscape': return config.maxVisibleTabletLandscape;
    case 'tabletPortrait': return config.maxVisibleTabletPortrait;
    case 'phone': return config.maxVisiblePhone;
    default: return config.maxVisibleDesktop;
  }
}

/**
 * Stable priority-class rank. Lower rank is considered earlier for
 * primary selection. Items marked `overflow` are always deferred to
 * the overflow bucket; the caller is also free to pre-filter
 * `overflowOnly` items (mirrors `resolveByBreakpoint` behavior).
 */
function priorityRank(item: PriorityActionsItemNormalized): number {
  switch (item.priority) {
    case 'primary': return 0;
    case 'secondary': return 1;
    case 'overflow': return 2;
    default: return 1;
  }
}

function sortedByAuthoring(
  items: readonly PriorityActionsItemNormalized[],
): PriorityActionsItemNormalized[] {
  return [...items].sort((a, b) => {
    const pa = priorityRank(a);
    const pb = priorityRank(b);
    if (pa !== pb) return pa - pb;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.actionKey.localeCompare(b.actionKey);
  });
}

function groupKeyFor(item: PriorityActionsItemNormalized): string {
  const key = (item.groupKey || item.groupTitle || '').trim();
  return key.length > 0 ? key : '__ungrouped__';
}

/**
 * Deterministic homepage-flagship curation.
 *
 * Algorithm (pure, order-stable):
 *   1. Split input into `overflowOnly` (forced overflow) and eligible.
 *   2. Pre-sort eligible by `priority` class, then `sortOrder`, then `actionKey`.
 *   3. Promote explicitly-featured actions into the primary set first
 *      (in the order they appear in `featuredActionKeys`).
 *   4. Bucket the remaining eligible items by group (preserving authored
 *      order within each bucket). Bucket iteration order follows first
 *      appearance in the sorted eligible list.
 *   5. Round-robin across buckets, taking one item per bucket per pass,
 *      until primary is filled to `maxVisible` or buckets are exhausted.
 *   6. Remaining eligible items + original `overflowOnly` items become
 *      the overflow bucket. Overflow preserves curation residue order,
 *      with forced `overflowOnly` items appended (mirrors default
 *      resolver).
 *
 * Properties:
 *   - Deterministic: same input always yields same output.
 *   - Balanced: avoids single-group domination when multiple groups
 *     have eligible members.
 *   - Faithful: respects authored priority class and featured intent.
 */
export function curatePrimaryForFlagship(
  items: readonly PriorityActionsItemNormalized[],
  config: PriorityActionsConfigResolved,
  device: DeviceClass,
  options?: FlagshipCurationOptions,
): PriorityActionsBreakpointResult {
  const maxVisible = getMaxVisibleForDevice(config, device);
  const overflowLabel = config.overflowLabel || 'More tools';

  const forced: PriorityActionsItemNormalized[] = [];
  const eligibleRaw: PriorityActionsItemNormalized[] = [];
  for (const item of items) {
    if (item.overflowOnly) forced.push(item);
    else eligibleRaw.push(item);
  }

  const eligible = sortedByAuthoring(eligibleRaw);
  const featuredKeys = (options?.featuredActionKeys ?? []).filter(
    (k) => typeof k === 'string' && k.length > 0,
  );

  const takenKeys = new Set<string>();
  const primary: PriorityActionsItemNormalized[] = [];

  // Pass 1 — explicit featured promotion (bounded by maxVisible).
  for (const featuredKey of featuredKeys) {
    if (primary.length >= maxVisible) break;
    const found = eligible.find(
      (item) => item.actionKey === featuredKey && !takenKeys.has(item.actionKey),
    );
    if (found) {
      primary.push(found);
      takenKeys.add(found.actionKey);
    }
  }

  // Pass 2 — bucketize remaining eligible by group in first-appearance order.
  const buckets = new Map<string, PriorityActionsItemNormalized[]>();
  for (const item of eligible) {
    if (takenKeys.has(item.actionKey)) continue;
    const key = groupKeyFor(item);
    const list = buckets.get(key);
    if (list) list.push(item);
    else buckets.set(key, [item]);
  }

  // Pass 3 — round-robin across buckets until primary is full.
  let drained = false;
  while (primary.length < maxVisible && !drained) {
    drained = true;
    for (const bucket of buckets.values()) {
      if (primary.length >= maxVisible) break;
      const next = bucket.shift();
      if (next) {
        primary.push(next);
        takenKeys.add(next.actionKey);
        drained = false;
      }
    }
  }

  // Remaining eligible (bucket residue) keeps curation order, followed by forced.
  const overflowResidue: PriorityActionsItemNormalized[] = [];
  for (const item of eligible) {
    if (!takenKeys.has(item.actionKey)) overflowResidue.push(item);
  }

  return {
    primaryItems: primary,
    overflowItems: [...overflowResidue, ...forced],
    maxVisible,
    overflowLabel,
    mode: 'standard-row',
    drawerSource: 'all-tools',
    capGovernance: 'binding-visible-cap',
  };
}
