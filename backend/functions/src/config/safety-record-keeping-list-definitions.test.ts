import { describe, expect, it } from 'vitest';
import {
  FIELD_SCHEMA_BY_LIST,
  type SpFieldDefinition,
} from '../../../../packages/features/safety/src/lists/fieldSchema.js';
import {
  HBCENTRAL_SITE_URL,
  SAFETY_SITE_URL,
  SafetyFieldExcellenceCandidateScoresList,
  SafetyFieldExcellenceWeeklyHighlightsList,
  SafetyFindingsList,
  SafetyIngestionRunsList,
  SafetyInspectionEventsList,
  SafetyProjectWeekRecordsList,
  SafetyReportingPeriodsList,
} from '../../../../packages/features/safety/src/lists/descriptors.js';
import { resolveUploadLibraryDescriptor } from '../../../../packages/features/safety/src/lists/safetyUploadLibrary.js';
import {
  SAFETY_RECORD_KEEPING_CONTAINER_DEFINITIONS,
  SAFETY_RECORD_KEEPING_REFERENCE_LIST_TITLES,
} from './safety-record-keeping-list-definitions.js';

const TYPE_MAP: Record<SpFieldDefinition['type'], string> = {
  Text: 'Text',
  Note: 'MultiLineText',
  Number: 'Number',
  DateTime: 'DateTime',
  Boolean: 'Boolean',
  Choice: 'Choice',
  Lookup: 'Lookup',
  User: 'User',
};

describe('SAFETY_RECORD_KEEPING_CONTAINER_DEFINITIONS drift guard', () => {
  it('contains exactly the bounded container scope', () => {
    const titles = SAFETY_RECORD_KEEPING_CONTAINER_DEFINITIONS.map((d) => d.title).sort();
    expect(titles).toEqual([
      'Safety Checklist Uploads',
      'Safety Field Excellence Candidate Scores',
      'Safety Field Excellence Weekly Highlights',
      'Safety Findings',
      'Safety Ingestion Runs',
      'Safety Inspection Events',
      'Safety Project Week Records',
      'Safety Reporting Periods',
    ]);
  });

  it('keeps reference lists validate-only and unchanged', () => {
    expect(SAFETY_RECORD_KEEPING_REFERENCE_LIST_TITLES).toEqual([
      'Projects',
      'Legacy Project Fallback Registry',
    ]);
  });

  it('keeps authoritative site topology contract', () => {
    for (const definition of SAFETY_RECORD_KEEPING_CONTAINER_DEFINITIONS) {
      if (definition.title === 'Safety Checklist Uploads') {
        expect(definition.siteUrl).toBe(SAFETY_SITE_URL);
      } else {
        expect(definition.siteUrl).toBe(HBCENTRAL_SITE_URL);
      }
    }
  });

  it('matches list descriptor titles from the Safety package', () => {
    const descriptorTitleByKey = {
      SafetyReportingPeriods: SafetyReportingPeriodsList.title,
      SafetyProjectWeekRecords: SafetyProjectWeekRecordsList.title,
      SafetyInspectionEvents: SafetyInspectionEventsList.title,
      SafetyFindings: SafetyFindingsList.title,
      SafetyIngestionRuns: SafetyIngestionRunsList.title,
      SafetyFieldExcellenceCandidateScores: SafetyFieldExcellenceCandidateScoresList.title,
      SafetyFieldExcellenceWeeklyHighlights: SafetyFieldExcellenceWeeklyHighlightsList.title,
    } as const;

    for (const [key, title] of Object.entries(descriptorTitleByKey)) {
      const definition = SAFETY_RECORD_KEEPING_CONTAINER_DEFINITIONS.find((d) => d.key === key);
      expect(definition, `Missing backend definition for ${key}`).toBeDefined();
      expect(definition!.title).toBe(title);
    }
  });

  it('matches fieldSchema.ts internal names, types, lookup intent, and required flags', () => {
    const schemaByKey = {
      SafetyReportingPeriods: FIELD_SCHEMA_BY_LIST.SafetyReportingPeriods,
      SafetyProjectWeekRecords: FIELD_SCHEMA_BY_LIST.SafetyProjectWeekRecords,
      SafetyInspectionEvents: FIELD_SCHEMA_BY_LIST.SafetyInspectionEvents,
      SafetyFindings: FIELD_SCHEMA_BY_LIST.SafetyFindings,
      SafetyIngestionRuns: FIELD_SCHEMA_BY_LIST.SafetyIngestionRuns,
      SafetyFieldExcellenceCandidateScores: FIELD_SCHEMA_BY_LIST.SafetyFieldExcellenceCandidateScores,
      SafetyFieldExcellenceWeeklyHighlights: FIELD_SCHEMA_BY_LIST.SafetyFieldExcellenceWeeklyHighlights,
    } as const;

    for (const [key, sourceFields] of Object.entries(schemaByKey)) {
      const definition = SAFETY_RECORD_KEEPING_CONTAINER_DEFINITIONS.find((d) => d.key === key);
      expect(definition, `Missing backend definition for ${key}`).toBeDefined();
      expect(definition!.kind).toBe('list');

      const backendFieldMap = new Map(definition!.fields.map((field) => [field.internalName, field]));
      const sourceFieldMap = new Map(sourceFields.map((field) => [field.internalName, field]));

      expect([...backendFieldMap.keys()].sort()).toEqual([...sourceFieldMap.keys()].sort());

      for (const [internalName, sourceField] of sourceFieldMap.entries()) {
        const backendField = backendFieldMap.get(internalName);
        expect(backendField, `${key}.${internalName} missing in backend definition`).toBeDefined();
        expect(backendField!.type).toBe(TYPE_MAP[sourceField.type]);
        expect(backendField!.required ?? false).toBe(sourceField.required ?? false);
        if (sourceField.lookupList) {
          expect(backendField!.lookupListTitle).toBe(sourceField.lookupList);
        }
      }
    }
  });

  it('keeps upload library descriptor alignment and critical field coverage', () => {
    const uploadDescriptor = resolveUploadLibraryDescriptor();
    const uploadDefinition = SAFETY_RECORD_KEEPING_CONTAINER_DEFINITIONS.find(
      (definition) => definition.key === 'SafetyChecklistUploads'
    );

    expect(uploadDefinition).toBeDefined();
    expect(uploadDefinition!.title).toBe(uploadDescriptor.title);
    expect(uploadDefinition!.kind).toBe('library');

    const backendFieldNames = uploadDefinition!.fields.map((field) => field.internalName).sort();
    const descriptorCriticalFields = [...uploadDescriptor.criticalFieldInternalNames].sort();
    expect(backendFieldNames).toEqual(descriptorCriticalFields);
  });
});
