import type { ManagerOperationsCount } from './managerOperationsViewModel.js';

export type RecommendedNextActionTarget =
  | { readonly kind: 'select-nav'; readonly key: 'content-operations' | 'lane-board' | 'admin-config' }
  | { readonly kind: 'focus-bucket'; readonly bucketId: 'blocked' | 'unassigned' };

export interface RecommendedNextAction {
  readonly id:
    | 'token-degraded'
    | 'sync-blocked'
    | 'resolve-blocked'
    | 'review-unassigned'
    | 'place-staged'
    | 'all-stable'
    | 'no-content';
  readonly headline: string;
  readonly cta: string | null;
  readonly target: RecommendedNextActionTarget | null;
}

/**
 * Pure derivation of the single most useful next action for the manager,
 * given the current operations counts and known degraded/blocked states.
 *
 * Decision rules, in priority order:
 *  1. Token-acquisition-degraded mode  → admin diagnostics
 *  2. Sync path blocked                → admin diagnostics
 *  3. >=1 blocked lane/record          → focus blocked inbox bucket
 *  4. >=1 unassigned record            → focus unassigned inbox bucket
 *  5. >=1 staged record                → open Lane Board
 *  6. live records present, none of the above → "all stable" — no CTA
 *  7. zero content                     → "no content yet" — no CTA (sync is in the header)
 */
export function buildRecommendedNextAction(args: {
  readonly counts: ReadonlyArray<ManagerOperationsCount>;
  readonly tokenAcquisitionDegraded: boolean;
  readonly canSync: boolean;
  readonly contentLoaded: number;
}): RecommendedNextAction {
  const valueOf = (id: ManagerOperationsCount['id']): number =>
    args.counts.find((entry) => entry.id === id)?.value ?? 0;
  const blocked = valueOf('blocked');
  const unassigned = valueOf('unassigned');
  const staged = valueOf('staged');
  const live = valueOf('live');

  if (args.tokenAcquisitionDegraded) {
    return {
      id: 'token-degraded',
      headline: 'API access for the Foleon integration is not approved yet. Resolve API approval before content operations can proceed.',
      cta: 'Open Admin / Config',
      target: { kind: 'select-nav', key: 'admin-config' },
    };
  }

  if (!args.canSync) {
    return {
      id: 'sync-blocked',
      headline: 'Sync from Foleon is blocked. Finish backend setup so content can flow into the Manager.',
      cta: 'Open Admin / Config',
      target: { kind: 'select-nav', key: 'admin-config' },
    };
  }

  if (blocked > 0) {
    return {
      id: 'resolve-blocked',
      headline: blocked === 1
        ? '1 lane or record is blocked. Resolve the blocker so it can ship to the homepage.'
        : `${blocked} lanes or records are blocked. Resolve blockers so they can ship to the homepage.`,
      cta: 'Review blocked items',
      target: { kind: 'focus-bucket', bucketId: 'blocked' },
    };
  }

  if (unassigned > 0) {
    return {
      id: 'review-unassigned',
      headline: unassigned === 1
        ? '1 record is unassigned. Review it and assign a homepage placement.'
        : `${unassigned} records are unassigned. Review them and assign homepage placements.`,
      cta: 'Review unassigned items',
      target: { kind: 'focus-bucket', bucketId: 'unassigned' },
    };
  }

  if (staged > 0) {
    return {
      id: 'place-staged',
      headline: staged === 1
        ? '1 lane has staged content waiting to go live. Open the Lane Board to validate and publish.'
        : `${staged} lanes have staged content waiting to go live. Open the Lane Board to validate and publish.`,
      cta: 'Open Lane Board',
      target: { kind: 'select-nav', key: 'lane-board' },
    };
  }

  if (live > 0) {
    return {
      id: 'all-stable',
      headline: live === 1
        ? '1 lane is live and stable. Nothing requires attention right now.'
        : `${live} lanes are live and stable. Nothing requires attention right now.`,
      cta: null,
      target: null,
    };
  }

  if (args.contentLoaded === 0) {
    return {
      id: 'no-content',
      headline: 'No content has been synced yet. Run "Sync from Foleon" in the header to bring in homepage content.',
      cta: null,
      target: null,
    };
  }

  return {
    id: 'all-stable',
    headline: 'All lanes are stable. Nothing requires attention right now.',
    cta: null,
    target: null,
  };
}
