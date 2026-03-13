import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  IUsePostBidAutopsySectionsInput,
  IUsePostBidAutopsySectionsResult,
} from '../types/index.js';
import { getPostBidAutopsyApi } from './stateStore.js';
import { createPostBidAutopsyInvalidationKeys, createPostBidAutopsySectionsQueryKey } from './queryKeys.js';
import {
  createAutopsyCommitMetadata,
  createAutopsyCompletenessState,
  createAutopsyPublicationBlockerSummary,
  createAutopsyQueueState,
  selectAutopsySectionsState,
} from './selectors.js';

const getErrorMessage = (error: unknown): string | null => {
  if (!error) {
    return null;
  }

  return error instanceof Error ? error.message : String(error);
};

export const usePostBidAutopsySections = (
  input: IUsePostBidAutopsySectionsInput
): IUsePostBidAutopsySectionsResult => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: createPostBidAutopsySectionsQueryKey(input.pursuitId),
    queryFn: async () => {
      const api = getPostBidAutopsyApi(input.pursuitId);
      const record = api.getRecordByPursuitId(input.pursuitId);
      const version = api.getVersionEnvelopeByPursuitId(input.pursuitId);
      return { record, version };
    },
  });

  const mutation = useMutation({
    mutationFn: async ({
      sectionKey,
      draftValue,
      updatedAt,
      actor,
    }: {
      sectionKey: string;
      draftValue: string;
      updatedAt: string;
      actor: Parameters<IUsePostBidAutopsySectionsResult['updateSectionDraft']>[2];
    }) => {
      const api = getPostBidAutopsyApi(input.pursuitId);
      const record = api.getRecordByPursuitId(input.pursuitId);
      if (!record) {
        return null;
      }

      const nextSectionDrafts = [...(record.sectionDrafts ?? [])];
      const existingIndex = nextSectionDrafts.findIndex((draft) => draft.sectionKey === sectionKey);
      const nextDraft = {
        sectionKey,
        draftValue,
        updatedAt,
        updatedBy: actor.userId,
      };

      if (existingIndex >= 0) {
        nextSectionDrafts[existingIndex] = nextDraft;
      } else {
        nextSectionDrafts.push(nextDraft);
      }

      await api.persistDraft(
        record.autopsy.autopsyId,
        {
          ...record,
          sectionDrafts: nextSectionDrafts,
        },
        actor,
        updatedAt
      );

      return record.autopsy.autopsyId;
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
    state: selectAutopsySectionsState(query.data?.record),
    loading: query.isLoading || mutation.isPending,
    error: getErrorMessage(query.error) ?? getErrorMessage(mutation.error),
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
    updateSectionDraft: async (sectionKey, draftValue, actor, updatedAt) => {
      await mutation.mutateAsync({ sectionKey, draftValue, actor, updatedAt });
    },
  };
};
