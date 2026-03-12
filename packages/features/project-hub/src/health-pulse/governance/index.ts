import { HEALTH_PULSE_TRIAGE_BUCKETS } from '../constants/index.js';
import type { IHealthPulseAdminConfig } from '../types/index.js';

export const HEALTH_PULSE_GOVERNANCE_SCOPE = 'health-pulse/governance';

export interface IHealthPulseConfigValidationIssue {
  path: string;
  message: string;
  severity: 'warning' | 'error';
}

export interface IHealthPulseConfigValidationResult {
  isValid: boolean;
  issues: IHealthPulseConfigValidationIssue[];
}

const TRIAGE_SORT_OPTIONS = [
  'deterioration-velocity',
  'compound-risk-severity',
  'unresolved-action-backlog',
] as const;

const isPositiveInteger = (value: number): boolean => Number.isInteger(value) && value > 0;

const isNonNegativeNumber = (value: number): boolean => Number.isFinite(value) && value >= 0;

const equalsWithinTolerance = (value: number, expected: number, tolerance = 0.000001): boolean =>
  Math.abs(value - expected) <= tolerance;

export const validateHealthPulseAdminConfig = (
  config: IHealthPulseAdminConfig
): IHealthPulseConfigValidationResult => {
  const issues: IHealthPulseConfigValidationIssue[] = [];

  const weightSum =
    config.weights.field + config.weights.time + config.weights.cost + config.weights.office;

  if (!equalsWithinTolerance(weightSum, 1)) {
    issues.push({
      path: 'weights',
      message: 'Dimension weights must sum to 1.0.',
      severity: 'error',
    });
  }

  if (!isPositiveInteger(config.stalenessThresholdDays)) {
    issues.push({
      path: 'stalenessThresholdDays',
      message: 'Staleness threshold must be a positive integer.',
      severity: 'error',
    });
  }

  for (const [metricKey, threshold] of Object.entries(config.metricStalenessOverrides)) {
    if (!isNonNegativeNumber(threshold)) {
      issues.push({
        path: `metricStalenessOverrides.${metricKey}`,
        message: 'Metric staleness overrides must be non-negative numbers.',
        severity: 'error',
      });
    }
  }

  if (
    config.manualEntryGovernance.maxManualInfluencePercent < 0 ||
    config.manualEntryGovernance.maxManualInfluencePercent > 100
  ) {
    issues.push({
      path: 'manualEntryGovernance.maxManualInfluencePercent',
      message: 'Manual influence percent must be between 0 and 100.',
      severity: 'error',
    });
  }

  if (!isPositiveInteger(config.manualEntryGovernance.maxOverrideAgeDays)) {
    issues.push({
      path: 'manualEntryGovernance.maxOverrideAgeDays',
      message: 'Max override age days must be a positive integer.',
      severity: 'error',
    });
  }

  if (!isPositiveInteger(config.officeHealthSuppression.duplicateClusterWindowHours)) {
    issues.push({
      path: 'officeHealthSuppression.duplicateClusterWindowHours',
      message: 'Duplicate cluster window hours must be a positive integer.',
      severity: 'error',
    });
  }

  for (const [severity, weight] of Object.entries(config.officeHealthSuppression.severityWeights)) {
    if (!isNonNegativeNumber(weight)) {
      issues.push({
        path: `officeHealthSuppression.severityWeights.${severity}`,
        message: 'Severity weights must be non-negative numbers.',
        severity: 'error',
      });
    }
  }

  if (!HEALTH_PULSE_TRIAGE_BUCKETS.includes(config.portfolioTriageDefaults.defaultBucket)) {
    issues.push({
      path: 'portfolioTriageDefaults.defaultBucket',
      message: `Default bucket must be one of: ${HEALTH_PULSE_TRIAGE_BUCKETS.join(', ')}.`,
      severity: 'error',
    });
  }

  if (!TRIAGE_SORT_OPTIONS.includes(config.portfolioTriageDefaults.defaultSort)) {
    issues.push({
      path: 'portfolioTriageDefaults.defaultSort',
      message: `Default sort must be one of: ${TRIAGE_SORT_OPTIONS.join(', ')}.`,
      severity: 'error',
    });
  }

  if (config.manualEntryGovernance.approvalRequiredMetricKeys.length === 0) {
    issues.push({
      path: 'manualEntryGovernance.approvalRequiredMetricKeys',
      message:
        'No approval-required metric keys configured; this may reduce governance strictness.',
      severity: 'warning',
    });
  }

  const hasError = issues.some((issue) => issue.severity === 'error');
  return {
    isValid: !hasError,
    issues,
  };
};
