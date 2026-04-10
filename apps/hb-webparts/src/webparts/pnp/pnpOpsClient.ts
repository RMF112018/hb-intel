import type { AdminActionMetadataDto, PnpOpsActionKey } from './pnpOpsActionCatalog.js';
import {
  PNP_OPS_LEGACY_MODE,
  type PnpOpsExecutionMode,
} from './pnpOpsExecutionModes.js';
import {
  fetchLegacyActionMetadata,
  fetchLegacyRun,
  fetchLegacyRunEvidence,
  launchLegacyRun,
  runLegacyPreflight,
} from './pnpOpsLegacyAdminClient.js';
import {
  fetchRunnerActionMetadata,
  fetchRunnerRun,
  fetchRunnerRunEvidence,
  isRunnerMode,
  launchRunnerRun,
  runRunnerPreflight,
} from './pnpOpsRunnerClient.js';

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
  readonly evidenceRefs: readonly PnpOpsEvidenceRef[];
  readonly total: number;
}

export interface PnpOpsEvidenceRef {
  readonly evidenceId?: string;
  readonly label?: string;
  readonly note?: string;
  readonly fileName?: string;
  readonly contentType?: string | null;
  readonly sizeBytes?: number | null;
  readonly isBundle?: boolean;
  readonly bundleFormat?: string | null;
  readonly availability?: string | null;
  readonly downloadUrl?: string | null;
  readonly url?: string | null;
  readonly href?: string | null;
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

export interface PnpOpsClientConfig {
  readonly executionMode: PnpOpsExecutionMode;
  readonly runnerBaseUrl: string;
  readonly legacyAdminApiBaseUrl?: string;
}

export type PnpOpsTokenProvider = (() => Promise<string>) | undefined;

function resolveLegacyBaseUrl(config: PnpOpsClientConfig): string {
  return config.legacyAdminApiBaseUrl?.trim() || config.runnerBaseUrl.trim();
}

export async function fetchPnpActionMetadata(
  config: PnpOpsClientConfig,
  tokenProvider: PnpOpsTokenProvider,
  fetchImpl: typeof fetch = fetch,
): Promise<readonly AdminActionMetadataDto[]> {
  if (isRunnerMode(config.executionMode)) {
    return fetchRunnerActionMetadata(config.runnerBaseUrl, fetchImpl);
  }
  if (config.executionMode === PNP_OPS_LEGACY_MODE) {
    return fetchLegacyActionMetadata(resolveLegacyBaseUrl(config), tokenProvider, fetchImpl);
  }
  return [];
}

export async function runPnpPreflight(
  config: PnpOpsClientConfig,
  actionKey: PnpOpsActionKey,
  commandInput: PnpOpsCommandInput,
  tokenProvider: PnpOpsTokenProvider,
  fetchImpl: typeof fetch = fetch,
): Promise<PnpOpsPreflightResponse> {
  if (isRunnerMode(config.executionMode)) {
    return runRunnerPreflight(config.runnerBaseUrl, actionKey, commandInput, fetchImpl);
  }
  return runLegacyPreflight(resolveLegacyBaseUrl(config), actionKey, commandInput, tokenProvider, fetchImpl);
}

export async function launchPnpRun(
  config: PnpOpsClientConfig,
  actionKey: PnpOpsActionKey,
  commandInput: PnpOpsCommandInput,
  tokenProvider: PnpOpsTokenProvider,
  fetchImpl: typeof fetch = fetch,
): Promise<PnpOpsRunLaunchResponse> {
  if (isRunnerMode(config.executionMode)) {
    return launchRunnerRun(config.runnerBaseUrl, actionKey, commandInput, fetchImpl);
  }
  return launchLegacyRun(resolveLegacyBaseUrl(config), actionKey, commandInput, tokenProvider, fetchImpl);
}

export async function fetchPnpRun(
  config: PnpOpsClientConfig,
  runId: string,
  tokenProvider: PnpOpsTokenProvider,
  fetchImpl: typeof fetch = fetch,
): Promise<PnpOpsRunEnvelope> {
  if (isRunnerMode(config.executionMode)) {
    return fetchRunnerRun(config.runnerBaseUrl, runId, fetchImpl);
  }
  return fetchLegacyRun(resolveLegacyBaseUrl(config), runId, tokenProvider, fetchImpl);
}

export async function fetchPnpRunEvidence(
  config: PnpOpsClientConfig,
  runId: string,
  tokenProvider: PnpOpsTokenProvider,
  fetchImpl: typeof fetch = fetch,
): Promise<PnpOpsRunEvidenceResponse> {
  if (isRunnerMode(config.executionMode)) {
    return fetchRunnerRunEvidence(config.runnerBaseUrl, runId, fetchImpl);
  }
  return fetchLegacyRunEvidence(resolveLegacyBaseUrl(config), runId, tokenProvider, fetchImpl);
}

