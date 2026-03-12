import type {
  ICommitmentRegisterItem,
  IHandoffReviewState,
  IStrategicIntelligenceEntry,
  ISuggestedIntelligenceMatch,
  ReliabilityTier,
} from '@hbc/strategic-intelligence';

export type StrategicIntelligenceComplexityMode = 'Essential' | 'Standard' | 'Expert';
export const HANDOFF_REQUIRED_ROLES = [
  'Project Manager',
  'Project Executive',
  'Estimating Lead',
  'BD Lead',
] as const;

export const HANDOFF_STEPS = [
  'heritage snapshot walkthrough',
  'commitment register verification',
  'strategic risk discussion',
  'acknowledgment confirmation',
] as const;

export interface IStrategicIntelligenceComplexityFlags {
  readonly isEssential: boolean;
  readonly isStandard: boolean;
  readonly isExpert: boolean;
}

export interface IStrategicIntelligenceFeedFilters {
  lifecycle: IStrategicIntelligenceEntry['lifecycleState'] | 'all';
  entryType: string;
  tag: string;
  trustTier: ReliabilityTier | 'all';
  stale: 'all' | 'stale' | 'fresh';
}

export interface IEntryVisibilityContext {
  canViewNonApproved: boolean;
  canViewSensitiveContent: boolean;
}

export interface IEntryVisibilityResult {
  isVisible: boolean;
  isRedacted: boolean;
  hiddenReason?: 'non-approved' | 'sensitivity';
}

const LIFECYCLE_LABELS: Record<IStrategicIntelligenceEntry['lifecycleState'], string> = {
  submitted: 'Submitted',
  'pending-approval': 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  'revision-requested': 'Revision Requested',
  superseded: 'Superseded',
};

const RELIABILITY_LABELS: Record<ReliabilityTier, string> = {
  high: 'High confidence',
  moderate: 'Moderate confidence',
  low: 'Low confidence',
  'review-required': 'Review required',
};

export const getComplexityFlags = (
  mode: StrategicIntelligenceComplexityMode
): IStrategicIntelligenceComplexityFlags => ({
  isEssential: mode === 'Essential',
  isStandard: mode === 'Standard',
  isExpert: mode === 'Expert',
});

export const getLifecycleLabel = (
  lifecycleState: IStrategicIntelligenceEntry['lifecycleState']
): string => LIFECYCLE_LABELS[lifecycleState];

export const getReliabilityLabel = (tier: ReliabilityTier): string =>
  RELIABILITY_LABELS[tier];

const normalizeLabel = (value: string): string =>
  value
    .split('-')
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');

export const getEntryTags = (entry: IStrategicIntelligenceEntry): string[] => {
  const tags = new Set<string>();

  tags.add(entry.type);
  if (entry.metadata.sector) tags.add(entry.metadata.sector);
  if (entry.metadata.geography) tags.add(entry.metadata.geography);
  if (entry.metadata.riskCategory) tags.add(entry.metadata.riskCategory);
  if (entry.metadata.lifecyclePhase) tags.add(entry.metadata.lifecyclePhase);

  for (const competitor of entry.metadata.competitorReferences ?? []) {
    tags.add(competitor);
  }

  return [...tags];
};

export const getTagOptions = (entries: IStrategicIntelligenceEntry[]): string[] => {
  const values = new Set<string>();
  for (const entry of entries) {
    for (const tag of getEntryTags(entry)) {
      values.add(tag);
    }
  }

  return [...values].sort((a, b) => a.localeCompare(b));
};

export const getEntryTypeOptions = (entries: IStrategicIntelligenceEntry[]): string[] =>
  [...new Set(entries.map((entry) => entry.type))].sort((a, b) => a.localeCompare(b));

export const getEntryVisibility = (
  entry: IStrategicIntelligenceEntry,
  context: IEntryVisibilityContext
): IEntryVisibilityResult => {
  if (!context.canViewNonApproved && entry.lifecycleState !== 'approved') {
    return {
      isVisible: false,
      isRedacted: true,
      hiddenReason: 'non-approved',
    };
  }

  if (!context.canViewSensitiveContent && entry.sensitivity !== 'public-internal') {
    return {
      isVisible: true,
      isRedacted: true,
      hiddenReason: 'sensitivity',
    };
  }

  return {
    isVisible: true,
    isRedacted: false,
  };
};

export const filterEntries = (
  entries: IStrategicIntelligenceEntry[],
  filters: IStrategicIntelligenceFeedFilters
): IStrategicIntelligenceEntry[] =>
  entries.filter((entry) => {
    if (filters.lifecycle !== 'all' && entry.lifecycleState !== filters.lifecycle) {
      return false;
    }

    if (filters.entryType !== 'all' && entry.type !== filters.entryType) {
      return false;
    }

    if (filters.tag !== 'all' && !getEntryTags(entry).includes(filters.tag)) {
      return false;
    }

    if (filters.trustTier !== 'all' && entry.trust.reliabilityTier !== filters.trustTier) {
      return false;
    }

    if (filters.stale === 'stale' && !entry.trust.isStale) {
      return false;
    }

    if (filters.stale === 'fresh' && entry.trust.isStale) {
      return false;
    }

    return true;
  });

export const getCommitmentSummary = (commitments: ICommitmentRegisterItem[]) => {
  const unresolved = commitments.filter(
    (item) => item.fulfillmentStatus !== 'fulfilled' && item.fulfillmentStatus !== 'not-applicable'
  );

  return {
    total: commitments.length,
    unresolvedCount: unresolved.length,
    hasWarning: unresolved.length > 0,
  };
};

export const getAcknowledgmentSummary = (review: IHandoffReviewState | null) => {
  if (!review) {
    return {
      acknowledgedCount: 0,
      participantCount: 0,
      isComplete: false,
    };
  }

  const acknowledgedCount = review.participants.filter(
    (participant) => participant.acknowledgedAt !== null
  ).length;

  return {
    acknowledgedCount,
    participantCount: review.participants.length,
    isComplete:
      review.participants.length > 0 && acknowledgedCount === review.participants.length,
  };
};

export const getDisplayDate = (value: string | null | undefined): string => {
  if (!value) {
    return 'Not set';
  }

  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getRedactionSummary = (
  entry: IStrategicIntelligenceEntry,
  reason?: IEntryVisibilityResult['hiddenReason']
): string => {
  if (reason === 'non-approved') {
    return 'Entry hidden until approved visibility is granted.';
  }

  if (reason === 'sensitivity') {
    return `Redacted due to ${normalizeLabel(entry.sensitivity)} policy.`;
  }

  return 'Redacted due to policy.';
};

export const classifySuggestion = (
  suggestion: ISuggestedIntelligenceMatch
): 'Suggested Heritage' | 'Suggested Intelligence' => {
  const normalized = suggestion.reason.toLowerCase();
  if (normalized.includes('heritage') || normalized.includes('snapshot')) {
    return 'Suggested Heritage';
  }

  return 'Suggested Intelligence';
};

export const parseCsv = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
