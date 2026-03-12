import { describe, expect, it } from 'vitest';
import {
  buildHealthIndicatorSummary,
  resolveHealthIndicatorProfileConfig,
} from '@hbc/health-indicator';

import { TELEMETRY_KEYS } from '../../constants/index.js';
import { evaluateReadinessSummary, resolveBidReadinessProfileConfig } from './index.js';
import { estimatingBidReadinessProfile } from './estimatingBidReadinessProfile.js';

describe('primitiveCompatibility', () => {
  it('aligns wrapper config resolution with primitive config runtime', () => {
    const override = {
      criteria: [{ criterionId: 'ce-sign-off', weight: 10 }],
      thresholds: {
        readyMinScore: 92,
        nearlyReadyMinScore: 75,
        attentionNeededMinScore: 55,
      },
    };

    const adapterResolved = resolveBidReadinessProfileConfig(override);
    const primitiveResolved = resolveHealthIndicatorProfileConfig({
      baseline: estimatingBidReadinessProfile,
      override,
      telemetryKeys: TELEMETRY_KEYS,
      defaultVersion: adapterResolved.version,
      defaultGovernance: {
        governanceState: adapterResolved.governance.governanceState,
        recordedAt: adapterResolved.governance.recordedAt,
        recordedBy: adapterResolved.governance.recordedBy,
        traceId: adapterResolved.governance.traceId,
        immutableSnapshotId: adapterResolved.governance.immutableSnapshotId,
      },
    });

    expect(adapterResolved.profile.criteria.length).toBe(primitiveResolved.profile.criteria.length);
    expect(adapterResolved.profile.thresholds).toEqual(primitiveResolved.profile.thresholds);
  });

  it('aligns wrapper summary composition with primitive summary runtime', () => {
    const criteria = estimatingBidReadinessProfile.criteria.map((criterion, index) => ({
      ...criterion,
      isComplete: index % 2 === 0,
    }));
    const adapter = evaluateReadinessSummary(criteria);
    const primitive = buildHealthIndicatorSummary(criteria, {
      profile: adapter.config.profile,
      governance: adapter.config.governance,
    });

    expect(adapter.summary.score.value).toBe(primitive.score.value);
    expect(adapter.summary.score.status).toBe(primitive.score.status);
    expect(adapter.summary.score.band).toBe(primitive.score.band);
    expect(adapter.summary.recommendations.length).toBe(primitive.recommendations.length);
  });
});
