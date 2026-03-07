// packages/auth/src/mock/personaRegistry.test.ts
// D-PH5C-05: Validation coverage for PersonaRegistry query and integrity behavior

import { describe, expect, it } from 'vitest';

import { PERSONA_REGISTRY } from './personaRegistry';

describe('PERSONA_REGISTRY', () => {
  it('returns the expected total/base/supplemental counts', () => {
    expect(PERSONA_REGISTRY.count()).toBe(11);
    expect(PERSONA_REGISTRY.base()).toHaveLength(6);
    expect(PERSONA_REGISTRY.supplemental()).toHaveLength(5);
    expect(PERSONA_REGISTRY.all()).toHaveLength(11);
  });

  it('getById returns a persona for a valid id', () => {
    const persona = PERSONA_REGISTRY.getById('persona-admin');
    expect(persona).toBeDefined();
    expect(persona?.name).toBe('Administrator');
  });

  it('getById returns undefined for invalid id', () => {
    expect(PERSONA_REGISTRY.getById('persona-does-not-exist')).toBeUndefined();
  });

  it('default returns Administrator persona', () => {
    const persona = PERSONA_REGISTRY.default();
    expect(persona.id).toBe('persona-admin');
    expect(persona.name).toBe('Administrator');
    expect(persona.category).toBe('base');
  });

  it('byCategory filters to base personas', () => {
    const personas = PERSONA_REGISTRY.byCategory('base');
    expect(personas).toHaveLength(6);
    expect(personas.every((p) => p.category === 'base')).toBe(true);
  });

  it('byCategory filters to supplemental personas', () => {
    const personas = PERSONA_REGISTRY.byCategory('supplemental');
    expect(personas).toHaveLength(5);
    expect(personas.every((p) => p.category === 'supplemental')).toBe(true);
  });

  it('byTag filters personas using tags', () => {
    const admin = PERSONA_REGISTRY.byTag('admin');
    const edgeCase = PERSONA_REGISTRY.byTag('edge-case');
    expect(admin.some((p) => p.id === 'persona-admin')).toBe(true);
    expect(edgeCase.length).toBeGreaterThan(0);
    expect(edgeCase.every((p) => p.tags.includes('edge-case'))).toBe(true);
  });

  it('contains no duplicate persona ids', () => {
    const ids = PERSONA_REGISTRY.all().map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('ensures required persona fields are populated', () => {
    for (const persona of PERSONA_REGISTRY.all()) {
      expect(persona.id).toBeTruthy();
      expect(persona.name).toBeTruthy();
      expect(persona.email).toContain('@');
      expect(persona.roles.length).toBeGreaterThan(0);
      expect(Object.keys(persona.permissions).length).toBeGreaterThan(0);
      expect(persona.description).toBeTruthy();
      expect(persona.tags.length).toBeGreaterThan(0);
      expect(persona.usageExample).toBeTruthy();
      expect(typeof persona.created).toBe('number');
      expect(typeof persona.updatedAt).toBe('number');
    }
  });
});
