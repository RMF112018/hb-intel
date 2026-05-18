import { describe, expect, it } from 'vitest';

import {
  enumerateAssignedUpns,
  type ILegacyRegistrySourceRow,
  type IProjectSourceRow,
} from '../../hosts/my-work-read-model/read-models/project-links/my-project-links-domain.js';

const PROJECT: IProjectSourceRow = {
  id: 101,
  projectNumber: '24-101',
  projectName: 'Riverwalk',
  year: 2024,
  roleArrays: {
    leadEstimatorUpns: ['lead@hb.example.com'],
    projectManagerUpns: ['pm@hb.example.com'],
  },
  legacyRoleFallbacks: {
    leadEstimatorUpn: 'legacy.lead@hb.example.com',
    projectExecutiveUpn: 'pe@hb.example.com',
  },
};

const REGISTRY: ILegacyRegistrySourceRow = {
  id: 9,
  projectNumber: '24-101',
  projectNameRaw: 'Riverwalk',
  legacyYear: 2024,
  isActive: true,
  matchStatus: 'matched',
  matchedProjectListItemId: 101,
  roleArrays: {
    leadEstimatorUpns: ['legacy.user@hb.example.com'],
  },
};

describe('enumerateAssignedUpns', () => {
  it('includes UPNs from canonical Projects role arrays and legacy four-field fallback fields', () => {
    const upns = enumerateAssignedUpns([PROJECT], []);
    expect(upns).toContain('lead@hb.example.com');
    expect(upns).toContain('pm@hb.example.com');
    expect(upns).toContain('legacy.lead@hb.example.com');
    expect(upns).toContain('pe@hb.example.com');
  });

  it('includes UPNs from Registry role arrays', () => {
    const upns = enumerateAssignedUpns([], [REGISTRY]);
    expect(upns).toEqual(['legacy.user@hb.example.com']);
  });

  it('returns sorted, de-duplicated UPNs across both inputs', () => {
    const upns = enumerateAssignedUpns([PROJECT], [REGISTRY]);
    expect(upns).toEqual([...upns].sort());
    expect(new Set(upns).size).toEqual(upns.length);
  });

  it('returns an empty array when neither source carries assigned UPNs', () => {
    const upns = enumerateAssignedUpns([], []);
    expect(upns).toEqual([]);
  });
});
