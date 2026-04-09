/**
 * Admin Control Plane — stub/mock service implementations.
 *
 * These stubs provide the minimal implementations needed to satisfy the
 * service container contract in mock/test mode. They are intentionally
 * simple — real implementations are created in later Phase 3 prompts.
 *
 * Each stub:
 * - Implements the corresponding interface from ./types.ts
 * - Returns plausible empty/default values
 * - Logs invocations for development visibility
 * - Does not throw (fail-safe for development)
 *
 * @module admin-control-plane/services
 */

import type {
  AdminAuditEventType,
  IAdminActorContext,
  IAdminAdapterDescriptor,
  IAdminAdapterInvocationContext,
  IAdminAdapterResult,
  IAdminAuditRecord,
  IAdminConfigResponse,
  IAdminPreflightRequest,
  IAdminPreflightResponse,
  IAdminRunEnvelope,
  IAdminRunLaunchRequest,
  IAdminRunLaunchResponse,
  IAdminRunSummary,
  AdminAdapterOutcome,
  AdminActionKey,
} from '@hbc/models/admin-control-plane';

import type {
  IAdminRunService,
  IAdminRunListOptions,
  IAdminRunListResult,
  IAdminRunUpdate,
  IAdminAdapterRegistry,
  IAdminConfigService,
  IAdminAuditService,
  IAdminAuditListOptions,
  IAdminPreflightService,
  IAdminActorContextResolver,
  IAdminActorResolverInput,
} from './types.js';

// ─── Stub Run Service ───────────────────────────────────────────────────────────

export class StubAdminRunService implements IAdminRunService {
  async launchRun(_request: IAdminRunLaunchRequest, _actor: IAdminActorContext): Promise<IAdminRunLaunchResponse> {
    console.log('[StubAdminRunService] launchRun called — stub, no-op');
    return { runId: crypto.randomUUID(), status: 'Pending' as const } as unknown as IAdminRunLaunchResponse;
  }

  async getRun(_runId: string): Promise<IAdminRunEnvelope | null> {
    console.log('[StubAdminRunService] getRun called — stub, returning null');
    return null;
  }

  async listRuns(_options: IAdminRunListOptions): Promise<IAdminRunListResult> {
    console.log('[StubAdminRunService] listRuns called — stub, returning empty');
    return { items: [] as readonly IAdminRunSummary[], total: 0, page: 1, pageSize: 25 };
  }

  async cancelRun(_runId: string, _actor: IAdminActorContext): Promise<IAdminRunEnvelope> {
    throw new Error('[StubAdminRunService] cancelRun not implemented — awaiting P3-05');
  }

  async retryRun(_parentRunId: string, _actor: IAdminActorContext): Promise<IAdminRunLaunchResponse> {
    throw new Error('[StubAdminRunService] retryRun not implemented — awaiting P3-05');
  }

  async updateRun(_runId: string, _updates: IAdminRunUpdate): Promise<IAdminRunEnvelope> {
    throw new Error('[StubAdminRunService] updateRun not implemented');
  }
}

// ─── Stub Adapter Registry ──────────────────────────────────────────────────────

export class StubAdminAdapterRegistry implements IAdminAdapterRegistry {
  private readonly descriptors = new Map<string, IAdminAdapterDescriptor>();

  register(descriptor: IAdminAdapterDescriptor): void {
    this.descriptors.set(descriptor.adapterKey, descriptor);
    console.log(`[StubAdminAdapterRegistry] Registered adapter: ${descriptor.adapterKey}`);
  }

  resolve(adapterKey: string): IAdminAdapterDescriptor | null {
    return this.descriptors.get(adapterKey) ?? null;
  }

  listAll(): readonly IAdminAdapterDescriptor[] {
    return [...this.descriptors.values()];
  }

  listForAction(_actionKey: AdminActionKey): readonly IAdminAdapterDescriptor[] {
    console.log('[StubAdminAdapterRegistry] listForAction called — stub, returning all');
    return this.listAll();
  }

  async invoke(adapterKey: string, _context: IAdminAdapterInvocationContext): Promise<IAdminAdapterResult> {
    console.log(`[StubAdminAdapterRegistry] invoke called for ${adapterKey} — stub, returning skipped`);
    return {
      adapterKey,
      outcome: 'skipped' as AdminAdapterOutcome,
      summary: 'Stub adapter — no real execution',
      durationMs: 0,
      warnings: [],
      issues: [],
      remediationHints: [],
      evidenceRefs: [],
      adapterSpecificData: null,
      deduplicatedInvocation: false,
    };
  }
}

// ─── Stub Config Service ────────────────────────────────────────────────────────

export class StubAdminConfigService implements IAdminConfigService {
  async getConfig(scope: string): Promise<IAdminConfigResponse> {
    console.log(`[StubAdminConfigService] getConfig called for scope "${scope}" — stub, returning empty`);
    return {
      scope,
      version: '0.0.0',
      source: 'code-default',
      values: {},
      effectiveAt: new Date().toISOString(),
    } as unknown as IAdminConfigResponse;
  }
}

// ─── Stub Audit Service ─────────────────────────────────────────────────────────

export class StubAdminAuditService implements IAdminAuditService {
  private readonly records: IAdminAuditRecord[] = [];

  async recordEvent(record: IAdminAuditRecord): Promise<void> {
    this.records.push(record);
    console.log(`[StubAdminAuditService] Recorded audit event: ${record.eventType} (${record.auditId})`);
  }

  async listByRunId(runId: string): Promise<readonly IAdminAuditRecord[]> {
    return this.records.filter(r => r.runId === runId);
  }

  async listByEventType(eventType: AdminAuditEventType, _options?: IAdminAuditListOptions): Promise<readonly IAdminAuditRecord[]> {
    return this.records.filter(r => r.eventType === eventType);
  }
}

// ─── Stub Preflight Service ─────────────────────────────────────────────────────

export class StubAdminPreflightService implements IAdminPreflightService {
  async validate(_request: IAdminPreflightRequest): Promise<IAdminPreflightResponse> {
    console.log('[StubAdminPreflightService] validate called — stub, returning all-pass');
    return {
      actionKey: _request.actionKey,
      overallResult: 'pass',
      checks: [],
      validatedAt: new Date().toISOString(),
    } as unknown as IAdminPreflightResponse;
  }
}

// ─── Stub Actor Context Resolver ────────────────────────────────────────────────

export class StubAdminActorContextResolver implements IAdminActorContextResolver {
  resolve(claims: IAdminActorResolverInput): IAdminActorContext {
    return {
      upn: claims.upn,
      objectId: claims.oid,
      displayName: claims.displayName,
      capturedAt: new Date().toISOString(),
    };
  }
}
