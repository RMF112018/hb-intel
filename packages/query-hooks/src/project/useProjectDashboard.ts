import { useQuery } from '@tanstack/react-query';
import { useRepository } from '../useRepository.js';
import { queryKeys } from '../keys.js';
import { defaultQueryOptions } from '../defaults.js';

export function useProjectDashboard() {
  const repo = useRepository('project');
  return useQuery({
    queryKey: queryKeys.project.dashboard(),
    queryFn: () => repo.getPortfolioSummary(),
    ...defaultQueryOptions,
  });
}
