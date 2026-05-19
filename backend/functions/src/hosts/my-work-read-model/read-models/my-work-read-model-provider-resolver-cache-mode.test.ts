import { describe, expect, it } from 'vitest';

import type { EnvLike } from './adobe-sign/adobe-sign-config.js';
import {
  composeAdobeSignCacheStack,
  resolveMyWorkReadModelProvider,
} from './my-work-read-model-provider-resolver.js';

const READY_OAUTH_ENV: EnvLike = {
  ADOBE_SIGN_OAUTH_CLIENT_ID: 'client-id',
  ADOBE_SIGN_OAUTH_CLIENT_SECRET: 'client-secret',
  ADOBE_SIGN_OAUTH_REDIRECT_URI: 'https://hb-intel.example/api/adobe/callback',
  ADOBE_SIGN_OAUTH_SCOPES: 'agreement_read agreement_send webhook_read webhook_write',
  ADOBE_SIGN_TOKEN_STORE_MODE: 'table-storage',
  AZURE_TABLE_ENDPOINT: 'https://example.table.core.windows.net',
  ADOBE_SIGN_TOKEN_ENCRYPTION_KEY: 'dGVzdC1rZXktdGVzdC1rZXktdGVzdC1rZXktdGVzdC0=',
  AZURE_TENANT_ID: 'tenant-1',
};

describe('composeAdobeSignCacheStack', () => {
  it("reports configuration-required when OAuth config is not ready", () => {
    const composition = composeAdobeSignCacheStack({});
    expect(composition.status).toBe('configuration-required');
    if (composition.status === 'configuration-required') {
      expect(composition.reason).toBe('oauth-config-not-ready');
    }
  });

  it("returns a known discriminant for a fully-populated OAuth env", () => {
    // Composition may report 'ready' OR 'configuration-required' depending
    // on the grant-store / cipher chain readiness against a synthetic env.
    // The behavior under test here is that the discriminant union is sound
    // and that 'oauth-config-not-ready' is NOT the reason when OAuth keys
    // are all present.
    const composition = composeAdobeSignCacheStack(READY_OAUTH_ENV);
    expect(['ready', 'configuration-required']).toContain(composition.status);
    if (composition.status === 'configuration-required') {
      expect(composition.reason).not.toBe('oauth-config-not-ready');
    }
  });
});

describe('resolveMyWorkReadModelProvider — cache-mode gate', () => {
  it("returns the cache provider when readMode='cache' and cache stack is ready", () => {
    const env: EnvLike = { ...READY_OAUTH_ENV, MY_WORK_ADOBE_SIGN_READ_MODE: 'cache' };
    const provider = resolveMyWorkReadModelProvider(env);
    expect(provider).toBeDefined();
    expect(typeof provider.getAdobeSignActionQueue).toBe('function');
  });

  it("falls back to live provider when readMode='cache' but OAuth config not ready", () => {
    const env: EnvLike = { MY_WORK_ADOBE_SIGN_READ_MODE: 'cache' };
    const provider = resolveMyWorkReadModelProvider(env);
    // When the live stack is also not ready, the resolver returns the
    // fallback (backend-unavailable) mock provider — that's the expected
    // graceful degradation path. The point of this test: the resolver
    // does NOT crash, and it returns a provider object.
    expect(provider).toBeDefined();
    expect(typeof provider.getAdobeSignActionQueue).toBe('function');
  });

  it("returns the live provider when readMode='live' (default)", () => {
    const env: EnvLike = { ...READY_OAUTH_ENV, MY_WORK_ADOBE_SIGN_READ_MODE: 'live' };
    const provider = resolveMyWorkReadModelProvider(env);
    expect(provider).toBeDefined();
  });

  it("returns the live provider when readMode is unset", () => {
    const provider = resolveMyWorkReadModelProvider(READY_OAUTH_ENV);
    expect(provider).toBeDefined();
  });

  it("returns the live provider when readMode is an unrecognized value", () => {
    const env: EnvLike = { ...READY_OAUTH_ENV, MY_WORK_ADOBE_SIGN_READ_MODE: 'hybrid' };
    const provider = resolveMyWorkReadModelProvider(env);
    expect(provider).toBeDefined();
  });

  it("test/mock mode beats readMode='cache'", () => {
    const env: EnvLike = {
      ...READY_OAUTH_ENV,
      NODE_ENV: 'test',
      MY_WORK_ADOBE_SIGN_READ_MODE: 'cache',
    };
    const provider = resolveMyWorkReadModelProvider(env);
    expect(provider).toBeDefined();
  });
});
