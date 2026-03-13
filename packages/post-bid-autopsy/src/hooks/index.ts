import { AUTOPSY_SYNC_QUEUE_KEY } from '../constants/index.js';
import type {
  IAutopsyCommitMetadata,
  IAutopsyCompletenessState,
  IAutopsyPublicationBlockerSummary,
  IAutopsyQueryInvalidationResult,
  IAutopsyQueueState,
  IPostBidAutopsyHookSurface,
  IUseAutopsyPublicationGateInput,
  IUseAutopsyPublicationGateResult,
  IUseAutopsyReviewGovernanceInput,
  IUseAutopsyReviewGovernanceResult,
  IUseAutopsySyncQueueInput,
  IUseAutopsySyncQueueResult,
  IUsePostBidAutopsyInput,
  IUsePostBidAutopsyResult,
  IPostBidAutopsy,
} from '../types/index.js';

export const createPostBidAutopsyRecordQueryKey = (autopsyId: string) =>
  ['post-bid-autopsy', 'record', autopsyId] as const;

export const createPostBidAutopsyReviewGovernanceQueryKey = (autopsyId: string) =>
  ['post-bid-autopsy', 'review-governance', autopsyId] as const;

export const createPostBidAutopsyPublicationGateQueryKey = (autopsyId: string) =>
  ['post-bid-autopsy', 'publication-gate', autopsyId] as const;

export const createPostBidAutopsySyncQueueQueryKey = (autopsyId: string) =>
  ['post-bid-autopsy', 'sync-queue', autopsyId] as const;

export const createPostBidAutopsyListQueryKey = () => ['post-bid-autopsy', 'list'] as const;

export const createAutopsyQueryInvalidationResult = (
  autopsyId: string
): IAutopsyQueryInvalidationResult => ({
  invalidatedQueryKeys: [
    createPostBidAutopsyListQueryKey(),
    createPostBidAutopsyRecordQueryKey(autopsyId),
    createPostBidAutopsyReviewGovernanceQueryKey(autopsyId),
    createPostBidAutopsyPublicationGateQueryKey(autopsyId),
    createPostBidAutopsySyncQueueQueryKey(autopsyId),
  ],
});

export const createAutopsyQueueState = (
  overrides: Partial<IAutopsyQueueState> = {}
): IAutopsyQueueState => ({
  status: overrides.status ?? 'synced',
  pendingMutationCount: overrides.pendingMutationCount ?? 0,
  lastSyncedAt: overrides.lastSyncedAt ?? null,
  syncQueueKey: overrides.syncQueueKey ?? AUTOPSY_SYNC_QUEUE_KEY,
});

export const createAutopsyCommitMetadata = (
  overrides: Partial<IAutopsyCommitMetadata> = {}
): IAutopsyCommitMetadata => ({
  committedAt: overrides.committedAt ?? null,
  committedBy: overrides.committedBy ?? null,
  source: overrides.source ?? 'unknown',
});

export const createAutopsyCompletenessState = (
  autopsy: Pick<IPostBidAutopsy, 'evidence' | 'confidence' | 'publicationGate'>
): IAutopsyCompletenessState => ({
  evidenceCount: autopsy.evidence.length,
  requiredEvidenceCount: autopsy.publicationGate.requiredEvidenceCount,
  evidenceComplete: autopsy.evidence.length >= autopsy.publicationGate.requiredEvidenceCount,
  confidenceTier: autopsy.confidence.tier,
  confidenceScore: autopsy.confidence.score,
  confidenceComplete: autopsy.confidence.evidenceCoverage >= 1,
});

export const createAutopsyPublicationBlockerSummary = (
  autopsy: Pick<IPostBidAutopsy, 'publicationGate'>
): IAutopsyPublicationBlockerSummary => ({
  publishable: autopsy.publicationGate.publishable,
  blockers: autopsy.publicationGate.blockers,
  minimumConfidenceTier: autopsy.publicationGate.minimumConfidenceTier,
});

export const POST_BID_AUTOPSY_HOOK_SURFACES: readonly IPostBidAutopsyHookSurface[] = Object.freeze([
  {
    surfaceId: 'post-bid-autopsy.record',
    ownership: 'primitive',
    queryKey: createPostBidAutopsyRecordQueryKey('record-template'),
  },
  {
    surfaceId: 'post-bid-autopsy.review-governance',
    ownership: 'primitive',
    queryKey: createPostBidAutopsyReviewGovernanceQueryKey('record-template'),
  },
  {
    surfaceId: 'post-bid-autopsy.publication-gate',
    ownership: 'primitive',
    queryKey: createPostBidAutopsyPublicationGateQueryKey('record-template'),
  },
  {
    surfaceId: 'post-bid-autopsy.sync-queue',
    ownership: 'primitive',
    queryKey: createPostBidAutopsySyncQueueQueryKey('record-template'),
  },
]);

export const createPostBidAutopsyHookScaffold = () => ({
  surfaces: POST_BID_AUTOPSY_HOOK_SURFACES,
});

export type {
  IUsePostBidAutopsyInput,
  IUsePostBidAutopsyResult,
  IUseAutopsyReviewGovernanceInput,
  IUseAutopsyReviewGovernanceResult,
  IUseAutopsyPublicationGateInput,
  IUseAutopsyPublicationGateResult,
  IUseAutopsySyncQueueInput,
  IUseAutopsySyncQueueResult,
  IAutopsyQueueState,
  IAutopsyCommitMetadata,
  IAutopsyCompletenessState,
  IAutopsyPublicationBlockerSummary,
  IAutopsyQueryInvalidationResult,
};
