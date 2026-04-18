import { describe, expect, it } from 'vitest';
import { LegacyFallbackDiscoveryService } from '../legacy-fallback/discovery-service.js';
import type {
  ILegacyFallbackDiscoveryGraphClient,
  ILegacyGraphDrive,
  ILegacyGraphFolderItem,
  ILegacyGraphSite,
} from '../legacy-fallback/discovery-graph-client.js';
import type {
  ILegacyFallbackDiscoveryRepository,
  ILegacyFallbackRegistryUpsertInput,
  ILegacyFallbackSyncRunCompletion,
  ILegacyFallbackSyncRunStart,
} from '../legacy-fallback/discovery-repository.js';

class FakeGraphClient implements ILegacyFallbackDiscoveryGraphClient {
  constructor(
    private readonly foldersByYear: Record<number, ILegacyGraphFolderItem[]>,
    private readonly throwYear?: number,
  ) {}

  async resolveSite(siteUrl: string): Promise<ILegacyGraphSite> {
    const year = Number(siteUrl.match(/\/sites\/(\d{4})Projects/)?.[1] ?? 0);
    if (this.throwYear && year === this.throwYear) {
      throw new Error(`site resolution failed for ${year}`);
    }
    return {
      id: `site-${year}`,
      webUrl: siteUrl,
      name: `${year} Projects`,
    };
  }

  async resolveDrive(siteId: string): Promise<ILegacyGraphDrive> {
    return {
      id: `drive-${siteId}`,
      name: 'Documents',
      webUrl: `https://example.invalid/${siteId}`,
      driveType: 'documentLibrary',
    };
  }

  async listRootFolders(driveId: string): Promise<readonly ILegacyGraphFolderItem[]> {
    const year = Number(driveId.match(/site-(\d{4})/)?.[1] ?? 0);
    return this.foldersByYear[year] ?? [];
  }
}

class FakeRepository implements ILegacyFallbackDiscoveryRepository {
  readonly upserts: ILegacyFallbackRegistryUpsertInput[] = [];
  readonly completions: ILegacyFallbackSyncRunCompletion[] = [];

  async startSyncRun(): Promise<ILegacyFallbackSyncRunStart> {
    return {
      runId: 'run-001',
      itemId: 7,
    };
  }

  async completeSyncRun(_start: ILegacyFallbackSyncRunStart, completion: ILegacyFallbackSyncRunCompletion): Promise<void> {
    this.completions.push(completion);
  }

  async upsertRegistryRecord(input: ILegacyFallbackRegistryUpsertInput): Promise<'created' | 'updated'> {
    this.upserts.push(input);
    return this.upserts.length % 2 === 0 ? 'updated' : 'created';
  }
}

const noopLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
};

describe('LegacyFallbackDiscoveryService', () => {
  it('discovers folders and writes registry records', async () => {
    const repo = new FakeRepository();
    const graph = new FakeGraphClient({
      2024: [
        {
          driveId: 'drive-site-2024',
          driveItemId: 'item-a',
          folderName: '24-100-01 Test Project',
          folderPath: '/24-100-01 Test Project',
          folderWebUrl: 'https://example.invalid/folder-a',
        },
      ],
    });

    const service = new LegacyFallbackDiscoveryService(graph, repo, noopLogger);
    const summary = await service.run({ years: [2024], dryRun: false });

    expect(summary.status).toBe('completed');
    expect(summary.foldersScanned).toBe(1);
    expect(summary.recordsCreated).toBe(1);
    expect(summary.recordsUpdated).toBe(0);
    expect(summary.sampleRecord?.driveItemId).toBe('item-a');
    expect(repo.upserts).toHaveLength(1);
    expect(repo.upserts[0].legacyYear).toBe(2024);
    expect(repo.upserts[0].projectNumber).toBe('24-100-01');
  });

  it('supports dry run without registry writes', async () => {
    const repo = new FakeRepository();
    const graph = new FakeGraphClient({
      2025: [
        {
          driveId: 'drive-site-2025',
          driveItemId: 'item-b',
          folderName: '25-777-12 Dry Run',
          folderPath: '/25-777-12 Dry Run',
          folderWebUrl: 'https://example.invalid/folder-b',
        },
      ],
    });

    const service = new LegacyFallbackDiscoveryService(graph, repo, noopLogger);
    const summary = await service.run({ years: [2025], dryRun: true });

    expect(summary.status).toBe('completed');
    expect(summary.foldersScanned).toBe(1);
    expect(summary.recordsCreated).toBe(0);
    expect(summary.recordsUpdated).toBe(0);
    expect(repo.upserts).toHaveLength(0);
  });

  it('marks failed status when a source cannot resolve', async () => {
    const repo = new FakeRepository();
    const graph = new FakeGraphClient({ 2024: [] }, 2024);

    const service = new LegacyFallbackDiscoveryService(graph, repo, noopLogger);
    const summary = await service.run({ years: [2024], dryRun: false });

    expect(summary.status).toBe('failed');
    expect(summary.errorCount).toBe(1);
    expect(summary.errors[0]).toContain('year=2024');
    expect(repo.completions).toHaveLength(1);
    expect(repo.completions[0].status).toBe('failed');
  });
});
