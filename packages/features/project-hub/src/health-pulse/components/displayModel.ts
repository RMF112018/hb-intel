import type { ComplexityTier } from '@hbc/complexity';
import type {
  HealthStatus,
  ICompoundRiskSignal,
  IHealthDimension,
  IHealthMetric,
  IProjectHealthPulse,
  IHealthPulseAdminConfig,
  PulseConfidenceTier,
} from '../types/index.js';
import type { StatusVariant } from '@hbc/ui-kit';

export type HealthDimensionKey = 'cost' | 'time' | 'field' | 'office';

export type ExplainabilitySection =
  | 'confidence'
  | 'why'
  | 'changed'
  | 'contributors'
  | 'matters-most';

export const getStatusVariant = (status: HealthStatus): StatusVariant => {
  if (status === 'on-track') return 'onTrack';
  if (status === 'watch') return 'warning';
  if (status === 'at-risk') return 'atRisk';
  if (status === 'critical') return 'critical';
  return 'pending';
};

export const getConfidenceVariant = (tier: PulseConfidenceTier): StatusVariant => {
  if (tier === 'high') return 'success';
  if (tier === 'moderate') return 'info';
  if (tier === 'low') return 'warning';
  return 'error';
};

export const getConfidenceLabel = (tier: PulseConfidenceTier): string => {
  if (tier === 'high') return 'Confidence: High';
  if (tier === 'moderate') return 'Confidence: Moderate';
  if (tier === 'low') return 'Confidence: Low';
  return 'Confidence: Unreliable';
};

export const isConfidenceCaution = (tier: PulseConfidenceTier): boolean =>
  tier === 'low' || tier === 'unreliable';

export const hasEscalatedCompoundRisk = (signals: ICompoundRiskSignal[]): boolean =>
  signals.some((signal) => signal.severity === 'moderate' || signal.severity === 'high' || signal.severity === 'critical');

export const getDimensionEntries = (pulse: IProjectHealthPulse): Array<[HealthDimensionKey, IHealthDimension]> => [
  ['cost', pulse.dimensions.cost],
  ['time', pulse.dimensions.time],
  ['field', pulse.dimensions.field],
  ['office', pulse.dimensions.office],
];

export const buildTrendSeries = (baseScore: number, trend: IHealthDimension['trend']): number[] => {
  const adjustments =
    trend === 'improving'
      ? [-8, -6, -5, -3, -2, 0, 1, 3, 4, 5, 6, 7, 8]
      : trend === 'declining'
        ? [8, 7, 6, 5, 4, 3, 1, 0, -2, -3, -5, -6, -8]
        : [0, 1, -1, 1, 0, -1, 1, 0, 0, 1, -1, 0, 0];

  return adjustments.map((delta) => Math.max(0, Math.min(100, Math.round(baseScore + delta))));
};

export const buildHistoryLabels = (points: number): string[] =>
  Array.from({ length: points }, (_, index) => `W${index + 1}`);

export const resolveComplexityTier = (
  explicitTier: ComplexityTier | undefined,
  contextTier: ComplexityTier | undefined
): ComplexityTier => explicitTier ?? contextTier ?? 'standard';

export interface PortfolioHealthRow {
  projectId: string;
  projectName: string;
  overallStatus: HealthStatus;
  overallScore: number;
  confidenceTier: PulseConfidenceTier;
  confidenceScore: number;
  dimensions: Record<HealthDimensionKey, number>;
  compoundRiskActive: boolean;
  compoundRiskSeverity: ICompoundRiskSignal['severity'] | 'none';
  topActionSummary: string;
  triageBucket: 'attention-now' | 'trending-down' | 'data-quality-risk' | 'recovering';
  triageReasons: string[];
  manualInfluenceHeavy: boolean;
  deteriorationVelocity: number;
  compoundRiskSeverityScore: number;
  unresolvedActionBacklog: number;
}

export interface PortfolioHealthTableFilters {
  status: HealthStatus | 'all';
  lowConfidenceOnly: boolean;
  compoundRiskActiveOnly: boolean;
  manualInfluenceHeavyOnly: boolean;
}

export type PortfolioHealthSortMode =
  | 'deterioration-velocity'
  | 'compound-risk-severity'
  | 'unresolved-action-backlog';

export const DEFAULT_PORTFOLIO_FILTERS: PortfolioHealthTableFilters = {
  status: 'all',
  lowConfidenceOnly: false,
  compoundRiskActiveOnly: false,
  manualInfluenceHeavyOnly: false,
};

const severityScoreMap: Record<PortfolioHealthRow['compoundRiskSeverity'], number> = {
  none: 0,
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4,
};

export const filterPortfolioRows = (
  rows: PortfolioHealthRow[],
  filters: PortfolioHealthTableFilters
): PortfolioHealthRow[] =>
  rows.filter((row) => {
    if (filters.status !== 'all' && row.overallStatus !== filters.status) {
      return false;
    }

    if (filters.lowConfidenceOnly && !isConfidenceCaution(row.confidenceTier)) {
      return false;
    }

    if (filters.compoundRiskActiveOnly && !row.compoundRiskActive) {
      return false;
    }

    if (filters.manualInfluenceHeavyOnly && !row.manualInfluenceHeavy) {
      return false;
    }

    return true;
  });

export const sortPortfolioRows = (
  rows: PortfolioHealthRow[],
  sortMode: PortfolioHealthSortMode
): PortfolioHealthRow[] =>
  [...rows].sort((a, b) => {
    if (sortMode === 'deterioration-velocity') {
      return b.deteriorationVelocity - a.deteriorationVelocity;
    }

    if (sortMode === 'compound-risk-severity') {
      return b.compoundRiskSeverityScore - a.compoundRiskSeverityScore;
    }

    return b.unresolvedActionBacklog - a.unresolvedActionBacklog;
  });

export const getCompoundSeverityScore = (
  severity: PortfolioHealthRow['compoundRiskSeverity']
): number => severityScoreMap[severity];

export const isMetricMissing = (metric: IHealthMetric): boolean => metric.value === null;

export const isMetricExcluded = (metric: IHealthMetric): boolean =>
  metric.value === null || metric.isStale;

export const getMetricValueLabel = (metric: IHealthMetric): string =>
  metric.value === null ? 'No data' : `${Math.round(metric.value)}`;

export const getMetricAnchorId = (
  dimensionKey: HealthDimensionKey,
  metricKey: string
): string => `health-metric-${dimensionKey}-${metricKey}`;

export const getMetricAgeInDays = (
  enteredAt: string,
  nowIso: string
): number => {
  const msPerDay = 24 * 60 * 60 * 1000;
  const ageMs = Date.parse(nowIso) - Date.parse(enteredAt);
  if (!Number.isFinite(ageMs) || ageMs < 0) return 0;
  return Math.floor(ageMs / msPerDay);
};

export const isOverrideAged = (
  enteredAt: string | null | undefined,
  maxOverrideAgeDays: number,
  nowIso: string
): boolean => {
  if (!enteredAt) return false;
  return getMetricAgeInDays(enteredAt, nowIso) > maxOverrideAgeDays;
};

export interface HealthPulseAdminFormState {
  weightsPercent: { field: number; time: number; cost: number; office: number };
  stalenessThresholdDays: number;
  metricStalenessOverridesInput: string;
  approvalRequiredMetricKeysInput: string;
  maxManualInfluencePercent: number;
  maxOverrideAgeDays: number;
  lowImpactSuppressionEnabled: boolean;
  duplicateClusterWindowHours: number;
  minorSeverityWeight: number;
  majorSeverityWeight: number;
  criticalSeverityWeight: number;
  defaultBucket: IHealthPulseAdminConfig['portfolioTriageDefaults']['defaultBucket'];
  defaultSort: IHealthPulseAdminConfig['portfolioTriageDefaults']['defaultSort'];
}

export const toAdminFormState = (
  config: IHealthPulseAdminConfig
): HealthPulseAdminFormState => ({
  weightsPercent: {
    field: Math.round(config.weights.field * 100),
    time: Math.round(config.weights.time * 100),
    cost: Math.round(config.weights.cost * 100),
    office: Math.round(config.weights.office * 100),
  },
  stalenessThresholdDays: config.stalenessThresholdDays,
  metricStalenessOverridesInput: Object.entries(config.metricStalenessOverrides)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n'),
  approvalRequiredMetricKeysInput:
    config.manualEntryGovernance.approvalRequiredMetricKeys.join(', '),
  maxManualInfluencePercent: config.manualEntryGovernance.maxManualInfluencePercent,
  maxOverrideAgeDays: config.manualEntryGovernance.maxOverrideAgeDays,
  lowImpactSuppressionEnabled:
    config.officeHealthSuppression.lowImpactSuppressionEnabled,
  duplicateClusterWindowHours:
    config.officeHealthSuppression.duplicateClusterWindowHours,
  minorSeverityWeight: config.officeHealthSuppression.severityWeights.minor,
  majorSeverityWeight: config.officeHealthSuppression.severityWeights.major,
  criticalSeverityWeight:
    config.officeHealthSuppression.severityWeights.critical,
  defaultBucket: config.portfolioTriageDefaults.defaultBucket,
  defaultSort: config.portfolioTriageDefaults.defaultSort,
});

const parseMetricOverrideLines = (raw: string): Record<string, number> =>
  raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, number>>((acc, line) => {
      const [keyRaw, valueRaw] = line.split('=');
      const key = keyRaw?.trim();
      const value = Number(valueRaw?.trim());
      if (key && Number.isFinite(value) && value >= 0) {
        acc[key] = value;
      }
      return acc;
    }, {});

const parseMetricKeys = (raw: string): string[] =>
  raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

export const toAdminConfigFromFormState = (
  formState: HealthPulseAdminFormState
): IHealthPulseAdminConfig => ({
  weights: {
    field: formState.weightsPercent.field / 100,
    time: formState.weightsPercent.time / 100,
    cost: formState.weightsPercent.cost / 100,
    office: formState.weightsPercent.office / 100,
  },
  stalenessThresholdDays: formState.stalenessThresholdDays,
  metricStalenessOverrides: parseMetricOverrideLines(
    formState.metricStalenessOverridesInput
  ),
  manualEntryGovernance: {
    approvalRequiredMetricKeys: parseMetricKeys(
      formState.approvalRequiredMetricKeysInput
    ),
    maxManualInfluencePercent: formState.maxManualInfluencePercent,
    maxOverrideAgeDays: formState.maxOverrideAgeDays,
  },
  officeHealthSuppression: {
    lowImpactSuppressionEnabled: formState.lowImpactSuppressionEnabled,
    duplicateClusterWindowHours: formState.duplicateClusterWindowHours,
    severityWeights: {
      minor: formState.minorSeverityWeight,
      major: formState.majorSeverityWeight,
      critical: formState.criticalSeverityWeight,
    },
  },
  portfolioTriageDefaults: {
    defaultBucket: formState.defaultBucket,
    defaultSort: formState.defaultSort,
  },
});
