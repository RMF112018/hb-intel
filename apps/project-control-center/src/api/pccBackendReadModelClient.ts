/**
 * PCC SPFx backend HTTP read-model client.
 *
 * Sole `fetch(` callsite in the SPFx app. Selected by the factory only
 * when `readModelMode: 'backend'` and a non-empty `backendBaseUrl`
 * are explicitly configured. Fixture remains the default for every
 * other mount/config path.
 *
 * Contract:
 *   - GET-only against the read-only PCC envelope routes.
 *   - Response body shape: `{ data: PccReadModelEnvelope<T> }`.
 *   - All failure modes (no fetch, network reject, non-2xx, malformed
 *     JSON, missing/non-envelope data, empty base URL) return safe
 *     `backend-unavailable` envelopes via the fixture-fallback client
 *     per W4-OD-007.
 *   - No auth headers, no Graph/PnP/Procore runtime, no SPFx context
 *     dependence, no write methods.
 */

import {
  PCC_READ_MODEL_ROUTE_PATHS,
  type IPccReadModelClient,
  type PccReadModelRouteId,
} from './pccReadModelClient.js';
import { createPccFixtureReadModelClient } from './pccFixtureReadModelClient.js';
import type { PccProjectId, PccReadModelEnvelope } from '@hbc/models/pcc';

export type PccReadModelFetch = typeof globalThis.fetch;

export interface PccBackendReadModelClientOptions {
  readonly backendBaseUrl: string;
  readonly fetch?: PccReadModelFetch;
}

function normalizeBackendApiBaseUrl(input: string): string {
  const trimmed = input.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

function resolveFetch(injected?: PccReadModelFetch): PccReadModelFetch | undefined {
  if (injected) return injected;
  const candidate = (globalThis as { fetch?: unknown }).fetch;
  if (typeof candidate === 'function') {
    return (candidate as PccReadModelFetch).bind(globalThis);
  }
  return undefined;
}

function isWrappedEnvelope<T>(body: unknown): body is { data: PccReadModelEnvelope<T> } {
  if (typeof body !== 'object' || body === null) return false;
  const data = (body as { data?: unknown }).data;
  if (typeof data !== 'object' || data === null) return false;
  const envelope = data as Partial<PccReadModelEnvelope<T>>;
  return (
    typeof envelope.mode === 'string' &&
    typeof envelope.sourceStatus === 'string' &&
    envelope.readOnly === true &&
    Array.isArray(envelope.warnings) &&
    'data' in envelope
  );
}

export function createPccBackendReadModelClient(
  options: PccBackendReadModelClientOptions,
): IPccReadModelClient {
  const apiBaseUrl = normalizeBackendApiBaseUrl(options.backendBaseUrl);
  const fetchImpl = resolveFetch(options.fetch);
  const fallback = createPccFixtureReadModelClient({
    simulateBackendUnavailable: true,
  });

  async function callBackend<T>(
    routeId: PccReadModelRouteId,
    projectId: PccProjectId,
    fallbackEnvelope: () => Promise<PccReadModelEnvelope<T>>,
    query?: string,
  ): Promise<PccReadModelEnvelope<T>> {
    if (!apiBaseUrl) return fallbackEnvelope();
    if (!fetchImpl) return fallbackEnvelope();

    const path = PCC_READ_MODEL_ROUTE_PATHS[routeId].replace(
      '{projectId}',
      encodeURIComponent(projectId),
    );
    // Only `unified-search` accepts a `q` query param. Blank/whitespace/undefined
    // `query` MUST NOT add `?q=` to the URL. `viewerPersona` (handled at the
    // method layer) is never serialized into the URL.
    const trimmedQuery = typeof query === 'string' ? query.trim() : '';
    const search = trimmedQuery ? `?q=${encodeURIComponent(trimmedQuery)}` : '';
    const url = `${apiBaseUrl}/${path}${search}`;

    let response: Response;
    try {
      response = await fetchImpl(url, { method: 'GET' });
    } catch {
      return fallbackEnvelope();
    }
    if (!response.ok) return fallbackEnvelope();

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      return fallbackEnvelope();
    }
    if (!isWrappedEnvelope<T>(body)) return fallbackEnvelope();
    return body.data;
  }

  return {
    getProjectProfile: (projectId, viewerPersona) =>
      callBackend('profile', projectId, () => fallback.getProjectProfile(projectId, viewerPersona)),
    getModuleRegistry: (projectId, viewerPersona) =>
      callBackend('modules', projectId, () => fallback.getModuleRegistry(projectId, viewerPersona)),
    getProjectHome: (projectId, viewerPersona) =>
      callBackend('home', projectId, () => fallback.getProjectHome(projectId, viewerPersona)),
    getPriorityActions: (projectId, viewerPersona) =>
      callBackend('priority-actions', projectId, () =>
        fallback.getPriorityActions(projectId, viewerPersona),
      ),
    getDocumentControl: (projectId, viewerPersona) =>
      callBackend('document-control', projectId, () =>
        fallback.getDocumentControl(projectId, viewerPersona),
      ),
    getExternalLinks: (projectId, viewerPersona) =>
      callBackend('external-links', projectId, () =>
        fallback.getExternalLinks(projectId, viewerPersona),
      ),
    getSiteHealth: (projectId, viewerPersona) =>
      callBackend('site-health', projectId, () => fallback.getSiteHealth(projectId, viewerPersona)),
    getTeamAccess: (projectId, viewerPersona) =>
      callBackend('team-access', projectId, () => fallback.getTeamAccess(projectId, viewerPersona)),
    getProjectReadiness: (projectId, viewerPersona) =>
      callBackend('project-readiness', projectId, () =>
        fallback.getProjectReadiness(projectId, viewerPersona),
      ),
    getLifecycleReadiness: (projectId, viewerPersona) =>
      callBackend('lifecycle-readiness', projectId, () =>
        fallback.getLifecycleReadiness(projectId, viewerPersona),
      ),
    getPermitInspectionControlCenter: (projectId, viewerPersona) =>
      callBackend('permit-inspection-control-center', projectId, () =>
        fallback.getPermitInspectionControlCenter(projectId, viewerPersona),
      ),
    getResponsibilityMatrix: (projectId, viewerPersona) =>
      callBackend('responsibility-matrix', projectId, () =>
        fallback.getResponsibilityMatrix(projectId, viewerPersona),
      ),
    getConstraintsLog: (projectId, viewerPersona) =>
      callBackend('constraints-log', projectId, () =>
        fallback.getConstraintsLog(projectId, viewerPersona),
      ),
    getBuyoutLog: (projectId, viewerPersona) =>
      callBackend('buyout-log', projectId, () => fallback.getBuyoutLog(projectId, viewerPersona)),
    getProcoreProjectMapping: (projectId, viewerPersona) =>
      callBackend('procore-project-mapping', projectId, () =>
        fallback.getProcoreProjectMapping(projectId, viewerPersona),
      ),
    getProcoreSyncHealth: (projectId, viewerPersona) =>
      callBackend('procore-sync-health', projectId, () =>
        fallback.getProcoreSyncHealth(projectId, viewerPersona),
      ),
    getUnifiedLifecycle: (projectId, viewerPersona) =>
      callBackend('unified-lifecycle', projectId, () =>
        fallback.getUnifiedLifecycle(projectId, viewerPersona),
      ),
    getProjectMemory: (projectId, viewerPersona) =>
      callBackend('project-memory', projectId, () =>
        fallback.getProjectMemory(projectId, viewerPersona),
      ),
    getProjectLenses: (projectId, viewerPersona) =>
      callBackend('project-lenses', projectId, () =>
        fallback.getProjectLenses(projectId, viewerPersona),
      ),
    getProjectTraceability: (projectId, viewerPersona) =>
      callBackend('project-traceability', projectId, () =>
        fallback.getProjectTraceability(projectId, viewerPersona),
      ),
    getWarrantyTrace: (projectId, viewerPersona) =>
      callBackend('warranty-trace', projectId, () =>
        fallback.getWarrantyTrace(projectId, viewerPersona),
      ),
    getCrossProjectKnowledge: (projectId, viewerPersona) =>
      callBackend('cross-project-knowledge', projectId, () =>
        fallback.getCrossProjectKnowledge(projectId, viewerPersona),
      ),
    getUnifiedSearch: (projectId, viewerPersona, query) =>
      callBackend(
        'unified-search',
        projectId,
        () => fallback.getUnifiedSearch(projectId, viewerPersona, query),
        query,
      ),
  };
}
