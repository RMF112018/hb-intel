import { describe, it, expect } from 'vitest';
import { HB_INTEL_WORKFLOW_LIST_DEFINITIONS } from './workflow-list-definitions.js';

/**
 * W0-G2-T07: Composition and ordering tests for the 26 workflow-family list definitions.
 */
describe('HB_INTEL_WORKFLOW_LIST_DEFINITIONS — composition tests', () => {
  it('contains exactly 26 workflow lists', () => {
    expect(HB_INTEL_WORKFLOW_LIST_DEFINITIONS).toHaveLength(26);
  });

  it('all 5 families are represented', () => {
    const families = new Set(HB_INTEL_WORKFLOW_LIST_DEFINITIONS.map((l) => l.listFamily));
    expect(families).toContain('startup');
    expect(families).toContain('closeout');
    expect(families).toContain('safety');
    expect(families).toContain('project-controls');
    expect(families).toContain('financial');
    expect(families.size).toBe(5);
  });

  it('every list has provisioningOrder defined', () => {
    for (const list of HB_INTEL_WORKFLOW_LIST_DEFINITIONS) {
      expect(list.provisioningOrder).toBeDefined();
    }
  });

  it('every list has listFamily defined', () => {
    for (const list of HB_INTEL_WORKFLOW_LIST_DEFINITIONS) {
      expect(list.listFamily).toBeDefined();
    }
  });

  it('every list has a pid field with required, indexed, and defaultValue', () => {
    for (const list of HB_INTEL_WORKFLOW_LIST_DEFINITIONS) {
      const pidField = list.fields.find((f) => f.internalName === 'pid');
      expect(pidField).toBeDefined();
      expect(pidField!.required).toBe(true);
      expect(pidField!.indexed).toBe(true);
      expect(pidField!.defaultValue).toBeDefined();
    }
  });

  it('no duplicate list titles across families', () => {
    const titles = HB_INTEL_WORKFLOW_LIST_DEFINITIONS.map((l) => l.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('parent lists have lower provisioningOrder than their children', () => {
    for (const list of HB_INTEL_WORKFLOW_LIST_DEFINITIONS) {
      if (list.parentListTitle) {
        const parent = HB_INTEL_WORKFLOW_LIST_DEFINITIONS.find(
          (p) => p.title === list.parentListTitle
        );
        expect(parent).toBeDefined();
        expect(parent!.provisioningOrder!).toBeLessThan(list.provisioningOrder!);
      }
    }
  });

  it('all lists have template 100', () => {
    for (const list of HB_INTEL_WORKFLOW_LIST_DEFINITIONS) {
      expect(list.template).toBe(100);
    }
  });
});
