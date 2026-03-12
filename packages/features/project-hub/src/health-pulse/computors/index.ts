import {
  HEALTH_DIMENSION_LAGGING_WEIGHT,
  HEALTH_DIMENSION_LEADING_WEIGHT,
} from '../constants/index.js';
import type {
  IHealthDimension,
  IHealthMetric,
  IHealthPulseAdminConfig,
  IHealthExplainability,
  IPortfolioTriageProjection,
  IProjectHealthPulse,
  IProjectHealthTelemetry,
  ITopRecommendedAction,
} from '../types/index.js';
import { computeOverallPulseConfidence, computePulseConfidence } from './confidence/index.js';
import {
  applyCompoundRiskToRecommendation,
  applyCompoundRiskToTriage,
  evaluateCompoundRiskSignals,
} from './compound-risk/index.js';
import {
  applyOfficeSuppressionPolicy,
  type IOfficeSuppressionSummary,
} from './office-suppression/index.js';
import {
  selectTopRecommendedAction,
  type IRecommendationCandidate,
} from './recommendation/index.js';

export { HEALTH_PULSE_CONFIDENCE_SCOPE } from './confidence/index.js';
export {
  applyCompoundRiskToRecommendation,
  applyCompoundRiskToTriage,
  evaluateCompoundRiskSignals,
  HEALTH_PULSE_COMPOUND_RISK_SCOPE,
} from './compound-risk/index.js';
export {
  applyOfficeSuppressionPolicy,
  HEALTH_PULSE_OFFICE_SUPPRESSION_SCOPE,
} from './office-suppression/index.js';
export {
  rankRecommendationCandidates,
  selectTopRecommendedAction,
  HEALTH_PULSE_RECOMMENDATION_SCOPE,
} from './recommendation/index.js';

export type HealthDimensionKey = 'cost' | 'time' | 'field' | 'office';

export interface IComputeProjectHealthPulseInput {
  projectId: string;
  adminConfig: IHealthPulseAdminConfig;
  metricsByDimension: Record<HealthDimensionKey, IHealthMetric[]>;
  recommendationCandidates?: IRecommendationCandidate[];
  explainability?: Partial<IHealthExplainability>;
  integrationCompleteness?: Partial<Record<HealthDimensionKey, number>>;
  trendHistorySufficient?: Partial<Record<HealthDimensionKey, boolean>>;
  computedAt?: string;
}

const REQUIRED_DIMENSION_SIGNAL_KEYS: Record<HealthDimensionKey, string[]> = {
  time: ['look-ahead-reliability', 'near-critical-path-volatility', 'schedule-update-quality'],
  cost: ['forecast-confidence', 'forecast-update-age', 'pending-change-order-aging'],
  field: ['production-throughput-reliability', 'rework-trend', 'plan-complete-reliability'],
  office: ['clustering', 'severity-weighted-overdue-signals', 'low-impact-suppression'],
};

const toKeyedDimensionLabel = (key: HealthDimensionKey): IHealthDimension['label'] => {
  if (key === 'cost') return 'Cost';
  if (key === 'time') return 'Time';
  if (key === 'field') return 'Field';
  return 'Office';
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const metricIsStale = (
  metric: IHealthMetric,
  config: IHealthPulseAdminConfig,
  computedAtIso: string
): boolean => {
  if (metric.isStale) {
    return true;
  }

  if (!metric.lastUpdatedAt) {
    return false;
  }

  const thresholdDays = config.metricStalenessOverrides[metric.key] ?? config.stalenessThresholdDays;
  const maxAgeMs = thresholdDays * 24 * 60 * 60 * 1000;
  const ageMs = Date.parse(computedAtIso) - Date.parse(metric.lastUpdatedAt);

  return Number.isFinite(ageMs) && ageMs > maxAgeMs;
};

const classifyStatus = (score: number): IHealthDimension['status'] => {
  if (score >= 85) return 'on-track';
  if (score >= 65) return 'watch';
  if (score >= 40) return 'at-risk';
  if (score >= 0) return 'critical';
  return 'data-pending';
};

const normalize = (metrics: IHealthMetric[]): Array<IHealthMetric & { normalizedWeight: number }> => {
  if (metrics.length === 0) {
    return [];
  }

  const equalWeight = 1 / metrics.length;
  return metrics.map((metric) => ({ ...metric, normalizedWeight: equalWeight }));
};

const scoreMetricGroup = (metrics: IHealthMetric[]): number => {
  const normalized = normalize(metrics);
  if (normalized.length === 0) {
    return 0;
  }

  return normalized.reduce((sum, metric) => {
    const numericValue = metric.value ?? 0;
    return sum + numericValue * metric.normalizedWeight;
  }, 0);
};

const dedupeReasons = (reasons: string[]): string[] => Array.from(new Set(reasons));

const computeDimension = (
  key: HealthDimensionKey,
  inputMetrics: IHealthMetric[],
  config: IHealthPulseAdminConfig,
  computedAtIso: string,
  integrationCompleteness: number,
  trendHistorySufficient: boolean
): { dimension: IHealthDimension; confidenceReasons: string[]; suppressionSummary?: IOfficeSuppressionSummary } => {
  let sourceMetrics = inputMetrics;
  let suppressionSummary: IOfficeSuppressionSummary | undefined;

  if (key === 'office') {
    const suppressed = applyOfficeSuppressionPolicy(sourceMetrics, config.officeHealthSuppression);
    sourceMetrics = suppressed.retainedMetrics;
    suppressionSummary = suppressed.summary;
  }

  const activeMetrics = sourceMetrics.filter(
    (metric) => metric.value !== null && !metricIsStale(metric, config, computedAtIso)
  );

  const excludedMetrics = sourceMetrics.filter((metric) => !activeMetrics.includes(metric));
  const leadingMetrics = activeMetrics.filter((metric) => metric.weight === 'leading');
  const laggingMetrics = activeMetrics.filter((metric) => metric.weight === 'lagging');

  const leadingScore = Math.round(scoreMetricGroup(leadingMetrics));
  const laggingScore = Math.round(scoreMetricGroup(laggingMetrics));
  const weightedScore = Math.round(
    leadingScore * HEALTH_DIMENSION_LEADING_WEIGHT + laggingScore * HEALTH_DIMENSION_LAGGING_WEIGHT
  );

  const requiredKeys = REQUIRED_DIMENSION_SIGNAL_KEYS[key];
  const availableMetricKeys = new Set(sourceMetrics.map((metric) => metric.key));
  const missingRequiredKeys = requiredKeys.filter((requiredKey) => !availableMetricKeys.has(requiredKey));

  const confidenceReasons: string[] = [];
  if (missingRequiredKeys.length > 0) {
    confidenceReasons.push(
      `Missing required ${key} signals: ${missingRequiredKeys.join(', ')}.`
    );
  }

  if (suppressionSummary && suppressionSummary.suppressedCount > 0) {
    confidenceReasons.push(
      `Office suppression removed ${suppressionSummary.suppressedCount} low-impact/duplicate signals.`
    );
  }

  const manualInfluenceRatio =
    activeMetrics.length === 0
      ? 0
      : activeMetrics.filter((metric) => metric.isManualEntry).length / activeMetrics.length;

  const confidence = computePulseConfidence({
    excludedMetricRatio: sourceMetrics.length === 0 ? 1 : excludedMetrics.length / sourceMetrics.length,
    staleMetricRatio:
      sourceMetrics.length === 0
        ? 0
        : sourceMetrics.filter((metric) => metricIsStale(metric, config, computedAtIso)).length /
          sourceMetrics.length,
    manualInfluenceRatio,
    trendHistorySufficient,
    integrationCompleteness,
    additionalReasons: confidenceReasons,
  });

  const hasNoValidMetrics = activeMetrics.length === 0;
  const status = hasNoValidMetrics || confidence.tier === 'unreliable' ? 'data-pending' : classifyStatus(weightedScore);

  const trend =
    leadingScore > laggingScore
      ? 'improving'
      : leadingScore < laggingScore
        ? 'declining'
        : 'stable';

  const dimension: IHealthDimension = {
    score: hasNoValidMetrics ? 0 : clamp(weightedScore, 0, 100),
    status,
    label: toKeyedDimensionLabel(key),
    leadingScore,
    laggingScore,
    metrics: sourceMetrics,
    keyMetric: activeMetrics[0]?.key ?? `${key}-data-pending`,
    trend,
    hasExcludedMetrics: excludedMetrics.length > 0,
    confidence,
  };

  return {
    dimension,
    confidenceReasons: dedupeReasons(confidenceReasons),
    suppressionSummary,
  };
};

const defaultTriageBucket = (score: number): IPortfolioTriageProjection['bucket'] => {
  if (score < 40) return 'attention-now';
  if (score < 65) return 'trending-down';
  if (score < 80) return 'data-quality-risk';
  return 'recovering';
};

export const computeProjectHealthPulse = (
  input: IComputeProjectHealthPulseInput
): { pulse: IProjectHealthPulse; telemetry: IProjectHealthTelemetry } => {
  const computedAt = input.computedAt ?? new Date().toISOString();

  const cost = computeDimension(
    'cost',
    input.metricsByDimension.cost,
    input.adminConfig,
    computedAt,
    input.integrationCompleteness?.cost ?? 1,
    input.trendHistorySufficient?.cost ?? true
  );
  const time = computeDimension(
    'time',
    input.metricsByDimension.time,
    input.adminConfig,
    computedAt,
    input.integrationCompleteness?.time ?? 1,
    input.trendHistorySufficient?.time ?? true
  );
  const field = computeDimension(
    'field',
    input.metricsByDimension.field,
    input.adminConfig,
    computedAt,
    input.integrationCompleteness?.field ?? 1,
    input.trendHistorySufficient?.field ?? true
  );
  const office = computeDimension(
    'office',
    input.metricsByDimension.office,
    input.adminConfig,
    computedAt,
    input.integrationCompleteness?.office ?? 1,
    input.trendHistorySufficient?.office ?? true
  );

  const weightedOverall =
    cost.dimension.score * input.adminConfig.weights.cost +
    time.dimension.score * input.adminConfig.weights.time +
    field.dimension.score * input.adminConfig.weights.field +
    office.dimension.score * input.adminConfig.weights.office;

  const overallConfidence = computeOverallPulseConfidence([
    cost.dimension.confidence,
    time.dimension.confidence,
    field.dimension.confidence,
    office.dimension.confidence,
  ]);

  const baseTriage: IPortfolioTriageProjection = {
    bucket: input.adminConfig.portfolioTriageDefaults.defaultBucket || defaultTriageBucket(weightedOverall),
    sortScore: Math.round(weightedOverall),
    triageReasons: [],
  };

  const compoundRisk = evaluateCompoundRiskSignals({
    cost: cost.dimension,
    time: time.dimension,
    field: field.dimension,
    office: office.dimension,
  });

  const topRecommendation = selectTopRecommendedAction(input.recommendationCandidates ?? []);
  const recommendation = applyCompoundRiskToRecommendation(topRecommendation, compoundRisk);
  const triage = applyCompoundRiskToTriage(baseTriage, compoundRisk);

  const explainability: IHealthExplainability = {
    whyThisStatus: [
      ...cost.confidenceReasons,
      ...time.confidenceReasons,
      ...field.confidenceReasons,
      ...office.confidenceReasons,
    ],
    whatChanged: [],
    topContributors: [cost.dimension.keyMetric, time.dimension.keyMetric, field.dimension.keyMetric, office.dimension.keyMetric],
    whatMattersMost:
      recommendation?.actionText ??
      'No recommendation candidate exceeded ranking thresholds.',
    ...input.explainability,
  };

  const overallStatus =
    overallConfidence.tier === 'unreliable'
      ? 'data-pending'
      : classifyStatus(Math.round(weightedOverall));

  const pulse: IProjectHealthPulse = {
    projectId: input.projectId,
    computedAt,
    overallScore: Math.round(clamp(weightedOverall, 0, 100)),
    overallStatus,
    overallConfidence,
    dimensions: {
      cost: cost.dimension,
      time: time.dimension,
      field: field.dimension,
      office: office.dimension,
    },
    compoundRisks: compoundRisk.signals,
    topRecommendedAction: recommendation,
    explainability,
    triage,
  };

  const telemetry: IProjectHealthTelemetry = {
    interventionLeadTime: null,
    falseAlarmRate: null,
    preLagDetectionRate: null,
    actionAdoptionRate: recommendation ? 1 : 0,
    portfolioReviewCycleTime: null,
    suppressionImpactRate:
      office.suppressionSummary && office.suppressionSummary.originalCount > 0
        ? office.suppressionSummary.suppressedCount / office.suppressionSummary.originalCount
        : null,
  };

  return { pulse, telemetry };
};

export const HEALTH_PULSE_COMPUTORS_SCOPE = 'health-pulse/computors';
