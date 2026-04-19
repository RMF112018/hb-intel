import type {
  LegacyFallbackMatchMethod,
  LegacyFallbackMatchStatus,
} from '@hbc/models/provisioning';
import type { IListDefinition } from '../sharepoint-service.js';
import { LEGACY_FALLBACK_LIST_HOST_SITE_URL } from './source-config.js';

export const LEGACY_FALLBACK_REGISTRY_LIST_TITLE = 'Legacy Project Fallback Registry';
export const LEGACY_FALLBACK_SYNC_RUNS_LIST_TITLE = 'Legacy Project Fallback Sync Runs';

export const LEGACY_FALLBACK_REVIEW_OVERRIDE_LIST_REQUIRED = false;

const MATCH_STATUS_CHOICES: readonly LegacyFallbackMatchStatus[] = [
  'matched',
  'unmatched',
  'review-required',
  'ignored',
  'disabled',
] as const;

const MATCH_CONFIDENCE_CHOICES = ['high', 'medium', 'low', 'none'] as const;

const MATCH_METHOD_CHOICES: readonly LegacyFallbackMatchMethod[] = [
  'project-number-exact',
  'normalized-title-year',
  'manual-bind',
  'manual-override',
  'no-match',
] as const;

export const LEGACY_FALLBACK_REGISTRY_LIST_DESCRIPTOR: IListDefinition = {
  title: LEGACY_FALLBACK_REGISTRY_LIST_TITLE,
  description: 'Canonical secondary registry for legacy project folder fallbacks.',
  template: 100,
  fields: [
    { internalName: 'ProjectNumber', displayName: 'Project Number', type: 'Text', indexed: true },
    { internalName: 'ProjectNameRaw', displayName: 'Project Name Raw', type: 'Text' },
    { internalName: 'ProjectNameNormalized', displayName: 'Project Name Normalized', type: 'Text' },
    { internalName: 'LegacyYear', displayName: 'Legacy Year', type: 'Number', indexed: true },
    { internalName: 'SourceSiteName', displayName: 'Source Site Name', type: 'Text' },
    { internalName: 'SourceSitePath', displayName: 'Source Site Path', type: 'Text' },
    { internalName: 'SourceLibraryName', displayName: 'Source Library Name', type: 'Text' },
    { internalName: 'DriveId', displayName: 'Drive Id', type: 'Text', required: true, indexed: true },
    { internalName: 'DriveItemId', displayName: 'Drive Item Id', type: 'Text', required: true, indexed: true },
    { internalName: 'FolderName', displayName: 'Folder Name', type: 'Text' },
    { internalName: 'FolderPath', displayName: 'Folder Path', type: 'Text' },
    { internalName: 'FolderWebUrl', displayName: 'Folder Web Url', type: 'URL' },
    {
      internalName: 'MatchStatus',
      displayName: 'Match Status',
      type: 'Choice',
      choices: [...MATCH_STATUS_CHOICES],
      indexed: true,
    },
    {
      internalName: 'MatchConfidence',
      displayName: 'Match Confidence',
      type: 'Choice',
      choices: [...MATCH_CONFIDENCE_CHOICES],
    },
    { internalName: 'MatchedProjectListItemId', displayName: 'Matched Project List Item Id', type: 'Number' },
    { internalName: 'MatchedProjectTitle', displayName: 'Matched Project Title', type: 'Text' },
    {
      internalName: 'MatchMethod',
      displayName: 'Match Method',
      type: 'Choice',
      choices: [...MATCH_METHOD_CHOICES],
    },
    { internalName: 'LastSeenUtc', displayName: 'Last Seen Utc', type: 'DateTime' },
    { internalName: 'LastValidatedUtc', displayName: 'Last Validated Utc', type: 'DateTime' },
    { internalName: 'DiscoveryRunId', displayName: 'Discovery Run Id', type: 'Text' },
    { internalName: 'Notes', displayName: 'Notes', type: 'MultiLineText' },
    {
      internalName: 'IsActive',
      displayName: 'Is Active',
      type: 'Boolean',
      indexed: true,
      defaultValue: '1',
    },
  ],
};

export const LEGACY_FALLBACK_SYNC_RUNS_LIST_DESCRIPTOR: IListDefinition = {
  title: LEGACY_FALLBACK_SYNC_RUNS_LIST_TITLE,
  description: 'Operational run log for legacy fallback discovery/sync operations.',
  template: 100,
  fields: [
    { internalName: 'RunId', displayName: 'Run Id', type: 'Text', required: true, indexed: true },
    { internalName: 'StartedUtc', displayName: 'Started Utc', type: 'DateTime', required: true },
    { internalName: 'CompletedUtc', displayName: 'Completed Utc', type: 'DateTime' },
    {
      internalName: 'Status',
      displayName: 'Status',
      type: 'Choice',
      choices: ['running', 'completed', 'failed'],
      indexed: true,
    },
    { internalName: 'YearsProcessed', displayName: 'Years Processed', type: 'MultiLineText' },
    { internalName: 'FoldersScanned', displayName: 'Folders Scanned', type: 'Number' },
    { internalName: 'RecordsCreated', displayName: 'Records Created', type: 'Number' },
    { internalName: 'RecordsUpdated', displayName: 'Records Updated', type: 'Number' },
    { internalName: 'RecordsMatched', displayName: 'Records Matched', type: 'Number' },
    { internalName: 'RecordsReviewRequired', displayName: 'Records Review Required', type: 'Number' },
    { internalName: 'RecordsUnmatched', displayName: 'Records Unmatched', type: 'Number' },
    { internalName: 'RecordsMarkedInactive', displayName: 'Records Marked Inactive', type: 'Number' },
    { internalName: 'ErrorCount', displayName: 'Error Count', type: 'Number' },
    { internalName: 'DurationMs', displayName: 'Duration Ms', type: 'Number' },
    { internalName: 'SourceFailureCount', displayName: 'Source Failure Count', type: 'Number' },
    { internalName: 'MatchAnomalyExceeded', displayName: 'Match Anomaly Exceeded', type: 'Boolean' },
    { internalName: 'FirstErrorMessage', displayName: 'First Error Message', type: 'Text' },
    { internalName: 'SummaryJson', displayName: 'Summary Json', type: 'MultiLineText' },
  ],
};

export const LEGACY_FALLBACK_LIST_DESCRIPTORS: readonly IListDefinition[] = [
  LEGACY_FALLBACK_REGISTRY_LIST_DESCRIPTOR,
  LEGACY_FALLBACK_SYNC_RUNS_LIST_DESCRIPTOR,
];

export function getLegacyFallbackListHostSiteUrl(): string {
  return LEGACY_FALLBACK_LIST_HOST_SITE_URL;
}
