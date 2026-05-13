import { describe, expect, it } from 'vitest';

import { adobeSignActorKey } from './adobe-sign-actor-normalizer.js';
import {
  ADOBE_SIGN_OAUTH_STATE_BYTE_LENGTH,
  ADOBE_SIGN_OAUTH_STATE_DEFAULT_TTL_SECONDS,
  classifyOAuthStateAtConsume,
  createAdobeSignOAuthState,
  toBase64Url,
  type AdobeSignOAuthStateRecord,
} from './adobe-sign-oauth-state.js';

const TENANT = '11111111-2222-3333-4444-555555555555';
const OID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const ACTOR_KEY = adobeSignActorKey(TENANT, OID);

const deterministicRandomBytes =
  (seed = 0xa5) =>
  (n: number): Uint8Array =>
    Uint8Array.from({ length: n }, (_, i) => (seed + i) & 0xff);

const fixedNow = (iso: string) => () => new Date(iso);

describe('toBase64Url', () => {
  it('produces URL-safe alphabet without padding', () => {
    const encoded = toBase64Url(Uint8Array.from([0xfb, 0xff, 0xbf]));
    expect(encoded).not.toContain('+');
    expect(encoded).not.toContain('/');
    expect(encoded).not.toContain('=');
  });

  it('round-trips for the canonical 32-byte length used by state values', () => {
    const bytes = deterministicRandomBytes()(32);
    const encoded = toBase64Url(bytes);
    expect(encoded.length).toBeGreaterThanOrEqual(43);
    expect(encoded.length).toBeLessThanOrEqual(44);
  });
});

describe('createAdobeSignOAuthState', () => {
  const baseInput = (overrides: Partial<Parameters<typeof createAdobeSignOAuthState>[0]> = {}) =>
    ({
      actorKey: ACTOR_KEY,
      returnPath: '/SitePages/MyDashboard.aspx',
      now: fixedNow('2026-05-13T12:00:00.000Z'),
      randomBytes: deterministicRandomBytes(),
      ...overrides,
    }) as const;

  it('produces a record with a 256-bit state value bound to the actor key + return path', () => {
    const record = createAdobeSignOAuthState(baseInput());
    expect(record.actorKey).toBe(ACTOR_KEY);
    expect(record.returnPath).toBe('/SitePages/MyDashboard.aspx');
    expect(record.consumedAtUtc).toBeUndefined();
    // 32 bytes → 43 chars base64url (no padding)
    expect(record.stateValue.length).toBe(43);
    expect(record.stateValue).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('respects the default TTL and uses the injected clock', () => {
    const record = createAdobeSignOAuthState(baseInput());
    expect(record.createdAtUtc).toBe('2026-05-13T12:00:00.000Z');
    const ttlMs = ADOBE_SIGN_OAUTH_STATE_DEFAULT_TTL_SECONDS * 1000;
    expect(new Date(record.expiresAtUtc).getTime() - new Date(record.createdAtUtc).getTime()).toBe(
      ttlMs,
    );
  });

  it('rejects non-positive TTLs', () => {
    expect(() => createAdobeSignOAuthState(baseInput({ ttlSeconds: 0 }))).toThrow(/ttlSeconds/);
    expect(() => createAdobeSignOAuthState(baseInput({ ttlSeconds: -1 }))).toThrow(/ttlSeconds/);
  });

  it('rejects randomBytes implementations that return the wrong length', () => {
    expect(() =>
      createAdobeSignOAuthState(baseInput({ randomBytes: () => new Uint8Array(16) })),
    ).toThrow(/32 bytes/);
  });

  it('two consecutive calls with different random bytes produce different state values', () => {
    const a = createAdobeSignOAuthState(baseInput({ randomBytes: deterministicRandomBytes(0x11) }));
    const b = createAdobeSignOAuthState(baseInput({ randomBytes: deterministicRandomBytes(0x77) }));
    expect(a.stateValue).not.toBe(b.stateValue);
  });

  it('emits a stateValue of the documented byte length', () => {
    const seenLengths = new Set<number>();
    for (let seed = 1; seed < 16; seed++) {
      const record = createAdobeSignOAuthState(
        baseInput({ randomBytes: deterministicRandomBytes(seed * 7) }),
      );
      seenLengths.add(record.stateValue.length);
    }
    // base64url of 32 bytes is always 43 chars (no padding).
    expect([...seenLengths]).toEqual([43]);
    expect(ADOBE_SIGN_OAUTH_STATE_BYTE_LENGTH).toBe(32);
  });
});

describe('classifyOAuthStateAtConsume', () => {
  const baseRecord = (
    overrides: Partial<AdobeSignOAuthStateRecord> = {},
  ): AdobeSignOAuthStateRecord => ({
    stateValue: 'state-value',
    actorKey: ACTOR_KEY,
    returnPath: '/SitePages/MyDashboard.aspx',
    createdAtUtc: '2026-05-13T12:00:00.000Z',
    expiresAtUtc: '2026-05-13T12:10:00.000Z',
    ...overrides,
  });

  it('returns valid when not consumed and not expired', () => {
    expect(classifyOAuthStateAtConsume(baseRecord(), new Date('2026-05-13T12:05:00.000Z'))).toBe(
      'valid',
    );
  });

  it('returns expired when now is at or past the expiry instant', () => {
    expect(classifyOAuthStateAtConsume(baseRecord(), new Date('2026-05-13T12:10:00.000Z'))).toBe(
      'expired',
    );
    expect(classifyOAuthStateAtConsume(baseRecord(), new Date('2026-05-13T12:30:00.000Z'))).toBe(
      'expired',
    );
  });

  it('returns consumed when the record already carries a consumedAtUtc, even if not expired', () => {
    expect(
      classifyOAuthStateAtConsume(
        baseRecord({ consumedAtUtc: '2026-05-13T12:03:00.000Z' }),
        new Date('2026-05-13T12:05:00.000Z'),
      ),
    ).toBe('consumed');
  });
});
