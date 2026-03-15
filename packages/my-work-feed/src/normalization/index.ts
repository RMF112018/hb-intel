export {
  MY_WORK_TRANSITION_GRAPH,
  isTransitionAllowed,
  isTerminalState,
  isActiveLaneState,
  applyStateTransition,
} from './lifecycle.js';
export type { IMyWorkTransitionResult, IMyWorkTransitionSuccess, IMyWorkTransitionFailure } from './lifecycle.js';

export { dedupeItems } from './dedupeItems.js';
export type { IDedupeResult, IDedupeEvent } from './dedupeItems.js';

export { applySupersession } from './supersession.js';
export type { ISupersessionResult, ISupersessionEvent } from './supersession.js';

export { computeRankingScore, rankItems } from './rankItems.js';
export type { IRankingContext } from './rankItems.js';

export { assignLane, computeCounts, projectFeedResult } from './projectFeed.js';
