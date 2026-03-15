/**
 * Draft/Resume (session-state) source adapter.
 *
 * Maps `IQueuedOperation[]` from `listPending()` into `IMyWorkItem[]`.
 * Weight 0.3 — background sync items, lowest priority.
 */

import { listPending } from '@hbc/session-state';
import type { IQueuedOperation, QueuedOperationType } from '@hbc/session-state';
import type { IMyWorkSourceAdapter, IMyWorkItem } from '../types/index.js';
import {
  buildWorkItemId,
  buildDedupeKey,
  buildDefaultTimestamps,
  buildSourceMeta,
} from './_mappers.js';

const TYPE_LABELS: Record<QueuedOperationType, string> = {
  upload: 'Queued upload',
  acknowledgment: 'Queued acknowledgment',
  'form-save': 'Queued form save',
  'api-mutation': 'Queued API update',
  'notification-action': 'Queued notification action',
};

function mapQueuedOperation(op: IQueuedOperation): IMyWorkItem {
  const hasError = op.lastError !== null;
  const summary = hasError
    ? `${op.target} — retry ${op.retryCount}/${op.maxRetries} (${op.lastError})`
    : op.target;

  return {
    workItemId: buildWorkItemId('session-state', op.operationId),
    canonicalKey: `queue::${op.operationId}`,
    dedupeKey: buildDedupeKey('queue', op.type, op.target),
    class: 'queued-follow-up',
    priority: 'watch',
    state: 'waiting',
    lane: 'waiting-blocked',
    title: TYPE_LABELS[op.type] ?? `Queued ${op.type}`,
    summary,
    expectedAction: undefined,
    dueDateIso: null,
    isOverdue: false,
    isUnread: true,
    isBlocked: false,
    blockedReason: null,
    changeSummary: null,
    whyThisMatters: null,
    supersededByWorkItemId: null,
    owner: { type: 'system', id: 'queue', label: 'System Queue' },
    previousOwner: null,
    context: {
      moduleKey: 'session-state',
    },
    sourceMeta: [buildSourceMeta('session-state', op.operationId, op.createdAt)],
    permissionState: { canOpen: false, canAct: false },
    lifecycle: {
      previousStepLabel: null,
      currentStepLabel: hasError ? 'Retrying' : 'Pending',
      nextStepLabel: 'Synced',
      blockedDependencyLabel: null,
      impactedRecordLabel: null,
    },
    rankingReason: {
      primaryReason: 'Queued offline operation',
      contributingReasons: [],
    },
    availableActions: [],
    offlineCapable: true,
    timestamps: buildDefaultTimestamps(op.createdAt, op.lastAttemptAt ?? op.createdAt),
    delegatedBy: null,
    delegatedTo: null,
    locationLabel: null,
    userNote: null,
  };
}

export const draftResumeAdapter: IMyWorkSourceAdapter = {
  source: 'session-state',

  isEnabled: () => true,

  load: async () => {
    const operations = await listPending();
    return operations.map(mapQueuedOperation);
  },
};
