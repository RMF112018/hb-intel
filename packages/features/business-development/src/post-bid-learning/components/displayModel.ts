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

import type { IBusinessDevelopmentPostBidLearningView } from '../adapters/index.js';

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
  readonly clientName?: string;
  readonly marketSegment?: string;
  readonly finalDisposition?: string;
  readonly finalValue?: string;
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

export const createDefaultEditingActor = (domain: string): IBicOwner => ({
  userId: `${domain}-autopsy-author`,
  displayName: `${domain} Autopsy Author`,
  role: domain === 'Business Development' ? 'BD Lead' : 'Estimator',
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

  const firstTag = autopsy.rootCauseTags[0];
  if (firstTag) {
    return `Root cause emphasized: ${firstTag.label}.`;
  }

  return 'Retrospective finding pending author review.';
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

export type BusinessDevelopmentAutopsyViewerRole =
  | 'business-development'
  | 'leadership'
  | 'executive';

export type AutopsyTriageQueue =
  | 'needs-corroboration'
  | 'ready-to-publish'
  | 'stale-needs-revalidation'
  | 'conflict-review';

export interface AutopsyListPursuitMetadata {
  readonly pursuitId: string;
  readonly pursuitName?: string;
  readonly clientName?: string;
  readonly projectType?: string;
}

export interface BusinessDevelopmentAutopsyListRow {
  readonly autopsyId: string;
  readonly pursuitId: string;
  readonly pursuitName: string;
  readonly clientName: string | null;
  readonly projectType: string;
  readonly outcome: IPostBidAutopsy['outcome'];
  readonly status: IPostBidAutopsy['status'];
  readonly confidenceTier: ConfidenceTier;
  readonly dueDate: string;
  readonly owners: readonly string[];
  readonly escalationTargets: readonly string[];
  readonly queueMemberships: readonly AutopsyTriageQueue[];
  readonly markers: readonly string[];
  readonly primaryFactor: string;
  readonly topReusableFinding: string;
  readonly detailSummary: string;
  readonly publicationReady: boolean;
  readonly blockerCount: number;
  readonly evidenceCount: number;
  readonly snapshot: IAutopsyRecordSnapshot;
  readonly view: IBusinessDevelopmentPostBidLearningView;
}

export interface BusinessDevelopmentInsightMetric {
  readonly metricId: string;
  readonly label: string;
  readonly value: string;
  readonly trendLabel: string;
  readonly trendDirection: 'up' | 'down' | 'flat';
}

export interface BusinessDevelopmentInsightModel {
  readonly kpis: readonly BusinessDevelopmentInsightMetric[];
  readonly trendLabels: readonly string[];
  readonly trendSeries: readonly {
    readonly name: string;
    readonly data: readonly number[];
  }[];
  readonly repeatPatterns: readonly {
    readonly label: string;
    readonly count: number;
  }[];
  readonly reinsertionOpportunities: readonly BusinessDevelopmentAutopsyListRow[];
  readonly staleBacklog: readonly BusinessDevelopmentAutopsyListRow[];
  readonly comparatorOptions: readonly {
    readonly comparatorId: 'corroboration-vs-reinsertion' | 'completion-vs-revalidation';
    readonly label: string;
  }[];
}

const hasOpenDisagreement = (record: IAutopsyRecordSnapshot): boolean =>
  record.autopsy.disagreements.some((item) => item.resolutionStatus === 'open');

export const resolveBusinessDevelopmentViewerAccess = (
  record: IAutopsyRecordSnapshot,
  viewerRole: BusinessDevelopmentAutopsyViewerRole
): boolean => {
  if (viewerRole === 'executive' || viewerRole === 'leadership') {
    return true;
  }

  return record.autopsy.sensitivity.visibility !== 'confidential';
};

export const resolveBusinessDevelopmentQueues = (
  record: IAutopsyRecordSnapshot
): readonly AutopsyTriageQueue[] => {
  const queues: AutopsyTriageQueue[] = [];
  const autopsy = record.autopsy;
  const evidenceIncomplete = autopsy.evidence.length < autopsy.publicationGate.requiredEvidenceCount;
  const lowConfidence = autopsy.confidence.tier === 'low' || autopsy.confidence.tier === 'unreliable';
  const stale =
    autopsy.status === 'overdue' ||
    (autopsy.telemetry.staleIntelligenceRate ?? 0) > 0 ||
    (autopsy.telemetry.revalidationLatency ?? 0) > 0;

  if (evidenceIncomplete || lowConfidence || autopsy.confidence.evidenceCoverage < 1) {
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

export const resolveBusinessDevelopmentMarkers = (
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

export const createBusinessDevelopmentListRows = (
  records: readonly IAutopsyRecordSnapshot[],
  views: ReadonlyMap<string, IBusinessDevelopmentPostBidLearningView>,
  metadataByPursuit: ReadonlyMap<string, AutopsyListPursuitMetadata>,
  viewerRole: BusinessDevelopmentAutopsyViewerRole
): readonly BusinessDevelopmentAutopsyListRow[] =>
  records
    .filter((record) => resolveBusinessDevelopmentViewerAccess(record, viewerRole))
    .map((record) => {
      const metadata = metadataByPursuit.get(record.autopsy.pursuitId);
      const view = views.get(record.autopsy.autopsyId);
      const owners = [
        record.assignments.primaryAuthor.displayName,
        ...record.assignments.coAuthors.map((owner) => owner.displayName),
      ];

      return {
        autopsyId: record.autopsy.autopsyId,
        pursuitId: record.autopsy.pursuitId,
        pursuitName: metadata?.pursuitName ?? record.autopsy.pursuitId,
        clientName: metadata?.clientName ?? null,
        projectType: metadata?.projectType ?? 'Unknown',
        outcome: record.autopsy.outcome,
        status: record.autopsy.status,
        confidenceTier: record.autopsy.confidence.tier,
        dueDate: record.sla.dueAt,
        owners,
        escalationTargets: record.escalationEvents.map((event) => event.target.displayName),
        queueMemberships: resolveBusinessDevelopmentQueues(record),
        markers: resolveBusinessDevelopmentMarkers(record),
        primaryFactor: getPrimaryFactor(record.autopsy),
        topReusableFinding: getReusableFinding(record.autopsy),
        detailSummary: getKeyRetrospectiveFinding(record.autopsy),
        publicationReady: record.autopsy.publicationGate.publishable,
        blockerCount: record.autopsy.publicationGate.blockers.length,
        evidenceCount: record.autopsy.evidence.length,
        snapshot: record,
        view:
          view ??
          ({
            row: {
              autopsyId: record.autopsy.autopsyId,
              pursuitId: record.autopsy.pursuitId,
              scorecardId: record.autopsy.scorecardId,
              status: record.autopsy.status,
              outcome: record.autopsy.outcome,
              confidenceTier: record.autopsy.confidence.tier,
              publicationReady: record.autopsy.publicationGate.publishable,
              blockerCount: record.autopsy.publicationGate.blockers.length,
            },
            summary: {
              autopsyId: record.autopsy.autopsyId,
              profileId: 'bd-post-bid-learning',
              status: record.autopsy.status,
              evidenceCount: record.autopsy.evidence.length,
              rootCauseLabels: record.autopsy.rootCauseTags.map((tag) => tag.label),
              reviewDecisionCount: record.autopsy.reviewDecisions.length,
              sensitivityVisibility: record.autopsy.sensitivity.visibility,
            },
            evidenceReferences: record.autopsy.evidence.map((evidence) => ({
              evidenceId: evidence.evidenceId,
              type: evidence.type,
              sourceRef: evidence.sourceRef,
              sensitivity: evidence.sensitivity,
            })),
            benchmarkEnrichment: {
              autopsyId: record.autopsy.autopsyId,
              publishable: record.autopsy.publicationGate.publishable,
              minimumConfidenceTier: record.autopsy.publicationGate.minimumConfidenceTier,
              blockerCount: record.autopsy.publicationGate.blockers.length,
              rootCauseCodes: record.autopsy.rootCauseTags.map((tag) => tag.normalizedCode),
            },
          } satisfies IBusinessDevelopmentPostBidLearningView),
      };
    });

const formatPercent = (value: number | null): string =>
  value == null ? 'N/A' : `${Math.round(value * 100)}%`;

export const createBusinessDevelopmentInsightModel = (
  rows: readonly BusinessDevelopmentAutopsyListRow[]
): BusinessDevelopmentInsightModel => {
  const recentRows = [...rows]
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate))
    .slice(-4);

  const average = (values: readonly number[]): number =>
    values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;

  const corroborationValues = recentRows
    .map((row) => row.snapshot.autopsy.telemetry.corroborationRate)
    .filter((value): value is number => value != null);
  const reinsertionValues = recentRows
    .map((row) => row.snapshot.autopsy.telemetry.reinsertionAdoptionRate)
    .filter((value): value is number => value != null);
  const completionValues = recentRows
    .map((row) => row.snapshot.autopsy.telemetry.autopsyCompletionLatency)
    .filter((value): value is number => value != null);
  const revalidationValues = recentRows
    .map((row) => row.snapshot.autopsy.telemetry.revalidationLatency)
    .filter((value): value is number => value != null);

  const repeatPatterns = [...rows]
    .flatMap((row) => row.snapshot.autopsy.rootCauseTags.map((tag) => tag.label))
    .reduce<Map<string, number>>((counts, label) => {
      counts.set(label, (counts.get(label) ?? 0) + 1);
      return counts;
    }, new Map());

  return {
    kpis: [
      {
        metricId: 'publish-ready',
        label: 'Ready to Publish',
        value: String(rows.filter((row) => row.queueMemberships.includes('ready-to-publish')).length),
        trendLabel: `${rows.filter((row) => row.status === 'published').length} published`,
        trendDirection: 'up',
      },
      {
        metricId: 'needs-corroboration',
        label: 'Needs Corroboration',
        value: String(rows.filter((row) => row.queueMemberships.includes('needs-corroboration')).length),
        trendLabel: `${formatPercent(average(corroborationValues))} corroboration`,
        trendDirection: corroborationValues.length > 0 && average(corroborationValues) >= 0.5 ? 'up' : 'flat',
      },
      {
        metricId: 'stale-backlog',
        label: 'Stale Backlog',
        value: String(rows.filter((row) => row.queueMemberships.includes('stale-needs-revalidation')).length),
        trendLabel: `${average(revalidationValues).toFixed(1)} avg latency`,
        trendDirection: average(revalidationValues) > 0 ? 'down' : 'flat',
      },
      {
        metricId: 'reinsertion',
        label: 'Reinsertion Opportunities',
        value: String(rows.filter((row) => (row.snapshot.autopsy.telemetry.reinsertionAdoptionRate ?? 0) > 0).length),
        trendLabel: `${formatPercent(average(reinsertionValues))} adoption`,
        trendDirection: reinsertionValues.length > 0 && average(reinsertionValues) >= 0.5 ? 'up' : 'flat',
      },
    ],
    trendLabels: recentRows.map((row) => row.pursuitName),
    trendSeries: [
      {
        name: 'Corroboration',
        data: recentRows.map((row) => row.snapshot.autopsy.telemetry.corroborationRate ?? 0),
      },
      {
        name: 'Reinsertion',
        data: recentRows.map((row) => row.snapshot.autopsy.telemetry.reinsertionAdoptionRate ?? 0),
      },
      {
        name: 'Revalidation latency',
        data: recentRows.map((row) => row.snapshot.autopsy.telemetry.revalidationLatency ?? 0),
      },
      {
        name: 'Completion latency',
        data: recentRows.map((row) => row.snapshot.autopsy.telemetry.autopsyCompletionLatency ?? 0),
      },
    ],
    repeatPatterns: [...repeatPatterns.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 4)
      .map(([label, count]) => ({ label, count })),
    reinsertionOpportunities: rows.filter(
      (row) =>
        (row.snapshot.autopsy.telemetry.reinsertionAdoptionRate ?? 0) > 0 ||
        (row.snapshot.autopsy.telemetry.benchmarkAccuracyLift ?? 0) > 0
    ),
    staleBacklog: rows.filter((row) => row.queueMemberships.includes('stale-needs-revalidation')),
    comparatorOptions: [
      {
        comparatorId: 'corroboration-vs-reinsertion',
        label: 'Corroboration vs reinsertion',
      },
      {
        comparatorId: 'completion-vs-revalidation',
        label: 'Completion vs revalidation latency',
      },
    ],
  };
};
