import { describe, expect, it } from 'vitest';

import {
  isAdobeSignConfigReady,
  parseAdobeSignScopes,
  resolveAdobeSignOAuthConfigReadiness,
  type EnvLike,
} from './adobe-sign-config.js';

const FULL_OAUTH_ENV: EnvLike = {
  ADOBE_SIGN_OAUTH_CLIENT_ID: 'adobe-client-id-value',
  ADOBE_SIGN_OAUTH_CLIENT_SECRET: 'super-secret-do-not-echo',
  ADOBE_SIGN_OAUTH_REDIRECT_URI: 'https://hb-intel.example.com/api/adobe/callback',
  ADOBE_SIGN_OAUTH_SCOPES: 'agreement_read agreement_send',
};

const SECRET_NEEDLE = 'super-secret-do-not-echo';

describe('parseAdobeSignScopes', () => {
  it('returns an empty list for undefined / blank', () => {
    expect(parseAdobeSignScopes(undefined)).toEqual([]);
    expect(parseAdobeSignScopes('')).toEqual([]);
    expect(parseAdobeSignScopes('   ')).toEqual([]);
  });

  it('splits on whitespace and commas, lowercasing + deduping', () => {
    expect(parseAdobeSignScopes(' Agreement_Read , agreement_send  AGREEMENT_READ ')).toEqual([
      'agreement_read',
      'agreement_send',
    ]);
  });
});

describe('resolveAdobeSignOAuthConfigReadiness', () => {
  it('reports configuration-required when every key is missing', () => {
    const readiness = resolveAdobeSignOAuthConfigReadiness({});
    expect(readiness.status).toBe('configuration-required');
    expect(readiness.missingKeys).toEqual([
      'ADOBE_SIGN_OAUTH_CLIENT_ID',
      'ADOBE_SIGN_OAUTH_CLIENT_SECRET',
      'ADOBE_SIGN_OAUTH_REDIRECT_URI',
      'ADOBE_SIGN_OAUTH_SCOPES',
    ]);
    expect(readiness.hasGovernedScopes).toBe(false);
    expect(readiness.tokenStoreMode).toBe('pending-selection');
  });

  it('reports configuration-required when only the client secret is missing', () => {
    const env: EnvLike = { ...FULL_OAUTH_ENV, ADOBE_SIGN_OAUTH_CLIENT_SECRET: undefined };
    const readiness = resolveAdobeSignOAuthConfigReadiness(env);
    expect(readiness.status).toBe('configuration-required');
    expect(readiness.missingKeys).toEqual(['ADOBE_SIGN_OAUTH_CLIENT_SECRET']);
  });

  it('reports configuration-required when scopes are present but empty after parsing', () => {
    const env: EnvLike = { ...FULL_OAUTH_ENV, ADOBE_SIGN_OAUTH_SCOPES: '   ,  ,, ' };
    const readiness = resolveAdobeSignOAuthConfigReadiness(env);
    expect(readiness.status).toBe('configuration-required');
    expect(readiness.missingKeys).toEqual(['ADOBE_SIGN_OAUTH_SCOPES']);
    expect(readiness.hasGovernedScopes).toBe(false);
  });

  it('reports pending-store-selection when OAuth keys are complete but store mode is unset', () => {
    const readiness = resolveAdobeSignOAuthConfigReadiness(FULL_OAUTH_ENV);
    expect(readiness.status).toBe('pending-store-selection');
    expect(readiness.missingKeys).toEqual([]);
    expect(readiness.tokenStoreMode).toBe('pending-selection');
    expect(readiness.hasGovernedScopes).toBe(true);
  });

  it('reports pending-store-selection for an unknown ADOBE_SIGN_TOKEN_STORE_MODE value', () => {
    const env: EnvLike = { ...FULL_OAUTH_ENV, ADOBE_SIGN_TOKEN_STORE_MODE: 'mystery-store' };
    const readiness = resolveAdobeSignOAuthConfigReadiness(env);
    expect(readiness.status).toBe('pending-store-selection');
    expect(readiness.tokenStoreMode).toBe('pending-selection');
  });

  it('reports ready when OAuth keys are complete, table-storage is selected, and infrastructure keys are present', () => {
    const env: EnvLike = {
      ...FULL_OAUTH_ENV,
      ADOBE_SIGN_TOKEN_STORE_MODE: 'table-storage',
      AZURE_TABLE_ENDPOINT: 'https://example.table.core.windows.net',
      ADOBE_SIGN_TOKEN_ENCRYPTION_KEY: 'dGVzdC1rZXktdGVzdC1rZXktdGVzdC1rZXktdGVzdC0=',
    };
    const readiness = resolveAdobeSignOAuthConfigReadiness(env);
    expect(readiness.status).toBe('ready');
    expect(readiness.tokenStoreMode).toBe('table-storage');
    expect(readiness.missingStorageKeys).toEqual([]);
    expect(isAdobeSignConfigReady(readiness)).toBe(true);
  });

  it('reports configuration-required for table-storage when AZURE_TABLE_ENDPOINT is missing', () => {
    const env: EnvLike = {
      ...FULL_OAUTH_ENV,
      ADOBE_SIGN_TOKEN_STORE_MODE: 'table-storage',
      ADOBE_SIGN_TOKEN_ENCRYPTION_KEY: 'dGVzdC1rZXktdGVzdC1rZXktdGVzdC1rZXktdGVzdC0=',
    };
    const readiness = resolveAdobeSignOAuthConfigReadiness(env);
    expect(readiness.status).toBe('configuration-required');
    expect(readiness.missingStorageKeys).toEqual(['AZURE_TABLE_ENDPOINT']);
  });

  it('reports configuration-required for table-storage when the encryption key is missing', () => {
    const env: EnvLike = {
      ...FULL_OAUTH_ENV,
      ADOBE_SIGN_TOKEN_STORE_MODE: 'table-storage',
      AZURE_TABLE_ENDPOINT: 'https://example.table.core.windows.net',
    };
    const readiness = resolveAdobeSignOAuthConfigReadiness(env);
    expect(readiness.status).toBe('configuration-required');
    expect(readiness.missingStorageKeys).toEqual(['ADOBE_SIGN_TOKEN_ENCRYPTION_KEY']);
  });

  it('reports unsupported-store-mode for key-vault (no production adapter in this remediation)', () => {
    const env: EnvLike = {
      ...FULL_OAUTH_ENV,
      ADOBE_SIGN_TOKEN_STORE_MODE: 'key-vault',
      AZURE_TABLE_ENDPOINT: 'https://example.table.core.windows.net',
      ADOBE_SIGN_TOKEN_ENCRYPTION_KEY: 'dGVzdC1rZXktdGVzdC1rZXktdGVzdC1rZXktdGVzdC0=',
    };
    const readiness = resolveAdobeSignOAuthConfigReadiness(env);
    expect(readiness.status).toBe('unsupported-store-mode');
    expect(isAdobeSignConfigReady(readiness)).toBe(false);
  });

  it('never echoes secret values back through the readiness object', () => {
    const readiness = resolveAdobeSignOAuthConfigReadiness({
      ...FULL_OAUTH_ENV,
      ADOBE_SIGN_TOKEN_STORE_MODE: 'table-storage',
    });
    const serialized = JSON.stringify(readiness);
    expect(serialized).not.toContain(SECRET_NEEDLE);
    expect(serialized).not.toContain('adobe-client-id-value');
    expect(serialized).not.toContain('hb-intel.example.com');
    expect(serialized).not.toContain('agreement_read');
  });

  it('never echoes secret values even when reporting configuration-required for one key', () => {
    const readiness = resolveAdobeSignOAuthConfigReadiness({
      ...FULL_OAUTH_ENV,
      ADOBE_SIGN_OAUTH_REDIRECT_URI: undefined,
    });
    expect(readiness.status).toBe('configuration-required');
    expect(JSON.stringify(readiness)).not.toContain(SECRET_NEEDLE);
  });
});

describe('isAdobeSignConfigReady', () => {
  it('returns false for configuration-required', () => {
    expect(isAdobeSignConfigReady(resolveAdobeSignOAuthConfigReadiness({}))).toBe(false);
  });

  it('returns false for pending-store-selection', () => {
    expect(isAdobeSignConfigReady(resolveAdobeSignOAuthConfigReadiness(FULL_OAUTH_ENV))).toBe(
      false,
    );
  });
});
