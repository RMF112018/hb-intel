import type {
  FoleonManagedContent,
  FoleonPlacement,
} from '../../types/foleon-management.types.js';

export type ContentInboxBucketId =
  | 'blocked'
  | 'unassigned'
  | 'live'
  | 'staged'
  | 'published-eligible';

export interface ContentInboxBucket {
  readonly id: ContentInboxBucketId;
  readonly label: string;
  readonly description: string;
  readonly items: ReadonlyArray<FoleonManagedContent>;
}

/**
 * Bucketed Content Inbox derived from already-loaded content + placements.
 *
 * Field-availability rules (per repo discipline):
 *  - 'blocked'            : validationStatus === 'blocked' OR blockingReasons.length > 0
 *  - 'unassigned'         : foleonDocId is not referenced by any placement
 *  - 'live'               : record's foleonDocId is referenced by an isActive placement
 *  - 'staged'             : record has a homepage-eligible reader role but is not live and is not Published
 *  - 'published-eligible' : Published + isVisible + isHomepageEligible AND already lives in a non-active placement
 *
 * A record may appear in only ONE bucket; precedence top-down.
 *
 * No bucket invents records, recency timestamps, or counts. A bucket with zero items
 * is still returned so the surface can render an honest empty state.
 */
export function buildContentInboxBuckets(args: {
  readonly content: ReadonlyArray<FoleonManagedContent>;
  readonly placements: ReadonlyArray<FoleonPlacement>;
}): ReadonlyArray<ContentInboxBucket> {
  const placedIds = new Set(args.placements.map((p) => p.foleonDocId));
  const activelyPlacedIds = new Set(
    args.placements.filter((p) => p.isActive).map((p) => p.foleonDocId),
  );

  const buckets: Record<ContentInboxBucketId, FoleonManagedContent[]> = {
    blocked: [],
    unassigned: [],
    live: [],
    staged: [],
    'published-eligible': [],
  };

  for (const record of args.content) {
    const isBlocked =
      record.validationStatus === 'blocked' || record.blockingReasons.length > 0;
    if (isBlocked) {
      buckets.blocked.push(record);
      continue;
    }

    const isPlaced = placedIds.has(record.foleonDocId);
    if (!isPlaced) {
      buckets.unassigned.push(record);
      continue;
    }

    const isLive = activelyPlacedIds.has(record.foleonDocId);
    if (isLive) {
      buckets.live.push(record);
      continue;
    }

    if (record.publishStatus === 'Published' && record.isVisible && record.isHomepageEligible) {
      buckets['published-eligible'].push(record);
      continue;
    }

    buckets.staged.push(record);
  }

  return [
    {
      id: 'blocked',
      label: 'Blocked',
      description: 'Validation or placement blockers must be resolved before these can ship.',
      items: buckets.blocked,
    },
    {
      id: 'unassigned',
      label: 'Unassigned',
      description: 'Synced content that is not yet referenced by any homepage placement.',
      items: buckets.unassigned,
    },
    {
      id: 'live',
      label: 'Live',
      description: 'Content currently active on the homepage through a live placement.',
      items: buckets.live,
    },
    {
      id: 'staged',
      label: 'Staged',
      description: 'Placed content that is not active yet — review and promote when ready.',
      items: buckets.staged,
    },
    {
      id: 'published-eligible',
      label: 'Published, eligible',
      description: 'Published, visible, homepage-eligible records that already have a placement.',
      items: buckets['published-eligible'],
    },
  ];
}
