import type {
  AutopsyStatus,
  ConfidenceTier,
  IAutopsyDisagreementTriageState,
  IAutopsyRecordSnapshot,
  IAutopsyPublicationBlockerSummary,
  IAutopsySectionValidationState,
  IBicOwner,
  IPostBidAutopsy,
} from '@hbc/post-bid-autopsy';
import type { StatusVariant } from '@hbc/ui-kit';

import type { IEstimatingPostBidLearningView } from '../adapters/index.js';

export type AutopsyComplexityTier = 'Essential' | 'Standard' | 'Expert';

export interface AutopsyAiSuggestion {
  readonly suggestionId: string;
  readonly action: 'summarize' | 'suggest' | 'compare';
  readonly text: string;
  readonly citations: readonly string[];
}

export interface AutopsyDeepLink {
  readonly linkId: string;
  readonly label: string;
  readonly description?: string;
  readonly href?: string;
  readonly onClick?: () => void;
}

export interface AutopsyImpactPreview {
  readonly title: string;
  readonly summary: string;
  readonly benchmarkHint?: string;
  readonly intelligenceHint?: string;
  readonly warning?: string;
  readonly metrics?: readonly {
    readonly label: string;
    readonly value: string;
  }[];
}

export interface AutopsyComparatorCallout {
  readonly title: string;
  readonly summary: string;
  readonly detail?: string;
}

export interface AutopsyPursuitSnapshot {
  readonly pursuitName: string;
  readonly estimatorName?: string;
  readonly scopePackage?: string;
  readonly estimateClass?: string;
}

export interface PostBidAutopsyWizardSubmitPayload {
  readonly pursuitId: string;
  readonly autopsyId: string | null;
  readonly approved: boolean;
  readonly activeStepId: string | null;
  readonly draftValues: ReadonlyArray<{
    readonly sectionKey: string;
    readonly draftValue: string;
  }>;
}

export const createDefaultEditingActor = (): IBicOwner => ({
  userId: 'estimating-autopsy-author',
  displayName: 'Estimating Autopsy Author',
  role: 'Estimator',
});

export const toConfidenceVariant = (tier: ConfidenceTier | null): StatusVariant => {
  switch (tier) {
    case 'high':
      return 'success';
    case 'moderate':
      return 'warning';
    case 'low':
      return 'atRisk';
    case 'unreliable':
      return 'error';
    default:
      return 'neutral';
  }
};

export const toLifecycleVariant = (status: AutopsyStatus | null): StatusVariant => {
  switch (status) {
    case 'published':
      return 'completed';
    case 'approved':
      return 'success';
    case 'review':
      return 'warning';
    case 'overdue':
      return 'error';
    case 'superseded':
    case 'archived':
      return 'neutral';
    case 'draft':
    default:
      return 'draft';
  }
};

export const toOutcomeVariant = (outcome: IPostBidAutopsy['outcome'] | null): StatusVariant => {
  switch (outcome) {
    case 'won':
      return 'success';
    case 'lost':
      return 'warning';
    case 'no-bid':
      return 'info';
    default:
      return 'neutral';
  }
};

export const formatOutcomeLabel = (outcome: IPostBidAutopsy['outcome'] | null): string => {
  switch (outcome) {
    case 'won':
      return 'Won';
    case 'lost':
      return 'Lost';
    case 'no-bid':
      return 'No-Bid';
    default:
      return 'Unavailable';
  }
};

export const formatStatusLabel = (status: AutopsyStatus | null): string => {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'review':
      return 'Review';
    case 'approved':
      return 'Approved';
    case 'published':
      return 'Published';
    case 'superseded':
      return 'Superseded';
    case 'archived':
      return 'Archived';
    case 'overdue':
      return 'Overdue';
    default:
      return 'Not started';
  }
};

export const getPrimaryFactor = (autopsy: IPostBidAutopsy | null): string => {
  return autopsy?.rootCauseTags[0]?.label ?? 'Primary factor pending';
};

export const getKeyRetrospectiveFinding = (autopsy: IPostBidAutopsy | null): string => {
  if (!autopsy) {
    return 'Retrospective finding unavailable.';
  }

  const firstReason = autopsy.confidence.reasons[0];
  if (firstReason) {
    return firstReason;
  }

  return autopsy.rootCauseTags[0]?.label ?? 'Retrospective finding pending review.';
};

export const getReusableFinding = (autopsy: IPostBidAutopsy | null): string => {
  if (!autopsy) {
    return 'Reusable learning unavailable.';
  }

  return autopsy.rootCauseTags[0]?.normalizedCode ?? 'No reusable finding coded';
};

export const formatEvidenceMarker = (autopsy: IPostBidAutopsy | null): string => {
  const evidenceCount = autopsy?.evidence.length ?? 0;
  return `Evidence marker: ${evidenceCount} source${evidenceCount === 1 ? '' : 's'}`;
};

export const getQueueLabel = (
  queueState: { optimisticStatusLabel: 'Saved locally' | 'Queued to sync' | null } | null | undefined
): 'Saved locally' | 'Queued to sync' | 'Synced' => {
  if (!queueState) {
    return 'Synced';
  }

  return queueState.optimisticStatusLabel ?? 'Synced';
};

export const hasBlockingIssues = (
  blockers: IAutopsyPublicationBlockerSummary,
  triage: IAutopsyDisagreementTriageState
): boolean => blockers.blockers.length > 0 || triage.hasOpenDisagreements;

export const getOwnershipLabel = (owner: IBicOwner | null | undefined): string =>
  owner ? `${owner.displayName} (${owner.role})` : 'Unassigned';

export const toSectionDraftRecord = (
  sections: readonly IAutopsySectionValidationState[]
): Record<string, string> =>
  Object.fromEntries(sections.map((section) => [section.sectionKey, section.draftValue]));

export type EstimatingAutopsyViewerRole = 'estimating' | 'chief-estimator' | 'leadership';

export type AutopsyTriageQueue =
  | 'needs-corroboration'
  | 'ready-to-publish'
  | 'stale-needs-revalidation'
  | 'conflict-review';

export interface AutopsyListPursuitMetadata {
  readonly pursuitId: string;
  readonly pursuitName?: string;
  readonly estimatorName?: string;
  readonly projectType?: string;
}

export interface EstimatingAutopsyListRow {
  readonly autopsyId: string;
  readonly pursuitId: string;
  readonly pursuitName: string;
  readonly estimatorName: string | null;
  readonly projectType: string;
  readonly outcome: IPostBidAutopsy['outcome'];
  readonly status: IPostBidAutopsy['status'];
  readonly confidenceTier: ConfidenceTier;
  readonly dueDate: string;
  readonly primaryOwner: string;
  readonly escalationOwner: string | null;
  readonly queueMemberships: readonly AutopsyTriageQueue[];
  readonly markers: readonly string[];
  readonly evidenceCount: number;
  readonly blockerCount: number;
  readonly detailSummary: string;
  readonly snapshot: IAutopsyRecordSnapshot;
  readonly view: IEstimatingPostBidLearningView;
}

const hasOpenDisagreement = (record: IAutopsyRecordSnapshot): boolean =>
  record.autopsy.disagreements.some((item) => item.resolutionStatus === 'open');

export const resolveEstimatingViewerAccess = (
  record: IAutopsyRecordSnapshot,
  viewerRole: EstimatingAutopsyViewerRole
): boolean => {
  if (viewerRole === 'leadership') {
    return true;
  }

  if (viewerRole === 'chief-estimator') {
    return record.autopsy.sensitivity.visibility !== 'confidential';
  }

  return record.autopsy.sensitivity.visibility === 'project-scoped' ||
    record.autopsy.sensitivity.visibility === 'role-scoped';
};

export const resolveEstimatingQueues = (
  record: IAutopsyRecordSnapshot
): readonly AutopsyTriageQueue[] => {
  const queues: AutopsyTriageQueue[] = [];
  const autopsy = record.autopsy;
  const evidenceIncomplete = autopsy.evidence.length < autopsy.publicationGate.requiredEvidenceCount;
  const stale =
    autopsy.status === 'overdue' ||
    (autopsy.telemetry.staleIntelligenceRate ?? 0) > 0 ||
    (autopsy.telemetry.revalidationLatency ?? 0) > 0;

  if (evidenceIncomplete || autopsy.confidence.tier === 'low' || autopsy.confidence.tier === 'unreliable') {
    queues.push('needs-corroboration');
  }

  if (
    autopsy.publicationGate.publishable &&
    (autopsy.status === 'approved' || autopsy.status === 'published')
  ) {
    queues.push('ready-to-publish');
  }

  if (stale) {
    queues.push('stale-needs-revalidation');
  }

  if (hasOpenDisagreement(record) || autopsy.overrideGovernance) {
    queues.push('conflict-review');
  }

  return queues;
};

export const resolveEstimatingMarkers = (
  record: IAutopsyRecordSnapshot
): readonly string[] => {
  const markers: string[] = [];

  if (record.autopsy.status === 'superseded' || record.autopsy.supersession.supersededByAutopsyId) {
    markers.push('Superseded');
  }

  if (record.autopsy.status === 'archived') {
    markers.push('Archived');
  }

  if (hasOpenDisagreement(record)) {
    markers.push('Disagreement open');
  }

  if (record.autopsy.overrideGovernance) {
    markers.push('Manual override');
  }

  return markers;
};

export const createEstimatingListRows = (
  records: readonly IAutopsyRecordSnapshot[],
  views: ReadonlyMap<string, IEstimatingPostBidLearningView>,
  metadataByPursuit: ReadonlyMap<string, AutopsyListPursuitMetadata>,
  viewerRole: EstimatingAutopsyViewerRole
): readonly EstimatingAutopsyListRow[] =>
  records
    .filter((record) => resolveEstimatingViewerAccess(record, viewerRole))
    .map((record) => {
      const metadata = metadataByPursuit.get(record.autopsy.pursuitId);
      const lastEscalation = record.escalationEvents.at(-1);
      const view = views.get(record.autopsy.autopsyId);

      return {
        autopsyId: record.autopsy.autopsyId,
        pursuitId: record.autopsy.pursuitId,
        pursuitName: metadata?.pursuitName ?? record.autopsy.pursuitId,
        estimatorName: metadata?.estimatorName ?? null,
        projectType: metadata?.projectType ?? 'Unknown',
        outcome: record.autopsy.outcome,
        status: record.autopsy.status,
        confidenceTier: record.autopsy.confidence.tier,
        dueDate: record.sla.dueAt,
        primaryOwner: record.assignments.primaryAuthor.displayName,
        escalationOwner: lastEscalation?.target.displayName ?? null,
        queueMemberships: resolveEstimatingQueues(record),
        markers: resolveEstimatingMarkers(record),
        evidenceCount: record.autopsy.evidence.length,
        blockerCount: record.autopsy.publicationGate.blockers.length,
        detailSummary: getKeyRetrospectiveFinding(record.autopsy),
        snapshot: record,
        view:
          view ??
          ({
            row: {
              autopsyId: record.autopsy.autopsyId,
              pursuitId: record.autopsy.pursuitId,
              status: record.autopsy.status,
              outcome: record.autopsy.outcome,
              confidenceTier: record.autopsy.confidence.tier,
              evidenceCount: record.autopsy.evidence.length,
            },
            summary: {
              autopsyId: record.autopsy.autopsyId,
              profileId: 'estimating-post-bid-learning',
              status: record.autopsy.status,
              confidenceScore: record.autopsy.confidence.score,
              reviewDecisionCount: record.autopsy.reviewDecisions.length,
              disagreementCount: record.autopsy.disagreements.length,
            },
            evidenceReferences: record.autopsy.evidence.map((evidence) => ({
              evidenceId: evidence.evidenceId,
              type: evidence.type,
              sourceRef: evidence.sourceRef,
              reliabilityHint: evidence.reliabilityHint,
            })),
            benchmarkRecommendation: {
              autopsyId: record.autopsy.autopsyId,
              publishable: record.autopsy.publicationGate.publishable,
              blockerCount: record.autopsy.publicationGate.blockers.length,
              rootCauseCodes: record.autopsy.rootCauseTags.map((tag) => tag.normalizedCode),
              minimumConfidenceTier: record.autopsy.publicationGate.minimumConfidenceTier,
            },
          } satisfies IEstimatingPostBidLearningView),
      };
    });
