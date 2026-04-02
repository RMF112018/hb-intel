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
  IAdminPreflightRequest,
  IAdminPreflightResponse,
  IAdminAdapterDescriptor,
  IAdminAdapterInvocationContext,
  IAdminAdapterResult,
  IAdminAuditRecord,
  AdminAuditEventType,
  IAdminActorContext,
  IAdminConfigResponse,
} from '@hbc/models/admin-control-plane';

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
