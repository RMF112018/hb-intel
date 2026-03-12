import { describe, expect, it } from 'vitest';

import {
  HEALTH_PULSE_ADMIN_CONFIG_LIST_TITLE,
  HEALTH_PULSE_CONFIDENCE_TIERS,
  HEALTH_PULSE_TRIAGE_BUCKETS,
  HEALTH_STALENESS_THRESHOLD_DAYS_DEFAULT,
  type IUseHealthPulseAdminConfigResult,
  type IUseProjectHealthPulseResult,
} from '../../index.js';

describe('SF21-T02 contracts', () => {
  it('locks public constants to the documented values', () => {
    expect(HEALTH_STALENESS_THRESHOLD_DAYS_DEFAULT).toBe(14);
    expect(HEALTH_PULSE_ADMIN_CONFIG_LIST_TITLE).toBe('HBC_HealthPulseAdminConfig');
    expect(HEALTH_PULSE_TRIAGE_BUCKETS).toEqual([
      'attention-now',
      'trending-down',
      'data-quality-risk',
      'recovering',
    ]);
    expect(HEALTH_PULSE_CONFIDENCE_TIERS).toEqual(['high', 'moderate', 'low', 'unreliable']);
  });

  it('exports hook return contracts through the runtime barrel', () => {
    const pulseResult: IUseProjectHealthPulseResult = {
      pulse: null,
      telemetry: null,
      isLoading: false,
      error: null,
      refresh: async () => {},
      derivation: {
        confidenceReasonCodes: [],
        governanceReasonCodes: [],
        hasManualInfluence: false,
        evaluatedAt: null,
      },
    };

    const adminResult: IUseHealthPulseAdminConfigResult = {
      config: null,
      draft: null,
      isLoading: false,
      isSaving: false,
      isValid: true,
      error: null,
      validationIssues: [],
      save: async () => {},
      reset: () => {},
      refresh: async () => {},
    };

    expect(pulseResult.isLoading).toBe(false);
    expect(adminResult.isValid).toBe(true);
  });
});
