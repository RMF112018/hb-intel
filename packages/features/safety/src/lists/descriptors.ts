/**
 * Safety Record Keeping SharePoint list descriptors.
 *
 * Site topology (Release 1):
 * - Authoritative structured lists live on /sites/HBCentral.
 * - Upload library lives on /sites/Safety (see safetyUploadLibrary.ts).
 *
 * GUID binding is authoritative. Titles are for logging only.
 *
 * GUIDs are placeholders that MUST be populated at tenant-provisioning time.
 * `getListDescriptor(name)` fails closed if a descriptor still holds the
 * zero-value GUID to prevent silent misbinding after deploy.
 */

import type { SharePointListDescriptor } from '@hbc/sharepoint-platform';

export const HBCENTRAL_SITE_URL = 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral' as const;
export const SAFETY_SITE_URL = 'https://hedrickbrotherscom.sharepoint.com/sites/Safety' as const;

export interface SiteScopedListDescriptor extends SharePointListDescriptor {
  readonly siteUrl: string;
}

const ZERO_GUID = '00000000-0000-0000-0000-000000000000';

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

const DESCRIPTORS_BY_NAME: Readonly<Record<string, SiteScopedListDescriptor>> = {
  SafetyReportingPeriods: SafetyReportingPeriodsList,
  SafetyProjectWeekRecords: SafetyProjectWeekRecordsList,
  SafetyInspectionEvents: SafetyInspectionEventsList,
  SafetyFindings: SafetyFindingsList,
  SafetyIngestionRuns: SafetyIngestionRunsList,
};

export type SafetyListName = keyof typeof DESCRIPTORS_BY_NAME;

export function getListDescriptor(name: SafetyListName): SiteScopedListDescriptor {
  const descriptor = DESCRIPTORS_BY_NAME[name];
  if (!descriptor) {
    throw new Error(`Unknown safety list name: ${name}`);
  }
  if (descriptor.id === ZERO_GUID) {
    throw new Error(
      `Safety list descriptor "${name}" is still bound to the zero GUID. ` +
        'Populate the list GUID at tenant-provisioning time before using this adapter in production.',
    );
  }
  return descriptor;
}

export function isZeroGuid(descriptor: SiteScopedListDescriptor): boolean {
  return descriptor.id === ZERO_GUID;
}
