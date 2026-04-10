import type { AdminActionMetadataDto, PnpOpsActionKey } from './pnpOpsActionCatalog.js';
import {
  PNP_OPS_RUNNER_ENDPOINTS,
  type PnpOpsExecutionMode,
} from './pnpOpsExecutionModes.js';
import {
  ApiEnvelope,
  ApiListEnvelope,
  assertOk,
  normalizeBaseUrl,
  readJson,
} from './pnpOpsTransport.js';
import type {
  PnpOpsClientConfig,
  PnpOpsCommandInput,
  PnpOpsPreflightResponse,
  PnpOpsRunEnvelope,
  PnpOpsRunEvidenceResponse,
  PnpOpsRunLaunchResponse,
} from './pnpOpsClient.js';

interface RunnerPathParams {
  readonly id?: string;
  readonly artifactId?: string;
}

function buildRunnerPath(
  endpoint: string,
  params: RunnerPathParams = {},
): string {
  return endpoint
    .replace('{id}', encodeURIComponent(params.id ?? ''))
    .replace('{artifactId}', encodeURIComponent(params.artifactId ?? ''));
}

function buildRunnerUrl(baseUrl: string, endpoint: string, params?: RunnerPathParams): string {
  return `${normalizeBaseUrl(baseUrl)}${buildRunnerPath(endpoint, params)}`;
}

function runnerHeaders(config: PnpOpsClientConfig, includeJsonContentType = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (includeJsonContentType) {
    headers['Content-Type'] = 'application/json';
  }
  if (typeof config.runnerApiKey === 'string' && config.runnerApiKey.trim().length > 0) {
    headers['X-Pnp-Runner-Key'] = config.runnerApiKey.trim();
  }
  return headers;
}

export function isRunnerMode(mode: PnpOpsExecutionMode): boolean {
  return mode === 'local-runner' || mode === 'remote-runner';
}

export async function fetchRunnerActionMetadata(
  config: PnpOpsClientConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<readonly AdminActionMetadataDto[]> {
  const response = await fetchImpl(buildRunnerUrl(config.runnerBaseUrl, PNP_OPS_RUNNER_ENDPOINTS.actions), {
    headers: runnerHeaders(config),
  });
  await assertOk(response, 'Action catalog load');
  const payload = await readJson<ApiListEnvelope<AdminActionMetadataDto>>(response);
  return payload.items ?? [];
}

export async function runRunnerPreflight(
  config: PnpOpsClientConfig,
  actionKey: PnpOpsActionKey,
  commandInput: PnpOpsCommandInput,
  fetchImpl: typeof fetch = fetch,
): Promise<PnpOpsPreflightResponse> {
  const response = await fetchImpl(buildRunnerUrl(config.runnerBaseUrl, PNP_OPS_RUNNER_ENDPOINTS.preflight), {
    method: 'POST',
    headers: runnerHeaders(config, true),
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

export async function launchRunnerRun(
  config: PnpOpsClientConfig,
  actionKey: PnpOpsActionKey,
  commandInput: PnpOpsCommandInput,
  fetchImpl: typeof fetch = fetch,
): Promise<PnpOpsRunLaunchResponse> {
  const response = await fetchImpl(buildRunnerUrl(config.runnerBaseUrl, PNP_OPS_RUNNER_ENDPOINTS.runs), {
    method: 'POST',
    headers: runnerHeaders(config, true),
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

export async function fetchRunnerRun(
  config: PnpOpsClientConfig,
  runId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PnpOpsRunEnvelope> {
  const response = await fetchImpl(
    buildRunnerUrl(config.runnerBaseUrl, PNP_OPS_RUNNER_ENDPOINTS.runById, { id: runId }),
    { headers: runnerHeaders(config) },
  );
  await assertOk(response, 'Run status');
  const payload = await readJson<ApiEnvelope<PnpOpsRunEnvelope>>(response);
  return payload.data;
}

export async function fetchRunnerRunEvidence(
  config: PnpOpsClientConfig,
  runId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PnpOpsRunEvidenceResponse> {
  const response = await fetchImpl(
    buildRunnerUrl(config.runnerBaseUrl, PNP_OPS_RUNNER_ENDPOINTS.runEvidence, { id: runId }),
    { headers: runnerHeaders(config) },
  );
  await assertOk(response, 'Run evidence');
  const payload = await readJson<ApiEnvelope<PnpOpsRunEvidenceResponse>>(response);
  return payload.data;
}
