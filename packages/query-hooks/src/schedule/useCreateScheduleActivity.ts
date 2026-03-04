import type { IScheduleActivity } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useCreateScheduleActivity() {
  const repo = useRepository('schedule');
  return useOptimisticMutation({
    mutationFn: (data: Omit<IScheduleActivity, 'id'>) => repo.createActivity(data),
    invalidateKey: queryKeys.schedule.all,
  });
}
