import { describe, expect, it } from 'vitest';
import { StrategicIntelligenceApi } from './StrategicIntelligenceApi.js';
import { StrategicIntelligenceLifecycleApi } from './StrategicIntelligenceLifecycleApi.js';
import type { IStrategicIntelligenceMutation } from '../types/index.js';

describe('strategic intelligence sync', () => {
  it('replays queued mutations in-order and marks state as synced', () => {
    const api = new StrategicIntelligenceApi();
    const lifecycle = new StrategicIntelligenceLifecycleApi(api);

    const savedLocallyMutation: IStrategicIntelligenceMutation = {
      mutationId: 'mutation-sync-1',
      scorecardId: 'scorecard-sync',
      mutationType: 'acknowledgment-update',
      payload: {
        participantId: 'participant-default',
        acknowledgedAt: '2026-03-12T12:00:00.000Z',
      },
      queuedAt: '2026-03-12T12:00:00.000Z',
      replaySafe: true,
      localStatus: 'saved-locally',
      provenance: {
        recordedAt: '2026-03-12T12:00:00.000Z',
        actorUserId: 'pm-1',
        actorRole: 'project-manager',
        source: 'offline-queue',
        provenanceClass: 'firsthand-observation',
      },
    };

    const queuedMutation: IStrategicIntelligenceMutation = {
      mutationId: 'mutation-sync-2',
      scorecardId: 'scorecard-sync',
      mutationType: 'commitment-update',
      payload: {
        commitment: {
          commitmentId: 'commit-sync-1',
          description: 'Queued commitment',
          source: 'handoff',
          responsibleRole: 'project-executive',
          fulfillmentStatus: 'open',
        },
      },
      queuedAt: '2026-03-12T12:01:00.000Z',
      replaySafe: true,
      localStatus: 'queued-to-sync',
      provenance: {
        recordedAt: '2026-03-12T12:01:00.000Z',
        actorUserId: 'pe-1',
        actorRole: 'project-executive',
        source: 'offline-queue',
        provenanceClass: 'meeting-summary',
      },
    };

    api.queueLocalMutation(queuedMutation);
    api.queueLocalMutation(savedLocallyMutation);

    const result = lifecycle.replayQueuedMutations('scorecard-sync');
    expect(result.replayedMutationIds).toEqual(['mutation-sync-1', 'mutation-sync-2']);
    expect(result.resultingSyncStatus).toBe('synced');
    expect(api.getState('scorecard-sync').syncStatus).toBe('synced');
  });
});
