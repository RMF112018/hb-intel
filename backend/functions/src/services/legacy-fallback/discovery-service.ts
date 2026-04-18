import { createLegacyFallbackRecordKey } from '@hbc/models/provisioning';
import { LEGACY_PROJECT_NUMBER_REGEX, normalizeLegacyCandidateName, stripLeadingProjectNumberToken } from './matching-contracts.js';
import type {
  ILegacyFallbackDiscoveryGraphClient,
  ILegacyGraphDrive,
  ILegacyGraphFolderItem,
  ILegacyGraphSite,
} from './discovery-graph-client.js';
import type {
  ILegacyFallbackDiscoveryRepository,
  ILegacyFallbackSyncRunStart,
} from './discovery-repository.js';
import { LEGACY_PROJECT_ANNUAL_SOURCES, type LegacyProjectSourceYear } from './source-config.js';
import type { ILogger } from '../../utils/logger.js';
import type { ILegacyFallbackMatchingEngine, ILegacyFallbackMatchDecision } from './matching-engine.js';
import type { ILegacyFallbackProjectIndexProvider } from './project-index-provider.js';

export interface ILegacyFallbackDiscoveryRunOptions {
  readonly years?: readonly LegacyProjectSourceYear[];
  readonly dryRun?: boolean;
  readonly maxFoldersPerRun?: number;
  readonly matchAnomalyThreshold?: number;
}

export interface ILegacyFallbackDiscoverySourceSummary {
  readonly year: LegacyProjectSourceYear;
  readonly sourceSiteUrl: string;
  readonly sourceSitePath: string;
  readonly sourceLibraryName: string;
  readonly siteId?: string;
  readonly driveId?: string;
  readonly foldersFound: number;
  readonly status: 'completed' | 'failed';
  readonly error?: string;
}

export interface ILegacyFallbackDiscoverySampleRecord {
  readonly year: number;
  readonly driveItemId: string;
  readonly projectNumber: string;
  readonly projectNameRaw: string;
  readonly projectNameNormalized: string;
  readonly matchStatus: ILegacyFallbackMatchDecision['matchStatus'];
  readonly matchConfidence: ILegacyFallbackMatchDecision['matchConfidence'];
  readonly matchMethod: ILegacyFallbackMatchDecision['matchMethod'];
}

export interface ILegacyFallbackDiscoveryRunSummary {
  readonly runId: string;
  readonly status: 'completed' | 'failed';
  readonly startedUtc: string;
  readonly completedUtc: string;
  readonly yearsProcessed: readonly number[];
  readonly foldersScanned: number;
  readonly recordsCreated: number;
  readonly recordsUpdated: number;
  readonly recordsMatched: number;
  readonly recordsReviewRequired: number;
  readonly recordsUnmatched: number;
  readonly recordsMarkedInactive: number;
  readonly errorCount: number;
  readonly sourceSummaries: readonly ILegacyFallbackDiscoverySourceSummary[];
  readonly errors: readonly string[];
  readonly sampleRecord: ILegacyFallbackDiscoverySampleRecord | null;
  readonly sampleByOutcome: {
    readonly matched: ILegacyFallbackDiscoverySampleRecord | null;
    readonly reviewRequired: ILegacyFallbackDiscoverySampleRecord | null;
    readonly unmatched: ILegacyFallbackDiscoverySampleRecord | null;
  };
  readonly stalePolicy: {
    readonly recordsNotSeenInRunMarkedInactive: true;
    readonly identityPreserved: true;
    readonly staleReasonTag: string;
  };
  readonly failurePolicy: {
    readonly perYearIsolation: true;
    readonly retryStrategy: 'transient-with-backoff';
    readonly terminalFailureOutcome: 'sync-run-failed-with-errors';
  };
}

interface ILegacyFallbackMutableSamples {
  matched: ILegacyFallbackDiscoverySampleRecord | null;
  reviewRequired: ILegacyFallbackDiscoverySampleRecord | null;
  unmatched: ILegacyFallbackDiscoverySampleRecord | null;
}

function extractProjectNumber(folderName: string): string {
  const match = folderName.match(LEGACY_PROJECT_NUMBER_REGEX);
  return match?.[0] ?? '';
}

function createSampleRecord(
  year: number,
  folder: ILegacyGraphFolderItem,
  projectNumber: string,
  projectNameRaw: string,
  projectNameNormalized: string,
  matching: ILegacyFallbackMatchDecision,
): ILegacyFallbackDiscoverySampleRecord {
  return {
    year,
    driveItemId: folder.driveItemId,
    projectNumber,
    projectNameRaw,
    projectNameNormalized,
    matchStatus: matching.matchStatus,
    matchConfidence: matching.matchConfidence,
    matchMethod: matching.matchMethod,
  };
}

function resolveYears(years?: readonly LegacyProjectSourceYear[]): LegacyProjectSourceYear[] {
  if (years?.length) {
    return [...years];
  }
  return LEGACY_PROJECT_ANNUAL_SOURCES.map((source) => source.year);
}

export class LegacyFallbackDiscoveryService {
  constructor(
    private readonly graphClient: ILegacyFallbackDiscoveryGraphClient,
    private readonly repository: ILegacyFallbackDiscoveryRepository,
    private readonly matchingEngine: ILegacyFallbackMatchingEngine,
    private readonly projectIndexProvider: ILegacyFallbackProjectIndexProvider,
    private readonly logger: ILogger,
  ) {}

  async run(options: ILegacyFallbackDiscoveryRunOptions = {}): Promise<ILegacyFallbackDiscoveryRunSummary> {
    const years = resolveYears(options.years);
    const startedUtc = new Date().toISOString();
    const dryRun = options.dryRun === true;
    const maxFoldersPerRun = Math.max(1, options.maxFoldersPerRun ?? Number.MAX_SAFE_INTEGER);
    const matchAnomalyThreshold = Math.max(1, options.matchAnomalyThreshold ?? 25);
    const runStart: ILegacyFallbackSyncRunStart = dryRun
      ? { runId: `dry-run-${Date.now()}`, itemId: 0 }
      : await this.repository.startSyncRun(years);

    const errors: string[] = [];
    const sourceSummaries: ILegacyFallbackDiscoverySourceSummary[] = [];
    const seenByYear = new Map<number, Set<string>>();

    let foldersScanned = 0;
    let recordsCreated = 0;
    let recordsUpdated = 0;
    let recordsMatched = 0;
    let recordsReviewRequired = 0;
    let recordsUnmatched = 0;
    let recordsMarkedInactive = 0;
    let sampleRecord: ILegacyFallbackDiscoverySampleRecord | null = null;
    const sampleByOutcome: ILegacyFallbackMutableSamples = {
      matched: null,
      reviewRequired: null,
      unmatched: null,
    };

    const projectIndex = await this.projectIndexProvider.loadIndex();

    try {
      for (const year of years) {
        if (foldersScanned >= maxFoldersPerRun) {
          break;
        }

        const source = LEGACY_PROJECT_ANNUAL_SOURCES.find((entry) => entry.year === year);
        if (!source) {
          const message = `No source configuration found for year=${year}`;
          this.logger.error(message, { domain: 'legacyFallback', year });
          errors.push(message);
          sourceSummaries.push({
            year,
            sourceSiteUrl: '',
            sourceSitePath: '',
            sourceLibraryName: '',
            foldersFound: 0,
            status: 'failed',
            error: message,
          });
          continue;
        }

        const seenForYear = seenByYear.get(year) ?? new Set<string>();
        seenByYear.set(year, seenForYear);

        try {
          const site: ILegacyGraphSite = await this.graphClient.resolveSite(source.siteUrl, source.sitePath);
          const drive: ILegacyGraphDrive = await this.graphClient.resolveDrive(
            site.id,
            source.preferredLibraryName,
            source.driveOverrideId,
          );
          const folders = await this.graphClient.listRootFolders(drive.id);
          const remainingCapacity = maxFoldersPerRun - foldersScanned;
          const foldersToProcess = folders.slice(0, Math.max(0, remainingCapacity));

          for (const folder of foldersToProcess) {
            const projectNumber = extractProjectNumber(folder.folderName);
            const projectNameRaw = stripLeadingProjectNumberToken(folder.folderName);
            const projectNameNormalized = normalizeLegacyCandidateName(projectNameRaw);
            const matching = this.matchingEngine.decide({
              legacyYear: year,
              projectNumber,
              normalizedFolderName: projectNameNormalized,
              projectIndex,
            });

            switch (matching.matchStatus) {
              case 'matched':
                recordsMatched += 1;
                if (!sampleByOutcome.matched) {
                  sampleByOutcome.matched = createSampleRecord(
                    year,
                    folder,
                    projectNumber,
                    projectNameRaw,
                    projectNameNormalized,
                    matching,
                  );
                }
                break;
              case 'review-required':
                recordsReviewRequired += 1;
                if (!sampleByOutcome.reviewRequired) {
                  sampleByOutcome.reviewRequired = createSampleRecord(
                    year,
                    folder,
                    projectNumber,
                    projectNameRaw,
                    projectNameNormalized,
                    matching,
                  );
                }
                break;
              default:
                recordsUnmatched += 1;
                if (!sampleByOutcome.unmatched) {
                  sampleByOutcome.unmatched = createSampleRecord(
                    year,
                    folder,
                    projectNumber,
                    projectNameRaw,
                    projectNameNormalized,
                    matching,
                  );
                }
                break;
            }

            if (!sampleRecord) {
              sampleRecord = createSampleRecord(
                year,
                folder,
                projectNumber,
                projectNameRaw,
                projectNameNormalized,
                matching,
              );
            }

            foldersScanned += 1;

            if (!dryRun) {
              const operation = await this.repository.upsertRegistryRecord({
                runId: runStart.runId,
                discoveredAtUtc: startedUtc,
                projectNumber,
                projectNameRaw,
                projectNameNormalized,
                legacyYear: year,
                sourceSiteName: site.name,
                sourceSitePath: source.sitePath,
                sourceLibraryName: drive.name,
                driveId: folder.driveId,
                driveItemId: folder.driveItemId,
                folderName: folder.folderName,
                folderPath: folder.folderPath,
                folderWebUrl: folder.folderWebUrl,
                matching,
              });

              const recordKey = createLegacyFallbackRecordKey(folder.driveId, folder.driveItemId);
              seenForYear.add(recordKey);

              if (operation === 'created') {
                recordsCreated += 1;
              } else {
                recordsUpdated += 1;
              }
            }
          }

          sourceSummaries.push({
            year,
            sourceSiteUrl: source.siteUrl,
            sourceSitePath: source.sitePath,
            sourceLibraryName: drive.name,
            siteId: site.id,
            driveId: drive.id,
            foldersFound: foldersToProcess.length,
            status: 'completed',
          });
        } catch (error) {
          const message = `Discovery failed for year=${year}: ${error instanceof Error ? error.message : String(error)}`;
          this.logger.error(message, { domain: 'legacyFallback', year });
          errors.push(message);
          sourceSummaries.push({
            year,
            sourceSiteUrl: source.siteUrl,
            sourceSitePath: source.sitePath,
            sourceLibraryName: source.preferredLibraryName ?? '',
            foldersFound: 0,
            status: 'failed',
            error: message,
          });
        }
      }

      if (!dryRun) {
        for (const year of years) {
          const activeRecords = await this.repository.listActiveRegistryRecordsByYear(year);
          const seenForYear = seenByYear.get(year) ?? new Set<string>();
          const staleIds = activeRecords
            .filter((record) => {
              const key = createLegacyFallbackRecordKey(record.driveId, record.driveItemId);
              return !seenForYear.has(key);
            })
            .map((record) => record.itemId);

          const marked = await this.repository.markRegistryRecordsInactive(
            runStart.runId,
            staleIds,
            new Date().toISOString(),
            `stale-not-seen-in-run:${runStart.runId};year=${year}`,
          );
          recordsMarkedInactive += marked;
        }
      }

      const completedUtc = new Date().toISOString();
      const status: ILegacyFallbackDiscoveryRunSummary['status'] = errors.length > 0 ? 'failed' : 'completed';
      const summary: ILegacyFallbackDiscoveryRunSummary = {
        runId: runStart.runId,
        status,
        startedUtc,
        completedUtc,
        yearsProcessed: years,
        foldersScanned,
        recordsCreated,
        recordsUpdated,
        recordsMatched,
        recordsReviewRequired,
        recordsUnmatched,
        recordsMarkedInactive,
        errorCount: errors.length,
        sourceSummaries,
        errors,
        sampleRecord,
        sampleByOutcome,
        stalePolicy: {
          recordsNotSeenInRunMarkedInactive: true,
          identityPreserved: true,
          staleReasonTag: 'stale-not-seen-in-run',
        },
        failurePolicy: {
          perYearIsolation: true,
          retryStrategy: 'transient-with-backoff',
          terminalFailureOutcome: 'sync-run-failed-with-errors',
        },
      };

      const anomalyCount = recordsReviewRequired + recordsUnmatched;
      if (anomalyCount >= matchAnomalyThreshold) {
        this.logger.warn('legacy-fallback.match-anomaly threshold exceeded', {
          runId: runStart.runId,
          anomalyCount,
          threshold: matchAnomalyThreshold,
          recordsReviewRequired,
          recordsUnmatched,
        });
      }

      if (!dryRun) {
        await this.repository.completeSyncRun(runStart, {
          status,
          completedUtc,
          foldersScanned,
          recordsCreated,
          recordsUpdated,
          recordsMatched,
          recordsReviewRequired,
          recordsUnmatched,
          recordsMarkedInactive,
          errorCount: errors.length,
          yearsProcessed: years,
          summaryJson: JSON.stringify(summary),
        });
      }

      return summary;
    } catch (fatal) {
      const completedUtc = new Date().toISOString();
      const message = fatal instanceof Error ? fatal.message : String(fatal);
      const errorsWithFatal = [...errors, message];
      if (!dryRun) {
        await this.repository.completeSyncRun(runStart, {
          status: 'failed',
          completedUtc,
          foldersScanned,
          recordsCreated,
          recordsUpdated,
          recordsMatched,
          recordsReviewRequired,
          recordsUnmatched,
          recordsMarkedInactive,
          errorCount: errorsWithFatal.length,
          yearsProcessed: years,
          summaryJson: JSON.stringify({ errors: errorsWithFatal, foldersScanned }),
        });
      }
      throw fatal;
    }
  }
}
