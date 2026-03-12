/**
 * SF18-T04 hooks and state-model orchestration.
 *
 * Provides deterministic, query-backed readiness state for Estimating surfaces,
 * including profile/config exposure and telemetry visibility filtering.
 *
 * @design D-SF18-T04, L-01, L-02, L-04, L-06
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BID_READINESS_SYNC_INDICATORS,
  type SyncIndicator,
} from '../../constants/index.js';
import type {
  BidReadinessDataState,
  IBidReadinessAdminConfigDraft,
  IBidReadinessAdminConfigSnapshot,
  IBidReadinessChecklistDefinition,
  IBidReadinessChecklistItem,
  IBidReadinessViewState,
  IHealthIndicatorCriterion,
  UseBidReadinessAdminConfigResult,
  UseBidReadinessChecklistResult,
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
  applyChecklistDraft,
  computeChecklistCompletion,
  createChecklistItems,
  groupChecklistItems,
  sortChecklistItems,
  validateAdminChecklistDefinitions,
} from '../checklist/index.js';
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

export interface UseBidReadinessChecklistParams {
  readonly viewState: IBidReadinessViewState | null;
  readonly enabled?: boolean;
}

export interface UseBidReadinessAdminConfigParams {
  readonly profileOverride?: IEstimatingBidReadinessAdminOverride | null;
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

/**
 * Checklist state hook for estimator completion workflow and rationale tracking.
 *
 * @design D-SF18-T06
 */
export function useBidReadinessChecklist({
  viewState,
  enabled = true,
}: UseBidReadinessChecklistParams): UseBidReadinessChecklistResult {
  const [draftOverrides, setDraftOverrides] = useState<
    Readonly<Record<string, Pick<IBidReadinessChecklistItem, 'isComplete' | 'rationale'>>>
  >({});

  const baseItems = useMemo(() => {
    if (!viewState || !enabled) {
      return [] as IBidReadinessChecklistItem[];
    }
    return sortChecklistItems(createChecklistItems(viewState));
  }, [viewState, enabled]);

  const items = useMemo(
    () => sortChecklistItems(applyChecklistDraft(baseItems, draftOverrides)),
    [baseItems, draftOverrides],
  );

  const grouped = useMemo(() => groupChecklistItems(items), [items]);
  const completionPercent = useMemo(() => computeChecklistCompletion(items), [items]);
  const recomputeRequired = useMemo(
    () => Object.keys(draftOverrides).length > 0,
    [draftOverrides],
  );

  const updateCompletion = useCallback((checklistItemId: string, isComplete: boolean) => {
    setDraftOverrides((previous) => {
      const previousEntry = previous[checklistItemId];
      return {
        ...previous,
        [checklistItemId]: {
          isComplete,
          rationale: previousEntry?.rationale ?? '',
        },
      };
    });
  }, []);

  const updateRationale = useCallback((checklistItemId: string, rationale: string) => {
    setDraftOverrides((previous) => {
      const previousEntry = previous[checklistItemId];
      return {
        ...previous,
        [checklistItemId]: {
          isComplete: previousEntry?.isComplete ?? baseItems.find((item) => item.checklistItemId === checklistItemId)?.isComplete ?? false,
          rationale,
        },
      };
    });
  }, [baseItems]);

  const resetDraft = useCallback(() => {
    setDraftOverrides({});
  }, []);

  const dataState = buildDataState({
    isLoading: false,
    hasData: Boolean(viewState),
    hasError: false,
    isDegraded: false,
    isEmpty: !viewState || items.length === 0,
  });

  return {
    state: dataState,
    items,
    grouped,
    completionPercent,
    blockingIncompleteCount: grouped.blockers.filter((item) => !item.isComplete).length,
    recomputeRequired,
    isLoading: false,
    isDegraded: false,
    error: null,
    updateCompletion,
    updateRationale,
    resetDraft,
  };
}

/**
 * Admin configuration hook for readiness criteria/checklist governance editing.
 *
 * @design D-SF18-T06
 */
export function useBidReadinessAdminConfig({
  profileOverride = null,
  enabled = true,
}: UseBidReadinessAdminConfigParams = {}): UseBidReadinessAdminConfigResult {
  const query = useQuery({
    queryKey: ['health-indicator', 'estimating-bid-readiness', 'admin-config', profileOverride ? JSON.stringify(profileOverride) : 'none'],
    enabled,
    queryFn: async () => resolveBidReadinessProfileConfig(profileOverride ?? undefined),
  });

  const [draft, setDraft] = useState<IBidReadinessAdminConfigDraft | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<IBidReadinessAdminConfigSnapshot | null>(null);

  useEffect(() => {
    if (!query.data) {
      return;
    }

    const checklistDefinitions: IBidReadinessChecklistDefinition[] = query.data.profile.criteria.map((criterion, index) => ({
      checklistItemId: `checklist-${criterion.criterionId}`,
      criterionId: criterion.criterionId,
      required: true,
      blocking: criterion.isBlocker,
      order: index,
    }));

    setDraft({
      profile: query.data.profile,
      checklistDefinitions,
      governance: query.data.governance,
      version: query.data.version,
      dirty: false,
    });

    setSavedSnapshot({
      profile: query.data.profile,
      checklistDefinitions,
      governance: query.data.governance,
      version: query.data.version,
      savedAt: new Date().toISOString(),
    });
  }, [query.data]);

  const setCriterionWeight = useCallback((criterionId: string, weight: number) => {
    setDraft((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        dirty: true,
        profile: {
          ...previous.profile,
          criteria: previous.profile.criteria.map((criterion) => (
            criterion.criterionId === criterionId ? { ...criterion, weight } : criterion
          )),
        },
      };
    });
  }, []);

  const setCriterionBlocker = useCallback((criterionId: string, isBlocker: boolean) => {
    setDraft((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        dirty: true,
        profile: {
          ...previous.profile,
          criteria: previous.profile.criteria.map((criterion) => (
            criterion.criterionId === criterionId ? { ...criterion, isBlocker } : criterion
          )),
        },
        checklistDefinitions: previous.checklistDefinitions.map((definition) => (
          definition.criterionId === criterionId ? { ...definition, blocking: isBlocker } : definition
        )),
      };
    });
  }, []);

  const setThreshold = useCallback((
    name: 'readyMinScore' | 'nearlyReadyMinScore' | 'attentionNeededMinScore',
    value: number,
  ) => {
    setDraft((previous) => {
      if (!previous) {
        return previous;
      }
      return {
        ...previous,
        dirty: true,
        profile: {
          ...previous.profile,
          thresholds: {
            ...previous.profile.thresholds,
            [name]: value,
          },
        },
      };
    });
  }, []);

  const validationErrors = useMemo(() => {
    if (!draft) {
      return [] as string[];
    }

    const errors = [...validateAdminChecklistDefinitions(draft.checklistDefinitions)];
    const thresholds = draft.profile.thresholds;
    if (!(thresholds.readyMinScore > thresholds.nearlyReadyMinScore
      && thresholds.nearlyReadyMinScore > thresholds.attentionNeededMinScore)) {
      errors.push('Threshold ordering invalid: ready > nearly-ready > attention-needed is required.');
    }
    if (draft.profile.criteria.some((criterion) => criterion.weight < 0)) {
      errors.push('Criterion weights must be non-negative.');
    }
    return errors;
  }, [draft]);

  const saveDraft = useCallback((): IBidReadinessAdminConfigSnapshot | null => {
    if (!draft || validationErrors.length > 0) {
      return null;
    }

    const snapshot: IBidReadinessAdminConfigSnapshot = {
      profile: draft.profile,
      checklistDefinitions: draft.checklistDefinitions,
      governance: {
        ...draft.governance,
        recordedAt: new Date().toISOString(),
      },
      version: {
        ...draft.version,
        version: draft.version.version + 1,
        updatedAt: new Date().toISOString(),
      },
      savedAt: new Date().toISOString(),
    };

    setSavedSnapshot(snapshot);
    setDraft({
      ...draft,
      governance: snapshot.governance,
      version: snapshot.version,
      dirty: false,
    });

    return snapshot;
  }, [draft, validationErrors]);

  const resetDraft = useCallback(() => {
    if (!savedSnapshot) {
      return;
    }
    setDraft({
      profile: savedSnapshot.profile,
      checklistDefinitions: savedSnapshot.checklistDefinitions,
      governance: savedSnapshot.governance,
      version: savedSnapshot.version,
      dirty: false,
    });
  }, [savedSnapshot]);

  const dataState = buildDataState({
    isLoading: query.isLoading,
    hasData: Boolean(draft),
    hasError: Boolean(query.error),
    isDegraded: Boolean(query.error) && Boolean(draft),
    isEmpty: Boolean(draft && draft.profile.criteria.length === 0),
  });

  return {
    state: dataState,
    snapshot: savedSnapshot,
    draft,
    validationErrors,
    isLoading: query.isLoading,
    isDegraded: Boolean(query.error) && Boolean(draft),
    error: query.error as Error | null,
    setCriterionWeight,
    setCriterionBlocker,
    setThreshold,
    saveDraft,
    resetDraft,
  };
}
