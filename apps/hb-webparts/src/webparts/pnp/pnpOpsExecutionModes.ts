/**
 * Prompt-01 phase lock: canonical non-Azure execution model for PnP Ops.
 * Runtime cutover is intentionally deferred to Prompt-02+.
 */

export type PnpOpsExecutionMode =
  | 'local-runner'
  | 'remote-runner'
  | 'mock'
  | 'legacy-admin-api';

export interface PnpOpsRunnerConfig {
  readonly executionMode: PnpOpsExecutionMode;
  readonly runnerBaseUrl: string;
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

/**
 * @deprecated Prompt-01 migration compatibility only.
 * Remove after frontend transport cutover to local/remote runner contract.
 */
export const PNP_OPS_LEGACY_MODE: PnpOpsExecutionMode = 'legacy-admin-api';
