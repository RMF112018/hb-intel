import { describe, expect, it } from 'vitest';
import { isAuthorizedRequest, isAuthExemptPath } from '../src/server.js';
import type { RunnerConfig } from '../src/types.js';

function makeConfig(overrides: Partial<RunnerConfig> = {}): RunnerConfig {
  return {
    host: '127.0.0.1',
    port: 5010,
    profile: 'remote-runner',
    certPath: '/tmp/cert.pem',
    keyPath: '/tmp/key.pem',
    allowedOrigins: ['https://hedrickbrotherscom.sharepoint.com'],
    storageDir: '/tmp/pnp-runner',
    authMode: 'DeviceLogin',
    clientId: '9bc3ab49-b65d-410a-85ad-de819febfddc',
    tenant: 'hedrickbrothers.com',
    allowNonLoopback: true,
    authRequired: true,
    apiKey: 'runner-secret',
    ...overrides,
  };
}

describe('server auth gate', () => {
  it('allows health endpoint without API key', () => {
    expect(isAuthExemptPath('/health')).toBe(true);
    expect(
      isAuthorizedRequest('GET', '/health', {}, makeConfig()),
    ).toBe(true);
  });

  it('rejects protected routes when API key is missing or invalid', () => {
    const config = makeConfig();
    expect(isAuthorizedRequest('GET', '/actions', {}, config)).toBe(false);
    expect(
      isAuthorizedRequest('GET', '/actions', { 'x-pnp-runner-key': 'wrong-secret' }, config),
    ).toBe(false);
  });

  it('accepts protected routes when API key matches', () => {
    const config = makeConfig();
    expect(
      isAuthorizedRequest('POST', '/runs', { 'x-pnp-runner-key': 'runner-secret' }, config),
    ).toBe(true);
  });
});
