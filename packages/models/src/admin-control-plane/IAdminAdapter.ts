/**
 * Admin Control Plane — adapter registry and normalized execution result contracts.
 *
 * These types define how platform-specific adapters are described, invoked,
 * and how their results are normalized for the control plane. They enable
 * the orchestrator to route work through adapters without each adapter
 * inventing its own result shape.
 *
 * @module admin-control-plane
 */

import type { AdminDomain } from './AdminEnums.js';
import type { IAdminActorContext } from './IAdminRun.js';
import type { IAdminEvidenceReference } from './IAdminAudit.js';

// ─── Adapter Categories ─────────────────────────────────────────────────────────

/**
 * Categories of platform-specific adapters in the admin control plane.
 *
 * Each category represents a distinct external platform or capability
 * that the control plane invokes through an adapter.
 */
export enum AdminAdapterCategory {
  /** Azure resource deployment (Bicep/ARM — resource groups, storage, Function Apps) */
  AzureDeployment = 'azure-deployment',

  /** Microsoft Entra ID / Graph API (users, groups, app registrations, role assignments) */
  EntraGraph = 'entra-graph',

  /** SharePoint ALM and package management (app catalog, package deployment, site install) */
  SharePointAlm = 'sharepoint-alm',

  /** SharePoint API access and approval posture (API permissions, consent) */
  SharePointApiAccess = 'sharepoint-api-access',

  /** SharePoint site lifecycle (create, configure, hub associate, permissions) */
  SharePointSite = 'sharepoint-site',

  /** Validation and environment probes (readiness checks, health probes) */
  ValidationProbe = 'validation-probe',

  /** Azure Table Storage persistence (run store, audit store) */
  TableStorage = 'table-storage',

  /** SignalR real-time communication (progress push, group management) */
  SignalR = 'signalr',

  /** Notification dispatch (email, Teams webhook) */
  Notification = 'notification',
}

// ─── Adapter Descriptor ─────────────────────────────────────────────────────────

/**
 * Metadata describing a registered adapter.
 *
 * Adapter descriptors are used by the orchestrator to discover available
 * adapters, check capabilities, and route invocations. They are static
 * metadata, not runtime instances.
 */
export interface IAdminAdapterDescriptor {
  /** Unique adapter key (e.g., 'entra-graph:group-lifecycle') */
  readonly adapterKey: string;

  /** Adapter category */
  readonly category: AdminAdapterCategory;

  /** Human-readable label */
  readonly label: string;

  /** Brief description of what this adapter does */
  readonly description: string;

  /** Admin domains this adapter serves */
  readonly domains: readonly AdminDomain[];

  /** Whether this adapter supports dry-run / preview execution */
  readonly supportsDryRun: boolean;

  /** Whether this adapter supports compensation / rollback */
  readonly supportsCompensation: boolean;

  /** Whether this adapter is idempotent (safe to re-invoke on retry) */
  readonly idempotent: boolean;

  /** Operations this adapter can perform */
  readonly operations: readonly string[];

  /** Current implementation status */
  readonly implementationStatus: 'implemented' | 'partial' | 'planned';
}

// ─── Invocation Context ─────────────────────────────────────────────────────────

/**
 * Context passed to an adapter when it is invoked by the orchestrator.
 *
 * The invocation context provides everything the adapter needs to execute
 * without requiring it to look up run, actor, or config state itself.
 */
export interface IAdminAdapterInvocationContext {
  /** Run ID this invocation belongs to */
  readonly runId: string;

  /** Step number within the run */
  readonly stepNumber: number;

  /** Operator who initiated the run */
  readonly actor: IAdminActorContext;

  /** Whether this is a dry-run / preview invocation */
  readonly dryRun: boolean;

  /** Whether this is a retry of a previously failed step */
  readonly isRetry: boolean;

  /** Retry attempt number (0 for first attempt) */
  readonly retryAttempt: number;

  /** Correlation ID for tracing across adapter calls */
  readonly correlationId: string;

  /** Domain-specific input payload for this adapter invocation */
  readonly input: Record<string, unknown>;

  /** Config/standards values relevant to this invocation (pre-resolved by orchestrator) */
  readonly resolvedConfig: Record<string, unknown>;
}

// ─── Normalized Adapter Result ──────────────────────────────────────────────────

/**
 * Outcome classification for an adapter invocation.
 */
export enum AdminAdapterOutcome {
  /** Adapter completed successfully */
  Success = 'success',

  /** Adapter completed with warnings (non-blocking issues detected) */
  SuccessWithWarnings = 'success-with-warnings',

  /** Adapter failed (blocking error) */
  Failed = 'failed',

  /** Adapter was skipped (already completed, not applicable) */
  Skipped = 'skipped',

  /** Dry-run completed (no state changes made) */
  DryRunComplete = 'dry-run-complete',
}

/**
 * Normalized result from any adapter invocation.
 *
 * All adapters return this shape regardless of the platform they interact
 * with. Platform-specific details go in `adapterSpecificData`. The
 * orchestrator uses only the normalized fields for run progression,
 * failure handling, and audit recording.
 */
export interface IAdminAdapterResult {
  /** Adapter key that produced this result */
  readonly adapterKey: string;

  /** Outcome classification */
  readonly outcome: AdminAdapterOutcome;

  /** Human-readable summary of what happened */
  readonly summary: string;

  /** Duration of the adapter invocation in milliseconds */
  readonly durationMs: number;

  // ── Warnings and Issues ───────────────────────────────────────────────────

  /** Non-blocking warnings detected during execution */
  readonly warnings: readonly IAdminAdapterWarning[];

  /** Blocking issues that caused failure (empty if outcome is not Failed) */
  readonly issues: readonly IAdminAdapterIssue[];

  // ── Remediation ───────────────────────────────────────────────────────────

  /** Suggested remediation steps if the adapter failed or produced warnings */
  readonly remediationHints: readonly IAdminRemediationHint[];

  // ── Evidence ──────────────────────────────────────────────────────────────

  /** Evidence references produced by this invocation (empty if none) */
  readonly evidenceRefs: readonly IAdminEvidenceReference[];

  // ── Adapter-Specific Data ─────────────────────────────────────────────────

  /**
   * Platform-specific output data. The orchestrator does not interpret this;
   * it is passed through to evidence recording and domain-specific display.
   */
  readonly adapterSpecificData: Record<string, unknown> | null;

  // ── Idempotency ───────────────────────────────────────────────────────────

  /** Whether the adapter detected this was a duplicate invocation and skipped work */
  readonly deduplicatedInvocation: boolean;
}

// ─── Warning / Issue / Remediation ──────────────────────────────────────────────

/**
 * Non-blocking warning from an adapter invocation.
 */
export interface IAdminAdapterWarning {
  /** Warning code (adapter-specific, machine-readable) */
  readonly code: string;

  /** Human-readable warning message */
  readonly message: string;

  /** Resource or entity the warning applies to (null if general) */
  readonly resource: string | null;
}

/**
 * Blocking issue that caused an adapter invocation to fail.
 */
export interface IAdminAdapterIssue {
  /** Issue code (adapter-specific, machine-readable) */
  readonly code: string;

  /** Human-readable issue description */
  readonly message: string;

  /** Resource or entity the issue applies to (null if general) */
  readonly resource: string | null;

  /** Whether this issue is likely transient (retry may help) */
  readonly transient: boolean;
}

/**
 * Suggested remediation step for a warning or issue.
 */
export interface IAdminRemediationHint {
  /** Human-readable remediation instruction */
  readonly instruction: string;

  /** Who should perform this remediation (operator, IT admin, DevOps) */
  readonly audience: 'operator' | 'it-admin' | 'devops';

  /** Optional link to documentation or runbook */
  readonly documentationUrl: string | null;
}
