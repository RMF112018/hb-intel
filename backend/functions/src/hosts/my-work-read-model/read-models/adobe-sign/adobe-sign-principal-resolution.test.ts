import { describe, expect, it } from 'vitest';

import { MY_WORK_READ_MODEL_SOURCE_STATUSES } from '@hbc/models/myWork';

import { adobeSignActorKey } from './adobe-sign-actor-normalizer.js';
import {
  ADOBE_SIGN_PRINCIPAL_RESOLUTION_STATUSES,
  toMyWorkSourceStatus,
  type AdobeSignPrincipalResolutionResult,
  type AdobeSignPrincipalResolutionStatus,
} from './adobe-sign-principal-resolution.js';

const TENANT_ID = '11111111-2222-3333-4444-555555555555';
const OID = 'aaaa';
const ACTOR_KEY = adobeSignActorKey(TENANT_ID, OID);

const STATUSES = [...ADOBE_SIGN_PRINCIPAL_RESOLUTION_STATUSES];

describe('principal-resolution status vocabulary', () => {
  it('declares the closed five-state union', () => {
    expect(STATUSES).toEqual([
      'resolved',
      'authorization-required',
      'principal-unresolved',
      'configuration-required',
      'source-unavailable',
    ]);
  });

  it('every status maps to a known MyWorkReadModelSourceStatus', () => {
    for (const status of STATUSES) {
      const mapped = toMyWorkSourceStatus(status);
      expect(MY_WORK_READ_MODEL_SOURCE_STATUSES).toContain(mapped);
    }
  });

  it('uses the canonical mapping for non-resolved statuses', () => {
    const mapping: Record<AdobeSignPrincipalResolutionStatus, string> = {
      resolved: 'available',
      'authorization-required': 'authorization-required',
      'principal-unresolved': 'principal-unresolved',
      'configuration-required': 'configuration-required',
      'source-unavailable': 'source-unavailable',
    };
    for (const status of STATUSES) {
      expect(toMyWorkSourceStatus(status)).toBe(mapping[status]);
    }
  });
});

describe('discriminated union shape (compile-time + runtime spot-check)', () => {
  it('accepts a resolved result with a public grant projection (no token material)', () => {
    const resolved: AdobeSignPrincipalResolutionResult = {
      status: 'resolved',
      principal: {
        actor: {
          tenantId: TENANT_ID,
          oid: OID,
          actorKey: ACTOR_KEY,
          upn: 'user@example.com',
        },
        adobeApiAccessPoint: 'https://api.na1.adobesign.com',
        adobeWebAccessPoint: 'https://secure.na1.adobesign.com',
        grantedScopes: ['agreement_read'],
        grantState: 'active',
      },
      grantPublic: {
        actorTenantId: TENANT_ID,
        actorOid: OID,
        actorKey: ACTOR_KEY,
        adobeApiAccessPoint: 'https://api.na1.adobesign.com',
        adobeWebAccessPoint: 'https://secure.na1.adobesign.com',
        grantedScopes: ['agreement_read'],
        grantedAtUtc: '2026-05-13T12:00:00.000Z',
        state: 'active',
      },
    };
    expect(JSON.stringify(resolved)).not.toContain('encryptedRefreshTokenRef');
    expect(toMyWorkSourceStatus(resolved.status)).toBe('available');
  });

  it('models app-only as principal-unresolved (no shared Adobe fallback)', () => {
    const appOnly: AdobeSignPrincipalResolutionResult = {
      status: 'principal-unresolved',
      reason: 'app-only',
    };
    expect(toMyWorkSourceStatus(appOnly.status)).toBe('principal-unresolved');
    expect(appOnly.reason).toBe('app-only');
  });

  it('carries the missing config-key list on configuration-required', () => {
    const cfg: AdobeSignPrincipalResolutionResult = {
      status: 'configuration-required',
      missingKeys: ['ADOBE_SIGN_OAUTH_CLIENT_SECRET'],
      pendingStoreSelection: false,
    };
    expect(cfg.missingKeys).toEqual(['ADOBE_SIGN_OAUTH_CLIENT_SECRET']);
    expect(toMyWorkSourceStatus(cfg.status)).toBe('configuration-required');
  });

  it('can express pending-store-selection without naming missing OAuth keys', () => {
    const cfg: AdobeSignPrincipalResolutionResult = {
      status: 'configuration-required',
      missingKeys: [],
      pendingStoreSelection: true,
    };
    expect(cfg.pendingStoreSelection).toBe(true);
    expect(cfg.missingKeys).toEqual([]);
  });
});
