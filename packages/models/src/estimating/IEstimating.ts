/**
 * An estimating tracker entry for a bid or proposal.
 *
 * @example
 * ```ts
 * import type { IEstimatingTracker } from '@hbc/models';
 * ```
 */
export interface IEstimatingTracker {
  /** Unique tracker identifier. */
  id: number;
  /** Associated project identifier. */
  projectId: string;
  /** Bid / proposal number. */
  bidNumber: string;
  /** Current status of the estimate. */
  status: string;
  /** ISO-8601 due date for the estimate. */
  dueDate: string;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
  /** ISO-8601 last-updated timestamp. */
  updatedAt: string;
}

/**
 * Estimating kickoff meeting record.
 */
export interface IEstimatingKickoff {
  /** Unique kickoff identifier. */
  id: number;
  /** Associated project identifier. */
  projectId: string;
  /** ISO-8601 kickoff meeting date. */
  kickoffDate: string;
  /** List of attendee names. */
  attendees: string[];
  /** Meeting notes / action items. */
  notes: string;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
}
