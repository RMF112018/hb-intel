import { describe, it, expect } from 'vitest';
import {
  PCC_PERSONAS,
  PCC_PERSONA_LABELS,
  PCC_PERSONA_TIER,
  PCC_PERSONA_CATEGORY,
  PCC_PERSONA_TO_PROJECT_ROLE,
  mapPccPersonaToProjectRole,
  type PccPersona,
} from './PccUserRoles.js';

const PROMPT_03_NEW_PERSONAS: readonly PccPersona[] = [
  'estimating-coordinator',
  'lead-estimator',
  'estimator',
  'chief-estimator',
  'director-of-preconstruction',
  'project-coordinator',
  'external-design-team',
  'owner-client-viewer',
  'subcontractor-limited',
  'manager-of-operational-excellence',
  'safety-qaqc',
];

const PROMPT_02_ORIGINAL_PERSONAS: readonly PccPersona[] = [
  'pcc-admin',
  'it-admin',
  'executive-oversight',
  'project-executive',
  'project-manager',
  'superintendent',
  'project-accounting',
  'project-team-member',
  'external-contributor',
  'viewer',
];

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

  it('Prompt 02 original personas remain present', () => {
    for (const persona of PROMPT_02_ORIGINAL_PERSONAS) {
      expect(PCC_PERSONAS).toContain(persona);
    }
  });

  it('Prompt 03 adds the four required personas', () => {
    for (const persona of PROMPT_03_NEW_PERSONAS) {
      expect(PCC_PERSONAS).toContain(persona);
      expect(PCC_PERSONA_LABELS[persona]).toBeTruthy();
      expect(PCC_PERSONA_TIER[persona]).toBeTruthy();
      expect(PCC_PERSONA_CATEGORY[persona]).toBeTruthy();
    }
  });

  it('every persona has a tier and category from the allowed literal set', () => {
    const allowedTiers = [
      'platform',
      'leadership',
      'operations',
      'field',
      'estimating',
      'finance',
      'external',
      'governance',
    ];
    const allowedCategories = ['primary-mvp', 'support-admin', 'secondary'];
    for (const persona of PCC_PERSONAS) {
      expect(allowedTiers).toContain(PCC_PERSONA_TIER[persona]);
      expect(allowedCategories).toContain(PCC_PERSONA_CATEGORY[persona]);
    }
  });
});
