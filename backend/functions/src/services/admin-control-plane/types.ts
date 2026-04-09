/**
 * Admin Control Plane — service interfaces for the generalized admin backend.
 *
 * These interfaces define the contracts that admin-control-plane route handlers
 * depend on. Implementations are created in later Phase 3 prompts (P3-04 through
 * P3-08); this file defines only the interfaces so the service container can be
 * typed and wired.
 *
 * Design principle: each interface is scoped to a single responsibility. Handlers
 * depend on the interface, not on the implementation. The service factory resolves
 * implementations at startup based on adapter mode (real/mock).
 *
 * All DTO types are imported from @hbc/models/admin-control-plane (Phase 2 contracts).
 *
 * @module admin-control-plane/services
 */

import type {
  AdminActionKey,
  IAdminRunEnvelope,
  IAdminRunLaunchRequest,
  IAdminRunLaunchResponse,
  IAdminRunSummary,
  IAdminStepResult,
  IAdminFailureSummary,
  AdminRunStatus,
  AdminExecutionMode,
  AdminRiskLevel,
  IAdminPreflightRequest,
  IAdminPreflightResponse,
  IAdminAdapterDescriptor,
  IAdminAdapterInvocationContext,
  IAdminAdapterResult,
  IAdminAuditRecord,
  AdminAuditEventType,
  IAdminActorContext,
  IAdminConfigResponse,
  IAdminEvidenceReference,
  IAppBindingRecord,
  IAppBindingPublishRequest,
  IAppBindingPublishResult,
  IAppBindingVerificationResult,
  IAppBindingRepairRequest,
  IAppBindingRepairResult,
  IObservabilityAlertRecord,
  IObservabilityAlertIngestionPayload,
  IObservabilityAlertQuery,
  IObservabilityAlertSummary,
  IObservabilityProbeSnapshotRecord,
  IObservabilityProbeSubmissionPayload,
  IObservabilityProbeSnapshotQuery,
  IObservabilityProbeHealthSummary,
  IObservabilityErrorRecord,
  IObservabilityErrorIngestionPayload,
  IObservabilityErrorQuery,
  IObservabilityPagedResponse,
} from '@hbc/models/admin-control-plane';

// Re-export PnP orchestrator interface from implementation module.
export type { IPnpOpsOrchestrator } from './pnp-orchestrator.js';

// Re-export IWhiteGloveRunService from the white-glove module
export type { IWhiteGloveRunService } from '../white-glove/white-glove-run-service.js';

// Re-export Microsoft device management service interfaces
export type { IMicrosoftIdentityService } from '../device-management/microsoft/microsoft-identity-service.js';
export type { IMicrosoftIntuneService } from '../device-management/microsoft/microsoft-intune-service.js';
export type { IMicrosoftAutopilotService } from '../device-management/microsoft/microsoft-autopilot-service.js';

// Re-export Apple device management service interfaces
export type { IAppleAbmService } from '../device-management/apple/apple-abm-service.js';
export type { IAppleAdeService } from '../device-management/apple/apple-ade-service.js';
export type { IAppleMdmService } from '../device-management/apple/apple-mdm-service.js';

// Re-export NinjaOne service interfaces
export type { INinjaOneApiService } from '../device-management/ninjaone/ninjaone-api-service.js';
export type { INinjaOneStandardizationService } from '../device-management/ninjaone/ninjaone-standardization-service.js';

// ─── Run Service ────────────────────────────────────────────────────────────────

/**
 * Manages admin run lifecycle: creation, status queries, and state transitions.
 *
 * Implemented in P3-05. Backed by Table Storage for persistence.
 */
export interface IAdminRunService {
  /** Create and launch a new admin run. */
  launchRun(request: IAdminRunLaunchRequest, actor: IAdminActorContext): Promise<IAdminRunLaunchResponse>;

  /** Get a single run by ID. Returns null if not found. */
  getRun(runId: string): Promise<IAdminRunEnvelope | null>;

  /** List runs with optional filtering and pagination. */
  listRuns(options: IAdminRunListOptions): Promise<IAdminRunListResult>;

  /** Cancel an in-progress run. Returns the updated envelope. */
  cancelRun(runId: string, actor: IAdminActorContext, reason?: string): Promise<IAdminRunEnvelope>;

  /** Retry a failed run. Creates a new run linked to the failed parent. */
  retryRun(parentRunId: string, actor: IAdminActorContext): Promise<IAdminRunLaunchResponse>;

  /** Apply controlled updates to an existing run envelope. */
  updateRun(runId: string, updates: IAdminRunUpdate): Promise<IAdminRunEnvelope>;
}

/** Controlled run-envelope updates used by backend orchestrators. */
export interface IAdminRunUpdate {
  readonly status?: AdminRunStatus;
  readonly executionMode?: AdminExecutionMode;
  readonly riskLevel?: AdminRiskLevel;
  readonly totalSteps?: number;
  readonly currentStep?: number | null;
  readonly steps?: readonly IAdminStepResult[];
  readonly startedAt?: string | null;
  readonly completedAt?: string | null;
  readonly failure?: IAdminFailureSummary | null;
  readonly commandInputRef?: string | null;
  readonly configSnapshotRef?: string | null;
  readonly targetEntityLabel?: string | null;
}

/** Options for listing admin runs. */
export interface IAdminRunListOptions {
  readonly domain?: string;
  readonly status?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

/** Paginated list of admin run summaries. */
export interface IAdminRunListResult {
  readonly items: readonly IAdminRunSummary[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

// ─── Adapter Registry ───────────────────────────────────────────────────────────

/**
 * Registry for admin control-plane adapters.
 *
 * Adapters are platform-specific execution units (Graph, SharePoint, Table Storage,
 * etc.) that the orchestrator routes work through. The registry provides discovery,
 * capability checking, and invocation.
 *
 * Implemented in P3-06.
 */
export interface IAdminAdapterRegistry {
  /** Register an adapter descriptor. */
  register(descriptor: IAdminAdapterDescriptor): void;

  /** Resolve an adapter descriptor by key. Returns null if not registered. */
  resolve(adapterKey: string): IAdminAdapterDescriptor | null;

  /** List all registered adapter descriptors. */
  listAll(): readonly IAdminAdapterDescriptor[];

  /** List adapters available for a specific action key. */
  listForAction(actionKey: AdminActionKey): readonly IAdminAdapterDescriptor[];

  /** Invoke an adapter with the given context. */
  invoke(adapterKey: string, context: IAdminAdapterInvocationContext): Promise<IAdminAdapterResult>;
}

// ─── Config Service ─────────────────────────────────────────────────────────────

/**
 * Provides access to admin configuration and standards state.
 *
 * The config service resolves configuration values by scope, supporting
 * the hybrid source-of-truth model (code defaults + live admin overrides).
 *
 * Full implementation deferred to Phase 10. Phase 3 provides a stub that
 * returns code-default values only.
 */
export interface IAdminConfigService {
  /** Get configuration for the specified scope. */
  getConfig(scope: string): Promise<IAdminConfigResponse>;
}

// ─── Config Override Store (Phase 10) ───────────────────────────────────────────

// Re-export the provider interface from its implementation module.
// This keeps all admin-control-plane service interfaces discoverable from types.ts.
export type { IConfigOverrideStore } from './config-override-store.js';

// Re-export the versioning service interface (P10-05).
export type { IConfigVersioningService } from './config-versioning-service.js';

// Re-export the resolution service and snapshot store interfaces (P10-06).
export type { IConfigResolutionService, IResolvableCatalogEntry, EnvReader } from './config-resolution-service.js';
export type { IConfigSnapshotStore } from './config-snapshot-store.js';

// ─── Audit Service ──────────────────────────────────────────────────────────────

/**
 * Records audit events and evidence references for admin control-plane actions.
 *
 * Audit records are the primary traceability mechanism. Evidence payloads
 * are stored separately and linked by reference.
 *
 * Full persistence implementation deferred to Phase 4. Phase 3 provides
 * an in-memory implementation for development and testing.
 */
export interface IAdminAuditService {
  /** Record an audit event. */
  recordEvent(record: IAdminAuditRecord): Promise<void>;

  /** List audit records for a run. */
  listByRunId(runId: string): Promise<readonly IAdminAuditRecord[]>;

  /** List audit records by event type. */
  listByEventType(eventType: AdminAuditEventType, options?: IAdminAuditListOptions): Promise<readonly IAdminAuditRecord[]>;
}

/** Options for listing audit records. */
export interface IAdminAuditListOptions {
  readonly limit?: number;
  readonly since?: string;
}

// ─── Preflight Validator ────────────────────────────────────────────────────────

/**
 * Validates preconditions before an admin action can be launched.
 *
 * Preflight checks verify environment readiness, permissions, configuration
 * state, and adapter availability before committing to a run.
 *
 * Implemented in P3-04.
 */
export interface IAdminPreflightService {
  /** Run preflight validation for an action. */
  validate(request: IAdminPreflightRequest): Promise<IAdminPreflightResponse>;
}

// ─── Evidence Service ───────────────────────────────────────────────────────────

/** Retention class determining how long evidence is kept. */
export type EvidenceRetentionClass = 'operational' | 'compliance' | 'permanent';

/**
 * Manages evidence metadata persistence and inline/offload decisions.
 *
 * Evidence references track artifacts produced by runs. Small payloads
 * (< 32 KB) are stored inline in Table Storage. Larger payloads are
 * referenced by storageLocator for offloaded blob storage (Phase 6).
 *
 * Implemented in P4-06.
 */
export interface IAdminEvidenceService {
  /** Record an evidence reference with retention metadata. */
  recordEvidence(
    ref: IAdminEvidenceReference,
    retentionClass: EvidenceRetentionClass,
    inlinePayload?: Record<string, unknown>,
  ): Promise<void>;

  /** List all evidence references for a run. */
  listByRunId(runId: string): Promise<readonly IAdminEvidenceReference[]>;

  /** Get a single evidence reference by ID. Returns null if not found. */
  getEvidence(evidenceId: string): Promise<IAdminEvidenceReference | null>;

  /** Get stored payload metadata and inline content for one evidence item. */
  getEvidencePayload(evidenceId: string): Promise<IAdminEvidencePayloadRecord | null>;
}

/** Evidence payload lookup result for artifact download surfaces. */
export interface IAdminEvidencePayloadRecord {
  readonly evidenceId: string;
  readonly runId: string | null;
  readonly storageLocator: string;
  readonly offloaded: boolean;
  readonly inlinePayload: Record<string, unknown> | null;
}

// ─── Actor Context Resolver ─────────────────────────────────────────────────────

/**
 * Resolves the admin actor context from authenticated JWT claims.
 *
 * Used by all admin endpoints that require audit-quality actor identification.
 * The resolver extracts UPN, OID, display name, and timestamps from the
 * validated JWT context passed by withAuth() middleware.
 *
 * Implemented in P3-08.
 */
export interface IAdminActorContextResolver {
  /** Extract actor context from validated JWT claims. */
  resolve(claims: IAdminActorResolverInput): IAdminActorContext;
}

/** Input to the actor context resolver (subset of validated JWT claims). */
export interface IAdminActorResolverInput {
  readonly upn: string;
  readonly oid: string;
  readonly displayName: string;
}

// ─── Observability Alert Store (Phase 12) ──────────────────────────────────────

/**
 * Durable persistence for admin observability alerts.
 *
 * Alerts are ingested from monitor evaluations, updated on operator actions
 * (acknowledge, resolve), and queried by SPFx operator-console hooks.
 *
 * Implemented in P12-04. Backed by Azure Table Storage.
 */
export interface IObservabilityAlertStore {
  /** Ingest alerts from a monitor evaluation cycle. Deduplicates by dedupeKey. */
  ingestAlerts(payload: IObservabilityAlertIngestionPayload): Promise<readonly IObservabilityAlertRecord[]>;

  /** Get a single alert by ID. Returns null if not found. */
  getAlert(alertId: string): Promise<IObservabilityAlertRecord | null>;

  /** List alerts matching the given query filters. */
  listAlerts(query: IObservabilityAlertQuery): Promise<IObservabilityPagedResponse<IObservabilityAlertRecord>>;

  /** Acknowledge an active alert. Returns the updated record. */
  acknowledgeAlert(alertId: string, actor: IAdminActorContext): Promise<IObservabilityAlertRecord>;

  /** Resolve an alert. Returns the updated record. */
  resolveAlert(alertId: string, actor: IAdminActorContext): Promise<IObservabilityAlertRecord>;

  /** Get aggregated alert summary counts. */
  getAlertSummary(): Promise<IObservabilityAlertSummary>;
}

// ─── Observability Probe Snapshot Store (Phase 12) ─────────────────────────────

/**
 * Durable persistence for infrastructure probe snapshots.
 *
 * Probe snapshots are append-only records captured from scheduled or manual
 * probe executions. They are never updated after creation.
 *
 * Implemented in P12-04. Backed by Azure Table Storage.
 */
export interface IObservabilityProbeSnapshotStore {
  /** Persist a probe snapshot from a client-triggered execution. */
  saveSnapshot(payload: IObservabilityProbeSubmissionPayload): Promise<IObservabilityProbeSnapshotRecord>;

  /** Get the most recent probe snapshot. Returns null if none exist. */
  getLatestSnapshot(): Promise<IObservabilityProbeSnapshotRecord | null>;

  /** List probe snapshots matching the given query filters. */
  listSnapshots(query: IObservabilityProbeSnapshotQuery): Promise<IObservabilityPagedResponse<IObservabilityProbeSnapshotRecord>>;

  /** Get aggregated probe health summary from the latest snapshot. */
  getHealthSummary(): Promise<IObservabilityProbeHealthSummary>;
}

// ─── Observability Error Store (Phase 12) ──────────────────────────────────────

/**
 * Durable persistence for observability error events.
 *
 * Error events are append-only records ingested from admin domain operations.
 * They are never updated after creation but may be linked to incidents.
 *
 * Implemented in P12-04. Backed by Azure Table Storage.
 */
export interface IObservabilityErrorStore {
  /** Ingest error events. */
  ingestErrors(payload: IObservabilityErrorIngestionPayload): Promise<readonly IObservabilityErrorRecord[]>;

  /** Get a single error event by ID. Returns null if not found. */
  getError(errorId: string): Promise<IObservabilityErrorRecord | null>;

  /** List error events matching the given query filters. */
  listErrors(query: IObservabilityErrorQuery): Promise<IObservabilityPagedResponse<IObservabilityErrorRecord>>;
}

// ─── App Binding Service ──────────────────────────────────────────────────────

/**
 * Manages durable per-app backend-setup binding records.
 *
 * The binding service is the control-plane authority for publishing,
 * resolving, verifying, and repairing managed-app binding records.
 * Target apps consume bindings; only the backend may write them.
 *
 * Implemented in P6A-04. Backed by Azure Table Storage.
 */
export interface IAdminAppBindingService {
  /** Get the active binding for a managed app. Returns null if not configured. */
  getBinding(appId: string): Promise<IAppBindingRecord | null>;

  /** List binding records for all managed apps. */
  listBindings(): Promise<readonly IAppBindingRecord[]>;

  /** Publish or update a binding for a managed app. */
  publishBinding(request: IAppBindingPublishRequest, actor: IAdminActorContext): Promise<IAppBindingPublishResult>;

  /** Verify a published binding against live infrastructure state. */
  verifyBinding(appId: string): Promise<IAppBindingVerificationResult>;

  /** Repair a drifted or errored binding with corrected values. */
  repairBinding(request: IAppBindingRepairRequest, actor: IAdminActorContext): Promise<IAppBindingRepairResult>;
}
