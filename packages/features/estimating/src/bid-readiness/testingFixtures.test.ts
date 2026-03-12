import { describe, expect, it } from 'vitest';

import {
  createDeterministicNow,
  createMockEstimatingPursuitForReadiness,
  createMockHealthIndicatorState,
  mockBidReadinessStates,
} from '@hbc/features-estimating/testing';

describe('testingFixtures', () => {
  it('provides deterministic pursuit and health state fixture builders', () => {
    const pursuit = createMockEstimatingPursuitForReadiness({ pursuitId: 'p-fixture' });
    const state = createMockHealthIndicatorState({
      version: {
        recordId: 'p-fixture',
        version: 2,
        updatedAt: '2026-03-12T00:00:00.000Z',
        updatedBy: 'fixture@test',
      },
    });

    expect(pursuit.pursuitId).toBe('p-fixture');
    expect(state.version.version).toBe(2);
  });

  it('exposes canonical T08 bid-readiness state matrix', () => {
    expect(mockBidReadinessStates.ready.status).toBe('ready');
    expect(mockBidReadinessStates.nearlyReady.status).toBe('nearly-ready');
    expect(mockBidReadinessStates.attentionNeeded.status).toBe('attention-needed');
    expect(mockBidReadinessStates.notReady.status).toBe('not-ready');
    expect(mockBidReadinessStates.savedLocallyOptimistic.syncIndicator).toBe('saved-locally');
    expect(mockBidReadinessStates.queuedToSyncReplayPending.syncIndicator).toBe('queued-to-sync');
  });

  it('provides deterministic now helper', () => {
    const now = createDeterministicNow('2026-03-12T12:00:00.000Z');
    expect(now.nowIso).toBe('2026-03-12T12:00:00.000Z');
    expect(now.nowMs).toBe(1773316800000);
  });
});
