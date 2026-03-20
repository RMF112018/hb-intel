/**
 * Lifecycle state machine — SF29-T03
 * Defines valid state transitions, terminal detection, and lane derivation.
 */

import type { IMyWorkItem, MyWorkState, MyWorkLane } from '../types/index.js';

export interface IMyWorkTransitionSuccess {
  ok: true;
  item: IMyWorkItem;
}

export interface IMyWorkTransitionFailure {
  ok: false;
  reason: 'invalid-transition';
  message: string;
}

export type IMyWorkTransitionResult = IMyWorkTransitionSuccess | IMyWorkTransitionFailure;

export const MY_WORK_TRANSITION_GRAPH: Readonly<Record<MyWorkState, readonly MyWorkState[]>> = Object.freeze({
  new: Object.freeze(['active'] as const),
  active: Object.freeze(['blocked', 'waiting', 'deferred', 'completed', 'superseded'] as const),
  blocked: Object.freeze(['active', 'completed', 'superseded'] as const),
  waiting: Object.freeze(['active', 'completed', 'superseded'] as const),
  deferred: Object.freeze(['active', 'completed', 'superseded'] as const),
  superseded: Object.freeze([] as const),
  completed: Object.freeze([] as const),
});

export function isTransitionAllowed(from: MyWorkState, to: MyWorkState): boolean {
  return MY_WORK_TRANSITION_GRAPH[from].includes(to);
}

export function isTerminalState(state: MyWorkState): boolean {
  return state === 'superseded' || state === 'completed';
}

export function isActiveLaneState(state: MyWorkState): boolean {
  return state === 'new' || state === 'active' || state === 'blocked' || state === 'waiting';
}

export function assignLane(item: IMyWorkItem): MyWorkLane {
  if (item.isBlocked || item.state === 'blocked' || item.state === 'waiting') {
    return 'waiting-blocked';
  }
  if (item.priority === 'now' && (item.state === 'active' || item.state === 'new')) {
    return 'do-now';
  }
  if (item.priority === 'deferred' || item.state === 'deferred') {
    return 'deferred';
  }
  // @provisional — delegated-team is not a target-state primary lane (P2-A2 §3.3 / P2-A3 §10.1).
  // Must not be exposed as a standing lane on first-release surfaces. Pending P2-A1 team-visibility work.
  if (item.delegatedTo || item.delegatedBy) {
    return 'delegated-team';
  }
  return 'watch';
}

export function applyStateTransition(
  item: IMyWorkItem,
  toState: MyWorkState,
  nowIso: string,
): IMyWorkTransitionResult {
  if (!isTransitionAllowed(item.state, toState)) {
    return {
      ok: false,
      reason: 'invalid-transition',
      message: `Cannot transition from "${item.state}" to "${toState}".`,
    };
  }

  const updatedTimestamps = {
    ...item.timestamps,
    updatedAtIso: nowIso,
    ...(toState === 'deferred' ? { markedDeferredAtIso: nowIso } : {}),
  };

  const updatedItem: IMyWorkItem = {
    ...item,
    state: toState,
    timestamps: updatedTimestamps,
  };

  // Derive lane from the new state
  updatedItem.lane = assignLane(updatedItem);

  return { ok: true, item: updatedItem };
}
