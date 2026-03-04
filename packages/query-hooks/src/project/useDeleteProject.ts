import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useDeleteProject() {
  const repo = useRepository('project');
  return useOptimisticMutation({
    mutationFn: (id: string) => repo.deleteProject(id),
    invalidateKey: queryKeys.project.all,
  });
}
