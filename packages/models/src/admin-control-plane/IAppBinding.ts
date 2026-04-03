/**
 * Admin Control Plane — managed app-binding contracts.
 *
 * These types define the shared contract surface for durable per-app
 * backend-setup configuration records, publication, retrieval, verification,
 * drift detection, and repair actions.
 *
 * Design principle: this slice is intentionally minimal and forward-compatible
 * with later Phase 10 configuration governance. It covers only the 4 binding
 * fields required by managed SPFx apps today. The contract is extensible but
 * must not become a general-purpose configuration DSL.
 *
 * @module admin-control-plane
 */

import type { IAdminActorContext } from './IAdminRun.js';

// ─── Binding Mode ──────────────────────────────────────────────────────────────

/**
 * Runtime backend mode for managed SPFx apps.
 *
 * Extracted as a shared type to eliminate per-app duplication.
 * Both Accounting and Project Setup already use this exact union.
 */
export type BackendMode = 'production' | 'ui-review';

// ─── Binding Status ────────────────────────────────────────────────────────────

/**
 * Durable status of a managed-app binding record.
 *
 * Status transitions:
 *   NotConfigured → PendingPublication → Active → Drifted → Active (repair)
 *   Any → Error (on infrastructure failure)
 *   Any → Superseded (when replaced by Phase 10 config governance)
 */
export enum AppBindingStatus {
  /** No binding record exists for this managed app */
  NotConfigured = 'NotConfigured',

  /** Binding publication has been requested but not yet completed */
  PendingPublication = 'PendingPublication',

  /** Binding is published and either verified or awaiting first verification */
  Active = 'Active',

  /** Verification detected a mismatch between published binding and live state */
  Drifted = 'Drifted',

  /** Binding has been replaced by a broader config governance record (Phase 10) */
  Superseded = 'Superseded',

  /** Binding publication or verification encountered an infrastructure error */
  Error = 'Error',
}

// ─── Binding Verification ──────────────────────────────────────────────────────

/**
 * Result classification for a single binding verification check.
 */
export type AppBindingVerificationOutcome = 'passed' | 'drifted' | 'inconclusive';

// ─── Binding Record ────────────────────────────────────────────────────────────

/**
 * Durable per-app binding record.
 *
 * Each managed SPFx app has exactly one active binding record at any time.
 * The record is the control-plane source of truth for what backend configuration
 * values the target app should be using.
 *
 * The 4 binding fields (`functionAppUrl`, `apiAudience`, `backendMode`,
 * `allowBackendModeSwitch`) match the `IRuntimeConfig` shape already
 * implemented in both Accounting and Project Setup apps.
 */
export interface IAppBindingRecord {
  // ── Identity ────────────────────────────────────────────

  /** Canonical managed app identifier (e.g., 'accounting', 'project-setup') */
  readonly appId: string;

  // ── Binding Fields ──────────────────────────────────────

  /** Azure Function App base URL */
  readonly functionAppUrl: string;

  /** API audience URI for SPFx token acquisition (e.g., 'api://<client-id>') */
  readonly apiAudience: string;

  /** Runtime backend mode */
  readonly backendMode: BackendMode;

  /** Whether the target app may switch backend modes at runtime */
  readonly allowBackendModeSwitch: boolean;

  // ── Version and Status ──────────────────────────────────

  /** Monotonically increasing version counter */
  readonly version: number;

  /** Current binding posture */
  readonly status: AppBindingStatus;

  // ── Publication Metadata ────────────────────────────────

  /** ISO 8601 timestamp when this binding version was published */
  readonly publishedAt: string;

  /** Actor who published this binding version */
  readonly publishedBy: IAdminActorContext;

  /** What triggered publication (e.g., 'install-run:<runId>', 'manual-repair') */
  readonly publishSource: string;

  // ── Verification Metadata ───────────────────────────────

  /** ISO 8601 timestamp when binding was last verified against live state */
  readonly lastVerifiedAt: string | null;

  /** Result of the most recent verification */
  readonly lastVerificationResult: AppBindingVerificationOutcome | null;
}

// ─── Binding Retrieval ─────────────────────────────────────────────────────────

/**
 * Response shape for target-app binding retrieval.
 *
 * This is the payload returned by the binding resolution API.
 * It includes only the fields needed by the target app at runtime
 * plus minimal metadata for diagnostics.
 */
export interface IAppBindingRetrievalResponse {
  /** Canonical managed app identifier */
  readonly appId: string;

  /** Azure Function App base URL */
  readonly functionAppUrl: string;

  /** API audience URI */
  readonly apiAudience: string;

  /** Runtime backend mode */
  readonly backendMode: BackendMode;

  /** Whether the target app may switch backend modes */
  readonly allowBackendModeSwitch: boolean;

  /** Binding version for cache-busting and diagnostics */
  readonly version: number;

  /** Current binding posture */
  readonly status: AppBindingStatus;

  /** ISO 8601 timestamp of publication */
  readonly publishedAt: string;
}

// ─── Binding Publication ───────────────────────────────────────────────────────

/**
 * Request to publish or update a managed-app binding record.
 */
export interface IAppBindingPublishRequest {
  /** Canonical managed app identifier */
  readonly appId: string;

  /** Azure Function App base URL */
  readonly functionAppUrl: string;

  /** API audience URI */
  readonly apiAudience: string;

  /** Runtime backend mode */
  readonly backendMode: BackendMode;

  /** Whether the target app may switch backend modes */
  readonly allowBackendModeSwitch: boolean;

  /** What triggered this publication (e.g., 'install-run:<runId>', 'manual-publish') */
  readonly publishSource: string;
}

/**
 * Result of a binding publication operation.
 */
export interface IAppBindingPublishResult {
  /** Canonical managed app identifier */
  readonly appId: string;

  /** New binding version after publication */
  readonly version: number;

  /** Binding status after publication */
  readonly status: AppBindingStatus;

  /** ISO 8601 timestamp of publication */
  readonly publishedAt: string;

  /** Whether this was a new record (true) or an update to existing (false) */
  readonly created: boolean;
}

// ─── Binding Verification ──────────────────────────────────────────────────────

/**
 * Per-field drift finding from a binding verification check.
 */
export interface IAppBindingDriftFinding {
  /** Binding field that drifted */
  readonly field: string;

  /** Published value in the binding record */
  readonly expected: string;

  /** Observed value from live infrastructure */
  readonly observed: string;

  /** Severity: critical (infrastructure gone/moved), warning (value mismatch), info (policy mismatch) */
  readonly severity: 'critical' | 'warning' | 'info';

  /** Human-readable description of the drift */
  readonly message: string;
}

/**
 * Result of verifying a managed-app binding against live infrastructure state.
 */
export interface IAppBindingVerificationResult {
  /** Canonical managed app identifier */
  readonly appId: string;

  /** Binding version that was verified */
  readonly version: number;

  /** Overall verification outcome */
  readonly outcome: AppBindingVerificationOutcome;

  /** ISO 8601 timestamp when verification completed */
  readonly verifiedAt: string;

  /** Per-field drift findings (empty if all checks passed) */
  readonly findings: readonly IAppBindingDriftFinding[];

  /** Number of checks that passed */
  readonly checksPassed: number;

  /** Total number of checks executed */
  readonly checksTotal: number;
}

// ─── Binding Repair ────────────────────────────────────────────────────────────

/**
 * Request to repair a drifted or errored binding.
 *
 * The operator may provide corrected values or request auto-detection
 * from live infrastructure state.
 */
export interface IAppBindingRepairRequest {
  /** Canonical managed app identifier */
  readonly appId: string;

  /** Corrected Function App URL (null to auto-detect from live state) */
  readonly functionAppUrl: string | null;

  /** Corrected API audience (null to auto-detect from live state) */
  readonly apiAudience: string | null;

  /** Corrected backend mode (null to keep current) */
  readonly backendMode: BackendMode | null;

  /** Corrected mode-switch policy (null to keep current) */
  readonly allowBackendModeSwitch: boolean | null;

  /** Operator rationale for the repair */
  readonly rationale: string;
}

/**
 * Result of a binding repair operation.
 */
export interface IAppBindingRepairResult {
  /** Canonical managed app identifier */
  readonly appId: string;

  /** New binding version after repair */
  readonly version: number;

  /** Binding status after repair (normally Active) */
  readonly status: AppBindingStatus;

  /** ISO 8601 timestamp of repair publication */
  readonly repairedAt: string;

  /** Number of fields that were changed during repair */
  readonly fieldsChanged: number;
}

// ─── Binding Status Summary ────────────────────────────────────────────────────

/**
 * Summary of binding posture for a single managed app.
 *
 * Used by the Admin UX to display binding status dashboards.
 */
export interface IAppBindingStatusSummary {
  /** Canonical managed app identifier */
  readonly appId: string;

  /** Human-readable app label */
  readonly appLabel: string;

  /** Current binding posture */
  readonly status: AppBindingStatus;

  /** Current binding version (0 if not configured) */
  readonly version: number;

  /** ISO 8601 timestamp of last publication (null if not configured) */
  readonly publishedAt: string | null;

  /** ISO 8601 timestamp of last verification (null if never verified) */
  readonly lastVerifiedAt: string | null;

  /** Result of most recent verification (null if never verified) */
  readonly lastVerificationResult: AppBindingVerificationOutcome | null;

  /** Number of active drift findings (0 if verified or not checked) */
  readonly activeDriftCount: number;
}

// ─── Binding Action Keys ───────────────────────────────────────────────────────

/**
 * Well-known action keys for binding operations.
 *
 * Follows the `domain:family:verb` pattern established by INSTALL_ACTION_KEYS.
 */
export const APP_BINDING_ACTION_KEYS = {
  PUBLISH: 'app-binding:binding:publish' as const,
  VERIFY: 'app-binding:binding:verify' as const,
  REPAIR: 'app-binding:binding:repair' as const,
} as const;

/** Union type of all app-binding action key values */
export type AppBindingActionKey =
  (typeof APP_BINDING_ACTION_KEYS)[keyof typeof APP_BINDING_ACTION_KEYS];
