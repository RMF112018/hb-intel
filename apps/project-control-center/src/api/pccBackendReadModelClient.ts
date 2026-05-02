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

function isWrappedEnvelope<T>(
  body: unknown,
): body is { data: PccReadModelEnvelope<T> } {
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
  ): Promise<PccReadModelEnvelope<T>> {
    if (!apiBaseUrl) return fallbackEnvelope();
    if (!fetchImpl) return fallbackEnvelope();

    const path = PCC_READ_MODEL_ROUTE_PATHS[routeId].replace(
      '{projectId}',
      encodeURIComponent(projectId),
    );
    const url = `${apiBaseUrl}/${path}`;

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
      callBackend('profile', projectId, () =>
        fallback.getProjectProfile(projectId, viewerPersona),
      ),
    getModuleRegistry: (projectId, viewerPersona) =>
      callBackend('modules', projectId, () =>
        fallback.getModuleRegistry(projectId, viewerPersona),
      ),
    getProjectHome: (projectId, viewerPersona) =>
      callBackend('home', projectId, () =>
        fallback.getProjectHome(projectId, viewerPersona),
      ),
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
      callBackend('site-health', projectId, () =>
        fallback.getSiteHealth(projectId, viewerPersona),
      ),
    getTeamAccess: (projectId, viewerPersona) =>
      callBackend('team-access', projectId, () =>
        fallback.getTeamAccess(projectId, viewerPersona),
      ),
    getProjectReadiness: (projectId, viewerPersona) =>
      callBackend('project-readiness', projectId, () =>
        fallback.getProjectReadiness(projectId, viewerPersona),
      ),
    getLifecycleReadiness: (projectId, viewerPersona) =>
      callBackend('lifecycle-readiness', projectId, () =>
        fallback.getLifecycleReadiness(projectId, viewerPersona),
      ),
  };
}
