import type { AdminActionMetadataDto, PnpOpsActionKey } from './pnpOpsActionCatalog.js';
import type {
  PnpOpsCommandInput,
  PnpOpsPreflightResponse,
  PnpOpsRunEnvelope,
  PnpOpsRunEvidenceResponse,
  PnpOpsRunLaunchResponse,
  PnpOpsTokenProvider,
} from './pnpOpsClient.js';
import {
  ApiEnvelope,
  ApiListEnvelope,
  assertOk,
  normalizeBaseUrl,
  readJson,
} from './pnpOpsTransport.js';

async function buildAuthHeaders(
  tokenProvider: PnpOpsTokenProvider,
  extraHeaders?: Record<string, string>,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = { ...(extraHeaders ?? {}) };
  if (!tokenProvider) {
    return headers;
  }
  const token = await tokenProvider();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchLegacyActionMetadata(
  legacyBaseUrl: string,
  tokenProvider: PnpOpsTokenProvider,
  fetchImpl: typeof fetch = fetch,
): Promise<readonly AdminActionMetadataDto[]> {
  const response = await fetchImpl(`${normalizeBaseUrl(legacyBaseUrl)}/api/admin/actions`, {
    headers: await buildAuthHeaders(tokenProvider),
  });
  await assertOk(response, 'Action catalog load');
  const payload = await readJson<ApiListEnvelope<AdminActionMetadataDto>>(response);
  return payload.items ?? [];
}

export async function runLegacyPreflight(
  legacyBaseUrl: string,
  actionKey: PnpOpsActionKey,
  commandInput: PnpOpsCommandInput,
  tokenProvider: PnpOpsTokenProvider,
  fetchImpl: typeof fetch = fetch,
): Promise<PnpOpsPreflightResponse> {
  const response = await fetchImpl(`${normalizeBaseUrl(legacyBaseUrl)}/api/admin/preflight`, {
    method: 'POST',
    headers: await buildAuthHeaders(tokenProvider, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      actionKey,
      targetEntityId: commandInput.targetSiteUrl,
      commandInput,
    }),
  });
  await assertOk(response, 'Preflight');
  const payload = await readJson<ApiEnvelope<PnpOpsPreflightResponse>>(response);
  return payload.data;
}

export async function launchLegacyRun(
  legacyBaseUrl: string,
  actionKey: PnpOpsActionKey,
  commandInput: PnpOpsCommandInput,
  tokenProvider: PnpOpsTokenProvider,
  fetchImpl: typeof fetch = fetch,
): Promise<PnpOpsRunLaunchResponse> {
  const response = await fetchImpl(`${normalizeBaseUrl(legacyBaseUrl)}/api/admin/runs`, {
    method: 'POST',
    headers: await buildAuthHeaders(tokenProvider, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      actionKey,
      targetEntityId: commandInput.targetSiteUrl,
      commandInput,
      dryRun: false,
    }),
  });
  await assertOk(response, 'Run launch');
  const payload = await readJson<ApiEnvelope<PnpOpsRunLaunchResponse>>(response);
  return payload.data;
}

export async function fetchLegacyRun(
  legacyBaseUrl: string,
  runId: string,
  tokenProvider: PnpOpsTokenProvider,
  fetchImpl: typeof fetch = fetch,
): Promise<PnpOpsRunEnvelope> {
  const response = await fetchImpl(`${normalizeBaseUrl(legacyBaseUrl)}/api/admin/runs/${encodeURIComponent(runId)}`, {
    headers: await buildAuthHeaders(tokenProvider),
  });
  await assertOk(response, 'Run status');
  const payload = await readJson<ApiEnvelope<PnpOpsRunEnvelope>>(response);
  return payload.data;
}

export async function fetchLegacyRunEvidence(
  legacyBaseUrl: string,
  runId: string,
  tokenProvider: PnpOpsTokenProvider,
  fetchImpl: typeof fetch = fetch,
): Promise<PnpOpsRunEvidenceResponse> {
  const response = await fetchImpl(`${normalizeBaseUrl(legacyBaseUrl)}/api/admin/runs/${encodeURIComponent(runId)}/evidence`, {
    headers: await buildAuthHeaders(tokenProvider),
  });
  await assertOk(response, 'Run evidence');
  const payload = await readJson<ApiEnvelope<PnpOpsRunEvidenceResponse>>(response);
  return payload.data;
}

