import { spfi } from '@pnp/sp';
import '@pnp/nodejs-commonjs';
import '@pnp/sp/items/index.js';
import '@pnp/sp/lists/index.js';
import '@pnp/sp/webs/index.js';
import {
  createSharePointBearerTokenBehavior,
  ManagedIdentityTokenService,
  type IManagedIdentityTokenService,
} from '../managed-identity-token-service.js';
import { withRetry } from '../../utils/retry.js';
import {
  LEGACY_FALLBACK_REGISTRY_LIST_TITLE,
  getLegacyFallbackListHostSiteUrl,
} from './list-descriptors.js';

export interface ILegacyFallbackReviewRecord {
  readonly id: number;
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
  readonly matchStatus: string;
  readonly matchConfidence: string;
  readonly matchedProjectListItemId: number | null;
  readonly matchedProjectTitle: string;
  readonly matchMethod: string;
  readonly lastSeenUtc: string;
  readonly lastValidatedUtc: string;
  readonly discoveryRunId: string;
  readonly notes: string;
  readonly isActive: boolean;
}

export interface ILegacyFallbackReviewUpdatePatch {
  readonly matchStatus?: string;
  readonly matchConfidence?: string;
  readonly matchedProjectListItemId?: number | null;
  readonly matchedProjectTitle?: string;
  readonly matchMethod?: string;
  readonly lastValidatedUtc?: string;
  readonly discoveryRunId?: string;
  readonly notes?: string;
  readonly isActive?: boolean;
}

export interface ILegacyFallbackReviewRepository {
  listRecords(): Promise<readonly ILegacyFallbackReviewRecord[]>;
  getRecordById(recordId: number): Promise<ILegacyFallbackReviewRecord | null>;
  updateRecord(recordId: number, patch: ILegacyFallbackReviewUpdatePatch): Promise<void>;
}

function trimToString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function toNumberOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes';
  }
  return false;
}

function toRecord(row: Record<string, unknown>): ILegacyFallbackReviewRecord {
  return {
    id: Number(row.Id ?? 0),
    projectNumber: trimToString(row.ProjectNumber),
    projectNameRaw: trimToString(row.ProjectNameRaw),
    projectNameNormalized: trimToString(row.ProjectNameNormalized),
    legacyYear: Number(row.LegacyYear ?? 0),
    sourceSiteName: trimToString(row.SourceSiteName),
    sourceSitePath: trimToString(row.SourceSitePath),
    sourceLibraryName: trimToString(row.SourceLibraryName),
    driveId: trimToString(row.DriveId),
    driveItemId: trimToString(row.DriveItemId),
    folderName: trimToString(row.FolderName),
    folderPath: trimToString(row.FolderPath),
    folderWebUrl: trimToString(row.FolderWebUrl),
    matchStatus: trimToString(row.MatchStatus),
    matchConfidence: trimToString(row.MatchConfidence),
    matchedProjectListItemId: toNumberOrNull(row.MatchedProjectListItemId),
    matchedProjectTitle: trimToString(row.MatchedProjectTitle),
    matchMethod: trimToString(row.MatchMethod),
    lastSeenUtc: trimToString(row.LastSeenUtc),
    lastValidatedUtc: trimToString(row.LastValidatedUtc),
    discoveryRunId: trimToString(row.DiscoveryRunId),
    notes: trimToString(row.Notes),
    isActive: toBoolean(row.IsActive),
  };
}

export class LegacyFallbackReviewRepository implements ILegacyFallbackReviewRepository {
  private readonly tokenService: IManagedIdentityTokenService;
  private readonly siteUrl = getLegacyFallbackListHostSiteUrl();
  
  constructor(tokenService: IManagedIdentityTokenService = new ManagedIdentityTokenService()) {
    this.tokenService = tokenService;
  }

  async listRecords(): Promise<readonly ILegacyFallbackReviewRecord[]> {
    return withRetry(async () => {
      const sp: any = await this.getSP();
      const rows = (await sp.web.lists
        .getByTitle(LEGACY_FALLBACK_REGISTRY_LIST_TITLE)
        .items
        .select(
          'Id',
          'ProjectNumber',
          'ProjectNameRaw',
          'ProjectNameNormalized',
          'LegacyYear',
          'SourceSiteName',
          'SourceSitePath',
          'SourceLibraryName',
          'DriveId',
          'DriveItemId',
          'FolderName',
          'FolderPath',
          'FolderWebUrl',
          'MatchStatus',
          'MatchConfidence',
          'MatchedProjectListItemId',
          'MatchedProjectTitle',
          'MatchMethod',
          'LastSeenUtc',
          'LastValidatedUtc',
          'DiscoveryRunId',
          'Notes',
          'IsActive',
        )
        .top(5000)()) as Array<Record<string, unknown>>;

      return rows
        .map(toRecord)
        .filter((record) => record.id > 0 && record.projectNumber.length > 0);
    });
  }

  async getRecordById(recordId: number): Promise<ILegacyFallbackReviewRecord | null> {
    return withRetry(async () => {
      const sp: any = await this.getSP();
      const rows = (await sp.web.lists
        .getByTitle(LEGACY_FALLBACK_REGISTRY_LIST_TITLE)
        .items
        .filter(`Id eq ${recordId}`)
        .select(
          'Id',
          'ProjectNumber',
          'ProjectNameRaw',
          'ProjectNameNormalized',
          'LegacyYear',
          'SourceSiteName',
          'SourceSitePath',
          'SourceLibraryName',
          'DriveId',
          'DriveItemId',
          'FolderName',
          'FolderPath',
          'FolderWebUrl',
          'MatchStatus',
          'MatchConfidence',
          'MatchedProjectListItemId',
          'MatchedProjectTitle',
          'MatchMethod',
          'LastSeenUtc',
          'LastValidatedUtc',
          'DiscoveryRunId',
          'Notes',
          'IsActive',
        )
        .top(1)()) as Array<Record<string, unknown>>;

      if (rows.length === 0) {
        return null;
      }

      return toRecord(rows[0]);
    });
  }

  async updateRecord(recordId: number, patch: ILegacyFallbackReviewUpdatePatch): Promise<void> {
    await withRetry(async () => {
      const sp: any = await this.getSP();
      await sp.web.lists
        .getByTitle(LEGACY_FALLBACK_REGISTRY_LIST_TITLE)
        .items.getById(recordId)
        .update({
          ...(patch.matchStatus !== undefined ? { MatchStatus: patch.matchStatus } : {}),
          ...(patch.matchConfidence !== undefined ? { MatchConfidence: patch.matchConfidence } : {}),
          ...(patch.matchedProjectListItemId !== undefined
            ? { MatchedProjectListItemId: patch.matchedProjectListItemId }
            : {}),
          ...(patch.matchedProjectTitle !== undefined ? { MatchedProjectTitle: patch.matchedProjectTitle } : {}),
          ...(patch.matchMethod !== undefined ? { MatchMethod: patch.matchMethod } : {}),
          ...(patch.lastValidatedUtc !== undefined ? { LastValidatedUtc: patch.lastValidatedUtc } : {}),
          ...(patch.discoveryRunId !== undefined ? { DiscoveryRunId: patch.discoveryRunId } : {}),
          ...(patch.notes !== undefined ? { Notes: patch.notes } : {}),
          ...(patch.isActive !== undefined ? { IsActive: patch.isActive } : {}),
        });
    });
  }

  private async getSP(): Promise<any> {
    const overrideToken = process.env.SHAREPOINT_BEARER_TOKEN?.trim();
    const behavior = overrideToken
      ? await createSharePointBearerTokenBehavior(this.siteUrl, {
        acquireAppToken: async () => overrideToken,
        getSharePointToken: async () => overrideToken,
      })
      : await createSharePointBearerTokenBehavior(this.siteUrl, this.tokenService);

    if (!behavior) {
      throw new Error('Unable to acquire SharePoint access token behavior for legacy fallback review repository.');
    }

    return (spfi(this.siteUrl) as any).using(behavior);
  }
}
