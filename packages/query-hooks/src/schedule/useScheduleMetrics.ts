import { useQuery } from '@tanstack/react-query';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useScheduleMetrics(projectId: string) {
  const repo = useRepository('schedule');
  return useQuery({
    queryKey: queryKeys.schedule.metrics(projectId),
    queryFn: () => repo.getMetrics(projectId),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}
