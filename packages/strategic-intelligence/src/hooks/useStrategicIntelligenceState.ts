import { StrategicIntelligenceApi } from '../api/StrategicIntelligenceApi.js';
import { StrategicIntelligenceLifecycleApi } from '../api/StrategicIntelligenceLifecycleApi.js';
import type {
  IRedactedProjection,
  IStrategicIntelligenceMutation,
  IStrategicIntelligenceState,
  IStrategicIntelligenceTelemetryState,
  StrategicIntelligenceSyncStatus,
} from '../types/index.js';
import {
  createStrategicIntelligenceStateQueryKey,
} from './queryKeys.js';
import {
  appendTelemetryDelta,
  getLastReplayAt,
  getTelemetryDeltas,
  setLastReplayAt,
  toSyncBadge,
  type IStrategicIntelligenceTelemetryDelta,
  type StrategicIntelligenceSyncBadge,
} from './stateStore.js';
import {
  summarizeConflicts,
  summarizeSensitivity,
  summarizeTelemetry,
  summarizeTrust,
  type IConflictProjectionSummary,
  type ISensitivityProjectionSummary,
  type ITrustProjectionSummary,
} from './selectors.js';

const defaultApi = new StrategicIntelligenceApi();
const defaultLifecycleApi = new StrategicIntelligenceLifecycleApi(defaultApi);

const deepFreeze = <T>(value: T): T => {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  const objectValue = value as Record<string, unknown>;
  for (const propertyValue of Object.values(objectValue)) {
    if (propertyValue && typeof propertyValue === 'object') {
      deepFreeze(propertyValue);
    }
  }

  return Object.freeze(value);
};

const clone = <T>(value: T): T => structuredClone(value);

const mergeTelemetry = (
  telemetry: IStrategicIntelligenceTelemetryState,
  deltas: IStrategicIntelligenceTelemetryDelta[]
): IStrategicIntelligenceTelemetryState => {
  const next = clone(telemetry);

  for (const delta of deltas) {
    const current = next[delta.channel];
    if (typeof current === 'number') {
      next[delta.channel] = current + delta.delta;
      continue;
    }

    next[delta.channel] = delta.delta;
  }

  return next;
};

const resolveSyncStatus = (
  stateSyncStatus: StrategicIntelligenceSyncStatus,
  queuedMutationsCount: number
): StrategicIntelligenceSyncStatus => {
  if (queuedMutationsCount > 0) {
    return 'queued-to-sync';
  }

  return stateSyncStatus;
};

export interface UseStrategicIntelligenceStateInput {
  projectId: string;
  visibilityContext: string;
  scorecardId?: string;
}

export interface UseStrategicIntelligenceStateResult {
  cacheKey: readonly ['strategic-intelligence', string, string];
  status: 'success' | 'error';
  isLoading: false;
  isError: boolean;
  errorMessage: string | null;
  state: IStrategicIntelligenceState | null;
  trust: ITrustProjectionSummary;
  sensitivity: ISensitivityProjectionSummary;
  conflicts: IConflictProjectionSummary;
  telemetry: {
    snapshot: Partial<Record<keyof IStrategicIntelligenceTelemetryState, number>>;
    deltas: IStrategicIntelligenceTelemetryDelta[];
  };
  sync: {
    status: StrategicIntelligenceSyncStatus;
    badgeLabel: StrategicIntelligenceSyncBadge;
    queuedCount: number;
    lastReplayedAt: string | null;
  };
  policy: {
    indexableEntryIds: string[];
    excludedEntryIds: string[];
    redactedProjections: IRedactedProjection[];
  };
  actions: {
    refresh: () => UseStrategicIntelligenceStateResult;
    queueLocalMutation: (
      mutation: IStrategicIntelligenceMutation
    ) => UseStrategicIntelligenceStateResult;
    replayQueuedMutations: () => UseStrategicIntelligenceStateResult;
    emitTelemetryDelta: (
      channel: keyof IStrategicIntelligenceTelemetryState,
      delta: number
    ) => UseStrategicIntelligenceStateResult;
  };
}

export const useStrategicIntelligenceState = (
  input: UseStrategicIntelligenceStateInput,
  deps?: {
    api?: StrategicIntelligenceApi;
    lifecycleApi?: StrategicIntelligenceLifecycleApi;
    now?: () => Date;
  }
): UseStrategicIntelligenceStateResult => {
  const api = deps?.api ?? defaultApi;
  const lifecycleApi = deps?.lifecycleApi ?? defaultLifecycleApi;
  const now = deps?.now ?? (() => new Date());
  const scorecardId = input.scorecardId ?? input.projectId;
  const cacheKey = createStrategicIntelligenceStateQueryKey(input.projectId, input.visibilityContext);

  try {
    const baseState = api.getState(scorecardId);
    const indexingPayload = api.getIndexingPayload(scorecardId);
    const queuedMutations = api.getQueuedMutations(scorecardId);
    const telemetryDeltas = getTelemetryDeltas(scorecardId);
    const state: IStrategicIntelligenceState = {
      ...baseState,
      heritageSnapshot: deepFreeze(clone(baseState.heritageSnapshot)),
      telemetry: mergeTelemetry(baseState.telemetry, telemetryDeltas),
      syncStatus: resolveSyncStatus(baseState.syncStatus, queuedMutations.length),
    };

    const syncStatus = state.syncStatus;

    return {
      cacheKey,
      status: 'success',
      isLoading: false,
      isError: false,
      errorMessage: null,
      state,
      trust: summarizeTrust(state.livingEntries),
      sensitivity: summarizeSensitivity(state.livingEntries),
      conflicts: summarizeConflicts(state.livingEntries),
      telemetry: {
        snapshot: summarizeTelemetry(state.telemetry),
        deltas: telemetryDeltas,
      },
      sync: {
        status: syncStatus,
        badgeLabel: toSyncBadge(syncStatus, queuedMutations.length),
        queuedCount: queuedMutations.length,
        lastReplayedAt: getLastReplayAt(scorecardId),
      },
      policy: {
        indexableEntryIds: indexingPayload.indexableEntries.map((entry) => entry.entryId),
        excludedEntryIds: indexingPayload.excludedEntryIds,
        redactedProjections: indexingPayload.redactedProjections,
      },
      actions: {
        refresh: () =>
          useStrategicIntelligenceState(input, {
            api,
            lifecycleApi,
            now,
          }),
        queueLocalMutation: (mutation) => {
          api.queueLocalMutation({
            ...mutation,
            scorecardId,
          });

          return useStrategicIntelligenceState(input, {
            api,
            lifecycleApi,
            now,
          });
        },
        replayQueuedMutations: () => {
          lifecycleApi.replayQueuedMutations(scorecardId);
          setLastReplayAt(scorecardId, now().toISOString());

          return useStrategicIntelligenceState(input, {
            api,
            lifecycleApi,
            now,
          });
        },
        emitTelemetryDelta: (channel, delta) => {
          appendTelemetryDelta(scorecardId, {
            channel,
            delta,
            recordedAt: now().toISOString(),
          });

          return useStrategicIntelligenceState(input, {
            api,
            lifecycleApi,
            now,
          });
        },
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load strategic intelligence state.';

    return {
      cacheKey,
      status: 'error',
      isLoading: false,
      isError: true,
      errorMessage: message,
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
        deltas: getTelemetryDeltas(scorecardId),
      },
      sync: {
        status: 'saved-locally',
        badgeLabel: toSyncBadge('saved-locally', 0),
        queuedCount: 0,
        lastReplayedAt: getLastReplayAt(scorecardId),
      },
      policy: {
        indexableEntryIds: [],
        excludedEntryIds: [],
        redactedProjections: [],
      },
      actions: {
        refresh: () =>
          useStrategicIntelligenceState(input, {
            api,
            lifecycleApi,
            now,
          }),
        queueLocalMutation: (mutation) => {
          api.queueLocalMutation({
            ...mutation,
            scorecardId,
          });

          return useStrategicIntelligenceState(input, {
            api,
            lifecycleApi,
            now,
          });
        },
        replayQueuedMutations: () => {
          lifecycleApi.replayQueuedMutations(scorecardId);
          setLastReplayAt(scorecardId, now().toISOString());

          return useStrategicIntelligenceState(input, {
            api,
            lifecycleApi,
            now,
          });
        },
        emitTelemetryDelta: (channel, delta) => {
          appendTelemetryDelta(scorecardId, {
            channel,
            delta,
            recordedAt: now().toISOString(),
          });

          return useStrategicIntelligenceState(input, {
            api,
            lifecycleApi,
            now,
          });
        },
      },
    };
  }
};
