import type {
  IProjectSetupRequest,
  IProvisioningStatus,
  ProjectSetupRequestState,
} from '@hbc/models';

/** Structured error carrying HTTP status and backend error code. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface IProvisioningApiClient {
  submitRequest(data: Partial<IProjectSetupRequest>): Promise<IProjectSetupRequest>;
  listRequests(state?: ProjectSetupRequestState): Promise<IProjectSetupRequest[]>;
  advanceState(
    requestId: string,
    newState: ProjectSetupRequestState,
    extras?: { projectNumber?: string; clarificationNote?: string }
  ): Promise<IProjectSetupRequest>;
  /**
   * W0-G5-T01: List project setup requests owned by a specific submitter.
   * Secure, requester-scoped alternative to the global `listRequests`.
   * The server filters by `submittedBy` — callers must pass the authenticated user's UPN.
   */
  listMyRequests(submitterId: string, state?: ProjectSetupRequestState): Promise<IProjectSetupRequest[]>;
  getProvisioningStatus(projectId: string): Promise<IProvisioningStatus | null>;
  listFailedRuns(): Promise<IProvisioningStatus[]>;
  /** W0-G4-T04: List all provisioning runs, optionally filtered by overallStatus. */
  listProvisioningRuns(status?: string): Promise<IProvisioningStatus[]>;
  retryProvisioning(projectId: string): Promise<void>;
  escalateProvisioning(projectId: string, escalatedBy: string): Promise<void>;
  /** W0-G4-T04: Archive a failed provisioning run (admin-only). */
  archiveFailure(projectId: string): Promise<void>;
  /** W0-G4-T04: Acknowledge an escalated provisioning run (admin-only). */
  acknowledgeEscalation(projectId: string): Promise<void>;
  /** W0-G4-T04: Force a provisioning run into a specific state (admin expert-tier only). */
  forceStateTransition(projectId: string, targetState: string): Promise<void>;
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
      const body = await response.json().catch(() => ({}));
      const msg =
        (body as Record<string, unknown>).message ??
        (body as Record<string, unknown>).error ??
        response.statusText;
      throw new ApiError(
        String(msg),
        response.status,
        (body as Record<string, unknown>).code as string | undefined,
      );
    }

    return response;
  }

  /** Fetch a single-item endpoint and unwrap the `{ data: T }` envelope. */
  async function fetchItem<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await authFetch(path, init);
    const json = await res.json();
    return (json as { data: T }).data;
  }

  /** Fetch a list endpoint and unwrap the `{ items: T[], pagination }` envelope. */
  async function fetchList<T>(path: string): Promise<T[]> {
    const res = await authFetch(path);
    const json = await res.json();
    return (json as { items: T[] }).items;
  }

  return {
    async submitRequest(data) {
      return fetchItem<IProjectSetupRequest>('/project-setup-requests', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async listRequests(state) {
      const qs = state ? `?state=${state}` : '';
      return fetchList<IProjectSetupRequest>(`/project-setup-requests${qs}`);
    },
    async listMyRequests(submitterId, state) {
      const params = new URLSearchParams({ submitterId });
      if (state) params.set('state', state);
      return fetchList<IProjectSetupRequest>(`/project-setup-requests?${params.toString()}`);
    },
    async advanceState(requestId, newState, extras = {}) {
      return fetchItem<IProjectSetupRequest>(`/project-setup-requests/${requestId}/state`, {
        method: 'PATCH',
        body: JSON.stringify({ newState, ...extras }),
      });
    },
    async getProvisioningStatus(projectId) {
      try {
        return await fetchItem<IProvisioningStatus>(`/provisioning-status/${projectId}`);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    async listFailedRuns() {
      return fetchList<IProvisioningStatus>('/provisioning-failures');
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
    async listProvisioningRuns(status) {
      const qs = status ? `?status=${status}` : '';
      return fetchList<IProvisioningStatus>(`/provisioning-runs${qs}`);
    },
    async archiveFailure(projectId) {
      await authFetch(`/provisioning-archive/${projectId}`, { method: 'POST' });
    },
    async acknowledgeEscalation(projectId) {
      await authFetch(`/provisioning-escalation-ack/${projectId}`, { method: 'POST' });
    },
    async forceStateTransition(projectId, targetState) {
      await authFetch(`/provisioning-force-state/${projectId}`, {
        method: 'POST',
        body: JSON.stringify({ targetState }),
      });
    },
  };
}
