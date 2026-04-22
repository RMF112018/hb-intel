/**
 * Safety Record Keeping SharePoint list descriptors.
 *
 * Site topology:
 * - Authoritative structured safety lists live on /sites/HBCentral.
 * - Reference source lists (`Projects`, `Legacy Project Fallback Registry`)
 *   live on /sites/HBCentral and are first-class descriptor citizens.
 * - Upload library lives on /sites/Safety (see safetyUploadLibrary.ts).
 *
 * GUID binding is authoritative. Titles are logging-only.
 *
 * GUIDs are sourced from (in priority order):
 *   1. the runtime overlay populated via `configureSafetyListGuids()`,
 *   2. the zero-GUID fail-closed default in this file.
 *
 * `getListDescriptor()` returns the overlay-resolved descriptor when available
 * and throws if neither layer supplies a non-zero GUID.
 */

import type { SharePointListDescriptor } from '@hbc/sharepoint-platform';
import {
  ZERO_GUID,
  getOverlayGuid,
  type SafetyOverlayKey,
} from './guidConfig.js';
import { SafetyConfigurationError } from '../adapters/sharepoint/errors.js';

export const HBCENTRAL_SITE_URL =
  'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral' as const;
export const SAFETY_SITE_URL =
  'https://hedrickbrotherscom.sharepoint.com/sites/Safety' as const;

export interface SiteScopedListDescriptor extends SharePointListDescriptor {
  readonly siteUrl: string;
}

function descriptor(
  siteUrl: string,
  title: string,
  urlSegment: string,
  purpose: string,
  criticalFieldInternalNames: ReadonlyArray<string>,
  guid: string = ZERO_GUID,
): SiteScopedListDescriptor {
  return { siteUrl, id: guid, title, urlSegment, purpose, criticalFieldInternalNames };
}

// -- Authoritative custom safety lists (HBCentral) ----------------------

export const SafetyReportingPeriodsList = descriptor(
  HBCENTRAL_SITE_URL,
  'Safety Reporting Periods',
  'SafetyReportingPeriods',
  'Weekly parent records for safety inspection cycles.',
  ['WeekStartDate', 'WeekEndDate', 'PeriodLabel', 'Status'],
);

export const SafetyProjectWeekRecordsList = descriptor(
  HBCENTRAL_SITE_URL,
  'Safety Project Week Records',
  'SafetyProjectWeekRecords',
  'One record per project per reporting period; holds weekly rollup.',
  [
    'ReportingPeriodId',
    'ProjectNumber',
    'ProjectNameSnapshot',
    'InspectionCount',
    'AverageInspectionScore',
    'PublishStatus',
  ],
);

export const SafetyInspectionEventsList = descriptor(
  HBCENTRAL_SITE_URL,
  'Safety Inspection Events',
  'SafetyInspectionEvents',
  'Authoritative per-inspection record; preserves raw parsed evidence.',
  [
    'ProjectWeekRecordId',
    'SourceUploadItemId',
    'TemplateVersion',
    'InspectionDate',
    'InspectionNumber',
    'InspectionScore',
    'RawChecklistJson',
    'ParserVersion',
    'IngestionStatus',
    'Checksum',
  ],
);

export const SafetyFindingsList = descriptor(
  HBCENTRAL_SITE_URL,
  'Safety Findings',
  'SafetyFindings',
  'Structured findings derived from inspection events.',
  [
    'InspectionEventId',
    'ProjectWeekRecordId',
    'SectionNumber',
    'ChecklistRowNumber',
    'FindingType',
    'Severity',
  ],
);

export const SafetyIngestionRunsList = descriptor(
  HBCENTRAL_SITE_URL,
  'Safety Ingestion Runs',
  'SafetyIngestionRuns',
  'Audit trail for upload processing attempts.',
  [
    'SourceUploadItemId',
    'UploadFileName',
    'TemplateVersionDetected',
    'Checksum',
    'ValidationStatus',
    'TerminalStatus',
    'CommittedEntityIdsJson',
    'RunStartedAt',
  ],
);

// -- Reference source lists (HBCentral) ---------------------------------

export const ProjectsReferenceList = descriptor(
  HBCENTRAL_SITE_URL,
  'Projects',
  'Projects',
  'Canonical HB Intel project registry (source of truth for project resolution).',
  [
    'ProjectNumber',
    'ProjectName',
    'ProjectLocation',
    'ProjectStage',
    'projectExecutiveUpn',
    'projectManagerUpn',
  ],
);

export const LegacyProjectFallbackRegistryList = descriptor(
  HBCENTRAL_SITE_URL,
  'Legacy Project Fallback Registry',
  'LegacyProjectFallbackRegistry',
  'Fallback legacy-project identity registry used when canonical match misses.',
  [
    'ProjectNumber',
    'ProjectNameRaw',
    'LegacyYear',
    'MatchStatus',
    'MatchedProjectListItemId',
    'IsActive',
  ],
);

// -- Registry + overlay resolution --------------------------------------

const DESCRIPTORS_BY_KEY: Readonly<Record<SafetyOverlayKey, SiteScopedListDescriptor>> = {
  SafetyReportingPeriods: SafetyReportingPeriodsList,
  SafetyProjectWeekRecords: SafetyProjectWeekRecordsList,
  SafetyInspectionEvents: SafetyInspectionEventsList,
  SafetyFindings: SafetyFindingsList,
  SafetyIngestionRuns: SafetyIngestionRunsList,
  Projects: ProjectsReferenceList,
  LegacyProjectFallbackRegistry: LegacyProjectFallbackRegistryList,
  // SafetyChecklistUploads lives in safetyUploadLibrary.ts; resolved via
  // resolveUploadLibraryDescriptor() there. This entry is retained so a
  // consumer asking `getListDescriptor('SafetyChecklistUploads')` still
  // fails closed with a consistent message.
  SafetyChecklistUploads: descriptor(
    SAFETY_SITE_URL,
    'Safety Checklist Uploads',
    'SafetyChecklistUploads',
    'Upload library landing for coordinator-submitted workbooks.',
    ['InspectionNumber', 'InspectionDate', 'ProjectNumber'],
  ),
};

export type SafetyListName = Exclude<SafetyOverlayKey, 'SafetyChecklistUploads'>;

export function resolveDescriptor(key: SafetyOverlayKey): SiteScopedListDescriptor {
  const base = DESCRIPTORS_BY_KEY[key];
  if (!base) throw new Error(`Unknown safety list/library key: ${key}`);
  const overlayGuid = getOverlayGuid(key);
  const effective: SiteScopedListDescriptor = overlayGuid
    ? { ...base, id: overlayGuid }
    : base;
  if (effective.id === ZERO_GUID) {
    throw new SafetyConfigurationError(
      base.title,
      `Safety list "${base.title}" (key "${key}") is bound to the zero GUID. ` +
        'Populate the list GUID via `configureSafetyListGuids()` at tenant-provisioning time ' +
        'before using this adapter in production.',
    );
  }
  return effective;
}

export function getListDescriptor(name: SafetyListName): SiteScopedListDescriptor {
  return resolveDescriptor(name);
}

export function isZeroGuid(descriptor: SiteScopedListDescriptor): boolean {
  return descriptor.id === ZERO_GUID;
}
