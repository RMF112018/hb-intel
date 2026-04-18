import { DefaultAzureCredential } from '@azure/identity';
import {
  createLegacyFallbackRecordKey,
  type ILegacyProjectFallbackRegistryRecord,
  type ILegacyProjectFallbackSyncRun,
} from '@hbc/models/provisioning';
import { randomUUID } from 'crypto';
import { spfi } from '@pnp/sp';
import '@pnp/nodejs-commonjs';
import '@pnp/sp/items/index.js';
import '@pnp/sp/lists/index.js';
import '@pnp/sp/webs/index.js';
import { withRetry } from '../../utils/retry.js';
import {
  LEGACY_FALLBACK_REGISTRY_LIST_TITLE,
  LEGACY_FALLBACK_SYNC_RUNS_LIST_TITLE,
  getLegacyFallbackListHostSiteUrl,
} from './list-descriptors.js';
import type { ILegacyFallbackMatchDecision } from './matching-engine.js';

export interface ILegacyFallbackRegistryUpsertInput {
  readonly runId: string;
  readonly discoveredAtUtc: string;
  readonly projectNumber: string;
  readonly projectNameRaw: string;
  readonly projectNameNormalized: string;
  readonly legacyYear: number;
  readonly sourceSiteName: string;
  readonly sourceSitePath: string;
  readonly sourceLibraryName: string;
  readonly driveId: string;
  readonly driveItemId: string;
  readonly folderName: string;
  readonly folderPath: string;
  readonly folderWebUrl: string;
  readonly matching: ILegacyFallbackMatchDecision;
}

export interface ILegacyFallbackSyncRunStart {
  readonly runId: string;
  readonly itemId: number;
}

export interface ILegacyFallbackSyncRunCompletion {
  readonly status: 'completed' | 'failed';
  readonly completedUtc: string;
  readonly foldersScanned: number;
  readonly recordsCreated: number;
  readonly recordsUpdated: number;
  readonly recordsMatched: number;
  readonly recordsReviewRequired: number;
  readonly recordsUnmatched: number;
  readonly recordsMarkedInactive: number;
  readonly errorCount: number;
  readonly yearsProcessed: readonly number[];
  readonly summaryJson: string;
}

export interface ILegacyFallbackRegistryIdentity {
  readonly itemId: number;
  readonly legacyYear: number;
  readonly driveId: string;
  readonly driveItemId: string;
}

export interface ILegacyFallbackDiscoveryRepository {
  startSyncRun(years: readonly number[]): Promise<ILegacyFallbackSyncRunStart>;
  completeSyncRun(start: ILegacyFallbackSyncRunStart, completion: ILegacyFallbackSyncRunCompletion): Promise<void>;
  upsertRegistryRecord(input: ILegacyFallbackRegistryUpsertInput): Promise<'created' | 'updated'>;
  listActiveRegistryRecordsByYear(year: number): Promise<readonly ILegacyFallbackRegistryIdentity[]>;
  markRegistryRecordsInactive(
    runId: string,
    itemIds: readonly number[],
    validatedAtUtc: string,
    reason: string,
  ): Promise<number>;
}

function toTitle(years: readonly number[]): string {
  if (years.length === 1) {
    return `Legacy fallback sync ${years[0]}`;
  }
  return `Legacy fallback sync ${years.join(',')}`;
}

function escapeODataValue(value: string): string {
  return value.replace(/'/g, "''");
}

function parseRunItemId(addResult: unknown): number {
  const candidate = addResult as { data?: { Id?: number }; Id?: number };
  return candidate?.data?.Id ?? candidate?.Id ?? 0;
}

export class LegacyFallbackDiscoveryRepository implements ILegacyFallbackDiscoveryRepository {
  private readonly credential = new DefaultAzureCredential();
  private readonly siteUrl = getLegacyFallbackListHostSiteUrl();

  async startSyncRun(years: readonly number[]): Promise<ILegacyFallbackSyncRunStart> {
    const runId = randomUUID();
    const startedUtc = new Date().toISOString();

    const payload: Partial<ILegacyProjectFallbackSyncRun> = {
      title: toTitle(years),
      runId,
      startedUtc,
      status: 'running',
      yearsProcessed: [...years],
      foldersScanned: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsUnmatched: 0,
      errorCount: 0,
      summaryJson: JSON.stringify({ phase: 'started' }),
      completedUtc: null,
    };

    const itemId = await withRetry(async () => {
      const sp: any = await this.getSP();
      const addResult = await sp.web.lists.getByTitle(LEGACY_FALLBACK_SYNC_RUNS_LIST_TITLE).items.add({
        Title: payload.title,
        RunId: payload.runId,
        StartedUtc: payload.startedUtc,
        Status: payload.status,
        YearsProcessed: JSON.stringify(payload.yearsProcessed),
        FoldersScanned: payload.foldersScanned,
        RecordsCreated: payload.recordsCreated,
        RecordsUpdated: payload.recordsUpdated,
        RecordsUnmatched: payload.recordsUnmatched,
        ErrorCount: payload.errorCount,
        SummaryJson: payload.summaryJson,
      });
      return parseRunItemId(addResult);
    });

    if (itemId <= 0) {
      throw new Error(`Unable to capture sync run item id for run ${runId}`);
    }

    return { runId, itemId };
  }

  async completeSyncRun(
    start: ILegacyFallbackSyncRunStart,
    completion: ILegacyFallbackSyncRunCompletion,
  ): Promise<void> {
    await withRetry(async () => {
      const sp: any = await this.getSP();
      await sp.web.lists
        .getByTitle(LEGACY_FALLBACK_SYNC_RUNS_LIST_TITLE)
        .items.getById(start.itemId)
        .update({
          Status: completion.status,
          CompletedUtc: completion.completedUtc,
          FoldersScanned: completion.foldersScanned,
          RecordsCreated: completion.recordsCreated,
          RecordsUpdated: completion.recordsUpdated,
          RecordsUnmatched: completion.recordsUnmatched,
          ErrorCount: completion.errorCount,
          YearsProcessed: JSON.stringify(completion.yearsProcessed),
          SummaryJson: completion.summaryJson,
        });
    });
  }

  async upsertRegistryRecord(input: ILegacyFallbackRegistryUpsertInput): Promise<'created' | 'updated'> {
    const recordKey = createLegacyFallbackRecordKey(input.driveId, input.driveItemId);

    return withRetry(async () => {
      const sp: any = await this.getSP();
      const list = sp.web.lists.getByTitle(LEGACY_FALLBACK_REGISTRY_LIST_TITLE);
      const driveId = escapeODataValue(input.driveId);
      const driveItemId = escapeODataValue(input.driveItemId);
      const existing = await list.items
        .filter(`DriveId eq '${driveId}' and DriveItemId eq '${driveItemId}'`)
        .top(1)
        .select('Id')();

      const payload: Partial<ILegacyProjectFallbackRegistryRecord> & { Title: string } = {
        Title: `${input.legacyYear} ${input.folderName}`.slice(0, 255),
        projectNumber: input.projectNumber,
        projectNameRaw: input.projectNameRaw,
        projectNameNormalized: input.projectNameNormalized,
        legacyYear: input.legacyYear,
        sourceSiteName: input.sourceSiteName,
        sourceSitePath: input.sourceSitePath,
        sourceLibraryName: input.sourceLibraryName,
        driveId: input.driveId,
        driveItemId: input.driveItemId,
        folderName: input.folderName,
        folderPath: input.folderPath,
        folderWebUrl: input.folderWebUrl,
        matchStatus: input.matching.matchStatus,
        matchConfidence: input.matching.matchConfidence,
        matchedProjectListItemId: input.matching.matchedProjectListItemId,
        matchedProjectTitle: input.matching.matchedProjectTitle,
        matchMethod: input.matching.matchMethod,
        lastSeenUtc: input.discoveredAtUtc,
        lastValidatedUtc: input.discoveredAtUtc,
        discoveryRunId: input.runId,
        notes: `recordKey=${recordKey};${input.matching.notes}`,
        isActive: true,
      };

      const listPayload = {
        Title: payload.Title,
        ProjectNumber: payload.projectNumber,
        ProjectNameRaw: payload.projectNameRaw,
        ProjectNameNormalized: payload.projectNameNormalized,
        LegacyYear: payload.legacyYear,
        SourceSiteName: payload.sourceSiteName,
        SourceSitePath: payload.sourceSitePath,
        SourceLibraryName: payload.sourceLibraryName,
        DriveId: payload.driveId,
        DriveItemId: payload.driveItemId,
        FolderName: payload.folderName,
        FolderPath: payload.folderPath,
        FolderWebUrl: payload.folderWebUrl,
        MatchStatus: payload.matchStatus,
        MatchConfidence: payload.matchConfidence,
        MatchedProjectListItemId: payload.matchedProjectListItemId,
        MatchedProjectTitle: payload.matchedProjectTitle,
        MatchMethod: payload.matchMethod,
        LastSeenUtc: payload.lastSeenUtc,
        LastValidatedUtc: payload.lastValidatedUtc,
        DiscoveryRunId: payload.discoveryRunId,
        Notes: payload.notes,
        IsActive: payload.isActive,
      };

      if (!existing.length) {
        await list.items.add(listPayload);
        return 'created';
      }

      await list.items.getById(existing[0].Id).update(listPayload);
      return 'updated';
    });
  }

  async listActiveRegistryRecordsByYear(year: number): Promise<readonly ILegacyFallbackRegistryIdentity[]> {
    return withRetry(async () => {
      const sp: any = await this.getSP();
      const yearValue = Number(year);
      const rows = await sp.web.lists
        .getByTitle(LEGACY_FALLBACK_REGISTRY_LIST_TITLE)
        .items.filter(`LegacyYear eq ${yearValue} and IsActive eq 1`)
        .select('Id', 'LegacyYear', 'DriveId', 'DriveItemId')
        .top(5000)();

      return (rows as Array<Record<string, unknown>>)
        .map((row) => ({
          itemId: Number(row.Id ?? 0),
          legacyYear: Number(row.LegacyYear ?? yearValue),
          driveId: String(row.DriveId ?? ''),
          driveItemId: String(row.DriveItemId ?? ''),
        }))
        .filter((row) => row.itemId > 0 && row.driveId.length > 0 && row.driveItemId.length > 0);
    });
  }

  async markRegistryRecordsInactive(
    runId: string,
    itemIds: readonly number[],
    validatedAtUtc: string,
    reason: string,
  ): Promise<number> {
    if (!itemIds.length) {
      return 0;
    }

    await withRetry(async () => {
      const sp: any = await this.getSP();
      const list = sp.web.lists.getByTitle(LEGACY_FALLBACK_REGISTRY_LIST_TITLE);
      for (const itemId of itemIds) {
        await list.items.getById(itemId).update({
          IsActive: false,
          LastValidatedUtc: validatedAtUtc,
          DiscoveryRunId: runId,
          Notes: reason.slice(0, 1024),
        });
      }
    });

    return itemIds.length;
  }

  private async getSP(): Promise<any> {
    const origin = new URL(this.siteUrl).origin;
    const token = await this.credential.getToken(`${origin}/.default`);
    if (!token?.token) {
      throw new Error('Unable to acquire SharePoint access token for discovery repository.');
    }

    return (spfi(this.siteUrl) as any).using({
      bind(instance: any) {
        instance.on.auth.replace(async (_: unknown, req: Request, done: (request: Request) => void) => {
          req.headers.set('Authorization', `Bearer ${token.token}`);
          done(req);
        });
      },
    } as any);
  }
}
