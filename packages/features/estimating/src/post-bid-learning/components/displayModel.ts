import type {
  AutopsyStatus,
  ConfidenceTier,
  IAutopsyDisagreementTriageState,
  IAutopsyPublicationBlockerSummary,
  IAutopsySectionValidationState,
  IBicOwner,
  IPostBidAutopsy,
} from '@hbc/post-bid-autopsy';
import type { StatusVariant } from '@hbc/ui-kit';

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
