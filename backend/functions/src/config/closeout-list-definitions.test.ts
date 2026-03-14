import { describe, it, expect } from 'vitest';
import { CLOSEOUT_LIST_DEFINITIONS } from './closeout-list-definitions.js';

/**
 * W0-G2-T03: Schema compliance tests for the 5 closeout-family list definitions.
 */
describe('CLOSEOUT_LIST_DEFINITIONS — closeout-family schema compliance', () => {
  it('contains exactly 5 lists', () => {
    expect(CLOSEOUT_LIST_DEFINITIONS).toHaveLength(5);
  });

  it('contains all expected list titles', () => {
    const titles = CLOSEOUT_LIST_DEFINITIONS.map((l) => l.title);
    expect(titles).toContain('Closeout Checklist');
    expect(titles).toContain('Closeout Checklist Items');
    expect(titles).toContain('Punch List Batches');
    expect(titles).toContain('Turnover Package Log');
    expect(titles).toContain('Subcontractor Evaluations');
  });

  it('every list has a pid field with required, indexed, and defaultValue', () => {
    for (const list of CLOSEOUT_LIST_DEFINITIONS) {
      const pid = list.fields.find((f) => f.internalName === 'pid');
      expect(pid, `${list.title} missing pid field`).toBeDefined();
      expect(pid!.type).toBe('Text');
      expect(pid!.required).toBe(true);
      expect(pid!.indexed).toBe(true);
      expect(pid!.defaultValue).toBe('{{projectNumber}}');
    }
  });

  it('every list has a Title field', () => {
    for (const list of CLOSEOUT_LIST_DEFINITIONS) {
      const title = list.fields.find((f) => f.internalName === 'Title');
      expect(title, `${list.title} missing Title field`).toBeDefined();
      expect(title!.required).toBe(true);
    }
  });

  it('all listFamily values are "closeout"', () => {
    for (const list of CLOSEOUT_LIST_DEFINITIONS) {
      expect(list.listFamily).toBe('closeout');
    }
  });

  it('only Closeout Checklist Items is a child list with ParentRecord Lookup', () => {
    const childLists = CLOSEOUT_LIST_DEFINITIONS.filter((l) => l.parentListTitle);
    expect(childLists).toHaveLength(1);
    expect(childLists[0].title).toBe('Closeout Checklist Items');

    const parentRecord = childLists[0].fields.find((f) => f.internalName === 'ParentRecord');
    expect(parentRecord).toBeDefined();
    expect(parentRecord!.type).toBe('Lookup');
    expect(parentRecord!.required).toBe(true);
    expect(parentRecord!.lookupListTitle).toBe('Closeout Checklist');
  });

  it('parent provisioningOrder < child provisioningOrder', () => {
    const childLists = CLOSEOUT_LIST_DEFINITIONS.filter((l) => l.parentListTitle);
    for (const child of childLists) {
      const parent = CLOSEOUT_LIST_DEFINITIONS.find((l) => l.title === child.parentListTitle);
      expect(parent, `parent "${child.parentListTitle}" not found`).toBeDefined();
      expect(parent!.provisioningOrder).toBeLessThan(child.provisioningOrder!);
    }
  });

  it('Choice fields have non-empty choices arrays', () => {
    for (const list of CLOSEOUT_LIST_DEFINITIONS) {
      for (const field of list.fields) {
        if (field.type === 'Choice') {
          expect(field.choices, `${list.title}.${field.internalName} missing choices`).toBeDefined();
          expect(field.choices!.length, `${list.title}.${field.internalName} has empty choices`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('Subcontractor Evaluations: all 5 rating fields share the same choice set', () => {
    const evals = CLOSEOUT_LIST_DEFINITIONS.find((l) => l.title === 'Subcontractor Evaluations');
    expect(evals).toBeDefined();

    const ratingFields = ['OverallRating', 'SafetyRating', 'QualityRating', 'ScheduleRating', 'CommunicationRating'];
    const ratingSets = ratingFields.map((name) => {
      const field = evals!.fields.find((f) => f.internalName === name);
      expect(field, `${name} not found`).toBeDefined();
      return JSON.stringify(field!.choices);
    });

    const uniqueSets = new Set(ratingSets);
    expect(uniqueSets.size).toBe(1);
  });

  it('Turnover Package Log: StorageLocation field has type URL', () => {
    const turnover = CLOSEOUT_LIST_DEFINITIONS.find((l) => l.title === 'Turnover Package Log');
    expect(turnover).toBeDefined();

    const storage = turnover!.fields.find((f) => f.internalName === 'StorageLocation');
    expect(storage).toBeDefined();
    expect(storage!.type).toBe('URL');
  });

  it('Punch List Batches: flat list with no parentListTitle', () => {
    const batches = CLOSEOUT_LIST_DEFINITIONS.find((l) => l.title === 'Punch List Batches');
    expect(batches).toBeDefined();
    expect(batches!.parentListTitle).toBeUndefined();
  });
});
