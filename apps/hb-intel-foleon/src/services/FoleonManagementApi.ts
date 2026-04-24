import type { IFoleonRuntimeContract } from '../runtime/foleonRuntimeContract.js';
import type {
  FoleonApiError,
  FoleonContentMutation,
  FoleonManagedContent,
  FoleonPlacement,
  FoleonPlacementMutation,
  FoleonSyncRun,
  FoleonSyncStatus,
  FoleonValidationResult,
} from '../types/foleon-management.types.js';

export class FoleonManagementApiError extends Error {
  readonly code?: string;
  readonly requestId?: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, error: FoleonApiError) {
    super(error.message);
    this.name = 'FoleonManagementApiError';
    this.status = status;
    this.code = error.code;
    this.requestId = error.requestId;
    this.details = error.details;
  }
}

export interface FoleonManagementApi {
  readonly listContent: () => Promise<ReadonlyArray<FoleonManagedContent>>;
  readonly createContent: (input: FoleonContentMutation) => Promise<FoleonManagedContent>;
  readonly updateContent: (id: string, input: FoleonContentMutation) => Promise<FoleonManagedContent>;
  readonly validateContent: (id: string) => Promise<FoleonValidationResult>;
  readonly publishContent: (id: string) => Promise<FoleonManagedContent>;
  readonly suppressContent: (id: string) => Promise<FoleonManagedContent>;
  readonly listPlacements: () => Promise<ReadonlyArray<FoleonPlacement>>;
  readonly createPlacement: (input: FoleonPlacementMutation) => Promise<FoleonPlacement>;
  readonly updatePlacement: (id: string, input: FoleonPlacementMutation) => Promise<FoleonPlacement>;
  readonly deletePlacement: (id: string) => Promise<FoleonPlacement>;
  readonly syncDocs: () => Promise<FoleonSyncRun>;
  readonly syncProjects: () => Promise<FoleonSyncRun>;
  readonly getSyncStatus: () => Promise<FoleonSyncStatus>;
  readonly listSyncRuns: () => Promise<ReadonlyArray<FoleonSyncRun>>;
}

export function createFoleonManagementApi(contract: IFoleonRuntimeContract): FoleonManagementApi {
  const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const headers = new Headers(init?.headers);
    headers.set('Accept', 'application/json');
    if (init?.body) headers.set('Content-Type', 'application/json');
    const token = await contract.getAccessToken?.();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(buildApiUrl(contract.apiBaseUrl, path), {
      ...init,
      headers,
      credentials: 'include',
    });
    const json = await response.json().catch(() => ({})) as { data?: T } & FoleonApiError;
    if (!response.ok) {
      throw new FoleonManagementApiError(response.status, {
        message: json.message ?? `Foleon API request failed with ${response.status}.`,
        code: json.code,
        requestId: json.requestId,
        details: json.details,
      });
    }
    return json.data as T;
  };

  return {
    listContent: () => request('/foleon/content'),
    createContent: (input) => request('/foleon/content', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
    updateContent: (id, input) => request(`/foleon/content/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
    validateContent: (id) => request(`/foleon/content/${encodeURIComponent(id)}/validate`, {
      method: 'POST',
    }),
    publishContent: (id) => request(`/foleon/content/${encodeURIComponent(id)}/publish`, {
      method: 'POST',
    }),
    suppressContent: (id) => request(`/foleon/content/${encodeURIComponent(id)}/suppress`, {
      method: 'POST',
    }),
    listPlacements: () => request('/foleon/placements'),
    createPlacement: (input) => request('/foleon/placements', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
    updatePlacement: (id, input) => request(`/foleon/placements/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
    deletePlacement: (id) => request(`/foleon/placements/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
    syncDocs: () => request('/foleon/sync/docs', { method: 'POST' }),
    syncProjects: () => request('/foleon/sync/projects', { method: 'POST' }),
    getSyncStatus: () => request('/foleon/sync/status'),
    listSyncRuns: () => request('/foleon/sync/runs'),
  };
}

export function buildApiUrl(apiBaseUrl: string | null, path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!apiBaseUrl) return `/api${cleanPath}`;
  return `${apiBaseUrl.replace(/\/$/, '')}/api${cleanPath}`;
}
