import type { IScheduleActivity } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useUpdateScheduleActivity() {
  const repo = useRepository('schedule');
  return useOptimisticMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<IScheduleActivity> }) =>
      repo.updateActivity(id, data),
    invalidateKey: queryKeys.schedule.all,
  });
}
