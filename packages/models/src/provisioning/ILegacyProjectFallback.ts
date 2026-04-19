/**
 * Legacy Project Fallback Bridge shared contracts.
 *
 * These contracts define the normalized fallback registry and sync-run shapes
 * shared across backend services and SPFx consumers.
 */

export type LegacyFallbackMatchStatus =
  | 'matched'
  | 'unmatched'
  | 'review-required'
  | 'ignored'
  | 'disabled';

export type LegacyFallbackMatchConfidence = 'high' | 'medium' | 'low' | 'none';

export type LegacyFallbackMatchMethod =
  | 'project-number-exact'
  | 'normalized-title-year'
  | 'manual-bind'
  | 'manual-override'
  | 'no-match';

/**
 * Canonical fallback record identity.
 *
 * Authoritative identity remains DriveId + DriveItemId. `recordKey` is a
 * transport/index convenience derived from the same two values.
 */
export interface ILegacyFallbackRecordIdentity {
  driveId: string;
  driveItemId: string;
  recordKey: string;
}

export interface ILegacyProjectFallbackRegistryRecord {
  title: string;
  projectNumber: string;
  projectNameRaw: string;
  projectNameNormalized: string;
  legacyYear: number;
  sourceSiteName: string;
  sourceSitePath: string;
  sourceLibraryName: string;
  driveId: string;
  driveItemId: string;
  folderName: string;
  folderPath: string;
  folderWebUrl: string;
  matchStatus: LegacyFallbackMatchStatus;
  matchConfidence: LegacyFallbackMatchConfidence;
  matchedProjectListItemId: number | null;
  matchedProjectTitle: string;
  matchMethod: LegacyFallbackMatchMethod;
  lastSeenUtc: string;
  lastValidatedUtc: string;
  discoveryRunId: string;
  notes: string;
  isActive: boolean;
}

export interface ILegacyProjectFallbackSyncRun {
  title: string;
  runId: string;
  startedUtc: string;
  completedUtc: string | null;
  status: 'running' | 'completed' | 'failed';
  yearsProcessed: number[];
  foldersScanned: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsMatched: number;
  recordsReviewRequired: number;
  recordsUnmatched: number;
  recordsMarkedInactive: number;
  errorCount: number;
  summaryJson: string;
}

export function createLegacyFallbackRecordKey(driveId: string, driveItemId: string): string {
  return `${driveId}:${driveItemId}`;
}

export function parseLegacyFallbackRecordKey(
  recordKey: string,
): ILegacyFallbackRecordIdentity | null {
  const separatorIndex = recordKey.indexOf(':');
  if (separatorIndex <= 0 || separatorIndex >= recordKey.length - 1) {
    return null;
  }

  const driveId = recordKey.slice(0, separatorIndex);
  const driveItemId = recordKey.slice(separatorIndex + 1);

  return {
    driveId,
    driveItemId,
    recordKey,
  };
}
