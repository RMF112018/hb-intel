import { useQuery } from '@tanstack/react-query';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useScheduleActivityById(id: number) {
  const repo = useRepository('schedule');
  return useQuery({
    queryKey: queryKeys.schedule.activity(id),
    queryFn: () => repo.getActivityById(id),
    ...defaultQueryOptions,
  });
}
