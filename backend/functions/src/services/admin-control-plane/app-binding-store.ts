/**
 * Admin Control Plane — durable app-binding store (Azure Table Storage).
 *
 * Provides persistence and retrieval for managed-app backend-setup binding
 * records. Table: `AdminAppBindings`, PartitionKey: `appId`, RowKey: `current`.
 *
 * Follows the same patterns as DurableAdminRunStore: Replace-mode upserts,
 * JSON-serialized complex fields, empty-string-to-null deserialization.
 *
 * See: Phase 6A binding architecture, P6A-03 shared contracts
 *
 * @module admin-control-plane/services
 */

import { odata } from '@azure/data-tables';
import {
  AppBindingStatus,
} from '@hbc/models/admin-control-plane';

import type {
  IAdminActorContext,
  IAppBindingRecord,
  IAppBindingPublishRequest,
  IAppBindingPublishResult,
  IAppBindingVerificationResult,
  IAppBindingRepairRequest,
  IAppBindingRepairResult,
  IAppBindingDriftFinding,
  BackendMode,
} from '@hbc/models/admin-control-plane';

import { createAppTableClient } from '../../utils/table-client-factory.js';

import type { IAdminAppBindingService } from './types.js';

const ADMIN_APP_BINDINGS_TABLE = 'AdminAppBindings';

// ─── Durable Implementation ────────────────────────────────────────────────────

/**
 * Durable app-binding store backed by Azure Table Storage.
 *
 * Entity keying:
 * - PartitionKey: `appId` — enables per-app queries
 * - RowKey: `current` — always points to the active binding
 */
export class DurableAdminAppBindingStore implements IAdminAppBindingService {
  private readonly client = createAppTableClient(ADMIN_APP_BINDINGS_TABLE);
  private tableEnsured = false;

  private async ensureTable(): Promise<void> {
    if (this.tableEnsured) return;
    await this.client.createTable().catch(() => { /* table may already exist */ });
    this.tableEnsured = true;
  }

  async getBinding(appId: string): Promise<IAppBindingRecord | null> {
    await this.ensureTable();

    try {
      const entity = await this.client.getEntity(appId, 'current');
      return deserializeBindingRecord(entity as Record<string, unknown>);
    } catch {
      return null;
    }
  }

  async listBindings(): Promise<readonly IAppBindingRecord[]> {
    await this.ensureTable();

    const results: IAppBindingRecord[] = [];
    const entities = this.client.listEntities({
      queryOptions: { filter: odata`RowKey eq 'current'` },
    });
    for await (const entity of entities) {
      results.push(deserializeBindingRecord(entity as Record<string, unknown>));
    }
    return results;
  }

  async publishBinding(
    request: IAppBindingPublishRequest,
    actor: IAdminActorContext,
  ): Promise<IAppBindingPublishResult> {
    await this.ensureTable();

    const existing = await this.getBinding(request.appId);
    const newVersion = existing ? existing.version + 1 : 1;
    const now = new Date().toISOString();

    const record: IAppBindingRecord = {
      appId: request.appId,
      functionAppUrl: request.functionAppUrl,
      apiAudience: request.apiAudience,
      backendMode: request.backendMode,
      allowBackendModeSwitch: request.allowBackendModeSwitch,
      version: newVersion,
      status: AppBindingStatus.Active,
      publishedAt: now,
      publishedBy: actor,
      publishSource: request.publishSource,
      lastVerifiedAt: null,
      lastVerificationResult: null,
    };

    await this.client.upsertEntity(serializeBindingRecord(record), 'Replace');

    console.log(`[AppBindingStore] Published binding for ${request.appId} v${newVersion} by ${actor.upn}`);

    return {
      appId: request.appId,
      version: newVersion,
      status: AppBindingStatus.Active,
      publishedAt: now,
      created: !existing,
    };
  }

  async verifyBinding(appId: string): Promise<IAppBindingVerificationResult> {
    const binding = await this.getBinding(appId);
    const now = new Date().toISOString();

    if (!binding) {
      return {
        appId,
        version: 0,
        outcome: 'inconclusive',
        verifiedAt: now,
        findings: [{
          field: 'binding',
          expected: 'configured',
          observed: 'not-configured',
          severity: 'critical',
          message: `No binding record exists for app '${appId}'`,
        }],
        checksPassed: 0,
        checksTotal: 1,
      };
    }

    // P6A-04: Verification checks are structural validations of the binding record.
    // Full infrastructure probes (HTTP health checks, Graph lookups) will be
    // integrated in P6A-07 when the verification service is implemented.
    const findings: IAppBindingDriftFinding[] = [];

    if (!binding.functionAppUrl) {
      findings.push({
        field: 'functionAppUrl',
        expected: 'non-empty URL',
        observed: '',
        severity: 'critical',
        message: 'Function App URL is empty',
      });
    }

    if (!binding.apiAudience) {
      findings.push({
        field: 'apiAudience',
        expected: 'non-empty audience URI',
        observed: '',
        severity: 'critical',
        message: 'API audience is empty',
      });
    }

    const outcome = findings.length === 0 ? 'passed' : 'drifted';
    const checksTotal = 2;
    const checksPassed = checksTotal - findings.length;

    // Update the binding record with verification result
    if (binding) {
      const updated: IAppBindingRecord = {
        ...binding,
        status: outcome === 'passed' ? AppBindingStatus.Active : AppBindingStatus.Drifted,
        lastVerifiedAt: now,
        lastVerificationResult: outcome,
      };
      await this.ensureTable();
      await this.client.upsertEntity(serializeBindingRecord(updated), 'Replace');
    }

    return {
      appId,
      version: binding.version,
      outcome,
      verifiedAt: now,
      findings,
      checksPassed,
      checksTotal,
    };
  }

  async repairBinding(
    request: IAppBindingRepairRequest,
    actor: IAdminActorContext,
  ): Promise<IAppBindingRepairResult> {
    const existing = await this.getBinding(request.appId);
    if (!existing) {
      throw new Error(`Cannot repair binding for '${request.appId}': no binding exists`);
    }

    const newVersion = existing.version + 1;
    const now = new Date().toISOString();

    let fieldsChanged = 0;
    const functionAppUrl = request.functionAppUrl ?? existing.functionAppUrl;
    const apiAudience = request.apiAudience ?? existing.apiAudience;
    const backendMode = request.backendMode ?? existing.backendMode;
    const allowBackendModeSwitch = request.allowBackendModeSwitch ?? existing.allowBackendModeSwitch;

    if (functionAppUrl !== existing.functionAppUrl) fieldsChanged++;
    if (apiAudience !== existing.apiAudience) fieldsChanged++;
    if (backendMode !== existing.backendMode) fieldsChanged++;
    if (allowBackendModeSwitch !== existing.allowBackendModeSwitch) fieldsChanged++;

    const record: IAppBindingRecord = {
      appId: request.appId,
      functionAppUrl,
      apiAudience,
      backendMode,
      allowBackendModeSwitch,
      version: newVersion,
      status: AppBindingStatus.Active,
      publishedAt: now,
      publishedBy: actor,
      publishSource: `manual-repair`,
      lastVerifiedAt: null,
      lastVerificationResult: null,
    };

    await this.ensureTable();
    await this.client.upsertEntity(serializeBindingRecord(record), 'Replace');

    console.log(`[AppBindingStore] Repaired binding for ${request.appId} v${newVersion} by ${actor.upn} (${fieldsChanged} fields changed)`);

    return {
      appId: request.appId,
      version: newVersion,
      status: AppBindingStatus.Active,
      repairedAt: now,
      fieldsChanged,
    };
  }
}

// ─── Mock Implementation ───────────────────────────────────────────────────────

/**
 * In-memory app-binding store for testing and mock mode.
 */
export class MockAdminAppBindingStore implements IAdminAppBindingService {
  private readonly store = new Map<string, IAppBindingRecord>();

  async getBinding(appId: string): Promise<IAppBindingRecord | null> {
    return this.store.get(appId) ?? null;
  }

  async listBindings(): Promise<readonly IAppBindingRecord[]> {
    return [...this.store.values()];
  }

  async publishBinding(
    request: IAppBindingPublishRequest,
    actor: IAdminActorContext,
  ): Promise<IAppBindingPublishResult> {
    const existing = this.store.get(request.appId);
    const newVersion = existing ? existing.version + 1 : 1;
    const now = new Date().toISOString();

    const record: IAppBindingRecord = {
      appId: request.appId,
      functionAppUrl: request.functionAppUrl,
      apiAudience: request.apiAudience,
      backendMode: request.backendMode,
      allowBackendModeSwitch: request.allowBackendModeSwitch,
      version: newVersion,
      status: AppBindingStatus.Active,
      publishedAt: now,
      publishedBy: actor,
      publishSource: request.publishSource,
      lastVerifiedAt: null,
      lastVerificationResult: null,
    };

    this.store.set(request.appId, record);

    return {
      appId: request.appId,
      version: newVersion,
      status: AppBindingStatus.Active,
      publishedAt: now,
      created: !existing,
    };
  }

  async verifyBinding(appId: string): Promise<IAppBindingVerificationResult> {
    const binding = this.store.get(appId);
    const now = new Date().toISOString();

    if (!binding) {
      return {
        appId,
        version: 0,
        outcome: 'inconclusive',
        verifiedAt: now,
        findings: [{
          field: 'binding',
          expected: 'configured',
          observed: 'not-configured',
          severity: 'critical',
          message: `No binding record exists for app '${appId}'`,
        }],
        checksPassed: 0,
        checksTotal: 1,
      };
    }

    const findings: IAppBindingDriftFinding[] = [];
    if (!binding.functionAppUrl) {
      findings.push({ field: 'functionAppUrl', expected: 'non-empty URL', observed: '', severity: 'critical', message: 'Function App URL is empty' });
    }
    if (!binding.apiAudience) {
      findings.push({ field: 'apiAudience', expected: 'non-empty audience URI', observed: '', severity: 'critical', message: 'API audience is empty' });
    }

    const outcome = findings.length === 0 ? 'passed' : 'drifted';
    const checksTotal = 2;

    const updated: IAppBindingRecord = {
      ...binding,
      status: outcome === 'passed' ? AppBindingStatus.Active : AppBindingStatus.Drifted,
      lastVerifiedAt: now,
      lastVerificationResult: outcome,
    };
    this.store.set(appId, updated);

    return { appId, version: binding.version, outcome, verifiedAt: now, findings, checksPassed: checksTotal - findings.length, checksTotal };
  }

  async repairBinding(
    request: IAppBindingRepairRequest,
    actor: IAdminActorContext,
  ): Promise<IAppBindingRepairResult> {
    const existing = this.store.get(request.appId);
    if (!existing) {
      throw new Error(`Cannot repair binding for '${request.appId}': no binding exists`);
    }

    const newVersion = existing.version + 1;
    const now = new Date().toISOString();

    let fieldsChanged = 0;
    const functionAppUrl = request.functionAppUrl ?? existing.functionAppUrl;
    const apiAudience = request.apiAudience ?? existing.apiAudience;
    const backendMode = request.backendMode ?? existing.backendMode;
    const allowBackendModeSwitch = request.allowBackendModeSwitch ?? existing.allowBackendModeSwitch;

    if (functionAppUrl !== existing.functionAppUrl) fieldsChanged++;
    if (apiAudience !== existing.apiAudience) fieldsChanged++;
    if (backendMode !== existing.backendMode) fieldsChanged++;
    if (allowBackendModeSwitch !== existing.allowBackendModeSwitch) fieldsChanged++;

    const record: IAppBindingRecord = {
      appId: request.appId,
      functionAppUrl,
      apiAudience,
      backendMode,
      allowBackendModeSwitch,
      version: newVersion,
      status: AppBindingStatus.Active,
      publishedAt: now,
      publishedBy: actor,
      publishSource: 'manual-repair',
      lastVerifiedAt: null,
      lastVerificationResult: null,
    };
    this.store.set(request.appId, record);

    return { appId: request.appId, version: newVersion, status: AppBindingStatus.Active, repairedAt: now, fieldsChanged };
  }
}

// ─── Serialization ─────────────────────────────────────────────────────────────

export function serializeBindingRecord(record: IAppBindingRecord): { partitionKey: string; rowKey: string } & Record<string, unknown> {
  return {
    partitionKey: record.appId,
    rowKey: 'current',
    appId: record.appId,
    functionAppUrl: record.functionAppUrl,
    apiAudience: record.apiAudience,
    backendMode: record.backendMode,
    allowBackendModeSwitch: record.allowBackendModeSwitch,
    version: record.version,
    status: String(record.status),
    publishedAt: record.publishedAt,
    publishedByJson: JSON.stringify(record.publishedBy),
    publishSource: record.publishSource,
    lastVerifiedAt: record.lastVerifiedAt ?? '',
    lastVerificationResult: record.lastVerificationResult ?? '',
  };
}

export function deserializeBindingRecord(entity: Record<string, unknown>): IAppBindingRecord {
  return {
    appId: entity.appId as string,
    functionAppUrl: entity.functionAppUrl as string,
    apiAudience: entity.apiAudience as string,
    backendMode: (entity.backendMode as BackendMode) ?? 'production',
    allowBackendModeSwitch: entity.allowBackendModeSwitch as boolean ?? false,
    version: entity.version as number,
    status: entity.status as AppBindingStatus,
    publishedAt: entity.publishedAt as string,
    publishedBy: parseJsonOrNull<IAdminActorContext>(entity.publishedByJson as string) ?? {
      upn: 'unknown',
      objectId: '',
      displayName: 'Unknown',
      capturedAt: '',
    },
    publishSource: entity.publishSource as string,
    lastVerifiedAt: (entity.lastVerifiedAt as string) || null,
    lastVerificationResult: (entity.lastVerificationResult as string as IAppBindingRecord['lastVerificationResult']) || null,
  };
}

function parseJsonOrNull<T>(json: string | undefined | null): T | null {
  if (!json || json === 'null') return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
