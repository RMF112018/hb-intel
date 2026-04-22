import { afterEach, describe, expect, it } from 'vitest';
import {
  LegacyProjectFallbackRegistryList,
  ProjectsReferenceList,
  getListDescriptor,
  resolveDescriptor,
} from './descriptors.js';
import {
  configureSafetyListGuids,
  resetSafetyListGuidOverlay,
} from './guidConfig.js';

const REAL_GUID_A = '11111111-1111-1111-1111-111111111111';
const REAL_GUID_B = '22222222-2222-2222-2222-222222222222';
const REAL_GUID_C = '33333333-3333-3333-3333-333333333333';
const HBCENTRAL_GUIDS = {
  SafetyReportingPeriods: 'c30e6f0f-44be-49bd-ad14-46701f96cedb',
  SafetyProjectWeekRecords: '404546f4-c827-4d87-816b-fa526c15852b',
  SafetyInspectionEvents: 'dca4537f-7f3a-4159-b48f-f06f2944dc59',
  SafetyFindings: '8140e59a-0fed-4681-8e8d-8360c93d2d08',
  SafetyIngestionRuns: '965d5b6a-6bec-425a-b19c-6fb56c717c30',
  Projects: '1ac57cbb-9f0a-457f-9c97-081a29f45b12',
  LegacyProjectFallbackRegistry: '2c24aa84-38f4-4793-9576-2ee23bedd74a',
} as const;

describe('GUID overlay + descriptor resolution', () => {
  afterEach(() => {
    resetSafetyListGuidOverlay();
  });

  it('fails closed when no overlay is configured', () => {
    expect(() => getListDescriptor('SafetyReportingPeriods')).toThrow(/zero GUID/);
  });

  it('returns the overlay GUID once configured', () => {
    configureSafetyListGuids({
      SafetyReportingPeriods: REAL_GUID_A,
    });
    const desc = getListDescriptor('SafetyReportingPeriods');
    expect(desc.id).toBe(REAL_GUID_A);
    expect(desc.title).toBe('Safety Reporting Periods');
    expect(desc.siteUrl).toContain('/sites/HBCentral');
  });

  it('partial overlay does not leak one list GUID into another', () => {
    configureSafetyListGuids({ SafetyReportingPeriods: REAL_GUID_A });
    expect(getListDescriptor('SafetyReportingPeriods').id).toBe(REAL_GUID_A);
    expect(() => getListDescriptor('SafetyInspectionEvents')).toThrow(/zero GUID/);
  });

  it('binds the Projects reference descriptor to HBCentral', () => {
    configureSafetyListGuids({ Projects: REAL_GUID_B });
    const projects = resolveDescriptor('Projects');
    expect(projects).toEqual(projectsReference(REAL_GUID_B));
    expect(projects.title).toBe('Projects');
    expect(projects.siteUrl).toContain('/sites/HBCentral');
  });

  it('binds the Legacy Project Fallback Registry reference descriptor to HBCentral', () => {
    configureSafetyListGuids({ LegacyProjectFallbackRegistry: REAL_GUID_C });
    const legacy = resolveDescriptor('LegacyProjectFallbackRegistry');
    expect(legacy.id).toBe(REAL_GUID_C);
    expect(legacy.title).toBe('Legacy Project Fallback Registry');
    expect(legacy.siteUrl).toContain('/sites/HBCentral');
  });

  it('source defaults still carry fail-closed zero GUIDs', () => {
    expect(ProjectsReferenceList.id).toBe('00000000-0000-0000-0000-000000000000');
    expect(LegacyProjectFallbackRegistryList.id).toBe('00000000-0000-0000-0000-000000000000');
  });

  it('resolves all known HBCentral safety/reference descriptors from one overlay', () => {
    configureSafetyListGuids(HBCENTRAL_GUIDS);
    expect(resolveDescriptor('SafetyReportingPeriods').id).toBe(HBCENTRAL_GUIDS.SafetyReportingPeriods);
    expect(resolveDescriptor('SafetyProjectWeekRecords').id).toBe(
      HBCENTRAL_GUIDS.SafetyProjectWeekRecords,
    );
    expect(resolveDescriptor('SafetyInspectionEvents').id).toBe(
      HBCENTRAL_GUIDS.SafetyInspectionEvents,
    );
    expect(resolveDescriptor('SafetyFindings').id).toBe(HBCENTRAL_GUIDS.SafetyFindings);
    expect(resolveDescriptor('SafetyIngestionRuns').id).toBe(HBCENTRAL_GUIDS.SafetyIngestionRuns);
    expect(resolveDescriptor('Projects').id).toBe(HBCENTRAL_GUIDS.Projects);
    expect(resolveDescriptor('LegacyProjectFallbackRegistry').id).toBe(
      HBCENTRAL_GUIDS.LegacyProjectFallbackRegistry,
    );
  });
});

function projectsReference(expectedGuid: string): {
  id: string;
  title: string;
  siteUrl: string;
  urlSegment: string;
  purpose?: string;
  criticalFieldInternalNames?: ReadonlyArray<string>;
} {
  // Small matcher helper — toStrictEqual against the real descriptor with the
  // overlay GUID applied. Keeps the test assertion readable.
  return {
    id: expectedGuid,
    title: 'Projects',
    siteUrl: ProjectsReferenceList.siteUrl,
    urlSegment: 'Projects',
    purpose: ProjectsReferenceList.purpose,
    criticalFieldInternalNames: ProjectsReferenceList.criticalFieldInternalNames,
  };
}
