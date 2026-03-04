import { useQuery } from '@tanstack/react-query';
import type { IListQueryOptions } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useScheduleActivities(projectId: string, options?: IListQueryOptions) {
  const repo = useRepository('schedule');
  return useQuery({
    queryKey: queryKeys.schedule.activities(projectId),
    queryFn: () => repo.getActivities(projectId, options),
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}
