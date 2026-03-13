import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { IUsePostBidAutopsyInput, IUsePostBidAutopsyResult } from '../types/index.js';
import { getPostBidAutopsyApi } from './stateStore.js';
import { createPostBidAutopsyInvalidationKeys, createPostBidAutopsyStateQueryKey } from './queryKeys.js';
import {
  createAutopsyCommitMetadata,
  createAutopsyCompletenessState,
  createAutopsyPublicationBlockerSummary,
  createAutopsyQueueState,
  selectAutopsyStateView,
} from './selectors.js';

const getErrorMessage = (error: unknown): string | null => {
  if (!error) {
    return null;
  }

  return error instanceof Error ? error.message : String(error);
};

export const usePostBidAutopsyState = (
  input: IUsePostBidAutopsyInput
): IUsePostBidAutopsyResult => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: createPostBidAutopsyStateQueryKey(input.pursuitId),
    queryFn: async () => {
      const api = getPostBidAutopsyApi(input.pursuitId);
      const record = api.getRecordByPursuitId(input.pursuitId);
      const version = api.getVersionEnvelopeByPursuitId(input.pursuitId);

      return {
        record,
        version,
      };
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
    state: selectAutopsyStateView(query.data?.record),
    loading: query.isLoading,
    error: getErrorMessage(query.error),
    refresh,
    queueStatus: createAutopsyQueueState({
      status: query.data?.record?.syncStatus ?? 'synced',
      pendingMutationCount: query.data?.record
        ? getPostBidAutopsyApi(input.pursuitId).listQueuedMutations(query.data.record.autopsy.autopsyId).length
        : 0,
      lastSyncedAt:
        query.data?.record?.syncStatus === 'synced' ? query.data?.version?.currentVersion.createdAt ?? null : null,
    }),
    commitMetadata: createAutopsyCommitMetadata({
      committedAt: query.data?.version?.currentVersion.createdAt ?? null,
      committedBy: query.data?.version?.currentVersion.createdBy.userId ?? null,
      source: 'unknown',
    }),
    completeness: createAutopsyCompletenessState(query.data?.record),
    publicationBlockers: createAutopsyPublicationBlockerSummary(query.data?.record),
  };
};
