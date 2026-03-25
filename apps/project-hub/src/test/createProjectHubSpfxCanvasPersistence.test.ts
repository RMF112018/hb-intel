import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ICanvasUserConfig } from '@hbc/project-canvas';
import { createProjectHubSpfxCanvasPersistence } from '../spfx/createProjectHubSpfxCanvasPersistence.js';

const SITE_URL = 'https://tenant.sharepoint.com/sites/project-alpha';
const STORAGE_KEY = 'hbc-canvas-spfx-project-001-user-001';

const remoteConfig: ICanvasUserConfig = {
  projectId: 'project-001',
  userId: 'user-001',
  tiles: [{ tileKey: 'project-health-pulse', colStart: 1, rowStart: 1, colSpan: 6, rowSpan: 1 }],
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('createProjectHubSpfxCanvasPersistence', () => {
  it('rehydrates from SharePoint and mirrors the result into local storage', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/items?$select=Id,Title")) {
          return new Response(JSON.stringify({ value: [{ Id: 7, Title: 'project-001::user-001' }] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        if (url.includes("/AttachmentFiles/getByFileName('canvas-config.json')/$value")) {
          return new Response(JSON.stringify(remoteConfig), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        return new Response(null, { status: 404 });
      }),
    );

    const adapter = createProjectHubSpfxCanvasPersistence(SITE_URL);
    const config = await adapter.getConfig('project-001', 'user-001');

    expect(config).toEqual(remoteConfig);
    expect(localStorage.getItem(STORAGE_KEY)).toContain('project-health-pulse');
  });

  it('keeps local persistence available when SharePoint sync fails', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('unavailable', { status: 503 })),
    );

    const adapter = createProjectHubSpfxCanvasPersistence(SITE_URL);
    await adapter.saveConfig(remoteConfig);

    expect(localStorage.getItem(STORAGE_KEY)).toContain('project-health-pulse');

    const fallback = await adapter.getConfig('project-001', 'user-001');
    expect(fallback).toEqual(remoteConfig);
    expect(warnSpy).toHaveBeenCalled();
  });
});
