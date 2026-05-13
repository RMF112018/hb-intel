import { describe, expect, it } from 'vitest';
import {
  LEGACY_FALLBACK_LIST_DESCRIPTORS,
  LEGACY_FALLBACK_REGISTRY_LIST_DESCRIPTOR,
  LEGACY_FALLBACK_SYNC_RUNS_LIST_DESCRIPTOR,
  LEGACY_FALLBACK_REGISTRY_LIST_TITLE,
  LEGACY_FALLBACK_SYNC_RUNS_LIST_TITLE,
  getLegacyFallbackListHostSiteUrl,
} from '../legacy-fallback/list-descriptors.js';
import {
  LEGACY_PROJECT_NUMBER_REGEX,
  MATCH_METHOD_CONFIDENCE,
  normalizeLegacyCandidateName,
  stripLeadingProjectNumberToken,
} from '../legacy-fallback/matching-contracts.js';

function field(list: { fields: Array<{ internalName: string; indexed?: boolean; type: string }> }, name: string) {
  return list.fields.find((entry) => entry.internalName === name);
}

describe('legacy fallback list descriptors and matching contracts', () => {
  it('declares required list titles and host site', () => {
    expect(LEGACY_FALLBACK_REGISTRY_LIST_TITLE).toBe('Legacy Project Fallback Registry');
    expect(LEGACY_FALLBACK_SYNC_RUNS_LIST_TITLE).toBe('Legacy Project Fallback Sync Runs');
    expect(getLegacyFallbackListHostSiteUrl()).toBe(
      'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
    );
  });

  it('contains both required descriptors', () => {
    expect(LEGACY_FALLBACK_LIST_DESCRIPTORS.map((list) => list.title)).toEqual([
      LEGACY_FALLBACK_REGISTRY_LIST_TITLE,
      LEGACY_FALLBACK_SYNC_RUNS_LIST_TITLE,
    ]);
  });

  it('locks required indexed registry fields', () => {
    const indexedFieldNames = LEGACY_FALLBACK_REGISTRY_LIST_DESCRIPTOR.fields
      .filter((entry) => entry.indexed)
      .map((entry) => entry.internalName);

    expect(indexedFieldNames).toEqual(
      expect.arrayContaining([
        'ProjectNumber',
        'LegacyYear',
        'DriveId',
        'DriveItemId',
        'MatchStatus',
        'IsActive',
      ]),
    );
  });

  it('declares required registry and sync-run fields', () => {
    expect(field(LEGACY_FALLBACK_REGISTRY_LIST_DESCRIPTOR, 'DriveId')?.type).toBe('Text');
    expect(field(LEGACY_FALLBACK_REGISTRY_LIST_DESCRIPTOR, 'DriveItemId')?.type).toBe('Text');
    expect(field(LEGACY_FALLBACK_REGISTRY_LIST_DESCRIPTOR, 'FolderWebUrl')?.type).toBe('URL');
    expect(field(LEGACY_FALLBACK_REGISTRY_LIST_DESCRIPTOR, 'MatchMethod')?.type).toBe('Choice');
    expect(field(LEGACY_FALLBACK_REGISTRY_LIST_DESCRIPTOR, 'Notes')?.type).toBe('MultiLineText');
    expect(field(LEGACY_FALLBACK_REGISTRY_LIST_DESCRIPTOR, 'procoreProject')?.type).toBe('Text');

    expect(field(LEGACY_FALLBACK_SYNC_RUNS_LIST_DESCRIPTOR, 'RunId')?.type).toBe('Text');
    expect(field(LEGACY_FALLBACK_SYNC_RUNS_LIST_DESCRIPTOR, 'StartedUtc')?.type).toBe('DateTime');
    expect(field(LEGACY_FALLBACK_SYNC_RUNS_LIST_DESCRIPTOR, 'CompletedUtc')?.type).toBe('DateTime');
    expect(field(LEGACY_FALLBACK_SYNC_RUNS_LIST_DESCRIPTOR, 'Status')?.type).toBe('Choice');
    expect(field(LEGACY_FALLBACK_SYNC_RUNS_LIST_DESCRIPTOR, 'SummaryJson')?.type).toBe('MultiLineText');
  });

  it('includes all My Projects canonical role-array registry fields as MultiLineText', () => {
    const canonicalRoleFields = [
      'leadEstimatorUpns',
      'estimatorUpns',
      'idsManagerUpns',
      'projectAccountantUpns',
      'projectAdministratorUpns',
      'projectCoordinatorUpns',
      'superintendentUpns',
      'leadSuperintendentUpns',
      'projectManagerUpns',
      'leadProjectManagerUpns',
      'projectExecutiveUpns',
      'safetyCoordinatorUpns',
      'qcManagerUpns',
      'warrantyManagerUpns',
    ] as const;

    for (const fieldName of canonicalRoleFields) {
      expect(field(LEGACY_FALLBACK_REGISTRY_LIST_DESCRIPTOR, fieldName)?.type).toBe('MultiLineText');
    }
  });

  it('uses anchored parser and confidence mapping assumptions', () => {
    expect(LEGACY_PROJECT_NUMBER_REGEX.test('22-112-01 PGA The Modern & Garage')).toBe(true);
    expect(LEGACY_PROJECT_NUMBER_REGEX.test('PGA 22-112-01 The Modern')).toBe(false);
    expect(stripLeadingProjectNumberToken('22-141-01 BIM - Caretta')).toBe('BIM - Caretta');
    expect(normalizeLegacyCandidateName('22-300-01 Biden Residence & Garage')).toBe(
      'biden residence and garage',
    );
    expect(MATCH_METHOD_CONFIDENCE['project-number-exact']).toBe('high');
    expect(MATCH_METHOD_CONFIDENCE['normalized-title-year']).toBe('medium');
    expect(MATCH_METHOD_CONFIDENCE['no-match']).toBe('none');
  });
});
