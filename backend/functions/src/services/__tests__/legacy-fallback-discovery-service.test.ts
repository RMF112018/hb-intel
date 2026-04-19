import { describe, expect, it } from 'vitest';
import { LegacyFallbackDiscoveryService } from '../legacy-fallback/discovery-service.js';
import { LegacyFallbackMatchingEngine } from '../legacy-fallback/matching-engine.js';
import type { ILegacyFallbackProjectIndexProvider } from '../legacy-fallback/project-index-provider.js';
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
  readonly activeByYear: Record<number, Array<{ itemId: number; driveId: string; driveItemId: string }>> = {};
  readonly markedInactive: number[] = [];

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

  async getLatestSyncRunCompletedUtc(): Promise<string | null> {
    return null;
  }

  async listActiveRegistryRecordsByYear(year: number): Promise<readonly { itemId: number; legacyYear: number; driveId: string; driveItemId: string }[]> {
    return (this.activeByYear[year] ?? []).map((entry) => ({
      itemId: entry.itemId,
      legacyYear: year,
      driveId: entry.driveId,
      driveItemId: entry.driveItemId,
    }));
  }

  async markRegistryRecordsInactive(
    _runId: string,
    itemIds: readonly number[],
    _validatedAtUtc: string,
    _reason: string,
  ): Promise<number> {
    this.markedInactive.push(...itemIds);
    return itemIds.length;
  }
}

class FakeProjectIndexProvider implements ILegacyFallbackProjectIndexProvider {
  constructor(
    private readonly rows: Array<{
      projectListItemId: number;
      projectNumber: string;
      projectTitle: string;
      normalizedProjectTitle: string;
      year: number | null;
    }>,
  ) {}

  async loadIndex() {
    return this.rows;
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

    const matching = new LegacyFallbackMatchingEngine();
    const projectIndex = new FakeProjectIndexProvider([
      {
        projectListItemId: 10,
        projectNumber: '24-100-01',
        projectTitle: 'Test Project',
        normalizedProjectTitle: 'test project',
        year: 2024,
      },
    ]);
    const summary = await new LegacyFallbackDiscoveryService(graph, repo, matching, projectIndex, noopLogger).run({ years: [2024], dryRun: false });

    expect(summary.status).toBe('completed');
    expect(summary.foldersScanned).toBe(1);
    expect(summary.recordsCreated).toBe(1);
    expect(summary.recordsUpdated).toBe(0);
    expect(summary.sampleRecord?.driveItemId).toBe('item-a');
    expect(repo.upserts).toHaveLength(1);
    expect(repo.upserts[0].legacyYear).toBe(2024);
    expect(repo.upserts[0].projectNumber).toBe('24-100-01');
    expect(repo.upserts[0].matching.matchStatus).toBe('matched');
    expect(summary.recordsMatched).toBe(1);
    // Prompt 06: first-class operational fields flow through completeSyncRun on the success path.
    expect(repo.completions).toHaveLength(1);
    const completion = repo.completions[0];
    expect(completion.durationMs).toBeGreaterThanOrEqual(0);
    expect(completion.sourceFailureCount).toBe(0);
    expect(completion.matchAnomalyExceeded).toBe(false);
    expect(completion.firstErrorMessage).toBe('');
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

    const matching = new LegacyFallbackMatchingEngine();
    const projectIndex = new FakeProjectIndexProvider([]);
    const summary = await new LegacyFallbackDiscoveryService(graph, repo, matching, projectIndex, noopLogger).run({ years: [2025], dryRun: true });

    expect(summary.status).toBe('completed');
    expect(summary.foldersScanned).toBe(1);
    expect(summary.recordsCreated).toBe(0);
    expect(summary.recordsUpdated).toBe(0);
    expect(repo.upserts).toHaveLength(0);
  });

  it('marks failed status when a source cannot resolve', async () => {
    const repo = new FakeRepository();
    const graph = new FakeGraphClient({ 2024: [] }, 2024);

    const matching = new LegacyFallbackMatchingEngine();
    const projectIndex = new FakeProjectIndexProvider([]);
    const summary = await new LegacyFallbackDiscoveryService(graph, repo, matching, projectIndex, noopLogger).run({ years: [2024], dryRun: false });

    expect(summary.status).toBe('failed');
    expect(summary.errorCount).toBe(1);
    expect(summary.errors[0]).toContain('year=2024');
    expect(repo.completions).toHaveLength(1);
    expect(repo.completions[0].status).toBe('failed');
    // Prompt 06: failure path populates operational fields so the sync-run row is queryable without SummaryJson.
    expect(repo.completions[0].sourceFailureCount).toBe(1);
    expect(repo.completions[0].firstErrorMessage).toContain('year=2024');
    expect(repo.completions[0].durationMs).toBeGreaterThanOrEqual(0);
  });

  it('marks unseen active records as inactive during stale pass', async () => {
    const repo = new FakeRepository();
    repo.activeByYear[2024] = [
      { itemId: 10, driveId: 'drive-site-2024', driveItemId: 'item-a' },
      { itemId: 11, driveId: 'drive-site-2024', driveItemId: 'item-stale' },
    ];
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

    const matching = new LegacyFallbackMatchingEngine();
    const projectIndex = new FakeProjectIndexProvider([
      {
        projectListItemId: 10,
        projectNumber: '24-100-01',
        projectTitle: 'Test Project',
        normalizedProjectTitle: 'test project',
        year: 2024,
      },
    ]);
    const summary = await new LegacyFallbackDiscoveryService(graph, repo, matching, projectIndex, noopLogger).run({
      years: [2024],
      dryRun: false,
    });

    expect(summary.recordsMarkedInactive).toBe(1);
    expect(repo.markedInactive).toEqual([11]);
    expect(repo.upserts[0].driveId).toBe('drive-site-2024');
    expect(repo.upserts[0].driveItemId).toBe('item-a');
  });
});
