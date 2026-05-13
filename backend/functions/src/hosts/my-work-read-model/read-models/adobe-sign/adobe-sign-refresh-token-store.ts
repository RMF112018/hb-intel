/**
 * Adobe Sign refresh-token store — B05 remediation Prompt 02.
 *
 * Companion to the grant store. The grant record carries only an opaque
 * `AdobeSignEncryptedRefreshTokenRef`; the actual ciphertext envelope
 * (produced by `adobe-sign-refresh-token-crypto`) lives in this store
 * keyed by the canonical actor key.
 *
 * Prompts 03 (callback) and 04 (refresh) consume:
 *   - `putCiphertext` after a successful Adobe token exchange,
 *   - `getCiphertext` immediately before a refresh,
 *   - `deleteCiphertext` after revoke or invalid-grant.
 *
 * No plaintext refresh-token, access-token, or vendor body ever crosses
 * this boundary.
 *
 * @module hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-refresh-token-store
 */

import { TableClient, type TableEntity } from '@azure/data-tables';

import { createAppTableClient } from '../../../../utils/table-client-factory.js';

import type { AdobeSignActorKey } from './adobe-sign-actor-normalizer.js';
import type { EnvLike } from './adobe-sign-config.js';
import type { AdobeSignEncryptedRefreshTokenRef } from './adobe-sign-grant-record.js';
import type { AdobeSignRefreshTokenCiphertextEnvelope } from './adobe-sign-refresh-token-crypto.js';
import {
  ADOBE_SIGN_TOKEN_ENCRYPTION_KEY_ENV,
  resolveAdobeSignRefreshTokenCipherKey,
} from './adobe-sign-refresh-token-crypto.js';

export const ADOBE_SIGN_REFRESH_TOKEN_TABLE = 'AdobeSignRefreshTokens' as const;
export const ADOBE_SIGN_REFRESH_TOKEN_PARTITION = 'refresh-token' as const;

export interface IAdobeSignRefreshTokenStore {
  putCiphertext(
    actorKey: AdobeSignActorKey,
    envelope: AdobeSignRefreshTokenCiphertextEnvelope,
    now: Date,
  ): Promise<AdobeSignEncryptedRefreshTokenRef>;
  getCiphertext(
    ref: AdobeSignEncryptedRefreshTokenRef,
  ): Promise<AdobeSignRefreshTokenCiphertextEnvelope | undefined>;
  deleteCiphertext(ref: AdobeSignEncryptedRefreshTokenRef): Promise<void>;
}

export type AdobeSignRefreshTokenStoreConfigurationReason =
  | 'production-store-not-selected'
  | 'missing-table-endpoint'
  | 'missing-encryption-key'
  | 'invalid-encryption-key';

export type AdobeSignRefreshTokenStoreReadiness =
  | { readonly readiness: 'ready'; readonly store: IAdobeSignRefreshTokenStore }
  | {
      readonly readiness: 'configuration-required';
      readonly reason: AdobeSignRefreshTokenStoreConfigurationReason;
      readonly missing?: readonly string[];
    };

// ---------------------------------------------------------------------------
// Deterministic mock — for tests and fixture mode only.
// ---------------------------------------------------------------------------

export function createDeterministicMockAdobeSignRefreshTokenStore(): IAdobeSignRefreshTokenStore {
  const ciphertexts = new Map<string, AdobeSignRefreshTokenCiphertextEnvelope>();
  return {
    async putCiphertext(actorKey, envelope, now) {
      ciphertexts.set(actorKey, envelope);
      return {
        storeKind: 'table-storage',
        address: actorKey,
        lastPersistedAtUtc: now.toISOString(),
      };
    },
    async getCiphertext(ref) {
      return ciphertexts.get(ref.address);
    },
    async deleteCiphertext(ref) {
      ciphertexts.delete(ref.address);
    },
  };
}

// ---------------------------------------------------------------------------
// Table-backed adapter.
// ---------------------------------------------------------------------------

interface RefreshTokenEntity {
  cipherVersion: number;
  iv: string;
  authTag: string;
  ciphertext: string;
  lastPersistedAtUtc: string;
}

export class TableAdobeSignRefreshTokenStore implements IAdobeSignRefreshTokenStore {
  private tableEnsured = false;

  constructor(private readonly client: TableClient) {}

  async putCiphertext(
    actorKey: AdobeSignActorKey,
    envelope: AdobeSignRefreshTokenCiphertextEnvelope,
    now: Date,
  ): Promise<AdobeSignEncryptedRefreshTokenRef> {
    await this.ensureTable();
    const lastPersistedAtUtc = now.toISOString();
    await this.client.upsertEntity<TableEntity<RefreshTokenEntity>>(
      {
        partitionKey: ADOBE_SIGN_REFRESH_TOKEN_PARTITION,
        rowKey: actorKey,
        cipherVersion: envelope.cipherVersion,
        iv: envelope.iv,
        authTag: envelope.authTag,
        ciphertext: envelope.ciphertext,
        lastPersistedAtUtc,
      },
      'Replace',
    );
    return {
      storeKind: 'table-storage',
      address: actorKey,
      lastPersistedAtUtc,
    };
  }

  async getCiphertext(
    ref: AdobeSignEncryptedRefreshTokenRef,
  ): Promise<AdobeSignRefreshTokenCiphertextEnvelope | undefined> {
    await this.ensureTable();
    try {
      const entity = await this.client.getEntity<RefreshTokenEntity>(
        ADOBE_SIGN_REFRESH_TOKEN_PARTITION,
        ref.address,
      );
      if (entity.cipherVersion !== 1) return undefined;
      return {
        cipherVersion: 1,
        iv: entity.iv,
        authTag: entity.authTag,
        ciphertext: entity.ciphertext,
      };
    } catch (err: unknown) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status === 404) return undefined;
      throw err;
    }
  }

  async deleteCiphertext(ref: AdobeSignEncryptedRefreshTokenRef): Promise<void> {
    await this.ensureTable();
    try {
      await this.client.deleteEntity(ADOBE_SIGN_REFRESH_TOKEN_PARTITION, ref.address);
    } catch (err: unknown) {
      const status = (err as { statusCode?: number }).statusCode;
      if (status !== 404) throw err;
    }
  }

  private async ensureTable(): Promise<void> {
    if (this.tableEnsured) return;
    try {
      await this.client.createTable();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code !== 'TableAlreadyExists') throw err;
    }
    this.tableEnsured = true;
  }
}

// ---------------------------------------------------------------------------
// Resolver.
// ---------------------------------------------------------------------------

const isMockOrTestMode = (env: EnvLike): boolean =>
  env.NODE_ENV === 'test' || env.HBC_ADAPTER_MODE === 'mock';

/**
 * Resolve a refresh-token store from `env`. The deterministic mock is
 * returned only in explicit test/mock mode. In production, a
 * Table-backed store is returned when:
 *
 *   - `ADOBE_SIGN_TOKEN_STORE_MODE === 'table-storage'`,
 *   - `AZURE_TABLE_ENDPOINT` is present,
 *   - `ADOBE_SIGN_TOKEN_ENCRYPTION_KEY` resolves to a valid 32-byte key.
 *
 * Otherwise the resolver returns `configuration-required` with a
 * structured reason that callers can map to the My Work envelope's
 * `configuration-required` source-status. No env values leak.
 *
 * Note: this resolver does not return the cipher key — only its
 * readiness. The route handler is expected to call
 * `resolveAdobeSignRefreshTokenCipherKey` separately when it actually
 * needs the bytes.
 */
export function resolveAdobeSignRefreshTokenStore(
  env: EnvLike,
): AdobeSignRefreshTokenStoreReadiness {
  if (isMockOrTestMode(env)) {
    return { readiness: 'ready', store: createDeterministicMockAdobeSignRefreshTokenStore() };
  }
  if (env.ADOBE_SIGN_TOKEN_STORE_MODE !== 'table-storage') {
    return { readiness: 'configuration-required', reason: 'production-store-not-selected' };
  }
  if (typeof env.AZURE_TABLE_ENDPOINT !== 'string' || env.AZURE_TABLE_ENDPOINT.trim() === '') {
    return {
      readiness: 'configuration-required',
      reason: 'missing-table-endpoint',
      missing: ['AZURE_TABLE_ENDPOINT'],
    };
  }
  const keyResolution = resolveAdobeSignRefreshTokenCipherKey(env);
  if (keyResolution.status === 'configuration-required') {
    return {
      readiness: 'configuration-required',
      reason: 'missing-encryption-key',
      missing: [ADOBE_SIGN_TOKEN_ENCRYPTION_KEY_ENV],
    };
  }
  if (keyResolution.status === 'configuration-invalid') {
    return {
      readiness: 'configuration-required',
      reason: 'invalid-encryption-key',
      missing: [ADOBE_SIGN_TOKEN_ENCRYPTION_KEY_ENV],
    };
  }
  let client: TableClient;
  try {
    client = createAppTableClient(ADOBE_SIGN_REFRESH_TOKEN_TABLE);
  } catch {
    return {
      readiness: 'configuration-required',
      reason: 'missing-table-endpoint',
      missing: ['AZURE_TABLE_ENDPOINT'],
    };
  }
  return { readiness: 'ready', store: new TableAdobeSignRefreshTokenStore(client) };
}
