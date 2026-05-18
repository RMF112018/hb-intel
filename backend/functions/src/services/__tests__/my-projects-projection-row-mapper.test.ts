import { describe, expect, it } from 'vitest';
import type { MyProjectLinkItem } from '@hbc/models/myWork';

import {
  buildDeactivationPatch,
  buildReactivationOperationalPatch,
  mapItemToRegistryRow,
} from '../my-projects-projection/registry/my-projects-registry-row-mapper.js';

const MERGED_ITEM: MyProjectLinkItem = {
  recordKey: 'projects:101',
  source: 'merged',
  projectName: 'Riverwalk Tower',
  projectNumber: '24-101',
  projectStage: 'Construction',
  assignmentRoles: ['leadEstimator', 'projectManager'],
  sharePointAction: {
    state: 'available',
    kind: 'project-site',
    label: 'Open SharePoint Site',
    href: 'https://contoso.example/sites/riverwalk',
  },
  procoreAction: {
    state: 'available',
    label: 'Open Procore',
    procoreProject: 'riverwalk',
    href: 'https://app.procore.com/riverwalk/project/home',
  },
  buildingConnectedAction: {
    state: 'unavailable',
    label: 'BuildingConnected unavailable',
  },
  documentCrunchAction: {
    state: 'unavailable',
    label: 'Document Crunch unavailable',
  },
  provenance: {
    projectsListItemId: 101,
    legacyRegistryItemId: 9,
    legacyMatchedProjectListItemId: 101,
    fallbackMatchMethod: 'explicit',
    fallbackMatchConfidence: 'high',
  },
  warnings: [{ code: 'legacy-role-data-preserved' }],
};

describe('mapItemToRegistryRow', () => {
  it('maps a merged item to the full registry row contract', () => {
    const fields = mapItemToRegistryRow({
      projectionKey: 'abc',
      userUpn: 'lead@hb.example.com',
      recordKey: 'projects:101',
      item: MERGED_ITEM,
      contentHash: 'hash-1',
      projectionBatchId: 'batch-1',
      lastProjectedAtUtc: '2026-05-18T00:00:00.000Z',
    });

    expect(fields.Title).toEqual('abc');
    expect(fields.ProjectionKey).toEqual('abc');
    expect(fields.RecordKey).toEqual('projects:101');
    expect(fields.UserUpn).toEqual('lead@hb.example.com');
    expect(fields.ProjectionSource).toEqual('merged');
    expect(fields.IsActive).toBe(true);
    expect(fields.ProjectionContentHash).toEqual('hash-1');
    expect(fields.ProjectionBatchId).toEqual('batch-1');
    expect(fields.LastProjectedAtUtc).toEqual('2026-05-18T00:00:00.000Z');
    expect(fields.ProjectNumber).toEqual('24-101');
    expect(fields.ProjectName).toEqual('Riverwalk Tower');
    expect(fields.ProjectStage).toEqual('Construction');
    expect(JSON.parse(fields.AssignmentRolesJson)).toEqual(['leadEstimator', 'projectManager']);
    expect(fields.ProjectsListItemId).toEqual(101);
    expect(fields.LegacyRegistryItemId).toEqual(9);
    expect(fields.LegacyMatchedProjectListItemId).toEqual(101);
    expect(fields.FallbackMatchMethod).toEqual('explicit');
    expect(fields.FallbackMatchConfidence).toEqual('high');
    expect(fields.SharePointActionState).toEqual('available');
    expect(fields.SharePointActionKind).toEqual('project-site');
    expect(fields.SharePointActionLabel).toEqual('Open SharePoint Site');
    expect(fields.SharePointActionHref).toEqual('https://contoso.example/sites/riverwalk');
    expect(fields.ProcoreActionState).toEqual('available');
    expect(fields.ProcoreProject).toEqual('riverwalk');
    expect(fields.ProcoreActionLabel).toEqual('Open Procore');
    expect(fields.ProcoreActionHref).toEqual('https://app.procore.com/riverwalk/project/home');
    expect(fields.BuildingConnectedActionState).toEqual('unavailable');
    expect(fields.DocumentCrunchActionState).toEqual('unavailable');
    expect(JSON.parse(fields.WarningsJson!)).toEqual([{ code: 'legacy-role-data-preserved' }]);
  });

  it('omits optional fields that are undefined on the item', () => {
    const item: MyProjectLinkItem = {
      ...MERGED_ITEM,
      projectStage: undefined,
      provenance: { projectsListItemId: 101 },
      sharePointAction: {
        state: 'unavailable',
        kind: 'none',
        label: 'SharePoint unavailable',
      },
      procoreAction: {
        state: 'unavailable',
        label: 'Procore unavailable',
      },
      warnings: [],
    };
    const fields = mapItemToRegistryRow({
      projectionKey: 'k',
      userUpn: 'lead@hb.example.com',
      recordKey: 'projects:101',
      item,
      contentHash: 'h',
      projectionBatchId: 'b',
      lastProjectedAtUtc: '2026-05-18T00:00:00.000Z',
    });
    expect(fields.ProjectStage).toBeUndefined();
    expect(fields.LegacyRegistryItemId).toBeUndefined();
    expect(fields.LegacyMatchedProjectListItemId).toBeUndefined();
    expect(fields.FallbackMatchMethod).toBeUndefined();
    expect(fields.FallbackMatchConfidence).toBeUndefined();
    expect(fields.SharePointActionHref).toBeUndefined();
    expect(fields.ProcoreProject).toBeUndefined();
    expect(fields.ProcoreActionHref).toBeUndefined();
    expect(fields.WarningsJson).toBeUndefined();
  });
});

describe('buildDeactivationPatch', () => {
  it('stamps soft-deactivation fields with a closed-set reason', () => {
    const patch = buildDeactivationPatch({
      reason: 'project-source-deleted',
      projectionBatchId: 'batch-x',
      nowUtc: '2026-05-18T10:00:00.000Z',
    });
    expect(patch.IsActive).toBe(false);
    expect(patch.DeactivationReason).toEqual('project-source-deleted');
    expect(patch.DeactivatedAtUtc).toEqual('2026-05-18T10:00:00.000Z');
    expect(patch.LastProjectedAtUtc).toEqual('2026-05-18T10:00:00.000Z');
    expect(patch.ProjectionBatchId).toEqual('batch-x');
  });
});

describe('buildReactivationOperationalPatch', () => {
  it('clears DeactivatedAtUtc / DeactivationReason via null and stamps the run', () => {
    const patch = buildReactivationOperationalPatch({
      projectionBatchId: 'batch-y',
      nowUtc: '2026-05-18T11:00:00.000Z',
    });
    expect(patch.IsActive).toBe(true);
    expect(patch.DeactivatedAtUtc).toBeNull();
    expect(patch.DeactivationReason).toBeNull();
    expect(patch.LastProjectedAtUtc).toEqual('2026-05-18T11:00:00.000Z');
    expect(patch.ProjectionBatchId).toEqual('batch-y');
  });
});
