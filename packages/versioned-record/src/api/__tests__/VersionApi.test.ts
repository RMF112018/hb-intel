// src/api/__tests__/VersionApi.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VersionApi } from '../VersionApi';
import { NotificationApi } from '@hbc/notification-intelligence';

// fetch is mocked globally via jsdom
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockConfig = {
  recordType: 'bd-scorecard',
  triggers: ['on-submit'] as const,
  getStakeholders: vi.fn().mockReturnValue(['user-1', 'user-2']),
  onVersionCreated: vi.fn(),
};

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
});

describe('VersionApi.getMetadataList', () => {
  it('returns metadata without snapshot payload', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        value: [{
          SnapshotId: 'snap-1',
          Version: 1,
          Tag: 'approved',
          ChangeSummary: 'Initial',
          CreatedByUserId: 'u1',
          CreatedByDisplayName: 'Alice',
          CreatedByRole: 'PM',
          CreatedAt: '2026-01-01T00:00:00Z',
          SnapshotJson: '{"score":42}',
        }],
      }),
    } as unknown as Response);

    const result = await VersionApi.getMetadataList('bd-scorecard', 'rec-1');
    expect(result).toHaveLength(1);
    expect(result[0]?.version).toBe(1);
    // No snapshot property on IVersionMetadata
    expect('snapshot' in result[0]!).toBe(false);
    // storageRef is undefined for inline snapshots
    expect(result[0]?.storageRef).toBeUndefined();
  });

  it('sets storageRef for file-library snapshots (D-02)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        value: [{
          SnapshotId: 'snap-big',
          Version: 1,
          Tag: 'approved',
          ChangeSummary: '',
          CreatedByUserId: 'u1',
          CreatedByDisplayName: 'Alice',
          CreatedByRole: 'PM',
          CreatedAt: '2026-01-01T00:00:00Z',
          SnapshotJson: 'ref:/sites/hb-intel/Shared Documents/System/Snapshots/bd-scorecard/rec-1/snap-big.json',
        }],
      }),
    } as unknown as Response);

    const result = await VersionApi.getMetadataList('bd-scorecard', 'rec-1');
    expect(result[0]?.storageRef).toContain('snap-big.json');
  });
});
