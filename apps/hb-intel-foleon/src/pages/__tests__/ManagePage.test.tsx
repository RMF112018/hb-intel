import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ManagePage } from '../ManagePage.js';
import { createFoleonOriginPolicy } from '../../services/FoleonOriginPolicy.js';
import type { IFoleonRuntimeContract } from '../../runtime/foleonRuntimeContract.js';
import { FOLEON_PACKAGE_VERSION, FOLEON_WEBPART_ID } from '../../webparts/foleon/runtimeContract.js';

function mockContract(): IFoleonRuntimeContract {
  return {
    hostMode: 'mock',
    route: 'manage',
    docId: null,
    siteUrl: null,
    listIds: { contentRegistry: null, placements: null, events: null },
    originPolicy: createFoleonOriginPolicy(),
    governed: {
      expectedManifestId: FOLEON_WEBPART_ID,
      expectedPackageVersion: FOLEON_PACKAGE_VERSION,
      manifestIdMatchesExpected: true,
      packageVersionMatchesExpected: true,
    },
    readerRoutePath: null,
    apiBaseUrl: 'https://functions.test',
    apiResource: null,
    getAccessToken: async () => 'token',
    telemetry: { correlationId: 'corr', sessionId: 'sess' },
    canInitialize: true,
    issues: [],
    blockingReasons: [],
  };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('ManagePage', () => {
  it('renders manage shell and registry without iframe hosts', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      const ok = { ok: true as const, status: 200 };
      if (url.includes('/foleon/sync/status')) {
        return {
          ...ok,
          json: async () => ({
            data: {
              health: 'ready',
              config: { graphConfigured: true, foleonApiConfigured: true, sharePointSiteConfigured: true },
            },
          }),
        } as Response;
      }
      return { ...ok, json: async () => ({ data: [] }) } as Response;
    });

    render(<ManagePage contract={mockContract()} onBack={(): void => undefined} />);

    expect((await screen.findByRole('heading', { name: /Foleon Connector/i })).textContent).toMatch(/Foleon Connector/i);
    expect(screen.getByRole('complementary', { name: /Foleon content registry/i })).toBeTruthy();
    expect(document.querySelector('iframe')).toBeNull();
  });
});
