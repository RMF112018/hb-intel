import { describe, expect, it } from 'vitest';

import {
  PUBLICATION_SCOPE,
  REVIEW_PACKAGE_STATUSES,
  CONSTRAINTS_PUBLICATION_ROLES,
  CONSTRAINTS_PUBLICATION_ACTIONS,
  STATE_CONSUMPTION_MODES,
  GOVERNED_TAXONOMY_AREAS,
  PUBLICATION_AUTHORITY_MATRIX,
  STATE_CONSUMPTION_MAP,
  BIC_TEAM_REGISTRY,
  GOVERNED_TAXONOMY_DESCRIPTORS,
  LOCKED_STRUCTURAL_ELEMENTS,
} from '../../index.js';

describe('P3-E6-T06 contract stability', () => {
  it('PUBLICATION_SCOPE is "constraints/publication"', () => {
    expect(PUBLICATION_SCOPE).toBe('constraints/publication');
  });

  it('locks REVIEW_PACKAGE_STATUSES to exactly 3 values', () => {
    expect(REVIEW_PACKAGE_STATUSES).toEqual(['Active', 'Superseded', 'Archived']);
    expect(REVIEW_PACKAGE_STATUSES).toHaveLength(3);
  });

  it('locks CONSTRAINTS_PUBLICATION_ROLES to exactly 6 values', () => {
    expect(CONSTRAINTS_PUBLICATION_ROLES).toHaveLength(6);
  });

  it('locks CONSTRAINTS_PUBLICATION_ACTIONS to exactly 8 values', () => {
    expect(CONSTRAINTS_PUBLICATION_ACTIONS).toHaveLength(8);
  });

  it('locks STATE_CONSUMPTION_MODES to exactly 3 values', () => {
    expect(STATE_CONSUMPTION_MODES).toEqual(['Live', 'Published', 'Configurable']);
  });

  it('locks GOVERNED_TAXONOMY_AREAS to exactly 13 values', () => {
    expect(GOVERNED_TAXONOMY_AREAS).toHaveLength(13);
  });

  it('PUBLICATION_AUTHORITY_MATRIX has exactly 8 rules', () => {
    expect(PUBLICATION_AUTHORITY_MATRIX).toHaveLength(8);
  });

  it('STATE_CONSUMPTION_MAP has exactly 9 consumer rules', () => {
    expect(STATE_CONSUMPTION_MAP).toHaveLength(9);
  });

  it('BIC_TEAM_REGISTRY has exactly 32 teams', () => {
    expect(BIC_TEAM_REGISTRY).toHaveLength(32);
  });

  it('each BIC team has all required fields', () => {
    for (const team of BIC_TEAM_REGISTRY) {
      expect(team.teamCode).toBeTruthy();
      expect(team.displayName).toBeTruthy();
      expect(team.responsibilityArea).toBeTruthy();
    }
  });

  it('BIC team codes are unique', () => {
    const codes = BIC_TEAM_REGISTRY.map((t) => t.teamCode);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('GOVERNED_TAXONOMY_DESCRIPTORS has exactly 13 entries', () => {
    expect(GOVERNED_TAXONOMY_DESCRIPTORS).toHaveLength(13);
  });

  it('LOCKED_STRUCTURAL_ELEMENTS has exactly 7 entries', () => {
    expect(LOCKED_STRUCTURAL_ELEMENTS).toHaveLength(7);
  });

  it('PER role can only annotate published state', () => {
    const perRules = PUBLICATION_AUTHORITY_MATRIX.filter((r) =>
      r.allowedRoles.includes('PER'),
    );
    const perActions = perRules.map((r) => r.action);
    expect(perActions).toContain('AnnotatePublished');
    expect(perActions).toContain('AccessPublished');
    expect(perActions).not.toContain('CreateEditLive');
    expect(perActions).not.toContain('PublishSnapshot');
    expect(perActions).not.toContain('ConfigureGovernance');
  });
});
