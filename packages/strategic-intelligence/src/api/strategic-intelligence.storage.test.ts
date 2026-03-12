import { describe, expect, it } from 'vitest';
import { StrategicIntelligenceApi } from './StrategicIntelligenceApi.js';
import { StrategicIntelligenceLifecycleApi } from './StrategicIntelligenceLifecycleApi.js';

describe('strategic intelligence storage', () => {
  it('keeps heritage snapshot immutable after freeze and persists commitments', () => {
    const api = new StrategicIntelligenceApi();
    const lifecycle = new StrategicIntelligenceLifecycleApi(api);

    const baseline = api.getHeritageSnapshot('scorecard-storage');
    const freezeResult = lifecycle.freezeHeritageSnapshot('scorecard-storage', 'pm-1');

    expect(freezeResult.snapshot.immutable).toBe(true);
    expect(api.getHeritageSnapshot('scorecard-storage').snapshotId).toBe(baseline.snapshotId);

    api.persistCommitmentUpdate('scorecard-storage', {
      commitmentId: 'commit-1',
      description: 'Track unresolved commitment',
      source: 'handoff',
      responsibleRole: 'project-manager',
      fulfillmentStatus: 'in-progress',
      bicRecordId: 'bic-123',
      reviewedAt: '2026-03-12T10:00:00.000Z',
    });

    const commitments = api.getCommitmentRegister('scorecard-storage');
    expect(commitments.find((item) => item.commitmentId === 'commit-1')?.bicRecordId).toBe('bic-123');
  });
});
