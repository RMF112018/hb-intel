/**
 * companionTabs — canonical tab model for the HB Kudos Approval
 * Companion workspace.
 *
 * Encodes the Decision-Lock-Appendix queue order:
 *   Pending → Revision Requested → Flagged for Admin Review →
 *   Approved → Rejected → Removed / Unpublished
 *
 * Each tab carries the workflow-status gate, optional extra predicate
 * (admin-review flag), and the sort direction the queue applies after
 * filtering.
 */
import {
  needsAdminReview,
  type KudosAgingBucket,
  type KudosEntry,
  type KudosWorkflowStatus,
} from '../../../homepage/webparts/kudosContracts.js';

export interface CompanionTab {
  id: string;
  label: string;
  /** Statuses this tab scopes the queue to. */
  statuses: readonly KudosWorkflowStatus[];
  /** Optional additional predicate (e.g. admin review flag). */
  extraPredicate?: (entry: KudosEntry) => boolean;
  /** Queue ordering: oldest-first for review queues, newest-first for resolved. */
  sortDirection: 'oldest' | 'newest';
}

export const COMPANION_TABS: readonly CompanionTab[] = [
  {
    id: 'pending',
    label: 'Pending',
    statuses: ['pending'],
    sortDirection: 'oldest',
  },
  {
    id: 'revisionRequested',
    label: 'Revision requested',
    statuses: ['revisionRequested'],
    sortDirection: 'oldest',
  },
  {
    id: 'flagged',
    label: 'Flagged for admin',
    statuses: ['pending', 'revisionRequested', 'approved', 'approvedScheduled'],
    extraPredicate: (entry) => needsAdminReview(entry),
    sortDirection: 'newest',
  },
  {
    id: 'approved',
    label: 'Approved',
    statuses: ['approved', 'approvedScheduled'],
    sortDirection: 'newest',
  },
  {
    id: 'rejected',
    label: 'Rejected',
    statuses: ['rejected', 'withdrawn'],
    sortDirection: 'newest',
  },
  {
    id: 'removed',
    label: 'Removed / Unpublished',
    statuses: ['removedUnpublished'],
    sortDirection: 'newest',
  },
];

/** Visible aging bucket labels used by queue rows and filter chips. */
export const AGING_LABEL: Record<KudosAgingBucket, string> = {
  freshToday: 'Today',
  within3Days: '≤ 3 days',
  within7Days: '≤ 7 days',
  within14Days: '≤ 14 days',
  stale: 'Stale',
};
