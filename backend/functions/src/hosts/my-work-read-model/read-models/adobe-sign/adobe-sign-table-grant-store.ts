/**
 * Adobe Sign grant store — durable Azure Table adapter.
 *
 * Implements the existing `IAdobeSignGrantStore` interface against Azure
 * Table Storage. PartitionKey/RowKey mirror the canonical actor key
 * (`actorTenantId`/`actorOid`, lowercased) so lookups remain O(1) and
 * the entity layout matches the actor-keying contract enforced upstream.
 *
 * The grant record's `encryptedRefreshTokenRef` is decomposed into
 * scalar columns (no nested objects on Azure Tables); the
 * `grantedScopes` and `failureMetadata` fields are JSON-serialized so
 * the underlying contract round-trips faithfully.
 *
 * Secret material never lives on this row — only the opaque
 * `encryptedRefreshTokenRefAddress` that points at the
 * `TableAdobeSignRefreshTokenStore` ciphertext envelope.
 *
 * @module hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-table-grant-store
 */

import { TableClient, type TableEntity } from '@azure/data-tables';
import {
  AdobeSignRuntimeDiagnosticError,
  classifyAdobeSignRuntimeError,
  resolveSafeTableEndpointHost,
  type AdobeSignTableStoreOperation,
  type AdobeSignTableStoreStage,
} from './adobe-sign-runtime-diagnostics.js';

import type { AdobeSignActorKey } from './adobe-sign-actor-normalizer.js';
import type {
  AdobeSignGrantFailureKind,
  AdobeSignGrantFailureMetadata,
  AdobeSignGrantState,
  IAdobeSignGrantRecord,
} from './adobe-sign-grant-record.js';
import type { IAdobeSignGrantStore } from './adobe-sign-grant-store.js';

export const ADOBE_SIGN_GRANTS_TABLE = 'AdobeSignGrants' as const;

interface GrantEntity {
  actorTenantId: string;
  actorOid: string;
  actorKey: AdobeSignActorKey;
  upnSnapshot?: string;
  displayNameSnapshot?: string;
  adobeApiAccessPoint: string;
  adobeWebAccessPoint: string;
  encryptedRefreshTokenRefStoreKind: string;
  encryptedRefreshTokenRefAddress: string;
  encryptedRefreshTokenRefLastPersistedAtUtc?: string;
  grantedScopesJson: string;
  grantedAtUtc: string;
  lastRefreshedAtUtc?: string;
  expiresAtUtc?: string;
  revokedAtUtc?: string;
  state: AdobeSignGrantState;
  failureKind?: AdobeSignGrantFailureKind;
  failureMessage?: string;
  failureObservedAtUtc?: string;
}

function partitionKeyFor(record: { actorTenantId: string }): string {
  return record.actorTenantId.toLowerCase();
}

function rowKeyFor(record: { actorOid: string }): string {
  return record.actorOid.toLowerCase();
}

function rowKeysFromActorKey(actorKey: AdobeSignActorKey): {
  partitionKey: string;
  rowKey: string;
} {
  const sep = actorKey.indexOf('::');
  if (sep === -1) {
    return { partitionKey: actorKey, rowKey: actorKey };
  }
  return {
    partitionKey: actorKey.slice(0, sep),
    rowKey: actorKey.slice(sep + 2),
  };
}

function recordToEntity(record: IAdobeSignGrantRecord): TableEntity<GrantEntity> {
  return {
    partitionKey: partitionKeyFor(record),
    rowKey: rowKeyFor(record),
    actorTenantId: record.actorTenantId,
    actorOid: record.actorOid,
    actorKey: record.actorKey,
    ...(record.upnSnapshot !== undefined ? { upnSnapshot: record.upnSnapshot } : {}),
    ...(record.displayNameSnapshot !== undefined
      ? { displayNameSnapshot: record.displayNameSnapshot }
      : {}),
    adobeApiAccessPoint: record.adobeApiAccessPoint,
    adobeWebAccessPoint: record.adobeWebAccessPoint,
    encryptedRefreshTokenRefStoreKind: record.encryptedRefreshTokenRef.storeKind,
    encryptedRefreshTokenRefAddress: record.encryptedRefreshTokenRef.address,
    ...(record.encryptedRefreshTokenRef.lastPersistedAtUtc !== undefined
      ? {
          encryptedRefreshTokenRefLastPersistedAtUtc:
            record.encryptedRefreshTokenRef.lastPersistedAtUtc,
        }
      : {}),
    grantedScopesJson: JSON.stringify(record.grantedScopes),
    grantedAtUtc: record.grantedAtUtc,
    ...(record.lastRefreshedAtUtc !== undefined
      ? { lastRefreshedAtUtc: record.lastRefreshedAtUtc }
      : {}),
    ...(record.expiresAtUtc !== undefined ? { expiresAtUtc: record.expiresAtUtc } : {}),
    ...(record.revokedAtUtc !== undefined ? { revokedAtUtc: record.revokedAtUtc } : {}),
    state: record.state,
    ...(record.failureMetadata !== undefined
      ? {
          failureKind: record.failureMetadata.kind,
          failureObservedAtUtc: record.failureMetadata.observedAtUtc,
          ...(record.failureMetadata.message !== undefined
            ? { failureMessage: record.failureMetadata.message }
            : {}),
        }
      : {}),
  };
}

function entityToRecord(entity: GrantEntity): IAdobeSignGrantRecord {
  let grantedScopes: readonly string[] = [];
  try {
    const parsed: unknown = JSON.parse(entity.grantedScopesJson);
    if (Array.isArray(parsed)) {
      grantedScopes = parsed.filter((s): s is string => typeof s === 'string');
    }
  } catch {
    grantedScopes = [];
  }
  const failureMetadata: AdobeSignGrantFailureMetadata | undefined =
    entity.failureKind !== undefined && entity.failureObservedAtUtc !== undefined
      ? {
          kind: entity.failureKind,
          observedAtUtc: entity.failureObservedAtUtc,
          ...(entity.failureMessage !== undefined ? { message: entity.failureMessage } : {}),
        }
      : undefined;
  return {
    actorTenantId: entity.actorTenantId,
    actorOid: entity.actorOid,
    actorKey: entity.actorKey,
    ...(entity.upnSnapshot !== undefined ? { upnSnapshot: entity.upnSnapshot } : {}),
    ...(entity.displayNameSnapshot !== undefined
      ? { displayNameSnapshot: entity.displayNameSnapshot }
      : {}),
    adobeApiAccessPoint: entity.adobeApiAccessPoint,
    adobeWebAccessPoint: entity.adobeWebAccessPoint,
    encryptedRefreshTokenRef: {
      storeKind: entity.encryptedRefreshTokenRefStoreKind,
      address: entity.encryptedRefreshTokenRefAddress,
      ...(entity.encryptedRefreshTokenRefLastPersistedAtUtc !== undefined
        ? { lastPersistedAtUtc: entity.encryptedRefreshTokenRefLastPersistedAtUtc }
        : {}),
    },
    grantedScopes,
    grantedAtUtc: entity.grantedAtUtc,
    ...(entity.lastRefreshedAtUtc !== undefined
      ? { lastRefreshedAtUtc: entity.lastRefreshedAtUtc }
      : {}),
    ...(entity.expiresAtUtc !== undefined ? { expiresAtUtc: entity.expiresAtUtc } : {}),
    ...(entity.revokedAtUtc !== undefined ? { revokedAtUtc: entity.revokedAtUtc } : {}),
    state: entity.state,
    ...(failureMetadata !== undefined ? { failureMetadata } : {}),
  };
}

export class TableAdobeSignGrantStore implements IAdobeSignGrantStore {
  private tableEnsured = false;
  private readonly endpointHost: string | undefined;

  constructor(private readonly client: TableClient) {
    this.endpointHost = resolveSafeTableEndpointHost(process.env.AZURE_TABLE_ENDPOINT);
  }

  async upsertGrant(record: IAdobeSignGrantRecord): Promise<void> {
    await this.ensureTable('upsert-grant');
    try {
      await this.client.upsertEntity<TableEntity<GrantEntity>>(recordToEntity(record), 'Replace');
    } catch (err: unknown) {
      throw this.wrapDiagnosticError(err, 'upsert-grant', 'upsert-entity');
    }
  }

  async findGrant(actorKey: AdobeSignActorKey): Promise<IAdobeSignGrantRecord | undefined> {
    await this.ensureTable('find-grant');
    const { partitionKey, rowKey } = rowKeysFromActorKey(actorKey);
    try {
      const entity = await this.client.getEntity<GrantEntity>(partitionKey, rowKey);
      try {
        return entityToRecord(entity);
      } catch (err: unknown) {
        throw this.wrapDiagnosticError(err, 'find-grant', 'map-entity');
      }
    } catch (err: unknown) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 404) return undefined;
      throw this.wrapDiagnosticError(err, 'find-grant', 'get-entity');
    }
  }

  async markReauthorizationRequired(
    actorKey: AdobeSignActorKey,
    failure?: AdobeSignGrantFailureMetadata,
  ): Promise<void> {
    const existing = await this.findGrantWithOperation(actorKey, 'mark-reauthorization-required');
    if (!existing) return;
    await this.upsertGrantWithOperation(
      {
        ...existing,
        state: 'requires-reauth',
        ...(failure !== undefined ? { failureMetadata: failure } : {}),
      },
      'mark-reauthorization-required',
    );
  }

  async markRevoked(actorKey: AdobeSignActorKey, revokedAtUtc: string): Promise<void> {
    const existing = await this.findGrantWithOperation(actorKey, 'mark-revoked');
    if (!existing) return;
    await this.upsertGrantWithOperation(
      {
      ...existing,
        state: 'revoked',
        revokedAtUtc,
      },
      'mark-revoked',
    );
  }

  private async findGrantWithOperation(
    actorKey: AdobeSignActorKey,
    operation: AdobeSignTableStoreOperation,
  ): Promise<IAdobeSignGrantRecord | undefined> {
    await this.ensureTable(operation);
    const { partitionKey, rowKey } = rowKeysFromActorKey(actorKey);
    try {
      const entity = await this.client.getEntity<GrantEntity>(partitionKey, rowKey);
      try {
        return entityToRecord(entity);
      } catch (err: unknown) {
        throw this.wrapDiagnosticError(err, operation, 'map-entity');
      }
    } catch (err: unknown) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 404) return undefined;
      throw this.wrapDiagnosticError(err, operation, 'get-entity');
    }
  }

  private async upsertGrantWithOperation(
    record: IAdobeSignGrantRecord,
    operation: AdobeSignTableStoreOperation,
  ): Promise<void> {
    await this.ensureTable(operation);
    try {
      await this.client.upsertEntity<TableEntity<GrantEntity>>(recordToEntity(record), 'Replace');
    } catch (err: unknown) {
      throw this.wrapDiagnosticError(err, operation, 'upsert-entity');
    }
  }

  private async ensureTable(operation: AdobeSignTableStoreOperation): Promise<void> {
    if (this.tableEnsured) return;
    try {
      await this.client.createTable();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code !== 'TableAlreadyExists') {
        throw this.wrapDiagnosticError(err, operation, 'create-table');
      }
    }
    this.tableEnsured = true;
  }

  private wrapDiagnosticError(
    error: unknown,
    operation: AdobeSignTableStoreOperation,
    stage: AdobeSignTableStoreStage,
  ): AdobeSignRuntimeDiagnosticError {
    const classified = classifyAdobeSignRuntimeError(error);
    const errorClass =
      classified.errorClass === 'resource-not-found' ? 'table-not-found' : classified.errorClass;
    return new AdobeSignRuntimeDiagnosticError(
      {
        operation,
        stage,
        errorClass,
        ...(classified.statusCode !== undefined ? { statusCode: classified.statusCode } : {}),
        ...(classified.sdkCode !== undefined ? { sdkCode: classified.sdkCode } : {}),
        tableName: ADOBE_SIGN_GRANTS_TABLE,
        ...(this.endpointHost !== undefined ? { endpointHost: this.endpointHost } : {}),
      },
      error,
    );
  }
}
