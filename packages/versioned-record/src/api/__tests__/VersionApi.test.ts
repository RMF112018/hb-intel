// src/api/__tests__/VersionApi.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VersionApi } from '../VersionApi';
import { NotificationApi } from '@hbc/notification-intelligence';

// Override global fetch with a local mock — avoids contamination from setup.ts
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

const mockConfig = {
  recordType: 'bd-scorecard',
  triggers: ['on-submit'] as const,
  getStakeholders: vi.fn().mockReturnValue(['user-1', 'user-2']),
  onVersionCreated: vi.fn(),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockSpRow(overrides: Record<string, unknown> = {}) {
  return {
    SnapshotId: 'snap-1',
    RecordType: 'bd-scorecard',
    RecordId: 'rec-1',
    Version: 1,
    Tag: 'submitted',
    ChangeSummary: 'Test',
    CreatedByUserId: 'u1',
    CreatedByDisplayName: 'Alice',
    CreatedByRole: 'PM',
    CreatedAt: '2026-01-01T00:00:00Z',
    SnapshotJson: '{"score":42}',
    ...overrides,
  };
}

function okJson(data: unknown): Partial<Response> {
  return { ok: true, json: () => Promise.resolve(data) };
}

// ---------------------------------------------------------------------------
// createSnapshot
// ---------------------------------------------------------------------------

describe('VersionApi.createSnapshot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // getMetadataList returns empty (first version)
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ value: [] }) } as unknown as Response)
      // createSnapshot POST
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) } as unknown as Response);
  });

  it('creates version 1 for a new record', async () => {
    const result = await VersionApi.createSnapshot({
      recordType: 'bd-scorecard',
      recordId: 'rec-1',
      config: mockConfig,
      snapshot: { score: 42 },
      tag: 'submitted',
      changeSummary: 'Initial submission',
      createdBy: { userId: 'u1', displayName: 'Alice', role: 'PM' },
    });

    expect(result.version).toBe(1);
    expect(result.tag).toBe('submitted');
    expect(result.snapshotId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it('calls NotificationApi.send for each stakeholder (D-09)', async () => {
    await VersionApi.createSnapshot({
      recordType: 'bd-scorecard',
      recordId: 'rec-1',
      config: mockConfig,
      snapshot: { score: 42 },
      tag: 'submitted',
      changeSummary: 'Test',
      createdBy: { userId: 'u1', displayName: 'Alice', role: 'PM' },
    });

    expect(NotificationApi.send).toHaveBeenCalledTimes(2);
    expect(NotificationApi.send).toHaveBeenCalledWith(
      expect.objectContaining({ recipientUserId: 'user-1' })
    );
  });

  it('calls config.onVersionCreated callback', async () => {
    await VersionApi.createSnapshot({
      recordType: 'bd-scorecard',
      recordId: 'rec-1',
      config: mockConfig,
      snapshot: { score: 42 },
      tag: 'submitted',
      changeSummary: 'Test',
      createdBy: { userId: 'u1', displayName: 'Alice', role: 'PM' },
    });

    expect(mockConfig.onVersionCreated).toHaveBeenCalledOnce();
  });

  it('routes large payloads to file library (D-02)', async () => {
    mockFetch.mockReset();
    const largePayload = { data: 'x'.repeat(260 * 1024) };

    mockFetch
      // getMetadataList
      .mockResolvedValueOnce(okJson({ value: [] }))
      // writeToFileLibrary POST
      .mockResolvedValueOnce(okJson({}))
      // list item POST
      .mockResolvedValueOnce(okJson({}));

    const result = await VersionApi.createSnapshot({
      recordType: 'bd-scorecard',
      recordId: 'rec-1',
      config: mockConfig,
      snapshot: largePayload,
      tag: 'submitted',
      changeSummary: 'Large payload',
      createdBy: { userId: 'u1', displayName: 'Alice', role: 'PM' },
    });

    expect(result.version).toBe(1);
    // The second call should be to the file library upload endpoint
    const secondCallUrl = mockFetch.mock.calls[1]?.[0] as string;
    expect(secondCallUrl).toContain('Files/add');
  });

  it('throws when file library write fails', async () => {
    mockFetch.mockReset();
    const largePayload = { data: 'x'.repeat(260 * 1024) };

    mockFetch
      .mockResolvedValueOnce(okJson({ value: [] }))
      // writeToFileLibrary fails
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Storage error'),
      });

    await expect(
      VersionApi.createSnapshot({
        recordType: 'bd-scorecard',
        recordId: 'rec-1',
        config: mockConfig,
        snapshot: largePayload,
        tag: 'submitted',
        changeSummary: 'Large payload',
        createdBy: { userId: 'u1', displayName: 'Alice', role: 'PM' },
      })
    ).rejects.toThrow('File library write failed');
  });
});

// ---------------------------------------------------------------------------
// getMetadataList
// ---------------------------------------------------------------------------

describe('VersionApi.getMetadataList', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns metadata without snapshot payload', async () => {
    mockFetch.mockResolvedValueOnce(okJson({
      value: [mockSpRow()],
    }));

    const result = await VersionApi.getMetadataList('bd-scorecard', 'rec-1');
    expect(result).toHaveLength(1);
    expect(result[0]?.version).toBe(1);
    // No snapshot property on IVersionMetadata
    expect('snapshot' in result[0]!).toBe(false);
    // storageRef is undefined for inline snapshots
    expect(result[0]?.storageRef).toBeUndefined();
  });

  it('sets storageRef for file-library snapshots (D-02)', async () => {
    mockFetch.mockResolvedValueOnce(okJson({
      value: [mockSpRow({
        SnapshotId: 'snap-big',
        SnapshotJson: 'ref:/sites/hb-intel/Shared Documents/System/Snapshots/bd-scorecard/rec-1/snap-big.json',
      })],
    }));

    const result = await VersionApi.getMetadataList('bd-scorecard', 'rec-1');
    expect(result[0]?.storageRef).toContain('snap-big.json');
  });
});

// ---------------------------------------------------------------------------
// spFetch error paths
// ---------------------------------------------------------------------------

describe('spFetch error handling', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws SharePoint API error with status and body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: () => Promise.resolve('Forbidden'),
    });

    await expect(
      VersionApi.getMetadataList('bd-scorecard', 'rec-1')
    ).rejects.toThrow('SharePoint API error 403: Forbidden');
  });

  it('throws with empty body when res.text() rejects', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.reject(new Error('text failed')),
    });

    await expect(
      VersionApi.getMetadataList('bd-scorecard', 'rec-1')
    ).rejects.toThrow('SharePoint API error 500: ');
  });
});

// ---------------------------------------------------------------------------
// getSnapshot
// ---------------------------------------------------------------------------

describe('VersionApi.getSnapshot', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns hydrated snapshot for inline JSON row', async () => {
    mockFetch.mockResolvedValueOnce(okJson({
      value: [mockSpRow()],
    }));

    const result = await VersionApi.getSnapshot<{ score: number }>('bd-scorecard', 'rec-1', 1);
    expect(result.snapshotId).toBe('snap-1');
    expect(result.snapshot).toEqual({ score: 42 });
    expect(result.version).toBe(1);
  });

  it('returns hydrated snapshot for file-ref row (D-02)', async () => {
    const fileRefRow = mockSpRow({
      SnapshotJson: 'ref:/sites/hb-intel/Shared Documents/System/Snapshots/bd-scorecard/rec-1/snap-1.json',
    });

    mockFetch
      // getSnapshot query
      .mockResolvedValueOnce(okJson({ value: [fileRefRow] }))
      // readFromFileLibrary
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ score: 99 }),
      });

    const result = await VersionApi.getSnapshot<{ score: number }>('bd-scorecard', 'rec-1', 1);
    expect(result.snapshot).toEqual({ score: 99 });
  });

  it('throws "Snapshot not found" when result is empty', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ value: [] }));

    await expect(
      VersionApi.getSnapshot('bd-scorecard', 'rec-1', 99)
    ).rejects.toThrow('Snapshot not found');
  });
});

// ---------------------------------------------------------------------------
// getSnapshotById
// ---------------------------------------------------------------------------

describe('VersionApi.getSnapshotById', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns hydrated snapshot by GUID', async () => {
    mockFetch.mockResolvedValueOnce(okJson({
      value: [mockSpRow({ SnapshotId: 'snap-guid-1' })],
    }));

    const result = await VersionApi.getSnapshotById<{ score: number }>('snap-guid-1');
    expect(result.snapshotId).toBe('snap-guid-1');
    expect(result.snapshot).toEqual({ score: 42 });
  });

  it('throws "Snapshot not found" when empty', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ value: [] }));

    await expect(
      VersionApi.getSnapshotById('nonexistent')
    ).rejects.toThrow('Snapshot not found');
  });
});

// ---------------------------------------------------------------------------
// tagSnapshot
// ---------------------------------------------------------------------------

describe('VersionApi.tagSnapshot', () => {
  beforeEach(() => vi.clearAllMocks());

  it('finds item and patches tag (two-step)', async () => {
    mockFetch
      // GET to find item Id
      .mockResolvedValueOnce(okJson({ value: [{ Id: 42 }] }))
      // PATCH to update tag
      .mockResolvedValueOnce(okJson({}));

    await VersionApi.tagSnapshot('snap-1', 'superseded');

    expect(mockFetch).toHaveBeenCalledTimes(2);
    // Verify the PATCH call includes the tag
    const patchBody = mockFetch.mock.calls[1]?.[1]?.body as string;
    expect(JSON.parse(patchBody)).toEqual({ Tag: 'superseded' });
  });

  it('returns without PATCH when item not found', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ value: [] }));

    await VersionApi.tagSnapshot('nonexistent', 'superseded');

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// restoreSnapshot
// ---------------------------------------------------------------------------

describe('VersionApi.restoreSnapshot', () => {
  beforeEach(() => vi.clearAllMocks());

  it('restores with approved tag when target was approved', async () => {
    const targetRow = mockSpRow({
      SnapshotId: 'snap-target',
      Version: 1,
      Tag: 'approved',
    });

    // Use mockImplementation to handle URL-based routing
    // since tagSnapshot calls happen in parallel via Promise.allSettled
    let fetchCallCount = 0;
    mockFetch.mockImplementation(() => {
      fetchCallCount++;
      switch (fetchCallCount) {
        case 1: // getSnapshotById(target)
          return Promise.resolve(okJson({ value: [targetRow] }));
        case 2: // getMetadataList
          return Promise.resolve(okJson({
            value: [
              mockSpRow({ SnapshotId: 'snap-target', Version: 1, Tag: 'approved' }),
              mockSpRow({ SnapshotId: 'snap-2', Version: 2, Tag: 'submitted' }),
              mockSpRow({ SnapshotId: 'snap-3', Version: 3, Tag: 'draft' }),
            ],
          }));
        case 3: // createSnapshot → getMetadataList
          return Promise.resolve(okJson({
            value: [
              mockSpRow({ Version: 1 }),
              mockSpRow({ SnapshotId: 'snap-2', Version: 2 }),
              mockSpRow({ SnapshotId: 'snap-3', Version: 3 }),
            ],
          }));
        case 4: // createSnapshot → POST item
          return Promise.resolve(okJson({}));
        default: // tagSnapshot GET/PATCH calls (parallel — order may vary)
          return Promise.resolve(okJson({ value: [{ Id: fetchCallCount }] }));
      }
    });

    const result = await VersionApi.restoreSnapshot({
      recordType: 'bd-scorecard',
      recordId: 'rec-1',
      targetSnapshotId: 'snap-target',
      restoredBy: { userId: 'u1', displayName: 'Alice', role: 'PM' },
      config: mockConfig,
    });

    expect(result.restoredSnapshot.tag).toBe('approved');
    expect(result.restoredSnapshot.version).toBe(4);
    expect(result.supersededSnapshotIds).toHaveLength(2);
    expect(result.supersededSnapshotIds).toContain('snap-2');
    expect(result.supersededSnapshotIds).toContain('snap-3');
  });

  it('restores with draft tag when target was not approved', async () => {
    const targetRow = mockSpRow({
      SnapshotId: 'snap-target',
      Version: 1,
      Tag: 'submitted',
    });

    let fetchCallCount = 0;
    mockFetch.mockImplementation(() => {
      fetchCallCount++;
      switch (fetchCallCount) {
        case 1: return Promise.resolve(okJson({ value: [targetRow] }));
        case 2: return Promise.resolve(okJson({
          value: [
            mockSpRow({ SnapshotId: 'snap-target', Version: 1, Tag: 'submitted' }),
            mockSpRow({ SnapshotId: 'snap-2', Version: 2, Tag: 'draft' }),
          ],
        }));
        case 3: return Promise.resolve(okJson({
          value: [
            mockSpRow({ Version: 1 }),
            mockSpRow({ SnapshotId: 'snap-2', Version: 2 }),
          ],
        }));
        case 4: return Promise.resolve(okJson({}));
        default: return Promise.resolve(okJson({ value: [{ Id: fetchCallCount }] }));
      }
    });

    const result = await VersionApi.restoreSnapshot({
      recordType: 'bd-scorecard',
      recordId: 'rec-1',
      targetSnapshotId: 'snap-target',
      restoredBy: { userId: 'u1', displayName: 'Alice', role: 'PM' },
      config: mockConfig,
    });

    expect(result.restoredSnapshot.tag).toBe('draft');
  });

  it('handles partial tagSnapshot failure gracefully', async () => {
    const targetRow = mockSpRow({
      SnapshotId: 'snap-target',
      Version: 1,
      Tag: 'submitted',
    });

    let fetchCallCount = 0;
    let tagSnapshotGetCount = 0;
    mockFetch.mockImplementation(() => {
      fetchCallCount++;
      if (fetchCallCount <= 4) {
        switch (fetchCallCount) {
          case 1: return Promise.resolve(okJson({ value: [targetRow] }));
          case 2: return Promise.resolve(okJson({
            value: [
              mockSpRow({ SnapshotId: 'snap-target', Version: 1, Tag: 'submitted' }),
              mockSpRow({ SnapshotId: 'snap-2', Version: 2, Tag: 'draft' }),
              mockSpRow({ SnapshotId: 'snap-3', Version: 3, Tag: 'draft' }),
            ],
          }));
          case 3: return Promise.resolve(okJson({
            value: [
              mockSpRow({ Version: 1 }),
              mockSpRow({ SnapshotId: 'snap-2', Version: 2 }),
              mockSpRow({ SnapshotId: 'snap-3', Version: 3 }),
            ],
          }));
          case 4: return Promise.resolve(okJson({}));
        }
      }
      // tagSnapshot calls (parallel): first GET succeeds, second GET fails
      tagSnapshotGetCount++;
      if (tagSnapshotGetCount === 1) {
        // First tagSnapshot GET: return Id
        return Promise.resolve(okJson({ value: [{ Id: 10 }] }));
      } else if (tagSnapshotGetCount === 2) {
        // First tagSnapshot PATCH: success
        return Promise.resolve(okJson({}));
      } else if (tagSnapshotGetCount === 3) {
        // Second tagSnapshot GET: fail
        return Promise.resolve({ ok: false, status: 500, text: () => Promise.resolve('Server error') });
      }
      return Promise.resolve(okJson({}));
    });

    const result = await VersionApi.restoreSnapshot({
      recordType: 'bd-scorecard',
      recordId: 'rec-1',
      targetSnapshotId: 'snap-target',
      restoredBy: { userId: 'u1', displayName: 'Alice', role: 'PM' },
      config: mockConfig,
    });

    // Only one of the two was successfully superseded
    expect(result.supersededSnapshotIds.length).toBeLessThan(2);
  });
});

// ---------------------------------------------------------------------------
// spRestUrl / spHeaders branch coverage
// ---------------------------------------------------------------------------

describe('SharePoint context helpers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses _spPageContextInfo.webAbsoluteUrl when available', async () => {
    (window as unknown as Record<string, unknown>)._spPageContextInfo = {
      webAbsoluteUrl: 'https://mysite.sharepoint.com/sites/hb-intel',
    };

    mockFetch.mockResolvedValueOnce(okJson({ value: [] }));

    await VersionApi.getMetadataList('bd-scorecard', 'rec-1');

    const callUrl = mockFetch.mock.calls[0]?.[0] as string;
    expect(callUrl).toContain('https://mysite.sharepoint.com/sites/hb-intel');

    delete (window as unknown as Record<string, unknown>)._spPageContextInfo;
  });

  it('falls back to empty string when _spPageContextInfo is absent', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ value: [] }));

    await VersionApi.getMetadataList('bd-scorecard', 'rec-1');

    const callUrl = mockFetch.mock.calls[0]?.[0] as string;
    expect(callUrl).toMatch(/^\/_api/);
  });
});

// ---------------------------------------------------------------------------
// readFromFileLibrary error path
// ---------------------------------------------------------------------------

describe('readFromFileLibrary error path', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws when file library read fails', async () => {
    const fileRefRow = mockSpRow({
      SnapshotJson: 'ref:/sites/hb-intel/Shared Documents/System/Snapshots/bd-scorecard/rec-1/snap-1.json',
    });

    mockFetch
      .mockResolvedValueOnce(okJson({ value: [fileRefRow] }))
      // readFromFileLibrary fails
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

    await expect(
      VersionApi.getSnapshot('bd-scorecard', 'rec-1', 1)
    ).rejects.toThrow('File library read failed');
  });
});
