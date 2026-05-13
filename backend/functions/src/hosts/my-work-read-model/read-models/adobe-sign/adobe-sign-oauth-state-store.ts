/**
 * Adobe Sign OAuth state store — B05 Prompt 03.
 *
 * Interface + deterministic mock + production-readiness gate.
 *
 * Production durable store selection is deferred to B05/B06 governance.
 * Until a store is selected, `resolveAdobeSignOAuthStateStore()` returns
 * `{ readiness: 'configuration-required' }` so callers must surface
 * `configuration-required` rather than silently fall back to an in-memory
 * implementation that would lose state across function invocations.
 *
 * @module hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-oauth-state-store
 */

import type { AdobeSignOAuthStateRecord } from './adobe-sign-oauth-state.js';
import { classifyOAuthStateAtConsume } from './adobe-sign-oauth-state.js';

export type AdobeSignOAuthStateTakeResult =
  | { readonly outcome: 'valid'; readonly record: AdobeSignOAuthStateRecord }
  | { readonly outcome: 'expired' }
  | { readonly outcome: 'consumed' }
  | { readonly outcome: 'missing' }
  | { readonly outcome: 'store-unavailable'; readonly reason?: string };

export interface IAdobeSignOAuthStateStore {
  put(record: AdobeSignOAuthStateRecord): Promise<void>;
  take(stateValue: string, now: Date): Promise<AdobeSignOAuthStateTakeResult>;
}

/**
 * Deterministic in-memory store for tests and local fixture-mode dev.
 * **NEVER auto-selected in production** by `resolveAdobeSignOAuthStateStore`.
 *
 * `take()` is consume-on-read — once a `stateValue` returns `'valid'`,
 * subsequent calls return `'consumed'` for the same stateValue.
 */
export function createDeterministicMockOAuthStateStore(): IAdobeSignOAuthStateStore {
  const live = new Map<string, AdobeSignOAuthStateRecord>();
  const consumed = new Set<string>();

  return {
    async put(record) {
      live.set(record.stateValue, record);
    },
    async take(stateValue, now) {
      if (consumed.has(stateValue)) return { outcome: 'consumed' };
      const record = live.get(stateValue);
      if (!record) return { outcome: 'missing' };
      const verdict = classifyOAuthStateAtConsume(record, now);
      if (verdict === 'expired') {
        live.delete(stateValue);
        return { outcome: 'expired' };
      }
      live.delete(stateValue);
      consumed.add(stateValue);
      return { outcome: 'valid', record };
    },
  };
}

export type AdobeSignOAuthStateStoreReadiness =
  | { readonly readiness: 'ready'; readonly store: IAdobeSignOAuthStateStore }
  | {
      readonly readiness: 'configuration-required';
      readonly reason: 'production-store-not-selected';
    };

export type StateStoreEnv = Readonly<Record<string, string | undefined>>;

const isMockOrTestMode = (env: StateStoreEnv): boolean =>
  env.NODE_ENV === 'test' || env.HBC_ADAPTER_MODE === 'mock';

/**
 * Resolve a state store given the runtime env. The deterministic mock is
 * only returned when the runtime explicitly indicates test/mock mode;
 * production callers receive `configuration-required` until a durable
 * store is wired through B05/B06 governance.
 *
 * This is the **only sanctioned entry point** for routes — handlers must
 * not instantiate the mock store directly outside of tests.
 */
export function resolveAdobeSignOAuthStateStore(
  env: StateStoreEnv,
): AdobeSignOAuthStateStoreReadiness {
  if (isMockOrTestMode(env)) {
    return { readiness: 'ready', store: createDeterministicMockOAuthStateStore() };
  }
  return {
    readiness: 'configuration-required',
    reason: 'production-store-not-selected',
  };
}
