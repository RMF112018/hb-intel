import { describe, expect, it, vi } from 'vitest';

vi.mock('@hbc/strategic-intelligence', async () => {
  const actual = await vi.importActual<typeof import('@hbc/strategic-intelligence')>(
    '@hbc/strategic-intelligence'
  );

  return {
    ...actual,
    useStrategicIntelligenceState: () => ({
      cacheKey: ['strategic-intelligence', 'project-null', 'bd-panel'] as const,
      status: 'error' as const,
      isLoading: false,
      isError: true,
      errorMessage: 'forced error',
      state: null,
      trust: {
        totalEntries: 0,
        staleEntries: 0,
        aiTrustDowngradedEntries: 0,
        reviewRequiredEntries: 0,
      },
      sensitivity: {
        byClass: {
          'public-internal': 0,
          'restricted-role': 0,
          'restricted-project': 0,
          confidential: 0,
        },
        redactedEntries: 0,
      },
      conflicts: {
        totalConflicts: 0,
        openConflicts: 0,
        resolvedConflicts: 0,
        contradictionConflicts: 0,
        supersessionConflicts: 0,
      },
      telemetry: {
        snapshot: {},
        deltas: [],
      },
      sync: {
        status: 'saved-locally' as const,
        badgeLabel: 'Saved locally' as const,
        queuedCount: 0,
        lastReplayedAt: null,
      },
      policy: {
        indexableEntryIds: [],
        excludedEntryIds: [],
        redactedProjections: [],
      },
      actions: {
        refresh: vi.fn(),
        queueLocalMutation: vi.fn(),
        replayQueuedMutations: vi.fn(),
        emitTelemetryDelta: vi.fn(),
      },
    }),
  };
});

import { useStrategicIntelligence } from './useStrategicIntelligence.js';

describe('BD strategic intelligence hook fallback state', () => {
  it('returns deterministic empty projections when primitive state is unavailable', () => {
    const projected = useStrategicIntelligence({
      projectId: 'project-null',
      visibilityContext: 'bd-panel',
      actorUserId: 'user-1',
    });

    expect(projected.view).toBeNull();
    expect(projected.integrations.versioned).toBeNull();
    expect(projected.integrations.searchIndex.indexableEntryIds).toEqual([]);
    expect(projected.integrations.searchIndex.excludedEntryIds).toEqual([]);
    expect(projected.queueSummary.pendingCount).toBe(0);
    expect(projected.handoffSummary.snapshotAligned).toBe(false);
    expect(projected.integrations.complexity.mode).toBe('Standard');
  });
});
