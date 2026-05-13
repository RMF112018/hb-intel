import { describe, expect, it } from 'vitest';

import { adobeSignActorKey } from './adobe-sign-actor-normalizer.js';
import {
  createDeterministicMockOAuthStateStore,
  resolveAdobeSignOAuthStateStore,
  type StateStoreEnv,
} from './adobe-sign-oauth-state-store.js';
import type { AdobeSignOAuthStateRecord } from './adobe-sign-oauth-state.js';

const ACTOR_KEY = adobeSignActorKey(
  '11111111-2222-3333-4444-555555555555',
  'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
);

const buildRecord = (
  overrides: Partial<AdobeSignOAuthStateRecord> = {},
): AdobeSignOAuthStateRecord => ({
  stateValue: 'state-fixture-1',
  actorKey: ACTOR_KEY,
  returnPath: '/SitePages/MyDashboard.aspx',
  createdAtUtc: '2026-05-13T12:00:00.000Z',
  expiresAtUtc: '2026-05-13T12:10:00.000Z',
  ...overrides,
});

describe('deterministic mock state store', () => {
  it('returns missing for an unknown state', async () => {
    const store = createDeterministicMockOAuthStateStore();
    const result = await store.take('not-there', new Date('2026-05-13T12:05:00.000Z'));
    expect(result.outcome).toBe('missing');
  });

  it('returns the record exactly once (consume-on-read)', async () => {
    const store = createDeterministicMockOAuthStateStore();
    const record = buildRecord();
    await store.put(record);
    const first = await store.take(record.stateValue, new Date('2026-05-13T12:05:00.000Z'));
    expect(first.outcome).toBe('valid');
    const second = await store.take(record.stateValue, new Date('2026-05-13T12:05:30.000Z'));
    expect(second.outcome).toBe('consumed');
  });

  it('returns expired when the record has aged out and removes it', async () => {
    const store = createDeterministicMockOAuthStateStore();
    const record = buildRecord();
    await store.put(record);
    const first = await store.take(record.stateValue, new Date('2026-05-13T12:30:00.000Z'));
    expect(first.outcome).toBe('expired');
    // After expiry, the record is gone — subsequent take is `missing`, not `consumed`,
    // because the state was never observed as `valid`.
    const second = await store.take(record.stateValue, new Date('2026-05-13T12:31:00.000Z'));
    expect(second.outcome).toBe('missing');
  });

  it('separate stateValues are independent', async () => {
    const store = createDeterministicMockOAuthStateStore();
    await store.put(buildRecord({ stateValue: 'a' }));
    await store.put(buildRecord({ stateValue: 'b' }));
    const a = await store.take('a', new Date('2026-05-13T12:05:00.000Z'));
    const b = await store.take('b', new Date('2026-05-13T12:05:00.000Z'));
    expect(a.outcome).toBe('valid');
    expect(b.outcome).toBe('valid');
  });
});

describe('resolveAdobeSignOAuthStateStore — readiness gate', () => {
  it('returns ready in test mode (NODE_ENV=test)', () => {
    const env: StateStoreEnv = { NODE_ENV: 'test' };
    const result = resolveAdobeSignOAuthStateStore(env);
    expect(result.readiness).toBe('ready');
  });

  it('returns ready in mock adapter mode', () => {
    const env: StateStoreEnv = { HBC_ADAPTER_MODE: 'mock' };
    const result = resolveAdobeSignOAuthStateStore(env);
    expect(result.readiness).toBe('ready');
  });

  it('returns configuration-required in production (no auto-fallback to in-memory)', () => {
    const env: StateStoreEnv = {
      NODE_ENV: 'production',
      AZURE_FUNCTIONS_ENVIRONMENT: 'Production',
    };
    const result = resolveAdobeSignOAuthStateStore(env);
    expect(result.readiness).toBe('configuration-required');
    if (result.readiness !== 'configuration-required') return;
    expect(result.reason).toBe('production-store-not-selected');
  });

  it('returns configuration-required when env is empty (no silent default)', () => {
    const result = resolveAdobeSignOAuthStateStore({});
    expect(result.readiness).toBe('configuration-required');
  });
});
