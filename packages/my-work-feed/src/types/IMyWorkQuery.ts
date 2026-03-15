/**
 * @hbc/my-work-feed — Query, Result, and Grouping Contracts
 * SF29-T02
 *
 * @see docs/explanation/feature-decisions/PH7-SF-29-Shared-Feature-My-Work-Feed.md §Interface Contract
 */

import type {
  IMyWorkItem,
  IMyWorkHealthState,
  MyWorkPriority,
  MyWorkItemClass,
  MyWorkState,
  MyWorkLane,
} from './IMyWorkItem.js';

// ─── Query ───────────────────────────────────────────────────────────────────

export interface IMyWorkQuery {
  projectId?: string;
  moduleKeys?: string[];
  priorities?: MyWorkPriority[];
  classes?: MyWorkItemClass[];
  states?: MyWorkState[];
  includeDeferred?: boolean;
  includeSuperseded?: boolean;
  lane?: MyWorkLane;
  teamMode?: 'personal' | 'delegated-by-me' | 'my-team';
  locationLabel?: string;
  limit?: number;
}

// ─── Saved Grouping ──────────────────────────────────────────────────────────

/**
 * A named grouping configuration for the feed.
 *
 * **Note:** `groupingFn` is not serializable. Persist by `key` and map to
 * the runtime function at load time.
 */
export interface IMyWorkSavedGrouping {
  key: string;
  label: string;
  groupingFn: (item: IMyWorkItem) => string;
}

// ─── Counts ──────────────────────────────────────────────────────────────────

export interface IMyWorkCounts {
  totalCount: number;
  unreadCount: number;
  nowCount: number;
  blockedCount: number;
  waitingCount: number;
  deferredCount: number;
  teamCount?: number;
}

// ─── Feed Results ────────────────────────────────────────────────────────────

export interface IMyWorkFeedResult {
  items: IMyWorkItem[];
  totalCount: number;
  unreadCount: number;
  nowCount: number;
  blockedCount: number;
  waitingCount: number;
  deferredCount: number;
  teamCount?: number;
  lastRefreshedIso: string;
  isStale: boolean;
  healthState?: IMyWorkHealthState;
}

/**
 * Team feed result — a projection over `IMyWorkItem`, not a separate item type.
 * Per locked decisions L-07 and L-10.
 */
export interface IMyWorkTeamFeedResult {
  items: IMyWorkItem[];
  totalCount: number;
  agingCount: number;
  blockedCount: number;
  escalationCandidateCount: number;
  lastRefreshedIso: string;
  healthState?: IMyWorkHealthState;
}
