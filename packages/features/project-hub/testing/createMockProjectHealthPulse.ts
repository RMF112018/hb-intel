import type {
  IHealthPulseAdminConfig,
  IProjectHealthPulse,
  IProjectHealthTelemetry,
} from '../src/health-pulse/types/index.js';
import { createMockHealthDimension } from './createMockHealthDimension.js';
import type { DeepPartial } from './createMockHealthMetric.js';

export const createMockHealthPulseAdminConfig = (
  overrides?: DeepPartial<IHealthPulseAdminConfig>
): IHealthPulseAdminConfig => {
  const base: IHealthPulseAdminConfig = {
    weights: {
      field: 0.3,
      time: 0.3,
      cost: 0.2,
      office: 0.2,
    },
    stalenessThresholdDays: 14,
    metricStalenessOverrides: {},
    manualEntryGovernance: {
      approvalRequiredMetricKeys: ['pending-change-order-aging'],
      maxManualInfluencePercent: 35,
      maxOverrideAgeDays: 21,
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
  };

  const mergedOverridesEntries = Object.entries(overrides?.metricStalenessOverrides ?? {}).filter(
    (entry): entry is [string, number] => typeof entry[1] === 'number'
  );

  return {
    ...base,
    ...overrides,
    weights: {
      ...base.weights,
      ...overrides?.weights,
    },
    metricStalenessOverrides: {
      ...base.metricStalenessOverrides,
      ...Object.fromEntries(mergedOverridesEntries),
    },
    manualEntryGovernance: {
      ...base.manualEntryGovernance,
      ...overrides?.manualEntryGovernance,
      approvalRequiredMetricKeys:
        overrides?.manualEntryGovernance?.approvalRequiredMetricKeys ??
        base.manualEntryGovernance.approvalRequiredMetricKeys,
    },
    officeHealthSuppression: {
      ...base.officeHealthSuppression,
      ...overrides?.officeHealthSuppression,
      severityWeights: {
        ...base.officeHealthSuppression.severityWeights,
        ...overrides?.officeHealthSuppression?.severityWeights,
      },
    },
    portfolioTriageDefaults: {
      ...base.portfolioTriageDefaults,
      ...overrides?.portfolioTriageDefaults,
    },
  };
};

export const createMockProjectHealthTelemetry = (
  overrides?: DeepPartial<IProjectHealthTelemetry>
): IProjectHealthTelemetry => {
  const base: IProjectHealthTelemetry = {
    interventionLeadTime: 4,
    falseAlarmRate: 0.08,
    preLagDetectionRate: 0.61,
    actionAdoptionRate: 0.72,
    portfolioReviewCycleTime: 7,
    suppressionImpactRate: 0.32,
  };

  return {
    ...base,
    ...overrides,
  };
};

export const createMockProjectHealthPulse = (
  overrides?: DeepPartial<IProjectHealthPulse>
): IProjectHealthPulse => {
  const base: IProjectHealthPulse = {
    projectId: 'project-health-mock',
    computedAt: '2026-03-12T00:00:00.000Z',
    overallScore: 78,
    overallStatus: 'watch',
    overallConfidence: {
      tier: 'moderate',
      score: 74,
      reasons: ['Minor exclusion impact'],
    },
    dimensions: {
      cost: createMockHealthDimension({
        label: 'Cost',
        score: 76,
        status: 'watch',
      }),
      time: createMockHealthDimension({
        label: 'Time',
        score: 79,
        status: 'watch',
      }),
      field: createMockHealthDimension({
        label: 'Field',
        score: 82,
        status: 'watch',
      }),
      office: createMockHealthDimension({
        label: 'Office',
        score: 72,
        status: 'watch',
      }),
    },
    compoundRisks: [],
    topRecommendedAction: {
      actionText: 'Review schedule variance with field leads.',
      actionLink: '/projects/project-health-mock/health',
      reasonCode: 'SCHEDULE_VARIANCE_EARLY_WARNING',
      owner: 'Project Manager',
      urgency: 65,
      impact: 63,
      confidenceWeight: 0.74,
    },
    explainability: {
      whyThisStatus: ['Time and cost are showing mild variance.'],
      whatChanged: ['Office backlog improved but remains elevated.'],
      topContributors: ['forecast-confidence', 'look-ahead-reliability'],
      whatMattersMost: 'Stabilize schedule inputs and reduce office backlog.',
    },
    triage: {
      bucket: 'trending-down',
      sortScore: 69,
      triageReasons: ['Moderate risk trend on time/office'],
    },
  };

  const mergedCompoundRisks = overrides?.compoundRisks
    ? overrides.compoundRisks.map((risk) => ({
        code: risk.code ?? 'custom',
        severity: risk.severity ?? 'low',
        affectedDimensions: (risk.affectedDimensions ?? ['office']) as Array<'cost' | 'time' | 'field' | 'office'>,
        summary: risk.summary ?? 'Projected compound risk signal.',
      }))
    : base.compoundRisks;

  return {
    ...base,
    ...overrides,
    overallConfidence: {
      ...base.overallConfidence,
      ...overrides?.overallConfidence,
      reasons: overrides?.overallConfidence?.reasons ?? base.overallConfidence.reasons,
    },
    dimensions: {
      cost: createMockHealthDimension({
        ...base.dimensions.cost,
        ...overrides?.dimensions?.cost,
      }),
      time: createMockHealthDimension({
        ...base.dimensions.time,
        ...overrides?.dimensions?.time,
      }),
      field: createMockHealthDimension({
        ...base.dimensions.field,
        ...overrides?.dimensions?.field,
      }),
      office: createMockHealthDimension({
        ...base.dimensions.office,
        ...overrides?.dimensions?.office,
      }),
    },
    compoundRisks: mergedCompoundRisks,
    topRecommendedAction:
      overrides?.topRecommendedAction === undefined
        ? base.topRecommendedAction
        : overrides.topRecommendedAction === null
          ? null
          : {
              ...base.topRecommendedAction,
              ...overrides.topRecommendedAction,
            },
    explainability: {
      ...base.explainability,
      ...overrides?.explainability,
      whyThisStatus:
        overrides?.explainability?.whyThisStatus ?? base.explainability.whyThisStatus,
      whatChanged:
        overrides?.explainability?.whatChanged ?? base.explainability.whatChanged,
      topContributors:
        overrides?.explainability?.topContributors ?? base.explainability.topContributors,
    },
    triage: {
      ...base.triage,
      ...overrides?.triage,
      triageReasons: overrides?.triage?.triageReasons ?? base.triage.triageReasons,
    },
  };
};
