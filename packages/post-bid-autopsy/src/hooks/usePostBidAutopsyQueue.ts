import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { IUseAutopsySyncQueueInput, IUseAutopsySyncQueueResult } from '../types/index.js';
import { getPostBidAutopsyApi, getReplayProjection, setReplayProjection } from './stateStore.js';
import { createPostBidAutopsyInvalidationKeys, createPostBidAutopsyQueueQueryKey } from './queryKeys.js';
import {
  createAutopsyCompletenessState,
  createAutopsyPublicationBlockerSummary,
  selectAutopsyQueueState,
} from './selectors.js';

const getErrorMessage = (error: unknown): string | null => {
  if (!error) {
    return null;
  }

  return error instanceof Error ? error.message : String(error);
};

export const usePostBidAutopsyQueue = (
  input: IUseAutopsySyncQueueInput
): IUseAutopsySyncQueueResult => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: createPostBidAutopsyQueueQueryKey(input.pursuitId),
    queryFn: async () => {
      const api = getPostBidAutopsyApi(input.pursuitId);
      const record = api.getRecordByPursuitId(input.pursuitId);
      const version = api.getVersionEnvelopeByPursuitId(input.pursuitId);
      const queuedMutations = record ? api.listQueuedMutations(record.autopsy.autopsyId) : [];

      return {
        record,
        version,
        queuedMutations,
        replayCompletion: getReplayProjection(input.pursuitId),
      };
    },
  });

  const replayMutation = useMutation({
    mutationFn: async () => {
      const api = getPostBidAutopsyApi(input.pursuitId);
      const result = await api.replayQueuedMutations();
      const version = api.getVersionEnvelopeByPursuitId(input.pursuitId)?.currentVersion ?? null;
      const projection = setReplayProjection(input.pursuitId, {
        completedAt: version?.createdAt ?? null,
        version,
        replayedMutationIds: result.replayedMutationIds,
        resultingSyncStatus: result.resultingSyncStatus,
      });

      return {
        result,
        projection,
      };
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

  const state = selectAutopsyQueueState(
    query.data?.record ?? null,
    query.data?.queuedMutations ?? [],
    replayMutation.data?.projection ?? query.data?.replayCompletion ?? getReplayProjection(input.pursuitId),
    query.data?.version?.currentVersion ?? null
  );

  return {
    state: {
      ...state,
      replayInFlight: replayMutation.isPending,
    },
    loading: query.isLoading || replayMutation.isPending,
    error: getErrorMessage(query.error) ?? getErrorMessage(replayMutation.error),
    refresh,
    replay: async () => {
      await replayMutation.mutateAsync();
    },
    queueStatus: state.queueStatus,
    commitMetadata: state.commitMetadata,
    completeness: createAutopsyCompletenessState(query.data?.record),
    publicationBlockers: createAutopsyPublicationBlockerSummary(query.data?.record),
  };
};
