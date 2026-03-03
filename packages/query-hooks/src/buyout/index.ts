import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { IBuyoutEntry, IListQueryOptions } from '@hbc/models';
import { createBuyoutRepository } from '@hbc/data-access';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions, defaultMutationOptions } from '../defaults.js';

const repo = createBuyoutRepository();

export function useBuyoutLog(projectId: string, options?: IListQueryOptions) {
  return useQuery({
    queryKey: queryKeys.buyout.entries(projectId),
    queryFn: () => repo.getEntries(projectId, options),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

export function useBuyoutEntryById(id: number) {
  return useQuery({
    queryKey: queryKeys.buyout.entry(id),
    queryFn: () => repo.getEntryById(id),
    ...defaultQueryOptions,
  });
}

export function useCreateBuyoutEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<IBuyoutEntry, 'id'>) => repo.createEntry(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.buyout.all });
    },
    ...defaultMutationOptions,
  });
}

export function useUpdateBuyoutEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<IBuyoutEntry> }) =>
      repo.updateEntry(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.buyout.all });
    },
    ...defaultMutationOptions,
  });
}

export function useDeleteBuyoutEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => repo.deleteEntry(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.buyout.all });
    },
    ...defaultMutationOptions,
  });
}

export function useBuyoutSummary(projectId: string) {
  return useQuery({
    queryKey: queryKeys.buyout.summary(projectId),
    queryFn: () => repo.getSummary(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}
