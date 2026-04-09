import type { AdminActionMetadataDto, PnpOpsActionKey } from './pnpOpsActionCatalog.js';

export interface PnpOpsRunLaunchResponse {
  readonly runId: string;
  readonly status: string;
  readonly actionKey: string;
}

export interface PnpOpsStepResult {
  readonly stepNumber: number;
  readonly stepLabel: string;
  readonly status: string;
  readonly errorMessage: string | null;
}

export interface PnpOpsRunEnvelope {
  readonly runId: string;
  readonly status: string;
  readonly actionKey: string;
  readonly totalSteps: number;
  readonly currentStep: number | null;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
  readonly steps: readonly PnpOpsStepResult[];
}

export interface PnpOpsPreflightResponse {
  readonly ready: boolean;
  readonly checks: readonly {
    readonly checkId: string;
    readonly label: string;
    readonly passed: boolean;
    readonly message: string;
    readonly blocking: boolean;
  }[];
}

export interface PnpOpsRunEvidenceResponse {
  readonly runId: string;
  readonly evidenceRefs: readonly unknown[];
  readonly total: number;
}

export interface PnpOpsCommandInput {
  readonly targetSiteUrl: string;
  readonly listFilters?: readonly string[];
  readonly pageFilters?: readonly string[];
  readonly executionIntent: {
    readonly mode: 'read-only-export';
    readonly source: 'spfx-webpart';
    readonly requestedAt: string;
  };
}

interface ApiEnvelope<T> {
  readonly data: T;
}

interface ApiListEnvelope<T> {
  readonly items: readonly T[];
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as T | null;
  if (!payload) {
    throw new Error(`Unexpected empty response (${response.status}).`);
  }
  return payload;
}

async function assertOk(response: Response, operation: string): Promise<void> {
  if (!response.ok) {
    const message = await response
      .json()
      .then((body) => (body as { message?: string }).message)
      .catch(() => undefined);
    throw new Error(`${operation} failed (${response.status}): ${message ?? response.statusText}`);
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}

export async function fetchPnpActionMetadata(
  backendUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<readonly AdminActionMetadataDto[]> {
  const response = await fetchImpl(`${normalizeBaseUrl(backendUrl)}/api/admin/actions`);
  await assertOk(response, 'Action catalog load');
  const payload = await readJson<ApiListEnvelope<AdminActionMetadataDto>>(response);
  return payload.items ?? [];
}

export async function runPnpPreflight(
  backendUrl: string,
  actionKey: PnpOpsActionKey,
  commandInput: PnpOpsCommandInput,
  fetchImpl: typeof fetch = fetch,
): Promise<PnpOpsPreflightResponse> {
  const response = await fetchImpl(`${normalizeBaseUrl(backendUrl)}/api/admin/preflight`, {
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

export async function launchPnpRun(
  backendUrl: string,
  actionKey: PnpOpsActionKey,
  commandInput: PnpOpsCommandInput,
  fetchImpl: typeof fetch = fetch,
): Promise<PnpOpsRunLaunchResponse> {
  const response = await fetchImpl(`${normalizeBaseUrl(backendUrl)}/api/admin/runs`, {
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

export async function fetchPnpRun(
  backendUrl: string,
  runId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PnpOpsRunEnvelope> {
  const response = await fetchImpl(`${normalizeBaseUrl(backendUrl)}/api/admin/runs/${encodeURIComponent(runId)}`);
  await assertOk(response, 'Run status');
  const payload = await readJson<ApiEnvelope<PnpOpsRunEnvelope>>(response);
  return payload.data;
}

export async function fetchPnpRunEvidence(
  backendUrl: string,
  runId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PnpOpsRunEvidenceResponse> {
  const response = await fetchImpl(`${normalizeBaseUrl(backendUrl)}/api/admin/runs/${encodeURIComponent(runId)}/evidence`);
  await assertOk(response, 'Run evidence');
  const payload = await readJson<ApiEnvelope<PnpOpsRunEvidenceResponse>>(response);
  return payload.data;
}
