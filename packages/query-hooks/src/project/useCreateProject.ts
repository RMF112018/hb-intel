import type { IActiveProject } from '@hbc/models';
import { useRepository } from '../useRepository.js';
import { useOptimisticMutation } from '../defaults.js';
import { queryKeys } from '../keys.js';

export function useCreateProject() {
  const repo = useRepository('project');
  return useOptimisticMutation({
    mutationFn: (data: Omit<IActiveProject, 'id'>) => repo.createProject(data),
    invalidateKey: queryKeys.project.all,
  });
}
