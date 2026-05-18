import { describe, expect, it } from 'vitest';
import type { MyProjectLinkItem } from '@hbc/models/myWork';

import {
  computeProjectionContentHash,
  computeProjectionKey,
  normalizeUpnForKey,
} from '../my-projects-projection/projection-content-hash.js';

const SAMPLE_ITEM: MyProjectLinkItem = {
  recordKey: 'projects:101',
  source: 'projects-only',
  projectName: 'Riverwalk Tower',
  projectNumber: '24-101',
  projectStage: 'Construction',
  assignmentRoles: ['leadEstimator'],
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
  },
  warnings: [{ code: 'building-connected-launch-unavailable' }],
};

describe('computeProjectionKey', () => {
  it('lowercases the UPN before hashing so case differences upsert the same row', () => {
    expect(computeProjectionKey('Lead.Estimator@HB.example.com', 'projects:101')).toEqual(
      computeProjectionKey('lead.estimator@hb.example.com', 'projects:101'),
    );
  });

  it('produces a different hash for a different RecordKey', () => {
    const a = computeProjectionKey('lead@hb.example.com', 'projects:101');
    const b = computeProjectionKey('lead@hb.example.com', 'projects:102');
    expect(a).not.toEqual(b);
  });

  it('emits a stable sha256 hex string (64 chars, lowercase hex)', () => {
    const key = computeProjectionKey('lead@hb.example.com', 'projects:101');
    expect(key).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('normalizeUpnForKey', () => {
  it('trims whitespace and lowercases', () => {
    expect(normalizeUpnForKey('  LEAD@HB.example.com  ')).toEqual('lead@hb.example.com');
  });
});

describe('computeProjectionContentHash', () => {
  it('is deterministic for the same input regardless of property insertion order', () => {
    const itemShuffled: MyProjectLinkItem = {
      warnings: SAMPLE_ITEM.warnings,
      provenance: SAMPLE_ITEM.provenance,
      documentCrunchAction: SAMPLE_ITEM.documentCrunchAction,
      buildingConnectedAction: SAMPLE_ITEM.buildingConnectedAction,
      procoreAction: SAMPLE_ITEM.procoreAction,
      sharePointAction: SAMPLE_ITEM.sharePointAction,
      assignmentRoles: SAMPLE_ITEM.assignmentRoles,
      projectStage: SAMPLE_ITEM.projectStage,
      projectNumber: SAMPLE_ITEM.projectNumber,
      projectName: SAMPLE_ITEM.projectName,
      source: SAMPLE_ITEM.source,
      recordKey: SAMPLE_ITEM.recordKey,
    };
    const a = computeProjectionContentHash({
      upn: 'lead@hb.example.com',
      recordKey: 'projects:101',
      item: SAMPLE_ITEM,
    });
    const b = computeProjectionContentHash({
      upn: 'lead@hb.example.com',
      recordKey: 'projects:101',
      item: itemShuffled,
    });
    expect(a).toEqual(b);
  });

  it('changes when a business field changes', () => {
    const a = computeProjectionContentHash({
      upn: 'lead@hb.example.com',
      recordKey: 'projects:101',
      item: SAMPLE_ITEM,
    });
    const mutated: MyProjectLinkItem = { ...SAMPLE_ITEM, projectName: 'Different Name' };
    const b = computeProjectionContentHash({
      upn: 'lead@hb.example.com',
      recordKey: 'projects:101',
      item: mutated,
    });
    expect(a).not.toEqual(b);
  });

  it('is UPN-case insensitive (normalizes to lowercase like the projection key)', () => {
    expect(
      computeProjectionContentHash({
        upn: 'LEAD@HB.example.com',
        recordKey: 'projects:101',
        item: SAMPLE_ITEM,
      }),
    ).toEqual(
      computeProjectionContentHash({
        upn: 'lead@hb.example.com',
        recordKey: 'projects:101',
        item: SAMPLE_ITEM,
      }),
    );
  });
});
