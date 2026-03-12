import type {
  IBenchmarkFilterContext,
  IScoreBenchmarkMutation,
} from '../types/index.js';

export interface IFilterStateRecord {
  context: IBenchmarkFilterContext;
  invalidatedQueryKeys: ReadonlyArray<readonly unknown[]>;
}

const filterStateByEntity = new Map<string, IFilterStateRecord>();
const queuedMutationsByEntity = new Map<string, IScoreBenchmarkMutation[]>();
const lastReplayByEntity = new Map<string, string>();
const noBidDraftByEntity = new Map<string, string>();

export const getFilterState = (entityId: string): IFilterStateRecord | undefined =>
  filterStateByEntity.get(entityId);

export const setFilterState = (entityId: string, state: IFilterStateRecord): void => {
  filterStateByEntity.set(entityId, {
    context: structuredClone(state.context),
    invalidatedQueryKeys: [...state.invalidatedQueryKeys],
  });
};

export const enqueueMutation = (entityId: string, mutation: IScoreBenchmarkMutation): number => {
  const existing = queuedMutationsByEntity.get(entityId) ?? [];
  const next = [...existing, structuredClone(mutation)];
  queuedMutationsByEntity.set(entityId, next);
  return next.length;
};

export const getQueuedMutations = (entityId: string): IScoreBenchmarkMutation[] =>
  [...(queuedMutationsByEntity.get(entityId) ?? [])].map((mutation) => structuredClone(mutation));

export const clearQueuedMutations = (entityId: string): void => {
  queuedMutationsByEntity.set(entityId, []);
};

export const setLastReplayAt = (entityId: string, replayedAtIso: string): void => {
  lastReplayByEntity.set(entityId, replayedAtIso);
};

export const getLastReplayAt = (entityId: string): string | null =>
  lastReplayByEntity.get(entityId) ?? null;

export const setNoBidDraft = (entityId: string, draft: string): void => {
  noBidDraftByEntity.set(entityId, draft);
};

export const getNoBidDraft = (entityId: string): string => noBidDraftByEntity.get(entityId) ?? '';
