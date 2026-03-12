import type {
  ICommitmentRegisterItem,
  IIntelligenceConflict,
  IStrategicIntelligenceEntry,
  IStrategicIntelligenceState,
  IStrategicIntelligenceTelemetryState,
  SensitivityClass,
} from '../types/index.js';

const SENSITIVITY_CLASSES: SensitivityClass[] = [
  'public-internal',
  'restricted-role',
  'restricted-project',
  'confidential',
];

const TELEMETRY_CHANNELS: Array<keyof IStrategicIntelligenceTelemetryState> = [
  'timeToHandoffContextReviewMs',
  'intelligenceContributionLatencyMs',
  'pctHeritagePanelsViewed',
  'heritageReuseRate',
  'strategicIntelligenceCes',
  'handoffReviewCompletionLatency',
  'acknowledgmentCompletionRate',
  'commitmentFulfillmentRate',
  'staleIntelligenceBacklog',
  'conflictResolutionLatency',
  'suggestionAcceptanceRate',
  'suggestionExplainabilityEngagementRate',
  'redactedProjectionAccessRate',
];

export interface ITrustProjectionSummary {
  totalEntries: number;
  staleEntries: number;
  aiTrustDowngradedEntries: number;
  reviewRequiredEntries: number;
}

export interface ISensitivityProjectionSummary {
  byClass: Record<SensitivityClass, number>;
  redactedEntries: number;
}

export interface IConflictProjectionSummary {
  totalConflicts: number;
  openConflicts: number;
  resolvedConflicts: number;
  contradictionConflicts: number;
  supersessionConflicts: number;
}

export interface IUnresolvedCommitmentEscalation {
  commitmentId: string;
  responsibleRole: string;
  fulfillmentStatus: ICommitmentRegisterItem['fulfillmentStatus'];
  bicRecordId?: string;
  source: string;
}

export const summarizeTrust = (entries: IStrategicIntelligenceEntry[]): ITrustProjectionSummary => ({
  totalEntries: entries.length,
  staleEntries: entries.filter((entry) => entry.trust.isStale).length,
  aiTrustDowngradedEntries: entries.filter((entry) => entry.trust.aiTrustDowngraded).length,
  reviewRequiredEntries: entries.filter((entry) => entry.trust.reliabilityTier === 'review-required').length,
});

export const summarizeSensitivity = (
  entries: IStrategicIntelligenceEntry[]
): ISensitivityProjectionSummary => {
  const byClass = SENSITIVITY_CLASSES.reduce<Record<SensitivityClass, number>>(
    (acc, sensitivityClass) => ({
      ...acc,
      [sensitivityClass]: entries.filter((entry) => entry.sensitivity === sensitivityClass).length,
    }),
    {
      'public-internal': 0,
      'restricted-role': 0,
      'restricted-project': 0,
      confidential: 0,
    }
  );

  return {
    byClass,
    redactedEntries: entries.filter((entry) => entry.sensitivity !== 'public-internal').length,
  };
};

const allConflicts = (entries: IStrategicIntelligenceEntry[]): IIntelligenceConflict[] =>
  entries.flatMap((entry) => entry.conflicts);

export const summarizeConflicts = (
  entries: IStrategicIntelligenceEntry[]
): IConflictProjectionSummary => {
  const conflicts = allConflicts(entries);

  return {
    totalConflicts: conflicts.length,
    openConflicts: conflicts.filter((conflict) => conflict.resolutionStatus === 'open').length,
    resolvedConflicts: conflicts.filter((conflict) => conflict.resolutionStatus === 'resolved').length,
    contradictionConflicts: conflicts.filter((conflict) => conflict.type === 'contradiction').length,
    supersessionConflicts: conflicts.filter((conflict) => conflict.type === 'supersession').length,
  };
};

export const summarizeTelemetry = (
  telemetry: IStrategicIntelligenceTelemetryState
): Partial<Record<keyof IStrategicIntelligenceTelemetryState, number>> =>
  TELEMETRY_CHANNELS.reduce<Partial<Record<keyof IStrategicIntelligenceTelemetryState, number>>>(
    (acc, channel) => {
      const value = telemetry[channel];
      if (typeof value === 'number') {
        acc[channel] = value;
      }

      return acc;
    },
    {}
  );

export const unresolvedCommitmentEscalations = (
  state: IStrategicIntelligenceState
): IUnresolvedCommitmentEscalation[] =>
  state.commitmentRegister
    .filter(
      (commitment) =>
        commitment.fulfillmentStatus !== 'fulfilled' && commitment.fulfillmentStatus !== 'not-applicable'
    )
    .map((commitment) => ({
      commitmentId: commitment.commitmentId,
      responsibleRole: commitment.responsibleRole,
      fulfillmentStatus: commitment.fulfillmentStatus,
      bicRecordId: commitment.bicRecordId,
      source: commitment.source,
    }));
