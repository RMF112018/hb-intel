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

export function isRunnerMode(mode: PnpOpsExecutionMode): boolean {
  return mode === 'local-runner' || mode === 'remote-runner';
}

export async function fetchRunnerActionMetadata(
  runnerBaseUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<readonly AdminActionMetadataDto[]> {
  const response = await fetchImpl(buildRunnerUrl(runnerBaseUrl, PNP_OPS_RUNNER_ENDPOINTS.actions));
  await assertOk(response, 'Action catalog load');
  const payload = await readJson<ApiListEnvelope<AdminActionMetadataDto>>(response);
  return payload.items ?? [];
}

export async function runRunnerPreflight(
  runnerBaseUrl: string,
  actionKey: PnpOpsActionKey,
  commandInput: PnpOpsCommandInput,
  fetchImpl: typeof fetch = fetch,
): Promise<PnpOpsPreflightResponse> {
  const response = await fetchImpl(buildRunnerUrl(runnerBaseUrl, PNP_OPS_RUNNER_ENDPOINTS.preflight), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  runnerBaseUrl: string,
  actionKey: PnpOpsActionKey,
  commandInput: PnpOpsCommandInput,
  fetchImpl: typeof fetch = fetch,
): Promise<PnpOpsRunLaunchResponse> {
  const response = await fetchImpl(buildRunnerUrl(runnerBaseUrl, PNP_OPS_RUNNER_ENDPOINTS.runs), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  runnerBaseUrl: string,
  runId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PnpOpsRunEnvelope> {
  const response = await fetchImpl(
    buildRunnerUrl(runnerBaseUrl, PNP_OPS_RUNNER_ENDPOINTS.runById, { id: runId }),
  );
  await assertOk(response, 'Run status');
  const payload = await readJson<ApiEnvelope<PnpOpsRunEnvelope>>(response);
  return payload.data;
}

export async function fetchRunnerRunEvidence(
  runnerBaseUrl: string,
  runId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PnpOpsRunEvidenceResponse> {
  const response = await fetchImpl(
    buildRunnerUrl(runnerBaseUrl, PNP_OPS_RUNNER_ENDPOINTS.runEvidence, { id: runId }),
  );
  await assertOk(response, 'Run evidence');
  const payload = await readJson<ApiEnvelope<PnpOpsRunEvidenceResponse>>(response);
  return payload.data;
}

