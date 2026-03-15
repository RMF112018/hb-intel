/**
 * W0-G5-T01: Mutation hook — submit a new project setup request.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { IProjectSetupRequest } from '@hbc/models';
import { useProvisioningApi } from './useProvisioningApi.js';

export function useSubmitProjectRequest() {
  const api = useProvisioningApi();
  const queryClient = useQueryClient();

  return useMutation<IProjectSetupRequest, Error, Partial<IProjectSetupRequest>>({
    mutationFn: (data) => api.submitRequest(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['provisioning', 'my-requests'] });
    },
  });
}
