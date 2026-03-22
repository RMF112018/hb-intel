/**
 * Hub state persistence types — P2-B2 §3–§6.
 * Draft contracts for query-seed, return UI state, and personalization.
 *
 * Card arrangement (P2-D5 §4) is managed by HbcProjectCanvas internally
 * via useCanvasConfig + CanvasApi — types removed per PRS-01 option (b).
 */

/** P2-B2 §4: Query-seed state — persisted query preferences. */
export interface IMyWorkQuerySeedDraft {
  teamMode?: 'personal' | 'my-team' | 'delegated-by-me';
  lane?: string;
  searchText?: string;
  savedAt: string;
}

/** P2-B2 §5: Return UI state — scroll position and expanded groups. */
export interface IMyWorkReturnState {
  scrollPosition: number;
  expandedGroupKeys: string[];
  capturedAt: string;
}

/**
 * P2-B2 §6: Feed fallback cache — durable continuity layer for offline/degraded return.
 * Persisted via @hbc/session-state draft store; not a competing primary cache.
 * TanStack Query remains the live/cache authority.
 */
export interface IMyWorkFeedCacheDraft {
  items: unknown[];
  totalCount: number;
  lastRefreshedIso: string;
  cachedAt: string;
}

/** P2-D5 §7: Team mode saved preference. */
export interface IMyWorkTeamModeDraft {
  teamMode: 'personal' | 'my-team' | 'delegated-by-me';
  savedAt: string;
}

/** Draft key constants per P2-B2 §3, P2-D5 §4. */
export const HUB_DRAFT_KEYS = {
  querySeed: 'hbc-my-work-query-seed',
  returnState: 'hbc-my-work-return-state',
  teamMode: 'hbc-my-work-team-mode',
  filterState: 'hbc-my-work-filter-state',
  /** P2-B2 §6: Durable feed fallback cache for stale return. */
  feedCache: 'hbc-my-work-feed-cache',
} as const;

/** TTL constants per P2-B2 §3, P2-D5 §4. */
export const HUB_DRAFT_TTL = {
  querySeed: 8,          // hours
  returnState: 1,        // hours
  teamMode: 16,          // hours (P2-D5 §7)
  filterState: 8,        // hours (P2-D5 §8)
  feedCache: 4,          // hours (P2-B2 §6)
} as const;
