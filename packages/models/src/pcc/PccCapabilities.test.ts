import { describe, it, expect } from 'vitest';
import {
  PCC_CAPABILITY_IDS,
  PCC_CAPABILITIES,
  PCC_PERSONA_CAPABILITIES,
  personaHasCapability,
} from './PccCapabilities.js';
import { PCC_PERSONAS } from './PccUserRoles.js';
import { PCC_MVP_SURFACE_IDS } from './PccMvpSurfaces.js';
import { TEAM_ACCESS_MANAGER_PERSONAS } from './TeamAccess.js';

const SECRET_TOKEN_PATTERNS = /(secret|token|bearer|apikey|api[-_]key|authorization|password)/i;

describe('PCC capabilities', () => {
  it('every capability id has a registry entry referencing an existing MVP surface', () => {
    for (const id of PCC_CAPABILITY_IDS) {
      const entry = PCC_CAPABILITIES[id];
      expect(entry).toBeDefined();
      expect(entry.id).toBe(id);
      expect(entry.displayName.length).toBeGreaterThan(0);
      expect(PCC_MVP_SURFACE_IDS).toContain(entry.surfaceId);
    }
  });

  it('every persona has a capability list', () => {
    for (const persona of PCC_PERSONAS) {
      const caps = PCC_PERSONA_CAPABILITIES[persona];
      expect(Array.isArray(caps)).toBe(true);
      for (const cap of caps) {
        expect(PCC_CAPABILITY_IDS).toContain(cap);
      }
    }
  });

  it('personaHasCapability matches the persona array', () => {
    expect(personaHasCapability('pcc-admin', 'manage-control-center-settings')).toBe(true);
    expect(personaHasCapability('viewer', 'manage-control-center-settings')).toBe(false);
    expect(personaHasCapability('safety-qaqc', 'manage-inspections')).toBe(true);
    expect(personaHasCapability('external-contributor', 'view-documents')).toBe(true);
  });

  it('no capability id contains secret-like substrings', () => {
    for (const id of PCC_CAPABILITY_IDS) {
      expect(id).not.toMatch(SECRET_TOKEN_PATTERNS);
      expect(PCC_CAPABILITIES[id].displayName).not.toMatch(SECRET_TOKEN_PATTERNS);
    }
  });

  it('pcc-admin holds the full capability set', () => {
    const adminCaps = PCC_PERSONA_CAPABILITIES['pcc-admin'];
    expect(adminCaps).toHaveLength(PCC_CAPABILITY_IDS.length);
  });

  it('manage-team-access is mapped exactly to TEAM_ACCESS_MANAGER_PERSONAS', () => {
    const managerSet = new Set(TEAM_ACCESS_MANAGER_PERSONAS);
    for (const persona of PCC_PERSONAS) {
      const expected = managerSet.has(persona);
      expect(
        personaHasCapability(persona, 'manage-team-access'),
        `${persona} manage-team-access mismatch`,
      ).toBe(expected);
    }
  });

  it('critical non-manager personas do not gain manage-team-access accidentally', () => {
    const mustNotHave = [
      'executive-oversight',
      'superintendent',
      'project-accounting',
      'project-team-member',
      'external-contributor',
      'viewer',
      'safety-qaqc',
    ] as const;
    for (const persona of mustNotHave) {
      expect(personaHasCapability(persona, 'manage-team-access')).toBe(false);
    }
  });
});
