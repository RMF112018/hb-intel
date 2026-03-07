import type {
  IProjectSetupRequest,
  IProvisioningStatus,
  ProjectSetupRequestState,
} from '@hbc/models';

export interface IProvisioningApiClient {
  submitRequest(data: Partial<IProjectSetupRequest>): Promise<IProjectSetupRequest>;
  listRequests(state?: ProjectSetupRequestState): Promise<IProjectSetupRequest[]>;
  advanceState(
    requestId: string,
    newState: ProjectSetupRequestState,
    extras?: { projectNumber?: string; clarificationNote?: string }
  ): Promise<IProjectSetupRequest>;
  getProvisioningStatus(projectId: string): Promise<IProvisioningStatus | null>;
  retryProvisioning(projectId: string): Promise<void>;
  escalateProvisioning(projectId: string, escalatedBy: string): Promise<void>;
}

/**
 * D-PH6-09 API-client factory for all provisioning/request lifecycle endpoints.
 * Traceability: docs/architecture/plans/PH6.9-Provisioning-Package.md §6.9.1
 */
export function createProvisioningApiClient(
  baseUrl: string,
  getToken: () => Promise<string>
): IProvisioningApiClient {
  /**
   * D-PH6-09 authenticated fetch boundary.
   * Every request acquires a fresh Bearer token from the supplied token factory.
   */
  async function authFetch(path: string, init?: RequestInit): Promise<Response> {
    const token = await getToken();
    const response = await fetch(`${baseUrl}/api${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...init?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error((error as { error: string }).error ?? `HTTP ${response.status}`);
    }

    return response;
  }

  return {
    async submitRequest(data) {
      const res = await authFetch('/project-setup-requests', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.json();
    },
    async listRequests(state) {
      const qs = state ? `?state=${state}` : '';
      const res = await authFetch(`/project-setup-requests${qs}`);
      return res.json();
    },
    async advanceState(requestId, newState, extras = {}) {
      const res = await authFetch(`/project-setup-requests/${requestId}/state`, {
        method: 'PATCH',
        body: JSON.stringify({ newState, ...extras }),
      });
      return res.json();
    },
    async getProvisioningStatus(projectId) {
      const res = await authFetch(`/provisioning-status/${projectId}`);
      if (res.status === 404) return null;
      return res.json();
    },
    async retryProvisioning(projectId) {
      await authFetch(`/provisioning-retry/${projectId}`, { method: 'POST' });
    },
    async escalateProvisioning(projectId, escalatedBy) {
      await authFetch(`/provisioning-escalate/${projectId}`, {
        method: 'POST',
        body: JSON.stringify({ escalatedBy }),
      });
    },
  };
}
