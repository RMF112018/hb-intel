/**
 * W0-G5-T01: Query hook — list current user's project setup requests.
 */
import { useQuery } from '@tanstack/react-query';
import type { ProjectSetupRequestState, IProjectSetupRequest } from '@hbc/models';
import { useCurrentUser } from '@hbc/auth';
import { useProvisioningApi } from './useProvisioningApi.js';

export function useMyProjectRequests(state?: ProjectSetupRequestState) {
  const api = useProvisioningApi();
  const currentUser = useCurrentUser();
  const submitterId = currentUser?.email ?? '';

  return useQuery<IProjectSetupRequest[]>({
    queryKey: ['provisioning', 'my-requests', submitterId, state],
    queryFn: () => api.listMyRequests(submitterId, state),
    enabled: submitterId.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
