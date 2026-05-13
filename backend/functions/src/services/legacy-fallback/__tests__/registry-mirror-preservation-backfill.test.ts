import { describe, expect, it } from 'vitest';
import {
  buildLegacyRegistryMirrorPatch,
  buildProjectYearIndexKey,
  type ILegacyRegistryNormalizedRow,
  type IProjectsAuthorityRow,
  resolveRegistryAuthorityLinkage,
} from '../registry-mirror-preservation-backfill.js';

function row(overrides: Partial<ILegacyRegistryNormalizedRow> = {}): ILegacyRegistryNormalizedRow {
  return {
    id: 10,
    projectNumber: '25-001-01',
    legacyYear: 2025,
    matchStatus: 'matched',
    matchedProjectListItemId: 100,
    procoreProject: '',
    roleArrays: {},
    ...overrides,
  };
}

function project(overrides: Partial<IProjectsAuthorityRow> = {}): IProjectsAuthorityRow {
  return {
    id: 100,
    projectNumber: '25-001-01',
    year: 2025,
    procoreProject: 'abc123',
    roleArrays: {
      leadEstimatorUpns: '["lead@hb.com"]',
      estimatorUpns: '["est@hb.com"]',
    },
    ...overrides,
  };
}

describe('registry-mirror-preservation-backfill', () => {
  it('matched row mirrors Projects role arrays and procoreProject', () => {
    const p = project();
    const result = buildLegacyRegistryMirrorPatch(
      row({
        roleArrays: { leadEstimatorUpns: '[]', estimatorUpns: '[]' },
        procoreProject: '',
      }),
      {
        projectById: new Map([[p.id, p]]),
        projectsByProjectYearKey: new Map(),
      },
    );

    expect(result.status).toBe('matched-mirrored');
    expect(result.patch.leadEstimatorUpns).toBe('["lead@hb.com"]');
    expect(result.patch.estimatorUpns).toBe('["est@hb.com"]');
    expect(result.patch.procoreProject).toBe('abc123');
    expect(result.mirroredMatchedRow).toBe(true);
  });

  it('legacy-only row preserves operator values and normalizes JSON arrays', () => {
    const result = buildLegacyRegistryMirrorPatch(
      row({
        matchStatus: 'unmatched',
        matchedProjectListItemId: null,
        procoreProject: 'token-7',
        roleArrays: { projectExecutiveUpns: '["B@hb.com","a@hb.com"]' },
      }),
      { projectById: new Map(), projectsByProjectYearKey: new Map() },
    );

    expect(result.status).toBe('legacy-preserved');
    expect(result.patch.projectExecutiveUpns).toBe('["a@hb.com","b@hb.com"]');
    expect(result.patch.procoreProject).toBeUndefined();
    expect(result.preservedLegacyOnlyRow).toBe(true);
  });

  it('legacy-only row with invalid procore token is warning and no destructive write', () => {
    const result = buildLegacyRegistryMirrorPatch(
      row({
        matchStatus: 'unmatched',
        matchedProjectListItemId: null,
        procoreProject: 'Yes',
      }),
      { projectById: new Map(), projectsByProjectYearKey: new Map() },
    );

    expect(result.status).toBe('warning');
    expect(result.patch.procoreProject).toBeUndefined();
    expect(result.warnings.some((w) => w.code === 'invalid-legacy-token')).toBe(true);
  });

  it('unresolved matched linkage warns and skips write', () => {
    const result = buildLegacyRegistryMirrorPatch(
      row({ matchedProjectListItemId: 999 }),
      { projectById: new Map(), projectsByProjectYearKey: new Map() },
    );

    expect(result.status).toBe('warning');
    expect(result.patch).toEqual({});
    expect(result.warnings.some((w) => w.code === 'missing-project-authority')).toBe(true);
  });

  it('fallback linkage by projectNumber + year resolves deterministically', () => {
    const p = project({ id: 0 });
    const key = buildProjectYearIndexKey(p.projectNumber, p.year);
    const linkage = resolveRegistryAuthorityLinkage(
      row({ matchStatus: 'review-required', matchedProjectListItemId: null }),
      {
        projectById: new Map(),
        projectsByProjectYearKey: new Map([[key, [p]]]),
      },
    );
    expect(linkage.kind).toBe('matched');
    expect(linkage.project?.projectNumber).toBe('25-001-01');
  });

  it('ambiguous fallback linkage warns and does not resolve', () => {
    const p1 = project({ id: 1 });
    const p2 = project({ id: 2 });
    const key = buildProjectYearIndexKey('25-001-01', 2025);
    const linkage = resolveRegistryAuthorityLinkage(
      row({ matchStatus: 'review-required', matchedProjectListItemId: null }),
      {
        projectById: new Map(),
        projectsByProjectYearKey: new Map([[key, [p1, p2]]]),
      },
    );
    expect(linkage.kind).toBe('insufficient');
    expect(linkage.warnings.some((w) => w.code === 'ambiguous-fallback-linkage')).toBe(true);
  });
});
