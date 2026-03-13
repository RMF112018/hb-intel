import { describe, expect, it } from 'vitest';

import {
  createMockHealthDimension,
  createMockHealthMetric,
  createMockProjectHealthPulse,
  createMockProjectHealthPulseSnapshot,
  mockProjectHealthStates,
} from '../../../testing/index.js';

describe('health pulse testing exports', () => {
  it('provides contract-valid fixture creators with deterministic defaults', () => {
    const metric = createMockHealthMetric();
    const dimension = createMockHealthDimension();
    const pulse = createMockProjectHealthPulse();

    expect(metric.key).toBe('forecast-confidence');
    expect(dimension.label).toBe('Cost');
    expect(pulse.projectId).toBe('project-health-mock');
    expect(pulse.dimensions.cost.metrics.length).toBeGreaterThan(0);
  });

  it('supports deterministic overrides and legacy snapshot alias', () => {
    const pulse = createMockProjectHealthPulse({
      projectId: 'override-project',
      overallStatus: 'critical',
      triage: {
        bucket: 'attention-now',
      },
    });

    expect(pulse.projectId).toBe('override-project');
    expect(pulse.overallStatus).toBe('critical');
    expect(pulse.triage.bucket).toBe('attention-now');

    const snapshot = createMockProjectHealthPulseSnapshot();
    expect(snapshot.projectId).toBe('project-sf21-fixture');
  });

  it('exposes canonical T08 state matrix presets', () => {
    expect(mockProjectHealthStates.onTrackHighConfidenceComplete.overallStatus).toBe('on-track');
    expect(mockProjectHealthStates.watchModerateEarlyWarning.overallStatus).toBe('watch');
    expect(mockProjectHealthStates.atRiskLowConfidenceStaleExcluded.overallStatus).toBe('at-risk');
    expect(mockProjectHealthStates.criticalCompoundRiskEscalation.overallStatus).toBe('critical');
    expect(mockProjectHealthStates.dataPendingUnreliableConfidence.overallStatus).toBe('data-pending');
    expect(mockProjectHealthStates.portfolioMixedStatusTriageSet.length).toBeGreaterThanOrEqual(5);
    expect(mockProjectHealthStates.manualInfluenceHeavyGovernanceRiskSet.overallConfidence.tier).toBe('low');
    expect(mockProjectHealthStates.officeSuppressionActiveSet.dimensions.office.confidence.reasons.join(' ')).toContain(
      'Suppression'
    );
  });
});
