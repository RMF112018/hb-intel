import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { IScheduleActivity, IListQueryOptions } from '@hbc/models';
import { createScheduleRepository } from '@hbc/data-access';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions, defaultMutationOptions } from '../defaults.js';

const repo = createScheduleRepository();

export function useScheduleActivities(projectId: string, options?: IListQueryOptions) {
  return useQuery({
    queryKey: queryKeys.schedule.activities(projectId),
    queryFn: () => repo.getActivities(projectId, options),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}

export function useScheduleActivityById(id: number) {
  return useQuery({
    queryKey: queryKeys.schedule.activity(id),
    queryFn: () => repo.getActivityById(id),
    ...defaultQueryOptions,
  });
}

export function useCreateScheduleActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<IScheduleActivity, 'id'>) => repo.createActivity(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.schedule.all });
    },
    ...defaultMutationOptions,
  });
}

export function useUpdateScheduleActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<IScheduleActivity> }) =>
      repo.updateActivity(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.schedule.all });
    },
    ...defaultMutationOptions,
  });
}

export function useDeleteScheduleActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => repo.deleteActivity(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.schedule.all });
    },
    ...defaultMutationOptions,
  });
}

export function useScheduleMetrics(projectId: string) {
  return useQuery({
    queryKey: queryKeys.schedule.metrics(projectId),
    queryFn: () => repo.getMetrics(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}
