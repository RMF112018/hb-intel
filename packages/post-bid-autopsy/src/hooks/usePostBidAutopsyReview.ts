import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  IUseAutopsyReviewGovernanceInput,
  IUseAutopsyReviewGovernanceResult,
} from '../types/index.js';
import { getPostBidAutopsyApi } from './stateStore.js';
import { createPostBidAutopsyInvalidationKeys, createPostBidAutopsyReviewQueryKey } from './queryKeys.js';
import {
  createAutopsyCommitMetadata,
  createAutopsyCompletenessState,
  createAutopsyPublicationBlockerSummary,
  createAutopsyQueueState,
  selectAutopsyReviewGovernanceState,
  selectDisagreementTriageState,
} from './selectors.js';

const getErrorMessage = (error: unknown): string | null => {
  if (!error) {
    return null;
  }

  return error instanceof Error ? error.message : String(error);
};

export const usePostBidAutopsyReview = (
  input: IUseAutopsyReviewGovernanceInput
): IUseAutopsyReviewGovernanceResult => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: createPostBidAutopsyReviewQueryKey(input.pursuitId),
    queryFn: async () => {
      const api = getPostBidAutopsyApi(input.pursuitId);
      const record = api.getRecordByPursuitId(input.pursuitId);
      const version = api.getVersionEnvelopeByPursuitId(input.pursuitId);
      return { record, version };
    },
  });

  const transitionMutation = useMutation({
    mutationFn: async (command: Parameters<IUseAutopsyReviewGovernanceResult['transition']>[0]) => {
      const api = getPostBidAutopsyApi(input.pursuitId);
      return api.transitionAutopsy(command);
    },
    onSuccess: async () => {
      await Promise.all(
        createPostBidAutopsyInvalidationKeys(input.pursuitId).map((queryKey) =>
          queryClient.invalidateQueries({ queryKey: [...queryKey] })
        )
      );
    },
  });

  const escalationMutation = useMutation({
    mutationFn: async ({ createdAt, reason }: { createdAt: string; reason: string }) => {
      const api = getPostBidAutopsyApi(input.pursuitId);
      const record = api.getRecordByPursuitId(input.pursuitId);
      if (!record) {
        return null;
      }

      return api.escalateDisagreementDeadlock(record.autopsy.autopsyId, createdAt, reason);
    },
    onSuccess: async () => {
      await Promise.all(
        createPostBidAutopsyInvalidationKeys(input.pursuitId).map((queryKey) =>
          queryClient.invalidateQueries({ queryKey: [...queryKey] })
        )
      );
    },
  });

  const refresh = useCallback(async (): Promise<void> => {
    await Promise.all(
      createPostBidAutopsyInvalidationKeys(input.pursuitId).map((queryKey) =>
        queryClient.invalidateQueries({ queryKey: [...queryKey] })
      )
    );
  }, [input.pursuitId, queryClient]);

  return {
    state: selectAutopsyReviewGovernanceState(query.data?.record),
    loading: query.isLoading || transitionMutation.isPending || escalationMutation.isPending,
    error:
      getErrorMessage(query.error) ??
      getErrorMessage(transitionMutation.error) ??
      getErrorMessage(escalationMutation.error),
    refresh,
    queueStatus: createAutopsyQueueState({
      status: query.data?.record?.syncStatus ?? 'synced',
      pendingMutationCount: query.data?.record
        ? getPostBidAutopsyApi(input.pursuitId).listQueuedMutations(query.data.record.autopsy.autopsyId).length
        : 0,
    }),
    commitMetadata: createAutopsyCommitMetadata({
      committedAt: query.data?.version?.currentVersion.createdAt ?? null,
      committedBy: query.data?.version?.currentVersion.createdBy.userId ?? null,
      source: 'direct-write',
    }),
    completeness: createAutopsyCompletenessState(query.data?.record),
    publicationBlockers: createAutopsyPublicationBlockerSummary(query.data?.record),
    triage: selectDisagreementTriageState(query.data?.record),
    transition: async (command) => transitionMutation.mutateAsync(command),
    escalateDeadlock: async (createdAt, reason) =>
      escalationMutation.mutateAsync({
        createdAt,
        reason,
      }),
  };
};
