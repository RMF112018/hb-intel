/**
 * Canonical non-Azure execution model for PnP Ops.
 * Prompt-02 consumes this model as the frontend runtime source of truth.
 */

export type PnpOpsExecutionMode =
  | 'local-runner'
  | 'remote-runner'
  | 'mock'
  | 'legacy-admin-api';

export interface PnpOpsRunnerConfig {
  readonly executionMode: PnpOpsExecutionMode;
  readonly runnerBaseUrl: string;
  readonly runnerApiKey?: string;
  readonly defaultTargetSiteUrl: string;
  readonly legacyAdminApiBaseUrl?: string;
  readonly mockMode?: boolean;
}

export const PNP_OPS_RUNNER_ENDPOINTS = {
  actions: '/actions',
  preflight: '/preflight',
  runs: '/runs',
  runById: '/runs/{id}',
  runEvidence: '/runs/{id}/evidence',
  runArtifactDownload: '/runs/{id}/artifacts/{artifactId}/download',
  health: '/health',
  capabilities: '/capabilities',
} as const;

export function isPnpOpsExecutionMode(value: string | null | undefined): value is PnpOpsExecutionMode {
  return value === 'local-runner'
    || value === 'remote-runner'
    || value === 'mock'
    || value === 'legacy-admin-api';
}

export function resolvePnpOpsExecutionMode(input: Record<string, unknown> | undefined): PnpOpsExecutionMode {
  if (input?.mockMode === true) {
    return 'mock';
  }
  const configured = typeof input?.executionMode === 'string'
    ? input.executionMode.trim()
    : '';
  if (isPnpOpsExecutionMode(configured)) {
    return configured;
  }

  // Backward compatibility for Prompt-01/legacy backendUrl-only configurations.
  if (typeof input?.backendUrl === 'string' && input.backendUrl.trim().length > 0) {
    return PNP_OPS_LEGACY_MODE;
  }
  return 'local-runner';
}

/**
 * @deprecated Prompt-01 migration compatibility only.
 * Remove after frontend transport cutover to local/remote runner contract.
 */
export const PNP_OPS_LEGACY_MODE: PnpOpsExecutionMode = 'legacy-admin-api';
