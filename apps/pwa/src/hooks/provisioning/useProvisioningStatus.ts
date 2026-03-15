/**
 * W0-G5-T05: Query hook — fetch provisioning status for a specific project.
 * Used for completion summary and failure detail on terminal-state requests.
 */
import { useQuery } from '@tanstack/react-query';
import type { IProvisioningStatus } from '@hbc/models';
import { useProvisioningApi } from './useProvisioningApi.js';

export function useProvisioningStatus(projectId: string, enabled = true) {
  const api = useProvisioningApi();

  return useQuery<IProvisioningStatus | null>({
    queryKey: ['provisioning', 'status', projectId],
    queryFn: () => api.getProvisioningStatus(projectId),
    enabled: enabled && projectId.length > 0,
    staleTime: 30 * 1000,
    refetchInterval: enabled ? 10 * 1000 : false,
  });
}
