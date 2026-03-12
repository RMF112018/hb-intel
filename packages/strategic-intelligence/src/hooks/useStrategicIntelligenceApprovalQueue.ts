import { StrategicIntelligenceApi } from '../api/StrategicIntelligenceApi.js';
import { StrategicIntelligenceLifecycleApi } from '../api/StrategicIntelligenceLifecycleApi.js';
import type {
  IStrategicIntelligenceApprovalQueueItem,
  IStrategicIntelligenceEntry,
} from '../types/index.js';
import {
  createStrategicIntelligenceApprovalQueueQueryKey,
  createStrategicIntelligenceCanvasProjectionQueryKey,
  createStrategicIntelligenceFeedQueryKey,
  createStrategicIntelligenceStateQueryKey,
} from './queryKeys.js';
import { getApprovalQueueOverride, setApprovalQueueOverride } from './stateStore.js';

const defaultApi = new StrategicIntelligenceApi();
const defaultLifecycleApi = new StrategicIntelligenceLifecycleApi(defaultApi);

const clone = <T>(value: T): T => structuredClone(value);

const requireReviewReason = (nextStatus: IStrategicIntelligenceApprovalQueueItem['approvalStatus'], reason?: string): void => {
  if ((nextStatus === 'rejected' || nextStatus === 'revision-requested') && (!reason || reason.trim().length === 0)) {
    throw new Error('Review reason is required for rejected and revision-requested transitions.');
  }
};

const transitionQueueItem = (
  queue: IStrategicIntelligenceApprovalQueueItem[],
  queueItemId: string,
  status: IStrategicIntelligenceApprovalQueueItem['approvalStatus'],
  actorUserId: string,
  reviewedAt: string,
  reviewNotes?: string
): IStrategicIntelligenceApprovalQueueItem[] =>
  queue.map((item) => {
    if (item.queueItemId !== queueItemId) {
      return item;
    }

    if (item.approvalStatus !== 'pending') {
      return item;
    }

    return {
      ...item,
      approvalStatus: status,
      reviewedBy: actorUserId,
      reviewedAt,
      reviewNotes,
    };
  });

const transitionEntryLifecycle = (
  entry: IStrategicIntelligenceEntry,
  status: IStrategicIntelligenceApprovalQueueItem['approvalStatus'],
  actorUserId: string,
  reviewedAt: string
): IStrategicIntelligenceEntry => {
  const nextLifecycle =
    status === 'approved'
      ? 'approved'
      : status === 'rejected'
      ? 'rejected'
      : 'revision-requested';

  return {
    ...clone(entry),
    lifecycleState: nextLifecycle,
    approvedAt: status === 'approved' ? reviewedAt : undefined,
    approvedBy: status === 'approved' ? actorUserId : undefined,
    trust: {
      ...entry.trust,
      aiTrustDowngraded: status === 'approved' ? false : entry.trust.aiTrustDowngraded,
    },
  };
};

export interface UseStrategicIntelligenceApprovalQueueInput {
  projectId: string;
  actorUserId: string;
  scorecardId?: string;
}

export interface UseStrategicIntelligenceApprovalDraft {
  entry: IStrategicIntelligenceEntry;
  reviewNotes?: string;
}

export interface UseStrategicIntelligenceApprovalQueueResult {
  cacheKey: readonly ['strategic-intelligence', 'approval-queue', string];
  queue: IStrategicIntelligenceApprovalQueueItem[];
  invalidatedQueryKeys: ReadonlyArray<readonly unknown[]>;
  actions: {
    submitForApproval: (
      draft: UseStrategicIntelligenceApprovalDraft
    ) => UseStrategicIntelligenceApprovalQueueResult;
    approve: (queueItemId: string) => UseStrategicIntelligenceApprovalQueueResult;
    reject: (
      queueItemId: string,
      reason: string
    ) => UseStrategicIntelligenceApprovalQueueResult;
    requestRevision: (
      queueItemId: string,
      reason: string
    ) => UseStrategicIntelligenceApprovalQueueResult;
    renewStaleReview: (
      entryId: string,
      reviewBy: string | null
    ) => UseStrategicIntelligenceApprovalQueueResult;
    resolveConflict: (
      conflictId: string,
      resolutionNote: string
    ) => UseStrategicIntelligenceApprovalQueueResult;
  };
}

export const useStrategicIntelligenceApprovalQueue = (
  input: UseStrategicIntelligenceApprovalQueueInput,
  deps?: {
    api?: StrategicIntelligenceApi;
    lifecycleApi?: StrategicIntelligenceLifecycleApi;
    now?: () => Date;
  }
): UseStrategicIntelligenceApprovalQueueResult => {
  const api = deps?.api ?? defaultApi;
  const lifecycleApi = deps?.lifecycleApi ?? defaultLifecycleApi;
  const now = deps?.now ?? (() => new Date());
  const scorecardId = input.scorecardId ?? input.projectId;
  const cacheKey = createStrategicIntelligenceApprovalQueueQueryKey(input.projectId);
  const queue = getApprovalQueueOverride(scorecardId) ?? api.getApprovalQueue(scorecardId);

  const transition = (
    queueItemId: string,
    status: IStrategicIntelligenceApprovalQueueItem['approvalStatus'],
    reason?: string
  ): UseStrategicIntelligenceApprovalQueueResult => {
    requireReviewReason(status, reason);
    const reviewedAt = now().toISOString();

    const currentQueueItem = queue.find((item) => item.queueItemId === queueItemId);
    if (!currentQueueItem || currentQueueItem.approvalStatus !== 'pending') {
      return useStrategicIntelligenceApprovalQueue(input, {
        api,
        lifecycleApi,
        now,
      });
    }

    const transitionedQueue = transitionQueueItem(
      queue,
      queueItemId,
      status,
      input.actorUserId,
      reviewedAt,
      reason
    );

    setApprovalQueueOverride(scorecardId, transitionedQueue);

    const targetEntry = api
      .getLivingEntries(scorecardId)
      .find((entry) => entry.entryId === currentQueueItem.entryId);

    if (targetEntry) {
      const transitionedEntry = transitionEntryLifecycle(
        targetEntry,
        status,
        input.actorUserId,
        reviewedAt
      );

      lifecycleApi.appendLivingIntelligenceEntryVersion(scorecardId, transitionedEntry);
    }

    return useStrategicIntelligenceApprovalQueue(input, {
      api,
      lifecycleApi,
      now,
    });
  };

  const submitForApproval = (
    draft: UseStrategicIntelligenceApprovalDraft
  ): UseStrategicIntelligenceApprovalQueueResult => {
    const submittedAt = now().toISOString();
    const draftEntry: IStrategicIntelligenceEntry = {
      ...clone(draft.entry),
      lifecycleState: 'pending-approval',
      createdAt: draft.entry.createdAt || submittedAt,
      createdBy: draft.entry.createdBy || input.actorUserId,
      trust: {
        ...draft.entry.trust,
        provenanceClass: 'ai-assisted-draft',
        aiTrustDowngraded: true,
      },
    };

    lifecycleApi.appendLivingIntelligenceEntryVersion(scorecardId, draftEntry);

    const currentQueue = getApprovalQueueOverride(scorecardId) ?? api.getApprovalQueue(scorecardId);
    const queueItem: IStrategicIntelligenceApprovalQueueItem = {
      queueItemId: `${scorecardId}-queue-${Date.now()}`,
      entryId: draftEntry.entryId,
      submittedBy: input.actorUserId,
      submittedAt,
      approvalStatus: 'pending',
      reviewNotes: draft.reviewNotes,
    };

    setApprovalQueueOverride(scorecardId, [...currentQueue, queueItem]);

    return useStrategicIntelligenceApprovalQueue(input, {
      api,
      lifecycleApi,
      now,
    });
  };

  const renewStaleReview = (
    entryId: string,
    reviewBy: string | null
  ): UseStrategicIntelligenceApprovalQueueResult => {
    const entry = api.getLivingEntries(scorecardId).find((item) => item.entryId === entryId);
    if (!entry) {
      return useStrategicIntelligenceApprovalQueue(input, {
        api,
        lifecycleApi,
        now,
      });
    }

    lifecycleApi.appendLivingIntelligenceEntryVersion(scorecardId, {
      ...entry,
      trust: {
        ...entry.trust,
        isStale: false,
        staleReason: undefined,
        lastValidatedAt: now().toISOString(),
        reviewBy,
      },
    });

    return useStrategicIntelligenceApprovalQueue(input, {
      api,
      lifecycleApi,
      now,
    });
  };

  const resolveConflict = (
    conflictId: string,
    resolutionNote: string
  ): UseStrategicIntelligenceApprovalQueueResult => {
    lifecycleApi.applySupersessionOrContradictionResolution(
      scorecardId,
      conflictId,
      resolutionNote,
      input.actorUserId
    );

    return useStrategicIntelligenceApprovalQueue(input, {
      api,
      lifecycleApi,
      now,
    });
  };

  const invalidatedQueryKeys: ReadonlyArray<readonly unknown[]> = [
    createStrategicIntelligenceStateQueryKey(input.projectId, 'adapter-default'),
    createStrategicIntelligenceApprovalQueueQueryKey(input.projectId),
    createStrategicIntelligenceFeedQueryKey(input.projectId),
    createStrategicIntelligenceCanvasProjectionQueryKey(input.projectId),
  ];

  return {
    cacheKey,
    queue,
    invalidatedQueryKeys,
    actions: {
      submitForApproval,
      approve: (queueItemId) => transition(queueItemId, 'approved'),
      reject: (queueItemId, reason) => transition(queueItemId, 'rejected', reason),
      requestRevision: (queueItemId, reason) =>
        transition(queueItemId, 'revision-requested', reason),
      renewStaleReview,
      resolveConflict,
    },
  };
};
