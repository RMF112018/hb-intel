/**
 * SF18-T04 hooks and state-model orchestration.
 *
 * Provides deterministic, query-backed readiness state for Estimating surfaces,
 * including profile/config exposure and telemetry visibility filtering.
 *
 * @design D-SF18-T04, L-01, L-02, L-04, L-06
 */
import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BID_READINESS_SYNC_INDICATORS,
  type SyncIndicator,
} from '../../constants/index.js';
import type {
  BidReadinessDataState,
  IHealthIndicatorCriterion,
  UseBidReadinessResult,
  UseBidReadinessProfileResult,
  UseBidReadinessTelemetryResult,
} from '../../types/index.js';
import {
  mapHealthIndicatorStateToBidReadinessView,
  mapPursuitToHealthIndicatorItem,
  type IEstimatingPursuitReadinessInput,
} from '../adapters/index.js';
import {
  resolveBidReadinessProfileConfig,
  evaluateReadinessSummary,
  type IEstimatingBidReadinessAdminOverride,
} from '../profiles/index.js';
import {
  bidReadinessKpiEmitter,
  type BidReadinessComplexity,
  type BidReadinessTelemetryAudience,
  type IBidReadinessTelemetrySnapshot,
} from '../telemetry/index.js';

export interface UseBidReadinessParams {
  readonly pursuit: IEstimatingPursuitReadinessInput | null;
  readonly profileOverride?: IEstimatingBidReadinessAdminOverride | null;
  readonly syncIndicator?: SyncIndicator;
  readonly criterionVisibilityFilter?: (criterion: IHealthIndicatorCriterion) => boolean;
  readonly enabled?: boolean;
}

export interface UseBidReadinessProfileParams {
  readonly profileOverride?: IEstimatingBidReadinessAdminOverride | null;
  readonly enabled?: boolean;
}

export interface UseBidReadinessTelemetryParams {
  readonly complexity?: BidReadinessComplexity;
  readonly audience?: BidReadinessTelemetryAudience;
  readonly staleAfterMs?: number;
  readonly fallbackSnapshot?: IBidReadinessTelemetrySnapshot;
  readonly enabled?: boolean;
}

interface IResolvedReadinessQueryData {
  readonly viewState: UseBidReadinessResult['viewState'];
  readonly validationErrors: readonly string[];
  readonly fallbackApplied: boolean;
}

function buildDataState(params: {
  isLoading: boolean;
  hasData: boolean;
  hasError: boolean;
  isDegraded: boolean;
  isEmpty: boolean;
}): BidReadinessDataState {
  if (params.isLoading && !params.hasData) {
    return 'loading';
  }
  if (params.hasError && !params.hasData) {
    return 'error';
  }
  if (params.isDegraded) {
    return 'degraded';
  }
  if (params.isEmpty) {
    return 'empty';
  }
  return 'success';
}

function sortCriteriaEntries(
  criteria: NonNullable<UseBidReadinessResult['viewState']>['criteria'],
): NonNullable<UseBidReadinessResult['viewState']>['criteria'] {
  return [...criteria].sort((left, right) => {
    if (left.criterion.isBlocker !== right.criterion.isBlocker) {
      return left.criterion.isBlocker ? -1 : 1;
    }
    if (left.criterion.weight !== right.criterion.weight) {
      return right.criterion.weight - left.criterion.weight;
    }
    return left.criterion.label.localeCompare(right.criterion.label);
  });
}

function applyVisibilityFilter(
  data: IResolvedReadinessQueryData,
  criterionVisibilityFilter?: (criterion: IHealthIndicatorCriterion) => boolean,
): IResolvedReadinessQueryData {
  if (!data.viewState || !criterionVisibilityFilter) {
    return data;
  }

  const filteredCriteria = sortCriteriaEntries(
    data.viewState.criteria.filter(({ criterion }) => criterionVisibilityFilter(criterion)),
  );
  const criteriaForSummary = filteredCriteria.map((entry) => entry.criterion);
  const summaryEval = evaluateReadinessSummary(criteriaForSummary);

  return {
    ...data,
    viewState: {
      ...data.viewState,
      criteria: filteredCriteria,
      blockers: filteredCriteria
        .map((entry) => entry.criterion)
        .filter((criterion) => criterion.isBlocker),
      summary: summaryEval.summary,
      score: summaryEval.summary.score.value,
      status: summaryEval.summary.score.status,
    },
  };
}

function groupCriteria(
  criteria: NonNullable<UseBidReadinessResult['viewState']>['criteria'],
): UseBidReadinessResult['groupedCriteria'] {
  const blockers: NonNullable<UseBidReadinessResult['viewState']>['criteria'][number][] = [];
  const complete: NonNullable<UseBidReadinessResult['viewState']>['criteria'][number][] = [];
  const incomplete: NonNullable<UseBidReadinessResult['viewState']>['criteria'][number][] = [];

  for (const item of criteria) {
    if (item.criterion.isBlocker) {
      blockers.push(item);
    }

    if (item.isComplete) {
      complete.push(item);
    } else {
      incomplete.push(item);
    }
  }

  return {
    blockers,
    complete,
    incomplete,
  };
}

/**
 * Canonical readiness-state hook for Estimating pursuits.
 *
 * @design D-SF18-T04
 */
export function useBidReadiness({
  pursuit,
  profileOverride = null,
  syncIndicator = BID_READINESS_SYNC_INDICATORS[0],
  criterionVisibilityFilter,
  enabled = true,
}: UseBidReadinessParams): UseBidReadinessResult {
  const queryClient = useQueryClient();

  const profileOverrideKey = useMemo(
    () => (profileOverride ? JSON.stringify(profileOverride) : 'none'),
    [profileOverride],
  );

  const query = useQuery<IResolvedReadinessQueryData>({
    queryKey: ['health-indicator', 'estimating-bid-readiness', pursuit?.pursuitId ?? 'none', profileOverrideKey],
    enabled: enabled && Boolean(pursuit?.pursuitId),
    queryFn: async () => {
      if (!pursuit) {
        return {
          viewState: null,
          validationErrors: [],
          fallbackApplied: false,
        };
      }

      const state = mapPursuitToHealthIndicatorItem(pursuit, profileOverride ?? undefined);
      const viewState = mapHealthIndicatorStateToBidReadinessView(
        state,
        profileOverride ?? undefined,
        syncIndicator,
      );
      const resolved = resolveBidReadinessProfileConfig(profileOverride ?? undefined);

      return {
        viewState: {
          ...viewState,
          criteria: sortCriteriaEntries(viewState.criteria),
        },
        validationErrors: resolved.validationErrors,
        fallbackApplied: resolved.fallbackApplied,
      };
    },
  });

  const filteredData = useMemo(
    () => applyVisibilityFilter(query.data ?? { viewState: null, validationErrors: [], fallbackApplied: false }, criterionVisibilityFilter),
    [query.data, criterionVisibilityFilter],
  );

  const groupedCriteria = useMemo(
    () => (filteredData.viewState ? groupCriteria(filteredData.viewState.criteria) : { blockers: [], complete: [], incomplete: [] }),
    [filteredData.viewState],
  );

  const isDegraded = Boolean(filteredData.fallbackApplied) || (Boolean(query.error) && Boolean(filteredData.viewState));
  const dataState = buildDataState({
    isLoading: query.isLoading,
    hasData: Boolean(filteredData.viewState),
    hasError: Boolean(query.error),
    isDegraded,
    isEmpty: !pursuit || Boolean(filteredData.viewState && filteredData.viewState.criteria.length === 0),
  });

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ['health-indicator', 'estimating-bid-readiness', pursuit?.pursuitId ?? 'none'],
    });
  }, [queryClient, pursuit?.pursuitId]);

  return {
    state: dataState,
    viewState: filteredData.viewState,
    blockerCount: groupedCriteria.blockers.length,
    incompleteCount: groupedCriteria.incomplete.length,
    groupedCriteria,
    isLoading: query.isLoading,
    isDegraded,
    error: query.error as Error | null,
    validationErrors: filteredData.validationErrors,
    refresh,
  };
}

/**
 * Profile/config state hook for Estimating bid readiness.
 *
 * @design D-SF18-T04
 */
export function useBidReadinessProfile({
  profileOverride = null,
  enabled = true,
}: UseBidReadinessProfileParams = {}): UseBidReadinessProfileResult {
  const queryClient = useQueryClient();

  const profileOverrideKey = useMemo(
    () => (profileOverride ? JSON.stringify(profileOverride) : 'none'),
    [profileOverride],
  );

  const query = useQuery({
    queryKey: ['health-indicator', 'estimating-bid-readiness', 'profile', profileOverrideKey],
    enabled,
    queryFn: async () => resolveBidReadinessProfileConfig(profileOverride ?? undefined),
  });

  const data = query.data ?? null;
  const isDegraded = Boolean(data?.fallbackApplied) || (Boolean(query.error) && Boolean(data));

  const state = buildDataState({
    isLoading: query.isLoading,
    hasData: Boolean(data),
    hasError: Boolean(query.error),
    isDegraded,
    isEmpty: Boolean(data && data.profile.criteria.length === 0),
  });

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ['health-indicator', 'estimating-bid-readiness', 'profile'],
    });
  }, [queryClient]);

  return {
    state,
    profile: data?.profile ?? null,
    source: data?.source ?? 'baseline',
    governance: data?.governance ?? null,
    version: data?.version ?? null,
    isLoading: query.isLoading,
    isDegraded,
    error: query.error as Error | null,
    validationErrors: data?.validationErrors ?? [],
    refresh,
  };
}

/**
 * Telemetry state hook for bid readiness KPI snapshots.
 *
 * @design D-SF18-T04
 */
export function useBidReadinessTelemetry({
  complexity = 'Standard',
  audience = 'canvas',
  staleAfterMs = 5 * 60 * 1000,
  fallbackSnapshot,
  enabled = true,
}: UseBidReadinessTelemetryParams = {}): UseBidReadinessTelemetryResult {
  const queryClient = useQueryClient();

  const query = useQuery<{ snapshot: IBidReadinessTelemetrySnapshot; isStale: boolean; backfillPending: boolean }>({
    queryKey: ['health-indicator', 'estimating-bid-readiness', 'telemetry', complexity, audience],
    enabled,
    queryFn: async () => {
      const snapshot = bidReadinessKpiEmitter.getView({ complexity, audience });
      const emittedAtMs = new Date(snapshot.emittedAt).getTime();
      const isStale = Number.isFinite(emittedAtMs)
        ? Date.now() - emittedAtMs > staleAfterMs
        : true;

      return {
        snapshot,
        isStale,
        backfillPending: isStale,
      };
    },
  });

  const snapshot = query.data?.snapshot ?? fallbackSnapshot ?? null;
  const isStale = query.data?.isStale ?? Boolean(fallbackSnapshot);
  const backfillPending = query.data?.backfillPending ?? Boolean(fallbackSnapshot);
  const isDegraded = (Boolean(query.error) && Boolean(snapshot)) || isStale;

  const state = buildDataState({
    isLoading: query.isLoading,
    hasData: Boolean(snapshot),
    hasError: Boolean(query.error),
    isDegraded,
    isEmpty: false,
  });

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ['health-indicator', 'estimating-bid-readiness', 'telemetry'],
    });
  }, [queryClient]);

  return {
    state,
    snapshot,
    isLoading: query.isLoading,
    isDegraded,
    isStale,
    backfillPending,
    lastEmittedAt: snapshot?.emittedAt ?? null,
    error: query.error as Error | null,
    refresh,
  };
}
