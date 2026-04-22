import { FIELD_SCHEMA_BY_LIST, type SpFieldDefinition } from '../../../../packages/features/safety/src/lists/fieldSchema.js';
import { HBCENTRAL_SITE_URL, SAFETY_SITE_URL } from '../../../../packages/features/safety/src/lists/descriptors.js';
import { resolveUploadLibraryDescriptor } from '../../../../packages/features/safety/src/lists/safetyUploadLibrary.js';
import type { IFieldDefinition } from '../services/sharepoint-service.js';

export type SafetyProvisionContainerKind = 'list' | 'library';

export interface ISafetyProvisionContainerDefinition {
  readonly key:
    | 'SafetyChecklistUploads'
    | 'SafetyReportingPeriods'
    | 'SafetyProjectWeekRecords'
    | 'SafetyInspectionEvents'
    | 'SafetyFindings'
    | 'SafetyIngestionRuns';
  readonly title: string;
  readonly siteUrl: string;
  readonly kind: SafetyProvisionContainerKind;
  readonly template: number;
  readonly provisioningOrder: number;
  readonly fields: readonly IFieldDefinition[];
}

export const SAFETY_RECORD_KEEPING_REFERENCE_LIST_TITLES = [
  'Projects',
  'Legacy Project Fallback Registry',
] as const;

const LIST_FIELD_TYPE_MAP: Record<SpFieldDefinition['type'], IFieldDefinition['type']> = {
  Text: 'Text',
  Note: 'MultiLineText',
  Number: 'Number',
  DateTime: 'DateTime',
  Boolean: 'Boolean',
  Choice: 'Choice',
  Lookup: 'Lookup',
  User: 'User',
};

function toFieldDefinition(field: SpFieldDefinition): IFieldDefinition {
  return {
    internalName: field.internalName,
    displayName: field.displayName,
    type: LIST_FIELD_TYPE_MAP[field.type],
    required: field.required,
    choices: field.choices ? [...field.choices] : undefined,
    lookupListTitle: field.lookupList,
    lookupFieldName: field.lookupList ? 'ID' : undefined,
  };
}

const uploadLibrary = resolveUploadLibraryDescriptor();

export const SAFETY_RECORD_KEEPING_CONTAINER_DEFINITIONS: readonly ISafetyProvisionContainerDefinition[] = [
  {
    key: 'SafetyChecklistUploads',
    title: uploadLibrary.title,
    siteUrl: SAFETY_SITE_URL,
    kind: 'library',
    template: 101,
    provisioningOrder: 10,
    // Safety upload-library source contract exposes critical field names only.
    // These are provisioned as bounded metadata columns for ingestion correlation.
    fields: [
      { internalName: 'InspectionNumber', displayName: 'Inspection Number', type: 'Text' },
      { internalName: 'InspectionDate', displayName: 'Inspection Date', type: 'DateTime' },
      { internalName: 'ProjectNumber', displayName: 'Project Number', type: 'Text' },
    ],
  },
  {
    key: 'SafetyReportingPeriods',
    title: 'Safety Reporting Periods',
    siteUrl: HBCENTRAL_SITE_URL,
    kind: 'list',
    template: 100,
    provisioningOrder: 10,
    fields: FIELD_SCHEMA_BY_LIST.SafetyReportingPeriods.map(toFieldDefinition),
  },
  {
    key: 'SafetyProjectWeekRecords',
    title: 'Safety Project Week Records',
    siteUrl: HBCENTRAL_SITE_URL,
    kind: 'list',
    template: 100,
    provisioningOrder: 20,
    fields: FIELD_SCHEMA_BY_LIST.SafetyProjectWeekRecords.map(toFieldDefinition),
  },
  {
    key: 'SafetyInspectionEvents',
    title: 'Safety Inspection Events',
    siteUrl: HBCENTRAL_SITE_URL,
    kind: 'list',
    template: 100,
    provisioningOrder: 30,
    fields: FIELD_SCHEMA_BY_LIST.SafetyInspectionEvents.map(toFieldDefinition),
  },
  {
    key: 'SafetyFindings',
    title: 'Safety Findings',
    siteUrl: HBCENTRAL_SITE_URL,
    kind: 'list',
    template: 100,
    provisioningOrder: 40,
    fields: FIELD_SCHEMA_BY_LIST.SafetyFindings.map(toFieldDefinition),
  },
  {
    key: 'SafetyIngestionRuns',
    title: 'Safety Ingestion Runs',
    siteUrl: HBCENTRAL_SITE_URL,
    kind: 'list',
    template: 100,
    provisioningOrder: 50,
    fields: FIELD_SCHEMA_BY_LIST.SafetyIngestionRuns.map(toFieldDefinition),
  },
] as const;

export const SAFETY_RECORD_KEEPING_EXPECTED_SITE_TARGETS = {
  safetySiteUrl: SAFETY_SITE_URL,
  hbCentralSiteUrl: HBCENTRAL_SITE_URL,
} as const;
