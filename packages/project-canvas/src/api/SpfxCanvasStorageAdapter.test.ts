import { describe, expect, it, beforeEach } from 'vitest';
import { createSpfxCanvasStorageAdapter } from './SpfxCanvasStorageAdapter.js';
import type { ICanvasUserConfig } from '../types/index.js';

// Mock localStorage
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
    { tileKey: 'bic-my-items', col: 0, row: 0, colSpan: 4, rowSpan: 1 },
    { tileKey: 'project-health-pulse', col: 4, row: 0, colSpan: 6, rowSpan: 1 },
  ],
};

describe('SpfxCanvasStorageAdapter', () => {
  const adapter = createSpfxCanvasStorageAdapter();

  beforeEach(() => {
    storage.clear();
  });

  it('saves and retrieves config', () => {
    adapter.saveConfig(mockConfig);
    const retrieved = adapter.getConfig('proj-001', 'user-001');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.projectId).toBe('proj-001');
    expect(retrieved?.userId).toBe('user-001');
    expect(retrieved?.tiles).toHaveLength(2);
  });

  it('returns null for missing config', () => {
    expect(adapter.getConfig('unknown', 'unknown')).toBeNull();
  });

  it('returns null for corrupt data', () => {
    storage.set('hbc-canvas-spfx-proj-001-user-001', 'not-valid-json{{{');
    expect(adapter.getConfig('proj-001', 'user-001')).toBeNull();
  });

  it('returns null for config missing required fields', () => {
    storage.set('hbc-canvas-spfx-proj-001-user-001', JSON.stringify({ projectId: 'proj-001' }));
    expect(adapter.getConfig('proj-001', 'user-001')).toBeNull();
  });

  it('resets config', () => {
    adapter.saveConfig(mockConfig);
    adapter.resetConfig('proj-001', 'user-001');
    expect(adapter.getConfig('proj-001', 'user-001')).toBeNull();
  });

  it('maintains separate configs per project/user', () => {
    const config2: ICanvasUserConfig = {
      projectId: 'proj-002',
      userId: 'user-001',
      tiles: [{ tileKey: 'pending-approvals', col: 0, row: 0, colSpan: 4, rowSpan: 1 }],
    };

    adapter.saveConfig(mockConfig);
    adapter.saveConfig(config2);

    const c1 = adapter.getConfig('proj-001', 'user-001');
    const c2 = adapter.getConfig('proj-002', 'user-001');

    expect(c1?.tiles).toHaveLength(2);
    expect(c2?.tiles).toHaveLength(1);
  });
});
