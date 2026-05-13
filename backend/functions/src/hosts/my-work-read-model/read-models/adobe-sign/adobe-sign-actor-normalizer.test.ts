import { describe, expect, it } from 'vitest';

import type { IValidatedClaims } from '../../../../middleware/validateToken.js';
import { adobeSignActorKey, normalizeAdobeSignActor } from './adobe-sign-actor-normalizer.js';

const TENANT_ID = '11111111-2222-3333-4444-555555555555';
const OID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

const delegatedClaims = (overrides: Partial<IValidatedClaims> = {}): IValidatedClaims => ({
  upn: 'user@example.com',
  oid: OID,
  roles: [],
  displayName: 'Test User',
  ...overrides,
});

const appOnlyClaims = (overrides: Partial<IValidatedClaims> = {}): IValidatedClaims => ({
  upn: '',
  oid: 'service-principal-oid',
  roles: [],
  idtyp: 'app',
  ...overrides,
});

describe('normalizeAdobeSignActor', () => {
  describe('delegated success', () => {
    it('returns a delegated actor with tenant + oid + actorKey', () => {
      const result = normalizeAdobeSignActor({
        tenantId: TENANT_ID,
        claims: delegatedClaims(),
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.actor.tenantId).toBe(TENANT_ID);
      expect(result.actor.oid).toBe(OID);
      expect(result.actor.actorKey).toBe(`${TENANT_ID.toLowerCase()}::${OID.toLowerCase()}`);
      expect(result.actor.displayName).toBe('Test User');
      expect(result.actor.upn).toBe('user@example.com');
    });

    it('omits display/upn when claims do not carry them', () => {
      const result = normalizeAdobeSignActor({
        tenantId: TENANT_ID,
        claims: {
          upn: 'user@example.com',
          oid: OID,
          roles: [],
          // no displayName
        },
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.actor.displayName).toBeUndefined();
      expect(result.actor.upn).toBe('user@example.com');
    });
  });

  describe('app-only rejection', () => {
    it('rejects idtyp=app claims as app-only', () => {
      const result = normalizeAdobeSignActor({
        tenantId: TENANT_ID,
        claims: appOnlyClaims(),
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toBe('app-only');
    });

    it('rejects claims lacking upn as app-only', () => {
      const result = normalizeAdobeSignActor({
        tenantId: TENANT_ID,
        claims: { upn: '', oid: OID, roles: [] },
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toBe('app-only');
    });
  });

  describe('missing-oid rejection', () => {
    it('rejects delegated claims with an empty oid', () => {
      const result = normalizeAdobeSignActor({
        tenantId: TENANT_ID,
        claims: delegatedClaims({ oid: '' }),
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toBe('missing-oid');
    });
  });

  describe('missing-tenant rejection', () => {
    it('rejects when the trusted tenant id is undefined', () => {
      const result = normalizeAdobeSignActor({
        tenantId: undefined,
        claims: delegatedClaims(),
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toBe('missing-tenant');
    });

    it('rejects when the trusted tenant id is whitespace-only', () => {
      const result = normalizeAdobeSignActor({
        tenantId: '   ',
        claims: delegatedClaims(),
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toBe('missing-tenant');
    });
  });

  describe('actor key is not UPN-derived', () => {
    it('produces an identical key when upn changes but oid+tenant are fixed', () => {
      const a = normalizeAdobeSignActor({
        tenantId: TENANT_ID,
        claims: delegatedClaims({ upn: 'first@example.com' }),
      });
      const b = normalizeAdobeSignActor({
        tenantId: TENANT_ID,
        claims: delegatedClaims({ upn: 'renamed@example.com' }),
      });

      expect(a.ok && b.ok).toBe(true);
      if (!a.ok || !b.ok) return;
      expect(a.actor.actorKey).toBe(b.actor.actorKey);
    });

    it('does not embed upn anywhere inside the actor key', () => {
      const result = normalizeAdobeSignActor({
        tenantId: TENANT_ID,
        claims: delegatedClaims({ upn: 'distinct-upn@example.com' }),
      });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.actor.actorKey).not.toContain('distinct-upn');
      expect(result.actor.actorKey).not.toContain('example.com');
    });
  });

  describe('adobeSignActorKey helper', () => {
    it('matches the key produced by normalizeAdobeSignActor', () => {
      const direct = adobeSignActorKey(TENANT_ID, OID);
      const normalized = normalizeAdobeSignActor({
        tenantId: TENANT_ID,
        claims: delegatedClaims(),
      });
      expect(normalized.ok).toBe(true);
      if (!normalized.ok) return;
      expect(normalized.actor.actorKey).toBe(direct);
    });

    it('normalizes case so equivalent tenant/oid casings produce one key', () => {
      const upper = adobeSignActorKey(TENANT_ID.toUpperCase(), OID.toUpperCase());
      const lower = adobeSignActorKey(TENANT_ID.toLowerCase(), OID.toLowerCase());
      expect(upper).toBe(lower);
    });
  });
});
