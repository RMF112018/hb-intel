import { CanvasApi } from '../api/index.js';
import { createMockCanvasConfig } from '@hbc/project-canvas/testing';

function createMockFetch(responseBody: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(responseBody),
    text: () => Promise.resolve(JSON.stringify(responseBody)),
  });
}

beforeEach(() => {
  vi.stubGlobal('fetch', createMockFetch(null));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('CanvasApi.getConfig (D-03)', () => {
  it('fetches config for userId + projectId', async () => {
    const config = createMockCanvasConfig();
    vi.stubGlobal('fetch', createMockFetch(config));

    const result = await CanvasApi.getConfig('user-001', 'project-001');
    expect(result).toEqual(config);
    expect(fetch).toHaveBeenCalledWith(
      '/api/canvas/configs?userId=user-001&projectId=project-001',
      expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'application/json' }) }),
    );
  });

  it('returns null when no config exists', async () => {
    vi.stubGlobal('fetch', createMockFetch(null));
    const result = await CanvasApi.getConfig('user-999', 'project-999');
    expect(result).toBeNull();
  });
});

describe('CanvasApi.saveConfig (D-03)', () => {
  it('POSTs config to backend', async () => {
    vi.stubGlobal('fetch', createMockFetch(undefined));
    const config = createMockCanvasConfig();

    await CanvasApi.saveConfig(config);
    expect(fetch).toHaveBeenCalledWith(
      '/api/canvas/configs',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(config),
      }),
    );
  });
});

describe('CanvasApi.resetToRoleDefault (D-02)', () => {
  it('POSTs reset request and returns new config', async () => {
    const config = createMockCanvasConfig();
    vi.stubGlobal('fetch', createMockFetch(config));

    const result = await CanvasApi.resetToRoleDefault('user-001', 'project-001', 'Project Manager');
    expect(result).toEqual(config);
    expect(fetch).toHaveBeenCalledWith(
      '/api/canvas/configs/reset',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ userId: 'user-001', projectId: 'project-001', role: 'Project Manager' }),
      }),
    );
  });
});

describe('CanvasApi.getRoleMandatoryTiles (D-05)', () => {
  it('fetches mandatory tiles for role', async () => {
    const tiles = [{ tileKey: 'bic-my-items' }];
    vi.stubGlobal('fetch', createMockFetch(tiles));

    const result = await CanvasApi.getRoleMandatoryTiles('Superintendent');
    expect(result).toEqual(tiles);
    expect(fetch).toHaveBeenCalledWith(
      '/api/canvas/governance/mandatory?role=Superintendent',
      expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'application/json' }) }),
    );
  });
});

describe('CanvasApi.applyMandatoryTilesToAllProjects (D-05)', () => {
  it('POSTs role-wide apply', async () => {
    vi.stubGlobal('fetch', createMockFetch(undefined));

    await CanvasApi.applyMandatoryTilesToAllProjects('Project Manager');
    expect(fetch).toHaveBeenCalledWith(
      '/api/canvas/governance/mandatory/apply-all',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ role: 'Project Manager' }),
      }),
    );
  });
});

describe('CanvasApi.getCanvasRecommendations', () => {
  it('fetches recommendations with signal and reason', async () => {
    const recommendations = [
      { tileKey: 'project-health-pulse', signal: 'health' as const, reason: 'Health score dropped below threshold' },
    ];
    vi.stubGlobal('fetch', createMockFetch(recommendations));

    const result = await CanvasApi.getCanvasRecommendations('user-001', 'project-001');
    expect(result).toEqual(recommendations);
    expect(fetch).toHaveBeenCalledWith(
      '/api/canvas/recommendations?userId=user-001&projectId=project-001',
      expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'application/json' }) }),
    );
  });
});

describe('CanvasApi.getTileDataSourceMetadata (D-08)', () => {
  it('fetches badge + tooltip for a tile', async () => {
    const metadata = {
      badge: 'Live' as const,
      tooltip: {
        badge: 'Live' as const,
        label: 'Live Data',
        description: 'Automatically synced',
        showLastSync: true,
        showSourceSystem: true,
        showQuickControls: false,
      },
    };
    vi.stubGlobal('fetch', createMockFetch(metadata));

    const result = await CanvasApi.getTileDataSourceMetadata('project-001', 'bic-my-items');
    expect(result).toEqual(metadata);
    expect(fetch).toHaveBeenCalledWith(
      '/api/canvas/tiles/bic-my-items/data-source?projectId=project-001',
      expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'application/json' }) }),
    );
  });
});

describe('apiFetch error handling', () => {
  it('throws on non-OK response with status and body', async () => {
    vi.stubGlobal('fetch', createMockFetch('Not Found', 404));

    await expect(CanvasApi.getConfig('user-001', 'project-001')).rejects.toThrow(
      'CanvasApi error 404',
    );
  });
});
