import { describe, expect, it } from 'vitest';
import { StrategicIntelligenceApi } from './StrategicIntelligenceApi.js';
import type {
  IStrategicIntelligenceGovernanceEvent,
  IStrategicIntelligenceMutation,
} from '../types/index.js';

describe('strategic intelligence api', () => {
  it('exposes retrieval and queue/governance methods with deterministic contracts', () => {
    const api = new StrategicIntelligenceApi();

    expect(api.getHeritageSnapshot('scorecard-api').scorecardId).toBe('scorecard-api');
    expect(api.getLivingEntries('scorecard-api').length).toBeGreaterThan(0);
    expect(api.getApprovalQueue('scorecard-api')).toEqual([]);

    const mutation: IStrategicIntelligenceMutation = {
      mutationId: 'mutation-api-1',
      scorecardId: 'scorecard-api',
      mutationType: 'commitment-update',
      payload: {
        commitment: {
          commitmentId: 'commit-api-1',
          description: 'API mutation commitment',
          source: 'workflow',
          responsibleRole: 'bd-lead',
          fulfillmentStatus: 'open',
        },
      },
      queuedAt: '2026-03-12T10:00:00.000Z',
      replaySafe: true,
      localStatus: 'queued-to-sync',
      provenance: {
        recordedAt: '2026-03-12T10:00:00.000Z',
        actorUserId: 'bd-1',
        actorRole: 'bd-lead',
        source: 'offline-queue',
        provenanceClass: 'meeting-summary',
      },
    };

    const queueResult = api.queueLocalMutation(mutation);
    expect(queueResult.queueKey).toBe('strategic-intelligence-sync-queue');
    expect(queueResult.queuedCount).toBe(1);

    const event: IStrategicIntelligenceGovernanceEvent = {
      eventId: 'event-api-1',
      scorecardId: 'scorecard-api',
      eventType: 'commitment-updated',
      note: 'Commitment update persisted',
      immutable: true,
      createdAt: '2026-03-12T10:05:00.000Z',
      createdBy: 'bd-1',
      relatedEntryIds: [],
      version: api.getState('scorecard-api').version,
    };

    expect(api.appendGovernanceEvent(event).totalEvents).toBe(1);
  });
});
