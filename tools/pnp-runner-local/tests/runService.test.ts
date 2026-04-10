import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LocalRunnerService } from '../src/runService.js';
import type { RunnerConfig } from '../src/types.js';

vi.mock('../src/preflight.js', () => ({
  runPreflight: vi.fn(async () => ({ ready: true, checks: [] })),
}));

vi.mock('../src/powershell.js', () => ({
  detectPowerShell: vi.fn(() => ({ available: true, command: 'pwsh', message: 'ok' })),
  checkPnpModule: vi.fn(() => ({ available: true, version: '3.1.0', message: 'ok' })),
  runExtractionScript: vi.fn(async ({ files }) => {
    await fs.writeFile(files.rawPath, JSON.stringify({ ok: true }, null, 2), 'utf-8');
    await fs.writeFile(files.normalizedPath, JSON.stringify({ ok: true }, null, 2), 'utf-8');
    await fs.writeFile(files.summaryPath, '# Summary\n', 'utf-8');
  }),
}));

const tempDirs: string[] = [];

function makeConfig(storageDir: string): RunnerConfig {
  return {
    host: '127.0.0.1',
    port: 5010,
    profile: 'local-runner',
    certPath: '/tmp/cert.pem',
    keyPath: '/tmp/key.pem',
    allowedOrigins: ['https://hedrickbrotherscom.sharepoint.com'],
    storageDir,
    authMode: 'DeviceLogin',
    clientId: '9bc3ab49-b65d-410a-85ad-de819febfddc',
    tenant: 'hedrickbrothers.com',
    allowNonLoopback: false,
    authRequired: false,
    apiKey: null,
  };
}

async function waitForTerminal(service: LocalRunnerService, runId: string): Promise<'Completed' | 'Failed'> {
  for (let i = 0; i < 60; i += 1) {
    const run = service.getRun(runId);
    if (run.status === 'Completed' || run.status === 'Failed') {
      return run.status;
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error('Timed out waiting for run completion.');
}

describe('LocalRunnerService', () => {
  afterEach(async () => {
    await Promise.all(tempDirs.map((dir) => fs.rm(dir, { recursive: true, force: true })));
    tempDirs.length = 0;
  });

  it('runs extraction and publishes evidence artifacts', async () => {
    const storageDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pnp-runner-local-test-'));
    tempDirs.push(storageDir);
    const service = new LocalRunnerService(makeConfig(storageDir));
    await service.initialize();

    const launched = await service.launch({
      actionKey: 'sharepoint-control:extraction:site-template',
      commandInput: {
        targetSiteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
        executionIntent: { mode: 'read-only-export' },
      },
    });
    const status = await waitForTerminal(service, launched.runId);
    expect(status).toBe('Completed');

    const evidence = service.getEvidence(launched.runId);
    expect(evidence.total).toBeGreaterThanOrEqual(5);
    expect(evidence.evidenceRefs[0]?.fileName).toBe('artifact-bundle.zip');
  });
});
