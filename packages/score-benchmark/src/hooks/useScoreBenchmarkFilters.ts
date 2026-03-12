import { ScoreBenchmarkApi } from '../api/ScoreBenchmarkApi.js';
import type {
  IBenchmarkFilterContext,
  IFilterGovernanceEvent,
  IScoreBenchmarkFiltersInput,
  IScoreBenchmarkFiltersResult,
} from '../types/index.js';
import {
  enqueueMutation,
  getFilterState,
  setFilterState,
} from './stateStore.js';
import {
  createScoreBenchmarkFiltersQueryKey,
  createScoreBenchmarkStateQueryKey,
} from './queryKeys.js';

const defaultApi = new ScoreBenchmarkApi();

const normalizeFilterContext = (context: IBenchmarkFilterContext): IBenchmarkFilterContext => {
  const next = structuredClone(context);

  if (next.valueRange) {
    const [rawMin, rawMax] = next.valueRange;
    const min = Number.isFinite(rawMin) ? rawMin : 0;
    const max = Number.isFinite(rawMax) ? rawMax : 0;
    next.valueRange = min <= max ? [min, max] : [max, min];
  }

  return next;
};

const createGovernanceEvent = (
  actorUserId: string,
  fromContext: IBenchmarkFilterContext,
  toContext: IBenchmarkFilterContext
): IFilterGovernanceEvent => ({
  eventType: 'filter-change',
  actorUserId,
  fromContext,
  toContext,
  deltaImpact: {
    sampleSizeDeltaPct: fromContext.valueRange && toContext.valueRange ? 0.1 : 0,
    similarityDeltaPct: fromContext.projectType !== toContext.projectType ? 0.15 : 0,
    winRateDeltaPct: fromContext.ownerType !== toContext.ownerType ? 0.12 : 0,
  },
  warningTriggered: Boolean(
    fromContext.cohortPolicy?.defaultLocked &&
    fromContext.cohortPolicy.approvedCohortId !== toContext.cohortPolicy?.approvedCohortId
  ),
  approvedCohortId: toContext.cohortPolicy?.approvedCohortId,
  recordedAt: new Date().toISOString(),
});

export const useScoreBenchmarkFilters = (
  input: IScoreBenchmarkFiltersInput,
  deps?: {
    api?: ScoreBenchmarkApi;
  }
): IScoreBenchmarkFiltersResult => {
  const api = deps?.api ?? defaultApi;
  const cacheKey = createScoreBenchmarkFiltersQueryKey(input.entityId);
  const existing = getFilterState(input.entityId);
  const currentFilterContext = existing?.context ?? normalizeFilterContext(input.initialContext ?? {});
  const invalidatedQueryKeys = existing?.invalidatedQueryKeys ?? [];

  const applyFilterContext = (
    nextContextRaw: IBenchmarkFilterContext
  ): IScoreBenchmarkFiltersResult => {
    const nextContext = normalizeFilterContext(nextContextRaw);

    if (
      currentFilterContext.cohortPolicy?.defaultLocked &&
      currentFilterContext.cohortPolicy.approvedCohortId !== nextContext.cohortPolicy?.approvedCohortId
    ) {
      throw new Error('Default cohort cannot be silently changed while lock is enabled.');
    }

    if (
      nextContext.cohortPolicy?.approvedCohortId &&
      input.approvedCohorts &&
      !input.approvedCohorts.includes(nextContext.cohortPolicy.approvedCohortId)
    ) {
      throw new Error('Approved cohort constraint violated for score benchmark filters.');
    }

    const governanceEvent = createGovernanceEvent(
      input.actorUserId,
      currentFilterContext,
      nextContext
    );

    api.appendFilterGovernanceEvent(governanceEvent);

    const stateKey = createScoreBenchmarkStateQueryKey(
      input.entityId,
      nextContext,
      input.reviewerContext
    );

    const nextInvalidations = [
      ...invalidatedQueryKeys,
      stateKey,
    ];

    setFilterState(input.entityId, {
      context: nextContext,
      invalidatedQueryKeys: nextInvalidations,
    });

    enqueueMutation(input.entityId, {
      mutationId: `${input.entityId}-filter-${Date.now()}`,
      mutationType: 'filter-context-change',
      entityId: input.entityId,
      payload: {
        fromContext: currentFilterContext,
        toContext: nextContext,
      },
      queuedAt: new Date().toISOString(),
      replaySafe: true,
    });

    enqueueMutation(input.entityId, {
      mutationId: `${input.entityId}-governance-${Date.now()}`,
      mutationType: 'governance-event',
      entityId: input.entityId,
      payload: {
        event: governanceEvent,
      },
      queuedAt: new Date().toISOString(),
      replaySafe: true,
    });

    return useScoreBenchmarkFilters(
      {
        ...input,
        initialContext: nextContext,
      },
      {
        api,
      }
    );
  };

  return {
    cacheKey,
    filterContext: currentFilterContext,
    invalidatedQueryKeys,
    applyFilterContext,
    resetToDefaultCohort: () =>
      applyFilterContext({
        ...currentFilterContext,
        cohortPolicy: {
          defaultLocked: true,
          approvedCohortId: input.defaultCohortId,
          auditRequired: true,
        },
      }),
  };
};
