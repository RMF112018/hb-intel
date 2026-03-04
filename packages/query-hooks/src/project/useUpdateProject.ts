import type { IActiveProject } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useUpdateProject() {
  const repo = useRepository('project');
  return useOptimisticMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IActiveProject> }) =>
      repo.updateProject(id, data),
    invalidateKey: queryKeys.project.all,
  });
}
