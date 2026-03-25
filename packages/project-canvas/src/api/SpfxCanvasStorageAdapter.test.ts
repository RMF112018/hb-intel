import { beforeEach, describe, expect, it } from 'vitest';
import { createSpfxCanvasStorageAdapter } from './SpfxCanvasStorageAdapter.js';
import type { ICanvasUserConfig } from '../types/index.js';

const storage = new Map<string, string>();

Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear(),
  },
  writable: true,
});

const mockConfig: ICanvasUserConfig = {
  projectId: 'proj-001',
  userId: 'user-001',
  tiles: [
    { tileKey: 'bic-my-items', colStart: 1, rowStart: 1, colSpan: 4, rowSpan: 1 },
    { tileKey: 'project-health-pulse', colStart: 5, rowStart: 1, colSpan: 6, rowSpan: 1 },
  ],
};

describe('SpfxCanvasStorageAdapter', () => {
  const adapter = createSpfxCanvasStorageAdapter();

  beforeEach(() => {
    storage.clear();
  });

  it('saves and retrieves config', async () => {
    await adapter.saveConfig(mockConfig);
    const retrieved = await adapter.getConfig('proj-001', 'user-001');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.projectId).toBe('proj-001');
    expect(retrieved?.userId).toBe('user-001');
    expect(retrieved?.tiles).toHaveLength(2);
  });

  it('returns null for missing config', async () => {
    await expect(adapter.getConfig('unknown', 'unknown')).resolves.toBeNull();
  });

  it('returns null for corrupt data', async () => {
    storage.set('hbc-canvas-spfx-proj-001-user-001', 'not-valid-json{{{');
    await expect(adapter.getConfig('proj-001', 'user-001')).resolves.toBeNull();
  });

  it('returns null for config missing required fields', async () => {
    storage.set('hbc-canvas-spfx-proj-001-user-001', JSON.stringify({ projectId: 'proj-001' }));
    await expect(adapter.getConfig('proj-001', 'user-001')).resolves.toBeNull();
  });

  it('resets config', async () => {
    await adapter.saveConfig(mockConfig);
    await adapter.resetConfig('proj-001', 'user-001');
    await expect(adapter.getConfig('proj-001', 'user-001')).resolves.toBeNull();
  });

  it('maintains separate configs per project/user', async () => {
    const config2: ICanvasUserConfig = {
      projectId: 'proj-002',
      userId: 'user-001',
      tiles: [{ tileKey: 'pending-approvals', colStart: 1, rowStart: 1, colSpan: 4, rowSpan: 1 }],
    };

    await adapter.saveConfig(mockConfig);
    await adapter.saveConfig(config2);

    const c1 = await adapter.getConfig('proj-001', 'user-001');
    const c2 = await adapter.getConfig('proj-002', 'user-001');

    expect(c1?.tiles).toHaveLength(2);
    expect(c2?.tiles).toHaveLength(1);
  });
});
