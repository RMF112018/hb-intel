import type { AutopsyStatus } from '../../types/index.js';

export const ACTIVE_AUTOPSY_STATUSES: readonly AutopsyStatus[] = Object.freeze([
  'draft',
  'review',
  'approved',
  'published',
]);

export const AUTOPSY_TRANSITION_GRAPH: Readonly<Record<AutopsyStatus, readonly AutopsyStatus[]>> =
  Object.freeze({
    draft: Object.freeze(['review', 'overdue'] satisfies AutopsyStatus[]),
    review: Object.freeze(['draft', 'approved', 'overdue'] satisfies AutopsyStatus[]),
    approved: Object.freeze(['review', 'published', 'overdue'] satisfies AutopsyStatus[]),
    published: Object.freeze(['superseded', 'overdue'] satisfies AutopsyStatus[]),
    superseded: Object.freeze(['archived'] satisfies AutopsyStatus[]),
    archived: Object.freeze([] as AutopsyStatus[]),
    overdue: Object.freeze([] as AutopsyStatus[]),
  });

export const isAutopsyTransitionAllowed = (
  fromStatus: AutopsyStatus,
  toStatus: AutopsyStatus
): boolean => AUTOPSY_TRANSITION_GRAPH[fromStatus].includes(toStatus);
