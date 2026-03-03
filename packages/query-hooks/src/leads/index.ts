import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ILeadFormData, IListQueryOptions } from '@hbc/models';
import { createLeadRepository } from '@hbc/data-access';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions, defaultMutationOptions } from '../defaults.js';

const repo = createLeadRepository();

export function useLeads(options?: IListQueryOptions) {
  return useQuery({
    queryKey: queryKeys.leads.list(options as Record<string, unknown>),
    queryFn: () => repo.getAll(options),
    ...defaultQueryOptions,
  });
}

export function useLeadById(id: number) {
  return useQuery({
    queryKey: queryKeys.leads.detail(id),
    queryFn: () => repo.getById(id),
    ...defaultQueryOptions,
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ILeadFormData) => repo.create(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.leads.all });
    },
    ...defaultMutationOptions,
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ILeadFormData> }) =>
      repo.update(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.leads.all });
    },
    ...defaultMutationOptions,
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => repo.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.leads.all });
    },
    ...defaultMutationOptions,
  });
}

export function useSearchLeads(query: string, options?: IListQueryOptions) {
  return useQuery({
    queryKey: queryKeys.leads.search(query),
    queryFn: () => repo.search(query, options),
    enabled: query.length > 0,
    ...defaultQueryOptions,
  });
}
