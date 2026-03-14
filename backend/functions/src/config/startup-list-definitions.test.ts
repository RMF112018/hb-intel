import { describe, it, expect } from 'vitest';
import { STARTUP_LIST_DEFINITIONS } from './startup-list-definitions.js';

/**
 * W0-G2-T02: Schema compliance tests for the 5 startup-family list definitions.
 */
describe('STARTUP_LIST_DEFINITIONS — startup-family schema compliance', () => {
  it('contains exactly 5 lists', () => {
    expect(STARTUP_LIST_DEFINITIONS).toHaveLength(5);
  });

  it('contains all expected list titles', () => {
    const titles = STARTUP_LIST_DEFINITIONS.map((l) => l.title);
    expect(titles).toContain('Startup Checklist');
    expect(titles).toContain('Startup Checklist Items');
    expect(titles).toContain('Estimating Kickoff Log');
    expect(titles).toContain('Kickoff Responsibility Items');
    expect(titles).toContain('Project Responsibility Matrix');
  });

  it('every list has a pid field with required, indexed, and defaultValue', () => {
    for (const list of STARTUP_LIST_DEFINITIONS) {
      const pid = list.fields.find((f) => f.internalName === 'pid');
      expect(pid, `${list.title} missing pid field`).toBeDefined();
      expect(pid!.type).toBe('Text');
      expect(pid!.required).toBe(true);
      expect(pid!.indexed).toBe(true);
      expect(pid!.defaultValue).toBe('{{projectNumber}}');
    }
  });

  it('every list has a Title field', () => {
    for (const list of STARTUP_LIST_DEFINITIONS) {
      const title = list.fields.find((f) => f.internalName === 'Title');
      expect(title, `${list.title} missing Title field`).toBeDefined();
      expect(title!.required).toBe(true);
    }
  });

  it('every list has a Status or Category field', () => {
    for (const list of STARTUP_LIST_DEFINITIONS) {
      const status = list.fields.find((f) => f.internalName === 'Status');
      const category = list.fields.find((f) => f.internalName === 'Category');
      expect(status || category, `${list.title} missing Status/Category field`).toBeDefined();
    }
  });

  it('all listFamily values are "startup"', () => {
    for (const list of STARTUP_LIST_DEFINITIONS) {
      expect(list.listFamily).toBe('startup');
    }
  });

  it('child lists have ParentRecord Lookup field with correct lookupListTitle', () => {
    const childLists = STARTUP_LIST_DEFINITIONS.filter((l) => l.parentListTitle);
    expect(childLists).toHaveLength(2);

    for (const child of childLists) {
      const parentRecord = child.fields.find((f) => f.internalName === 'ParentRecord');
      expect(parentRecord, `${child.title} missing ParentRecord field`).toBeDefined();
      expect(parentRecord!.type).toBe('Lookup');
      expect(parentRecord!.required).toBe(true);
      expect(parentRecord!.lookupListTitle).toBe(child.parentListTitle);
    }
  });

  it('parent provisioningOrder < child provisioningOrder', () => {
    const childLists = STARTUP_LIST_DEFINITIONS.filter((l) => l.parentListTitle);
    for (const child of childLists) {
      const parent = STARTUP_LIST_DEFINITIONS.find((l) => l.title === child.parentListTitle);
      expect(parent, `parent "${child.parentListTitle}" not found`).toBeDefined();
      expect(parent!.provisioningOrder).toBeLessThan(child.provisioningOrder!);
    }
  });

  it('Choice fields have non-empty choices arrays', () => {
    for (const list of STARTUP_LIST_DEFINITIONS) {
      for (const field of list.fields) {
        if (field.type === 'Choice') {
          expect(field.choices, `${list.title}.${field.internalName} missing choices`).toBeDefined();
          expect(field.choices!.length, `${list.title}.${field.internalName} has empty choices`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('Project Responsibility Matrix Notes field is Text (not MultiLineText)', () => {
    const matrix = STARTUP_LIST_DEFINITIONS.find((l) => l.title === 'Project Responsibility Matrix');
    expect(matrix).toBeDefined();
    const notes = matrix!.fields.find((f) => f.internalName === 'Notes');
    expect(notes).toBeDefined();
    expect(notes!.type).toBe('Text');
  });
});
