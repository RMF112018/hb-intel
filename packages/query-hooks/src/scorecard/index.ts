import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { IGoNoGoScorecard, IListQueryOptions } from '@hbc/models';
import type { IPagedResult, IScorecardVersion } from '@hbc/models';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions, defaultMutationOptions } from '../defaults.js';

// NOTE: Scorecard repository factory is not yet exported from @hbc/data-access
// (only lead, schedule, buyout factories exist). Until createScorecardRepository
// is added to the factory (Phase 3+), we use a type-safe placeholder that throws
// at runtime — the hooks compile and the cache keys are established.

interface IScorecardRepositoryLike {
  getScorecards(projectId: string, options?: IListQueryOptions): Promise<IPagedResult<IGoNoGoScorecard>>;
  getScorecardById(id: number): Promise<IGoNoGoScorecard | null>;
  createScorecard(data: Omit<IGoNoGoScorecard, 'id' | 'createdAt' | 'updatedAt'>): Promise<IGoNoGoScorecard>;
  updateScorecard(id: number, data: Partial<IGoNoGoScorecard>): Promise<IGoNoGoScorecard>;
  deleteScorecard(id: number): Promise<void>;
  getVersions(scorecardId: number): Promise<IScorecardVersion[]>;
}

const notImplemented = (method: string) => () => {
  throw new Error(`ScorecardRepository.${method} not yet available — awaiting factory export`);
};

const repo: IScorecardRepositoryLike = {
  getScorecards: notImplemented('getScorecards') as IScorecardRepositoryLike['getScorecards'],
  getScorecardById: notImplemented('getScorecardById') as IScorecardRepositoryLike['getScorecardById'],
  createScorecard: notImplemented('createScorecard') as IScorecardRepositoryLike['createScorecard'],
  updateScorecard: notImplemented('updateScorecard') as IScorecardRepositoryLike['updateScorecard'],
  deleteScorecard: notImplemented('deleteScorecard') as IScorecardRepositoryLike['deleteScorecard'],
  getVersions: notImplemented('getVersions') as IScorecardRepositoryLike['getVersions'],
};

export function useScorecards(projectId: string, options?: IListQueryOptions) {
  return useQuery({
    queryKey: queryKeys.scorecard.scorecards(projectId),
    queryFn: () => repo.getScorecards(projectId, options),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

export function useScorecardById(id: number) {
  return useQuery({
    queryKey: queryKeys.scorecard.detail(id),
    queryFn: () => repo.getScorecardById(id),
    ...defaultQueryOptions,
  });
}

export function useSubmitDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<IGoNoGoScorecard, 'id' | 'createdAt' | 'updatedAt'>) =>
      repo.createScorecard(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.scorecard.all });
    },
    ...defaultMutationOptions,
  });
}

export function useScorecardVersions(scorecardId: number) {
  return useQuery({
    queryKey: queryKeys.scorecard.versions(scorecardId),
    queryFn: () => repo.getVersions(scorecardId),
    ...defaultQueryOptions,
  });
}
