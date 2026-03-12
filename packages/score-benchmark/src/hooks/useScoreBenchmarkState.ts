import { BENCHMARK_STALE_MS } from '../constants/index.js';
import { ScoreBenchmarkApi } from '../api/ScoreBenchmarkApi.js';
import { ScoreBenchmarkLifecycleApi } from '../api/ScoreBenchmarkLifecycleApi.js';
import type {
  IBenchmarkFilterContext,
  IScoreBenchmarkStateInput,
  IScoreBenchmarkStateResult,
  IScoreBenchmarkMutation,
  ScoreBenchmarkSyncBadge,
} from '../types/index.js';
import {
  clearQueuedMutations,
  enqueueMutation,
  getFilterState,
  getLastReplayAt,
  getQueuedMutations,
  setLastReplayAt,
} from './stateStore.js';
import { createScoreBenchmarkStateQueryKey } from './queryKeys.js';

const defaultApi = new ScoreBenchmarkApi();
const defaultLifecycleApi = new ScoreBenchmarkLifecycleApi();

const toSyncBadge = (syncStatus: IScoreBenchmarkStateResult['sync']['status']): ScoreBenchmarkSyncBadge => {
  if (syncStatus === 'saved-locally') return 'Saved locally';
  if (syncStatus === 'queued-to-sync') return 'Queued to sync';
  return 'Synced';
};

const normalizeDistance = (distanceToWinZone: number | null, winZoneMin: number | null): number | null => {
  if (distanceToWinZone === null || winZoneMin === null || winZoneMin <= 0) {
    return null;
  }

  return Number((distanceToWinZone / winZoneMin).toFixed(4));
};

const createQueueMutation = (
  entityId: string,
  mutationType: IScoreBenchmarkMutation['mutationType'],
  payload: Record<string, unknown>
): IScoreBenchmarkMutation => ({
  mutationId: `${entityId}-${mutationType}-${Date.now()}`,
  mutationType,
  entityId,
  payload,
  queuedAt: new Date().toISOString(),
  replaySafe: true,
});

export const useScoreBenchmarkState = (
  input: IScoreBenchmarkStateInput,
  deps?: {
    api?: ScoreBenchmarkApi;
    lifecycleApi?: ScoreBenchmarkLifecycleApi;
    now?: () => Date;
  }
): IScoreBenchmarkStateResult => {
  const api = deps?.api ?? defaultApi;
  const lifecycleApi = deps?.lifecycleApi ?? defaultLifecycleApi;
  const now = deps?.now ?? (() => new Date());
  const resolvedFilterContext: IBenchmarkFilterContext =
    getFilterState(input.entityId)?.context ?? input.filterContext;

  const cacheKey = createScoreBenchmarkStateQueryKey(
    input.entityId,
    resolvedFilterContext,
    input.reviewerContext
  );

  const queuedMutations = getQueuedMutations(input.entityId);
  const lastReplayAt = getLastReplayAt(input.entityId);

  try {
    const overlayResponse = api.getOverlayState(input.entityId, resolvedFilterContext);
    const state = overlayResponse.state;
    const generationIso =
      new Date(state.version.createdAt).getTime() < new Date(state.benchmarkGeneratedAt).getTime()
        ? state.version.createdAt
        : state.benchmarkGeneratedAt;
    const staleMs = now().getTime() - new Date(generationIso).getTime();
    const warningEvent = [...state.filterGovernanceEvents]
      .reverse()
      .find((event) => event.warningTriggered);

    const syncStatus =
      queuedMutations.length > 0
        ? 'queued-to-sync'
        : state.syncStatus;

    const result: IScoreBenchmarkStateResult = {
      cacheKey,
      status: 'success',
      isLoading: false,
      isError: false,
      errorMessage: null,
      overlay: state,
      bicOwnershipProjections: overlayResponse.bicOwnershipProjections,
      normalizedDistanceToWinZone: normalizeDistance(
        state.distanceToWinZone,
        state.overallWinZoneMin
      ),
      hasLossRiskOverlap: state.lossRiskOverlap,
      governanceWarning: {
        triggered: Boolean(warningEvent),
        message: warningEvent
          ? 'Filter changes triggered a governance warning and require confirmation.'
          : null,
      },
      stale: {
        isStale: staleMs > BENCHMARK_STALE_MS,
        staleMs,
      },
      sync: {
        status: syncStatus,
        badgeLabel: toSyncBadge(syncStatus),
        queuedCount: queuedMutations.length,
        lastReplayedAt: lastReplayAt,
      },
      actions: {
        refresh: () =>
          useScoreBenchmarkState(input, {
            api,
            lifecycleApi,
            now,
          }),
        replayQueuedMutations: () => {
          if (queuedMutations.length > 0) {
            lifecycleApi.runOnDemandRecompute(
              resolvedFilterContext,
              input.reviewerContext.reviewerId
            );
            clearQueuedMutations(input.entityId);
            setLastReplayAt(input.entityId, now().toISOString());
          }

          return useScoreBenchmarkState(input, {
            api,
            lifecycleApi,
            now,
          });
        },
        queueLocalMutation: (mutationType, payload) => {
          enqueueMutation(input.entityId, createQueueMutation(input.entityId, mutationType, payload));

          return useScoreBenchmarkState(input, {
            api,
            lifecycleApi,
            now,
          });
        },
      },
    };

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load score benchmark state.';

    return {
      cacheKey,
      status: 'error',
      isLoading: false,
      isError: true,
      errorMessage: message,
      overlay: null,
      bicOwnershipProjections: [],
      normalizedDistanceToWinZone: null,
      hasLossRiskOverlap: false,
      governanceWarning: {
        triggered: false,
        message: null,
      },
      stale: {
        isStale: false,
        staleMs: 0,
      },
      sync: {
        status: queuedMutations.length > 0 ? 'queued-to-sync' : 'saved-locally',
        badgeLabel: queuedMutations.length > 0 ? 'Queued to sync' : 'Saved locally',
        queuedCount: queuedMutations.length,
        lastReplayedAt: lastReplayAt,
      },
      actions: {
        refresh: () =>
          useScoreBenchmarkState(input, {
            api,
            lifecycleApi,
            now,
          }),
        replayQueuedMutations: () => {
          clearQueuedMutations(input.entityId);
          setLastReplayAt(input.entityId, now().toISOString());

          return useScoreBenchmarkState(input, {
            api,
            lifecycleApi,
            now,
          });
        },
        queueLocalMutation: (mutationType, payload) => {
          enqueueMutation(input.entityId, createQueueMutation(input.entityId, mutationType, payload));

          return useScoreBenchmarkState(input, {
            api,
            lifecycleApi,
            now,
          });
        },
      },
    };
  }
};
