import { AUTOPSY_SYNC_QUEUE_KEY } from '../constants/index.js';
import {
  createPostBidAutopsyInvalidationKeys,
} from './queryKeys.js';
import type {
  AutopsyQueueStatus,
  ConfidenceTier,
  IAutopsyCommitMetadata,
  IAutopsyCompletenessState,
  IAutopsyDisagreementTriageState,
  IAutopsyPublicationBlockerSummary,
  IAutopsyQueryInvalidationResult,
  IAutopsyQueueReplayProjection,
  IAutopsyQueueState,
  IAutopsyRecordSnapshot,
  IAutopsyReviewGovernanceState,
  IAutopsySectionValidationState,
  IAutopsySyncQueueState,
  IPostBidAutopsyStateView,
  IPostBidAutopsySectionsState,
  IPostBidAutopsy,
  IVersionMetadata,
} from '../types/index.js';

const EMPTY_CONFIDENCE_TIER: ConfidenceTier = 'unreliable';

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

type AutopsyRecordLike = IAutopsyRecordSnapshot | IPostBidAutopsy | null | undefined;

const resolveAutopsy = (value: AutopsyRecordLike): IPostBidAutopsy | null => {
  if (!value) {
    return null;
  }

  return 'autopsy' in value ? value.autopsy : value;
};

export const createAutopsyCompletenessState = (
  record?: AutopsyRecordLike
): IAutopsyCompletenessState => {
  const autopsy = resolveAutopsy(record);
  if (!autopsy) {
    return {
      evidenceCount: 0,
      requiredEvidenceCount: 0,
      evidenceComplete: false,
      confidenceTier: EMPTY_CONFIDENCE_TIER,
      confidenceScore: 0,
      confidenceComplete: false,
    };
  }

  return {
    evidenceCount: autopsy.evidence.length,
    requiredEvidenceCount: autopsy.publicationGate.requiredEvidenceCount,
    evidenceComplete: autopsy.evidence.length >= autopsy.publicationGate.requiredEvidenceCount,
    confidenceTier: autopsy.confidence.tier,
    confidenceScore: autopsy.confidence.score,
    confidenceComplete: autopsy.confidence.evidenceCoverage >= 1,
  };
};

export const createAutopsyPublicationBlockerSummary = (
  record?: AutopsyRecordLike
): IAutopsyPublicationBlockerSummary => ({
  publishable: resolveAutopsy(record)?.publicationGate.publishable ?? false,
  blockers: resolveAutopsy(record)?.publicationGate.blockers ?? [],
  minimumConfidenceTier: resolveAutopsy(record)?.publicationGate.minimumConfidenceTier ?? 'moderate',
});

export const createAutopsyQueryInvalidationResult = (
  pursuitId: string
): IAutopsyQueryInvalidationResult => ({
  invalidatedQueryKeys: createPostBidAutopsyInvalidationKeys(pursuitId),
});

export const selectAutopsyCommitMetadata = (
  version: IVersionMetadata | null,
  source: IAutopsyCommitMetadata['source']
): IAutopsyCommitMetadata =>
  createAutopsyCommitMetadata({
    committedAt: version?.createdAt ?? null,
    committedBy: version?.createdBy.userId ?? null,
    source,
  });

export const selectAutopsyStateView = (
  record?: IAutopsyRecordSnapshot | null
): IPostBidAutopsyStateView => ({
  autopsy: record?.autopsy ?? null,
  lifecycleStatus: record?.autopsy.status ?? null,
  publicationGate: record?.autopsy.publicationGate ?? null,
  telemetrySummary: {
    autopsyCompletionLatency: record?.autopsy.telemetry.autopsyCompletionLatency ?? null,
    intelligenceSeedingConversionRate:
      record?.autopsy.telemetry.intelligenceSeedingConversionRate ?? null,
    staleIntelligenceRate: record?.autopsy.telemetry.staleIntelligenceRate ?? null,
    revalidationLatency: record?.autopsy.telemetry.revalidationLatency ?? null,
    benchmarkAccuracyLift: record?.autopsy.telemetry.benchmarkAccuracyLift ?? null,
  },
});

export const selectAutopsySectionsState = (
  record?: IAutopsyRecordSnapshot | null
): IPostBidAutopsySectionsState => {
  if (!record) {
    return {
      autopsyId: null,
      sections: [],
    };
  }

  const draftBySection = new Map(
    (record.sectionDrafts ?? []).map((draft) => [draft.sectionKey, draft])
  );

  const sections: IAutopsySectionValidationState[] = record.sectionBicRecords.map((section) => {
    const matchingEvidence = record.autopsy.evidence.filter((evidence) =>
      evidence.sourceRef.includes(section.sectionKey)
    );
    const draft = draftBySection.get(section.sectionKey);
    const validationErrors: string[] = [];

    if (matchingEvidence.length === 0) {
      validationErrors.push('section-evidence-required');
    }

    if (!draft?.draftValue?.trim()) {
      validationErrors.push('section-draft-required');
    }

    return {
      sectionKey: section.sectionKey,
      owner: section.currentOwner,
      title: section.title,
      evidenceCount: matchingEvidence.length,
      evidenceComplete: matchingEvidence.length > 0,
      validationErrors,
      draftValue: draft?.draftValue ?? '',
    };
  });

  return {
    autopsyId: record.autopsy.autopsyId,
    sections,
  };
};

export const selectAutopsyReviewGovernanceState = (
  record?: IAutopsyRecordSnapshot | null
): IAutopsyReviewGovernanceState => ({
  autopsyId: record?.autopsy.autopsyId ?? null,
  reviewDecisions: record?.autopsy.reviewDecisions ?? [],
  disagreements: record?.autopsy.disagreements ?? [],
  overrideGovernance: record?.autopsy.overrideGovernance ?? null,
  sensitivity: record?.autopsy.sensitivity ?? {
    visibility: 'confidential',
    redactionRequired: true,
  },
  publicationGate: record?.autopsy.publicationGate ?? null,
  escalationEvents: record?.escalationEvents ?? [],
});

export const selectDisagreementTriageState = (
  record?: IAutopsyRecordSnapshot | null
): IAutopsyDisagreementTriageState => {
  const disagreements = record?.autopsy.disagreements ?? [];
  const escalationEvents = record?.escalationEvents ?? [];

  return {
    hasOpenDisagreements: disagreements.some((item) => item.resolutionStatus === 'open'),
    escalationRequired: disagreements.some((item) => item.escalationRequired),
    escalationTargets: escalationEvents.map((event) => event.target.displayName),
  };
};

export const selectOptimisticStatusLabel = (
  status: AutopsyQueueStatus | null
): IAutopsySyncQueueState['optimisticStatusLabel'] => {
  if (status === 'saved-locally') {
    return 'Saved locally';
  }

  if (status === 'queued-to-sync') {
    return 'Queued to sync';
  }

  return null;
};

export const selectAutopsyQueueState = (
  record: IAutopsyRecordSnapshot | null,
  pendingMutations: IAutopsySyncQueueState['queuedMutations'],
  replayCompletion: IAutopsyQueueReplayProjection,
  lastVersion: IVersionMetadata | null
): IAutopsySyncQueueState => ({
  autopsyId: record?.autopsy.autopsyId ?? null,
  queuedMutations: pendingMutations,
  optimisticStatusLabel: selectOptimisticStatusLabel(record?.syncStatus ?? null),
  replayInFlight: false,
  replayCompletion: replayCompletion.completedAt
    ? replayCompletion
    : {
        ...replayCompletion,
        version: replayCompletion.version ?? lastVersion,
      },
  queueStatus: createAutopsyQueueState({
    status: record?.syncStatus ?? 'synced',
    pendingMutationCount: pendingMutations.length,
    lastSyncedAt:
      replayCompletion.completedAt ??
      (record?.syncStatus === 'synced' ? lastVersion?.createdAt ?? null : null),
  }),
  commitMetadata: selectAutopsyCommitMetadata(lastVersion, 'unknown'),
});
