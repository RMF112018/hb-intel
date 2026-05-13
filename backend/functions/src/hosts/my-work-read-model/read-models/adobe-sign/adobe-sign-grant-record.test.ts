import { describe, expect, it } from 'vitest';

import { adobeSignActorKey } from './adobe-sign-actor-normalizer.js';
import {
  ADOBE_SIGN_GRANT_FAILURE_KINDS,
  ADOBE_SIGN_GRANT_STATES,
  toAdobeSignGrantPublic,
  type AdobeSignGrantFailureMetadata,
  type IAdobeSignGrantRecord,
} from './adobe-sign-grant-record.js';

const TENANT_ID = '11111111-2222-3333-4444-555555555555';
const OID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

const baseRecord = (overrides: Partial<IAdobeSignGrantRecord> = {}): IAdobeSignGrantRecord => ({
  actorTenantId: TENANT_ID,
  actorOid: OID,
  actorKey: adobeSignActorKey(TENANT_ID, OID),
  upnSnapshot: 'user@example.com',
  displayNameSnapshot: 'Test User',
  adobeApiAccessPoint: 'https://api.na1.adobesign.com',
  adobeWebAccessPoint: 'https://secure.na1.adobesign.com',
  encryptedRefreshTokenRef: {
    storeKind: 'pending-selection',
    address: '',
  },
  grantedScopes: ['agreement_read', 'agreement_send'],
  grantedAtUtc: '2026-05-13T12:00:00.000Z',
  state: 'active',
  ...overrides,
});

describe('grant-record vocabulary', () => {
  it('declares the closed set of grant states', () => {
    expect(ADOBE_SIGN_GRANT_STATES).toEqual(['pending', 'active', 'requires-reauth', 'revoked']);
  });

  it('declares the closed set of grant failure kinds', () => {
    expect(ADOBE_SIGN_GRANT_FAILURE_KINDS).toEqual([
      'refresh-failed',
      'scope-changed',
      'revoked-upstream',
      'token-store-unavailable',
    ]);
  });
});

describe('grant-record shape', () => {
  it('uses tenant + oid (not UPN) as the lookup key partition + row', () => {
    const record = baseRecord();
    expect(record.actorKey).toBe(`${TENANT_ID.toLowerCase()}::${OID.toLowerCase()}`);
    expect(record.actorKey).not.toContain('@');
    expect(record.actorKey).not.toContain('example.com');
  });

  it('keeps the encrypted refresh-token reference opaque (no secret payload field)', () => {
    const record = baseRecord();
    // The shape must carry storeKind + address only — no `token`, `secret`,
    // `ciphertext`, or `value` field that could accidentally hold a payload.
    const refKeys = Object.keys(record.encryptedRefreshTokenRef);
    expect(refKeys).not.toContain('token');
    expect(refKeys).not.toContain('secret');
    expect(refKeys).not.toContain('ciphertext');
    expect(refKeys).not.toContain('value');
    expect(refKeys).not.toContain('refreshToken');
  });
});

describe('toAdobeSignGrantPublic', () => {
  it('strips the encrypted token reference from the public projection', () => {
    const record = baseRecord();
    const projection = toAdobeSignGrantPublic(record);

    expect(projection).not.toHaveProperty('encryptedRefreshTokenRef');
    // Defensive: enumerate keys so a future spread cannot leak the field.
    expect(Object.keys(projection)).not.toContain('encryptedRefreshTokenRef');
  });

  it('reduces failure metadata to its kind, dropping any vendor message', () => {
    const failure: AdobeSignGrantFailureMetadata = {
      kind: 'refresh-failed',
      message: 'Vendor returned 4xx — sensitive-looking detail string',
      observedAtUtc: '2026-05-13T13:00:00.000Z',
    };

    const projection = toAdobeSignGrantPublic(
      baseRecord({
        state: 'requires-reauth',
        failureMetadata: failure,
      }),
    );

    expect(projection.failureKind).toBe('refresh-failed');
    expect(JSON.stringify(projection)).not.toContain('sensitive-looking');
    expect(JSON.stringify(projection)).not.toContain('Vendor returned');
    expect(projection).not.toHaveProperty('failureMetadata');
  });

  it('preserves access points, granted scopes, and lifecycle timestamps', () => {
    const projection = toAdobeSignGrantPublic(
      baseRecord({
        lastRefreshedAtUtc: '2026-05-13T12:30:00.000Z',
        expiresAtUtc: '2026-08-13T12:30:00.000Z',
      }),
    );

    expect(projection.adobeApiAccessPoint).toBe('https://api.na1.adobesign.com');
    expect(projection.adobeWebAccessPoint).toBe('https://secure.na1.adobesign.com');
    expect(projection.grantedScopes).toEqual(['agreement_read', 'agreement_send']);
    expect(projection.grantedAtUtc).toBe('2026-05-13T12:00:00.000Z');
    expect(projection.lastRefreshedAtUtc).toBe('2026-05-13T12:30:00.000Z');
    expect(projection.expiresAtUtc).toBe('2026-08-13T12:30:00.000Z');
  });

  it('omits optional fields when they are not set on the source record', () => {
    const projection = toAdobeSignGrantPublic(
      baseRecord({
        upnSnapshot: undefined,
        displayNameSnapshot: undefined,
        lastRefreshedAtUtc: undefined,
        expiresAtUtc: undefined,
        revokedAtUtc: undefined,
      }),
    );
    expect(projection).not.toHaveProperty('upnSnapshot');
    expect(projection).not.toHaveProperty('displayNameSnapshot');
    expect(projection).not.toHaveProperty('lastRefreshedAtUtc');
    expect(projection).not.toHaveProperty('expiresAtUtc');
    expect(projection).not.toHaveProperty('revokedAtUtc');
  });
});
