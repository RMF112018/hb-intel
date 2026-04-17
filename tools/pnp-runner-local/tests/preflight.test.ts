import { describe, expect, it, vi } from 'vitest';
import { runPreflight } from '../src/preflight.js';
import type { RunnerConfig } from '../src/types.js';

vi.mock('../src/powershell.js', () => ({
  detectPowerShell: vi.fn(() => ({ available: true, command: 'pwsh', message: 'ok' })),
  checkPnpModule: vi.fn(() => ({ available: true, version: '3.1.0', message: 'ok' })),
  runPowerShellDryCheck: vi.fn(() => ({ passed: true, message: 'ok' })),
}));

vi.mock('../src/storage.js', async (importOriginal) => {
  const original = await importOriginal<typeof import('../src/storage.js')>();
  return {
    ...original,
    assertStorageWritable: vi.fn(async () => undefined),
  };
});

function makeConfig(): RunnerConfig {
  return {
    host: '127.0.0.1',
    port: 5010,
    profile: 'local-runner',
    certPath: '/tmp/cert.pem',
    keyPath: '/tmp/key.pem',
    allowedOrigins: ['https://hedrickbrotherscom.sharepoint.com'],
    storageDir: '/tmp/pnp-runner-tests',
    authMode: 'DeviceLogin',
    clientId: '9bc3ab49-b65d-410a-85ad-de819febfddc',
    tenant: 'hedrickbrothers.com',
    allowNonLoopback: false,
    authRequired: false,
    apiKey: null,
  };
}

describe('runPreflight', () => {
  it('accepts provisioning intent for provision-and-seed action', async () => {
    const result = await runPreflight(
      'sharepoint-control:provisioning:priority-actions-band-provision-and-seed',
      {
        targetSiteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
        executionIntent: { mode: 'sharepoint-provision-and-seed' },
      },
      makeConfig(),
    );

    expect(result.ready).toBe(true);
    expect(result.checks.some((check) => check.checkId === 'execution-intent' && check.passed)).toBe(true);
  });

  it('rejects read-only intent for provisioning action', async () => {
    const result = await runPreflight(
      'sharepoint-control:provisioning:priority-actions-band-lists',
      {
        targetSiteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
        executionIntent: { mode: 'read-only-export' },
      },
      makeConfig(),
    );

    expect(result.ready).toBe(false);
    const intentCheck = result.checks.find((check) => check.checkId === 'execution-intent');
    expect(intentCheck?.passed).toBe(false);
  });
});
