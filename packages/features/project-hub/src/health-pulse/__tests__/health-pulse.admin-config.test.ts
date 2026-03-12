import { describe, expect, it } from 'vitest';

import { validateHealthPulseAdminConfig } from '../governance/index.js';
import { useHealthPulseAdminConfig } from '../hooks/index.js';

const validConfig = {
  weights: { field: 0.4, time: 0.3, cost: 0.15, office: 0.15 },
  stalenessThresholdDays: 14,
  metricStalenessOverrides: { sample: 7 },
  manualEntryGovernance: {
    approvalRequiredMetricKeys: ['sample'],
    maxManualInfluencePercent: 40,
    maxOverrideAgeDays: 20,
  },
  officeHealthSuppression: {
    lowImpactSuppressionEnabled: true,
    duplicateClusterWindowHours: 24,
    severityWeights: { minor: 1, major: 2, critical: 3 },
  },
  portfolioTriageDefaults: {
    defaultBucket: 'attention-now' as const,
    defaultSort: 'deterioration-velocity' as const,
  },
};

describe('health pulse admin-config', () => {
  it('accepts valid config', () => {
    const result = validateHealthPulseAdminConfig(validConfig);
    expect(result.isValid).toBe(true);
  });

  it('rejects invalid weight sums, thresholds, overrides, governance, suppression, and triage defaults', () => {
    const invalid = {
      ...validConfig,
      weights: { field: 0.4, time: 0.4, cost: 0.4, office: 0.4 },
      stalenessThresholdDays: 0,
      metricStalenessOverrides: { sample: -1 },
      manualEntryGovernance: {
        ...validConfig.manualEntryGovernance,
        maxManualInfluencePercent: 101,
        maxOverrideAgeDays: 0,
        approvalRequiredMetricKeys: [],
      },
      officeHealthSuppression: {
        ...validConfig.officeHealthSuppression,
        duplicateClusterWindowHours: 0,
        severityWeights: { minor: 1, major: -2, critical: 3 },
      },
      portfolioTriageDefaults: {
        defaultBucket: 'unsupported',
        defaultSort: 'unsupported',
      },
    } as unknown as typeof validConfig;

    const result = validateHealthPulseAdminConfig(invalid);
    expect(result.isValid).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it('exposes deterministic hook composition helpers', () => {
    expect(typeof useHealthPulseAdminConfig).toBe('function');
  });
});
