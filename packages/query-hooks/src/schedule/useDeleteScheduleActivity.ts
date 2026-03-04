import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useDeleteScheduleActivity() {
  const repo = useRepository('schedule');
  return useOptimisticMutation({
    mutationFn: (id: number) => repo.deleteActivity(id),
    invalidateKey: queryKeys.schedule.all,
  });
}
