import { LEGACY_PROJECT_NUMBER_REGEX, normalizeLegacyCandidateName } from './matching-contracts.js';
import {
  LEGACY_PROJECT_ANNUAL_SOURCES,
  type ILegacyAnnualSourceConfig,
  type LegacyProjectSourceYear,
} from './source-config.js';
import type {
  ILegacyFallbackDiscoveryGraphClient,
  ILegacyGraphFolderItem,
} from './discovery-graph-client.js';
import type {
  ILegacyFallbackDiscoveryRepository,
  ILegacyFallbackSyncRunStart,
} from './discovery-repository.js';

export interface ILegacyFallbackDiscoveryRunOptions {
  readonly years?: readonly LegacyProjectSourceYear[];
  readonly dryRun?: boolean;
  readonly maxFoldersPerRun?: number;
}

export interface ILegacyFallbackDiscoverySourceSummary {
  readonly year: LegacyProjectSourceYear;
  readonly siteUrl: string;
  readonly driveId: string;
  readonly driveName: string;
  readonly foldersFound: number;
  readonly recordsCreated: number;
  readonly recordsUpdated: number;
}

export interface ILegacyFallbackDiscoveryRunSummary {
  readonly runId: string;
  readonly status: 'completed' | 'failed';
  readonly startedUtc: string;
  readonly completedUtc: string;
  readonly yearsProcessed: readonly LegacyProjectSourceYear[];
  readonly dryRun: boolean;
  readonly foldersScanned: number;
  readonly recordsCreated: number;
  readonly recordsUpdated: number;
  readonly recordsUnmatched: number;
  readonly errorCount: number;
  readonly errors: readonly string[];
  readonly sourceSummaries: readonly ILegacyFallbackDiscoverySourceSummary[];
  readonly sampleRecord: {
    driveId: string;
    driveItemId: string;
    folderName: string;
    folderPath: string;
    folderWebUrl: string;
    legacyYear: number;
    sourceSitePath: string;
    sourceLibraryName: string;
  } | null;
}

function toYearSet(years: readonly LegacyProjectSourceYear[] | undefined): readonly LegacyProjectSourceYear[] {
  if (!years || years.length === 0) {
    return LEGACY_PROJECT_ANNUAL_SOURCES.map((entry) => entry.year);
  }
  return [...new Set(years)].sort((a, b) => a - b);
}

function resolveProjectNumber(folderName: string): string {
  const match = folderName.match(LEGACY_PROJECT_NUMBER_REGEX);
  return match?.[0] ?? '';
}

function toSampleRecord(
  source: ILegacyAnnualSourceConfig,
  driveName: string,
  folder: ILegacyGraphFolderItem,
): ILegacyFallbackDiscoveryRunSummary['sampleRecord'] {
  return {
    driveId: folder.driveId,
    driveItemId: folder.driveItemId,
    folderName: folder.folderName,
    folderPath: folder.folderPath,
    folderWebUrl: folder.folderWebUrl,
    legacyYear: source.year,
    sourceSitePath: source.sitePath,
    sourceLibraryName: driveName,
  };
}

export class LegacyFallbackDiscoveryService {
  constructor(
    private readonly graphClient: ILegacyFallbackDiscoveryGraphClient,
    private readonly repository: ILegacyFallbackDiscoveryRepository,
    private readonly logger: {
      info(message: string, data?: Record<string, unknown>): void;
      warn(message: string, data?: Record<string, unknown>): void;
      error(message: string, data?: Record<string, unknown>): void;
    },
  ) {}

  async run(options: ILegacyFallbackDiscoveryRunOptions = {}): Promise<ILegacyFallbackDiscoveryRunSummary> {
    const years = toYearSet(options.years);
    const startedUtc = new Date().toISOString();
    const maxFoldersPerRun = options.maxFoldersPerRun ?? Number.POSITIVE_INFINITY;
    const sources = LEGACY_PROJECT_ANNUAL_SOURCES.filter((entry) => years.includes(entry.year));
    const errors: string[] = [];
    const sourceSummaries: ILegacyFallbackDiscoverySourceSummary[] = [];
    let foldersScanned = 0;
    let recordsCreated = 0;
    let recordsUpdated = 0;
    let recordsUnmatched = 0;
    let sampleRecord: ILegacyFallbackDiscoveryRunSummary['sampleRecord'] = null;

    const runStart = await this.repository.startSyncRun(years);

    try {
      for (const source of sources) {
        if (foldersScanned >= maxFoldersPerRun) {
          this.logger.warn('Legacy fallback discovery reached maxFoldersPerRun budget', {
            maxFoldersPerRun,
            runId: runStart.runId,
          });
          break;
        }

        try {
          const sourceSummary = await this.processSource(source, runStart, {
            dryRun: options.dryRun === true,
            remainingBudget: maxFoldersPerRun - foldersScanned,
            onSample: (folder, driveName) => {
              if (!sampleRecord) {
                sampleRecord = toSampleRecord(source, driveName, folder);
              }
            },
          });

          foldersScanned += sourceSummary.foldersFound;
          recordsCreated += sourceSummary.recordsCreated;
          recordsUpdated += sourceSummary.recordsUpdated;
          recordsUnmatched += sourceSummary.foldersFound;
          sourceSummaries.push(sourceSummary);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          errors.push(`year=${source.year}: ${message}`);
          this.logger.error('Legacy fallback source discovery failed', {
            runId: runStart.runId,
            year: source.year,
            siteUrl: source.siteUrl,
            error: message,
          });
        }
      }

      const completedUtc = new Date().toISOString();
      const status: 'completed' | 'failed' = errors.length > 0 ? 'failed' : 'completed';

      const summary: ILegacyFallbackDiscoveryRunSummary = {
        runId: runStart.runId,
        status,
        startedUtc,
        completedUtc,
        yearsProcessed: years,
        dryRun: options.dryRun === true,
        foldersScanned,
        recordsCreated,
        recordsUpdated,
        recordsUnmatched,
        errorCount: errors.length,
        errors,
        sourceSummaries,
        sampleRecord,
      };

      await this.repository.completeSyncRun(runStart, {
        status,
        completedUtc,
        foldersScanned,
        recordsCreated,
        recordsUpdated,
        recordsUnmatched,
        errorCount: errors.length,
        yearsProcessed: years,
        summaryJson: JSON.stringify(summary),
      });

      return summary;
    } catch (error) {
      const completedUtc = new Date().toISOString();
      const message = error instanceof Error ? error.message : String(error);
      await this.repository.completeSyncRun(runStart, {
        status: 'failed',
        completedUtc,
        foldersScanned,
        recordsCreated,
        recordsUpdated,
        recordsUnmatched,
        errorCount: errors.length + 1,
        yearsProcessed: years,
        summaryJson: JSON.stringify({
          runId: runStart.runId,
          status: 'failed',
          startedUtc,
          completedUtc,
          error: message,
          sourceErrors: errors,
        }),
      });
      throw error;
    }
  }

  private async processSource(
    source: ILegacyAnnualSourceConfig,
    runStart: ILegacyFallbackSyncRunStart,
    options: {
      dryRun: boolean;
      remainingBudget: number;
      onSample(folder: ILegacyGraphFolderItem, driveName: string): void;
    },
  ): Promise<ILegacyFallbackDiscoverySourceSummary> {
    const site = await this.graphClient.resolveSite(source.siteUrl, source.sitePath);
    const drive = await this.graphClient.resolveDrive(
      site.id,
      source.preferredLibraryName,
      source.driveOverrideId,
    );
    const allFolders = await this.graphClient.listRootFolders(drive.id);
    const folders = allFolders.slice(0, options.remainingBudget);

    let created = 0;
    let updated = 0;

    for (const folder of folders) {
      options.onSample(folder, drive.name);

      if (options.dryRun) {
        continue;
      }

      const outcome = await this.repository.upsertRegistryRecord({
        runId: runStart.runId,
        discoveredAtUtc: new Date().toISOString(),
        projectNumber: resolveProjectNumber(folder.folderName),
        projectNameRaw: folder.folderName,
        projectNameNormalized: normalizeLegacyCandidateName(folder.folderName),
        legacyYear: source.year,
        sourceSiteName: site.name,
        sourceSitePath: source.sitePath,
        sourceLibraryName: drive.name,
        driveId: folder.driveId,
        driveItemId: folder.driveItemId,
        folderName: folder.folderName,
        folderPath: folder.folderPath,
        folderWebUrl: folder.folderWebUrl,
      });

      if (outcome === 'created') {
        created += 1;
      } else {
        updated += 1;
      }
    }

    return {
      year: source.year,
      siteUrl: source.siteUrl,
      driveId: drive.id,
      driveName: drive.name,
      foldersFound: folders.length,
      recordsCreated: created,
      recordsUpdated: updated,
    };
  }
}
