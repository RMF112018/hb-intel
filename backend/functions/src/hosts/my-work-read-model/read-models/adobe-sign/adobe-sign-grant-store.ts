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

import type { AdobeSignActorKey } from './adobe-sign-actor-normalizer.js';
import type { IAdobeSignGrantRecord } from './adobe-sign-grant-record.js';

export interface IAdobeSignGrantStore {
  upsertGrant(record: IAdobeSignGrantRecord): Promise<void>;
  findGrant(actorKey: AdobeSignActorKey): Promise<IAdobeSignGrantRecord | undefined>;
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
  return { readiness: 'configuration-required', reason: 'production-store-not-selected' };
}
