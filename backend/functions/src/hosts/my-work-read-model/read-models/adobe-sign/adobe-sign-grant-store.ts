/**
 * Adobe Sign grant store seam — B05 Prompt 03.
 *
 * Interface + deterministic mock + production-readiness gate. Mirrors
 * the state-store posture: in production, no durable adapter has been
 * selected yet, so callers receive `configuration-required` until B05/B06
 * governance wires the chosen store.
 *
 * The grant record carries an opaque encrypted-refresh-token reference,
 * not the secret itself. The mock store keeps records in memory and is
 * only auto-selected in test / mock-adapter mode.
 *
 * @module hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-grant-store
 */

import { createAppTableClient } from '../../../../utils/table-client-factory.js';

import type { AdobeSignActorKey } from './adobe-sign-actor-normalizer.js';
import type {
  AdobeSignGrantFailureMetadata,
  IAdobeSignGrantRecord,
} from './adobe-sign-grant-record.js';
import {
  ADOBE_SIGN_GRANTS_TABLE,
  TableAdobeSignGrantStore,
} from './adobe-sign-table-grant-store.js';

export interface IAdobeSignGrantStore {
  upsertGrant(record: IAdobeSignGrantRecord): Promise<void>;
  findGrant(actorKey: AdobeSignActorKey): Promise<IAdobeSignGrantRecord | undefined>;
  /**
   * Mark an existing grant as `requires-reauth`. No-op when the actor has
   * no grant on file. Optional failure metadata is recorded for diagnostic
   * UI; it must never include vendor secret strings (Prompt 02 contract
   * already restricts the type).
   */
  markReauthorizationRequired(
    actorKey: AdobeSignActorKey,
    failure?: AdobeSignGrantFailureMetadata,
  ): Promise<void>;
  /**
   * Mark an existing grant as `revoked` and stamp `revokedAtUtc`. No-op
   * when the actor has no grant on file.
   */
  markRevoked(actorKey: AdobeSignActorKey, revokedAtUtc: string): Promise<void>;
}

export function createDeterministicMockGrantStore(): IAdobeSignGrantStore {
  const grants = new Map<AdobeSignActorKey, IAdobeSignGrantRecord>();
  return {
    async upsertGrant(record) {
      grants.set(record.actorKey, record);
    },
    async findGrant(actorKey) {
      return grants.get(actorKey);
    },
    async markReauthorizationRequired(actorKey, failure) {
      const existing = grants.get(actorKey);
      if (!existing) return;
      grants.set(actorKey, {
        ...existing,
        state: 'requires-reauth',
        ...(failure !== undefined ? { failureMetadata: failure } : {}),
      });
    },
    async markRevoked(actorKey, revokedAtUtc) {
      const existing = grants.get(actorKey);
      if (!existing) return;
      grants.set(actorKey, {
        ...existing,
        state: 'revoked',
        revokedAtUtc,
      });
    },
  };
}

export type AdobeSignGrantStoreReadiness =
  | { readonly readiness: 'ready'; readonly store: IAdobeSignGrantStore }
  | {
      readonly readiness: 'configuration-required';
      readonly reason: 'production-store-not-selected';
    };

export type GrantStoreEnv = Readonly<Record<string, string | undefined>>;

const isMockOrTestMode = (env: GrantStoreEnv): boolean =>
  env.NODE_ENV === 'test' || env.HBC_ADAPTER_MODE === 'mock';

export function resolveAdobeSignGrantStore(env: GrantStoreEnv): AdobeSignGrantStoreReadiness {
  if (isMockOrTestMode(env)) {
    return { readiness: 'ready', store: createDeterministicMockGrantStore() };
  }
  if (env.ADOBE_SIGN_TOKEN_STORE_MODE === 'table-storage') {
    try {
      const client = createAppTableClient(ADOBE_SIGN_GRANTS_TABLE);
      return { readiness: 'ready', store: new TableAdobeSignGrantStore(client) };
    } catch {
      return { readiness: 'configuration-required', reason: 'production-store-not-selected' };
    }
  }
  return { readiness: 'configuration-required', reason: 'production-store-not-selected' };
}
