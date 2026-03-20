/**
 * Hub state persistence types — P2-B2 §3–§6.
 * Draft contracts for query-seed and return UI state.
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

/** Draft key constants per P2-B2 §3. */
export const HUB_DRAFT_KEYS = {
  querySeed: 'hbc-my-work-query-seed',
  returnState: 'hbc-my-work-return-state',
} as const;

/** TTL constants per P2-B2 §3. */
export const HUB_DRAFT_TTL = {
  querySeed: 8, // hours
  returnState: 1, // hours
} as const;
