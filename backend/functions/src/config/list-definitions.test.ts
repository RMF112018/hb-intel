import { describe, it, expect } from 'vitest';
import { HB_INTEL_LIST_DEFINITIONS } from './list-definitions.js';

/**
 * W0-G2-T01: Regression guard tests for the 8 core G1 list definitions.
 * Ensures G2 schema extensions (pid, defaultValue, indexed, Lookup, MultiLineText,
 * provisioningOrder, parentListTitle, listFamily) do not leak into the core lists.
 */
describe('HB_INTEL_LIST_DEFINITIONS — core list regression guards', () => {
  it('contains exactly 8 core lists', () => {
    expect(HB_INTEL_LIST_DEFINITIONS).toHaveLength(8);
  });

  it('no core list field has internalName "pid"', () => {
    for (const list of HB_INTEL_LIST_DEFINITIONS) {
      for (const field of list.fields) {
        expect(field.internalName).not.toBe('pid');
      }
    }
  });

  it('no core list field has a defaultValue property', () => {
    for (const list of HB_INTEL_LIST_DEFINITIONS) {
      for (const field of list.fields) {
        expect(field.defaultValue).toBeUndefined();
      }
    }
  });

  it('no core list field has an indexed property', () => {
    for (const list of HB_INTEL_LIST_DEFINITIONS) {
      for (const field of list.fields) {
        expect(field.indexed).toBeUndefined();
      }
    }
  });

  it('no core list field uses Lookup type', () => {
    for (const list of HB_INTEL_LIST_DEFINITIONS) {
      for (const field of list.fields) {
        expect(field.type).not.toBe('Lookup');
      }
    }
  });

  it('no core list field uses MultiLineText type', () => {
    for (const list of HB_INTEL_LIST_DEFINITIONS) {
      for (const field of list.fields) {
        expect(field.type).not.toBe('MultiLineText');
      }
    }
  });

  it('all core list fields use one of the original 7 type values', () => {
    const originalTypes = ['Text', 'Number', 'DateTime', 'Boolean', 'Choice', 'User', 'URL'];
    for (const list of HB_INTEL_LIST_DEFINITIONS) {
      for (const field of list.fields) {
        expect(originalTypes).toContain(field.type);
      }
    }
  });

  it('no core list has provisioningOrder metadata', () => {
    for (const list of HB_INTEL_LIST_DEFINITIONS) {
      expect(list.provisioningOrder).toBeUndefined();
    }
  });

  it('no core list has parentListTitle metadata', () => {
    for (const list of HB_INTEL_LIST_DEFINITIONS) {
      expect(list.parentListTitle).toBeUndefined();
    }
  });

  it('no core list has listFamily metadata', () => {
    for (const list of HB_INTEL_LIST_DEFINITIONS) {
      expect(list.listFamily).toBeUndefined();
    }
  });
});
