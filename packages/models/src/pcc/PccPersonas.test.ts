import { describe, it, expect } from 'vitest';
import {
  PCC_PERSONAS,
  PCC_PERSONA_LABELS,
  PCC_PERSONA_TO_PROJECT_ROLE,
  mapPccPersonaToProjectRole,
} from './PccUserRoles.js';

describe('PCC personas', () => {
  it('every persona id has a display label', () => {
    for (const persona of PCC_PERSONAS) {
      expect(PCC_PERSONA_LABELS[persona]).toBeTruthy();
    }
  });

  it('every persona maps deterministically to ProjectRole or null', () => {
    for (const persona of PCC_PERSONAS) {
      const mapped = PCC_PERSONA_TO_PROJECT_ROLE[persona];
      expect(mapPccPersonaToProjectRole(persona)).toBe(mapped);
      if (mapped !== null) {
        expect(typeof mapped).toBe('string');
        expect(mapped.length).toBeGreaterThan(0);
      }
    }
  });

  it('it-admin has no project-role equivalent', () => {
    expect(mapPccPersonaToProjectRole('it-admin')).toBeNull();
  });

  it('persona registry has no duplicates', () => {
    expect(new Set(PCC_PERSONAS).size).toBe(PCC_PERSONAS.length);
  });
});
