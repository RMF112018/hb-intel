import type {
  IHealthDimension,
  IHealthPulseAdminConfig,
  IProjectHealthPulse,
  IProjectHealthTelemetry,
} from '../src/health-pulse/types/index.js';

const createDimension = (label: IHealthDimension['label'], score: number): IHealthDimension => ({
  score,
  status: score >= 85 ? 'on-track' : 'watch',
  label,
  leadingScore: score,
  laggingScore: score,
  metrics: [],
  keyMetric: `${label.toLowerCase()}-placeholder`,
  trend: 'stable',
  hasExcludedMetrics: false,
  confidence: {
    tier: 'moderate',
    score,
    reasons: ['sf21-t02-fixture'],
  },
});

/**
 * Stable SF21 testing fixture surface for T08/T09 integration work.
 */
export const createMockProjectHealthPulseSnapshot = (): IProjectHealthPulse => ({
  projectId: 'project-sf21-fixture',
  computedAt: '2026-03-12T00:00:00.000Z',
  overallScore: 72,
  overallStatus: 'watch',
  overallConfidence: {
    tier: 'moderate',
    score: 72,
    reasons: ['scaffold-fixture'],
  },
  dimensions: {
    cost: createDimension('Cost', 68),
    time: createDimension('Time', 80),
    field: createDimension('Field', 70),
    office: createDimension('Office', 69),
  },
  compoundRisks: [],
  topRecommendedAction: null,
  explainability: {
    whyThisStatus: ['SF21-T02 deterministic fixture'],
    whatChanged: [],
    topContributors: [],
    whatMattersMost: 'No-op fixture for contract tests',
  },
  triage: {
    bucket: 'trending-down',
    sortScore: 72,
    triageReasons: ['scaffold-fixture'],
  },
});

export const createMockHealthPulseAdminConfig = (): IHealthPulseAdminConfig => ({
  weights: {
    field: 40,
    time: 30,
    cost: 15,
    office: 15,
  },
  stalenessThresholdDays: 14,
  metricStalenessOverrides: {},
  manualEntryGovernance: {
    approvalRequiredMetricKeys: [],
    maxManualInfluencePercent: 30,
    maxOverrideAgeDays: 14,
  },
  officeHealthSuppression: {
    lowImpactSuppressionEnabled: true,
    duplicateClusterWindowHours: 24,
    severityWeights: {
      minor: 1,
      major: 2,
      critical: 3,
    },
  },
  portfolioTriageDefaults: {
    defaultBucket: 'attention-now',
    defaultSort: 'deterioration-velocity',
  },
});

export const createMockProjectHealthTelemetry = (): IProjectHealthTelemetry => ({
  interventionLeadTime: null,
  falseAlarmRate: null,
  preLagDetectionRate: null,
  actionAdoptionRate: null,
  portfolioReviewCycleTime: null,
  suppressionImpactRate: null,
});
