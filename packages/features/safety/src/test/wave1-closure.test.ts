/**
 * Wave 1 closure harness — audit-remediation Gates G1–G5.
 *
 * This test fails loudly if any foundational Wave 1 proof regresses.
 * Wave 2 work may not be merged while this file is red.
 */

import { afterEach, describe, expect, it } from 'vitest';
import {
  SharePointSafetyInspectionRepository,
  uploadToSafetyChecklistUploads,
  downloadUploadedWorkbook,
  MockSafetyInspectionRepository,
  createSafetyInspectionRepository,
  configureSafetyListGuids,
  resetSafetyListGuidOverlay,
  getListDescriptor,
  resolveDescriptor,
  ProjectsReferenceList,
  LegacyProjectFallbackRegistryList,
  SafetyChecklistUploadsLibrary,
  resolveUploadLibraryDescriptor,
  type SpHttpClient,
  type ISafetyInspectionRepository,
} from '../index.js';

const REAL_GUID = '11111111-1111-1111-1111-111111111111';

describe('Wave 1 closure — G1 export resolution', () => {
  it('exposes the SharePoint adapter, upload helper, and download helper at the public surface', () => {
    expect(typeof SharePointSafetyInspectionRepository).toBe('function');
    expect(typeof uploadToSafetyChecklistUploads).toBe('function');
    expect(typeof downloadUploadedWorkbook).toBe('function');
    expect(typeof MockSafetyInspectionRepository).toBe('function');
    expect(typeof createSafetyInspectionRepository).toBe('function');
  });
});

describe('Wave 1 closure — G1 runtime-wiring branch', () => {
  it('createSafetyInspectionRepository selects the SharePoint adapter when mode=sharepoint', () => {
    const fakeClient: SpHttpClient = {
      get: async () => new Response(null, { status: 200 }),
      post: async () => new Response(null, { status: 200 }),
    };
    const repo: ISafetyInspectionRepository = createSafetyInspectionRepository({
      mode: 'sharepoint',
      sharepoint: { client: fakeClient },
    });
    expect(repo).toBeInstanceOf(SharePointSafetyInspectionRepository);
  });

  it('createSafetyInspectionRepository falls back to mock when mode=mock', () => {
    const repo = createSafetyInspectionRepository({ mode: 'mock' });
    expect(repo).toBeInstanceOf(MockSafetyInspectionRepository);
  });

  it('SharePoint mode without an SpHttpClient fails fast', () => {
    expect(() => createSafetyInspectionRepository({ mode: 'sharepoint' })).toThrow();
  });
});

describe('Wave 1 closure — G2 numeric spItemId contract', () => {
  it('mock repo exposes spItemId + string id on every domain entity', async () => {
    const repo = new MockSafetyInspectionRepository();
    const periods = await repo.listReportingPeriods();
    expect(periods[0]?.spItemId).toBeGreaterThan(0);
    expect(periods[0]?.id).toMatch(/^period-\d+$/);

    const projectWeeks = await repo.listProjectWeeks({ reportingPeriodId: periods[0]?.id });
    expect(projectWeeks[0]?.spItemId).toBeGreaterThan(0);
    expect(projectWeeks[0]?.reportingPeriodSpItemId).toBe(periods[0]?.spItemId);

    const inspections = await repo.listInspections({ reportingPeriodId: periods[0]?.id });
    for (const ie of inspections) {
      expect(ie.spItemId).toBeGreaterThan(0);
      expect(ie.reportingPeriodSpItemId).toBe(periods[0]?.spItemId);
      expect(ie.projectWeekRecordSpItemId).toBeGreaterThan(0);
    }
  });
});

describe('Wave 1 closure — G3 reference descriptor topology', () => {
  afterEach(() => resetSafetyListGuidOverlay());

  it('Projects reference descriptor points to HBCentral', () => {
    expect(ProjectsReferenceList.siteUrl).toContain('/sites/HBCentral');
    expect(ProjectsReferenceList.title).toBe('Projects');
  });

  it('Legacy Project Fallback Registry reference descriptor points to HBCentral', () => {
    expect(LegacyProjectFallbackRegistryList.siteUrl).toContain('/sites/HBCentral');
    expect(LegacyProjectFallbackRegistryList.title).toBe('Legacy Project Fallback Registry');
  });

  it('resolveDescriptor honors overlay for both reference lists', () => {
    configureSafetyListGuids({
      Projects: REAL_GUID,
      LegacyProjectFallbackRegistry: REAL_GUID,
    });
    expect(resolveDescriptor('Projects').id).toBe(REAL_GUID);
    expect(resolveDescriptor('LegacyProjectFallbackRegistry').id).toBe(REAL_GUID);
  });
});

describe('Wave 1 closure — G4 overlay integrity', () => {
  afterEach(() => resetSafetyListGuidOverlay());

  it('fails closed when neither source nor overlay supplies a GUID', () => {
    expect(() => getListDescriptor('SafetyReportingPeriods')).toThrow(/zero GUID/);
  });

  it('returns overlay GUID once configured, keeping other keys fail-closed', () => {
    configureSafetyListGuids({ SafetyReportingPeriods: REAL_GUID });
    expect(getListDescriptor('SafetyReportingPeriods').id).toBe(REAL_GUID);
    expect(() => getListDescriptor('SafetyFindings')).toThrow(/zero GUID/);
  });

  it('upload library overlay is optional (server-relative path still reachable)', () => {
    const without = resolveUploadLibraryDescriptor();
    expect(without.id).toBe('00000000-0000-0000-0000-000000000000');
    expect(without.title).toBe(SafetyChecklistUploadsLibrary.title);
    configureSafetyListGuids({ SafetyChecklistUploads: REAL_GUID });
    const withOverlay = resolveUploadLibraryDescriptor();
    expect(withOverlay.id).toBe(REAL_GUID);
  });
});

describe('Wave 1 closure — G5 repository contract shape stability', () => {
  it('ISafetyInspectionRepository surface does not include Wave 2 symbols', () => {
    const repo = new MockSafetyInspectionRepository();
    // Wave 1 surface
    expect(typeof repo.ingestWorkbook).toBe('function');
    expect(typeof repo.retryIngestion).toBe('function');
    expect(typeof repo.listReportingPeriods).toBe('function');
    expect(typeof repo.listProjectWeeks).toBe('function');
    expect(typeof repo.listInspections).toBe('function');
    expect(typeof repo.listIngestionRuns).toBe('function');
    // Wave 2 additions must NOT yet be present on the repository.
    const repoKeys = Object.getOwnPropertyNames(
      Object.getPrototypeOf(repo),
    ) as Array<keyof typeof repo>;
    expect(repoKeys).not.toContain('findInspectionsForProjectWeek' as keyof typeof repo);
    expect(repoKeys).not.toContain('replayIngestion' as keyof typeof repo);
  });
});
