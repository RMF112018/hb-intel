/**
 * Feed Projection — SF29-T03
 * Lane assignment, counting, query filtering, and result assembly.
 */

import type {
  IMyWorkItem,
  IMyWorkQuery,
  IMyWorkFeedResult,
  IMyWorkCounts,
  IMyWorkHealthState,
  MyWorkLane,
} from '../types/index.js';

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

export function computeCounts(items: IMyWorkItem[]): IMyWorkCounts {
  let unreadCount = 0;
  let nowCount = 0;
  let blockedCount = 0;
  let waitingCount = 0;
  let deferredCount = 0;
  let teamCount = 0;

  for (const item of items) {
    if (item.isUnread) unreadCount++;
    if (item.priority === 'now') nowCount++;
    if (item.isBlocked || item.state === 'blocked') blockedCount++;
    if (item.state === 'waiting') waitingCount++;
    if (item.state === 'deferred') deferredCount++;
    if (item.delegatedTo || item.delegatedBy) teamCount++;
  }

  return {
    totalCount: items.length,
    unreadCount,
    nowCount,
    blockedCount,
    waitingCount,
    deferredCount,
    teamCount,
  };
}

function filterByQuery(items: IMyWorkItem[], query: IMyWorkQuery): IMyWorkItem[] {
  let filtered = items;

  if (query.projectId) {
    filtered = filtered.filter((i) => i.context.projectId === query.projectId);
  }
  if (query.moduleKeys?.length) {
    filtered = filtered.filter((i) => query.moduleKeys!.includes(i.context.moduleKey));
  }
  if (query.priorities?.length) {
    filtered = filtered.filter((i) => query.priorities!.includes(i.priority));
  }
  if (query.classes?.length) {
    filtered = filtered.filter((i) => query.classes!.includes(i.class));
  }
  if (query.states?.length) {
    filtered = filtered.filter((i) => query.states!.includes(i.state));
  }
  if (query.lane) {
    filtered = filtered.filter((i) => i.lane === query.lane);
  }
  if (query.locationLabel) {
    filtered = filtered.filter((i) => i.locationLabel === query.locationLabel);
  }
  if (!query.includeDeferred) {
    filtered = filtered.filter((i) => i.state !== 'deferred');
  }
  if (!query.includeSuperseded) {
    filtered = filtered.filter((i) => i.state !== 'superseded');
  }
  if (query.limit && query.limit > 0) {
    filtered = filtered.slice(0, query.limit);
  }

  return filtered;
}

export function projectFeedResult(
  items: IMyWorkItem[],
  query: IMyWorkQuery,
  healthState: IMyWorkHealthState | undefined,
  lastRefreshedIso: string,
): IMyWorkFeedResult {
  const filtered = filterByQuery(items, query);
  const counts = computeCounts(filtered);

  return {
    items: filtered,
    ...counts,
    lastRefreshedIso,
    isStale: healthState?.freshness === 'cached' || healthState?.freshness === 'partial',
    healthState,
  };
}
