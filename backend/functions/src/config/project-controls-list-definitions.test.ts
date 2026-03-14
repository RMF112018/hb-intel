import { describe, it, expect } from 'vitest';
import { PROJECT_CONTROLS_LIST_DEFINITIONS } from './project-controls-list-definitions.js';

/**
 * W0-G2-T05: Schema compliance tests for the 3 project-controls-family list definitions.
 */
describe('PROJECT_CONTROLS_LIST_DEFINITIONS — project-controls-family schema compliance', () => {
  it('contains exactly 3 lists', () => {
    expect(PROJECT_CONTROLS_LIST_DEFINITIONS).toHaveLength(3);
  });

  it('contains all expected list titles', () => {
    const titles = PROJECT_CONTROLS_LIST_DEFINITIONS.map((l) => l.title);
    expect(titles).toContain('Permit Log');
    expect(titles).toContain('Required Inspections');
    expect(titles).toContain('Constraints Log');
  });

  it('every list has a pid field with required, indexed, and defaultValue', () => {
    for (const list of PROJECT_CONTROLS_LIST_DEFINITIONS) {
      const pid = list.fields.find((f) => f.internalName === 'pid');
      expect(pid, `${list.title} missing pid field`).toBeDefined();
      expect(pid!.type).toBe('Text');
      expect(pid!.required).toBe(true);
      expect(pid!.indexed).toBe(true);
      expect(pid!.defaultValue).toBe('{{projectNumber}}');
    }
  });

  it('every list has a Title field that is required', () => {
    for (const list of PROJECT_CONTROLS_LIST_DEFINITIONS) {
      const title = list.fields.find((f) => f.internalName === 'Title');
      expect(title, `${list.title} missing Title field`).toBeDefined();
      expect(title!.required).toBe(true);
    }
  });

  it('all listFamily values are "project-controls"', () => {
    for (const list of PROJECT_CONTROLS_LIST_DEFINITIONS) {
      expect(list.listFamily).toBe('project-controls');
    }
  });

  it('all 3 lists are flat (no parentListTitle)', () => {
    for (const list of PROJECT_CONTROLS_LIST_DEFINITIONS) {
      expect(list.parentListTitle, `${list.title} should not have parentListTitle`).toBeUndefined();
    }
  });

  it('Choice fields have non-empty choices arrays', () => {
    for (const list of PROJECT_CONTROLS_LIST_DEFINITIONS) {
      for (const field of list.fields) {
        if (field.type === 'Choice') {
          expect(field.choices, `${list.title}.${field.internalName} missing choices`).toBeDefined();
          expect(field.choices!.length, `${list.title}.${field.internalName} has empty choices`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('Permit Log: PermitType has 13 choices', () => {
    const permit = PROJECT_CONTROLS_LIST_DEFINITIONS.find((l) => l.title === 'Permit Log');
    expect(permit).toBeDefined();
    const permitType = permit!.fields.find((f) => f.internalName === 'PermitType');
    expect(permitType).toBeDefined();
    expect(permitType!.choices).toHaveLength(13);
  });

  it('Permit Log: Status has 8 choices', () => {
    const permit = PROJECT_CONTROLS_LIST_DEFINITIONS.find((l) => l.title === 'Permit Log');
    expect(permit).toBeDefined();
    const status = permit!.fields.find((f) => f.internalName === 'Status');
    expect(status).toBeDefined();
    expect(status!.choices).toHaveLength(8);
  });

  it('Permit Log: HolderType has 3 choices', () => {
    const permit = PROJECT_CONTROLS_LIST_DEFINITIONS.find((l) => l.title === 'Permit Log');
    expect(permit).toBeDefined();
    const holderType = permit!.fields.find((f) => f.internalName === 'HolderType');
    expect(holderType).toBeDefined();
    expect(holderType!.choices).toHaveLength(3);
  });

  it('Permit Log: DocumentLink is URL, CostAmount is Number', () => {
    const permit = PROJECT_CONTROLS_LIST_DEFINITIONS.find((l) => l.title === 'Permit Log');
    expect(permit).toBeDefined();
    const docLink = permit!.fields.find((f) => f.internalName === 'DocumentLink');
    expect(docLink).toBeDefined();
    expect(docLink!.type).toBe('URL');
    const cost = permit!.fields.find((f) => f.internalName === 'CostAmount');
    expect(cost).toBeDefined();
    expect(cost!.type).toBe('Number');
  });

  it('Required Inspections: Trade has 12 choices', () => {
    const inspections = PROJECT_CONTROLS_LIST_DEFINITIONS.find((l) => l.title === 'Required Inspections');
    expect(inspections).toBeDefined();
    const trade = inspections!.fields.find((f) => f.internalName === 'Trade');
    expect(trade).toBeDefined();
    expect(trade!.choices).toHaveLength(12);
  });

  it('Required Inspections: InspectionCategory has 4 choices', () => {
    const inspections = PROJECT_CONTROLS_LIST_DEFINITIONS.find((l) => l.title === 'Required Inspections');
    expect(inspections).toBeDefined();
    const cat = inspections!.fields.find((f) => f.internalName === 'InspectionCategory');
    expect(cat).toBeDefined();
    expect(cat!.choices).toHaveLength(4);
  });

  it('Required Inspections: Result has 4 choices', () => {
    const inspections = PROJECT_CONTROLS_LIST_DEFINITIONS.find((l) => l.title === 'Required Inspections');
    expect(inspections).toBeDefined();
    const result = inspections!.fields.find((f) => f.internalName === 'Result');
    expect(result).toBeDefined();
    expect(result!.choices).toHaveLength(4);
  });

  it('Required Inspections: InspectionReportLink is URL', () => {
    const inspections = PROJECT_CONTROLS_LIST_DEFINITIONS.find((l) => l.title === 'Required Inspections');
    expect(inspections).toBeDefined();
    const link = inspections!.fields.find((f) => f.internalName === 'InspectionReportLink');
    expect(link).toBeDefined();
    expect(link!.type).toBe('URL');
  });

  it('Constraints Log: DateIdentified is required', () => {
    const constraints = PROJECT_CONTROLS_LIST_DEFINITIONS.find((l) => l.title === 'Constraints Log');
    expect(constraints).toBeDefined();
    const dateId = constraints!.fields.find((f) => f.internalName === 'DateIdentified');
    expect(dateId).toBeDefined();
    expect(dateId!.required).toBe(true);
  });

  it('Constraints Log: ImpactIfUnresolved has 4 choices, ConstraintType has 9 choices', () => {
    const constraints = PROJECT_CONTROLS_LIST_DEFINITIONS.find((l) => l.title === 'Constraints Log');
    expect(constraints).toBeDefined();
    const impact = constraints!.fields.find((f) => f.internalName === 'ImpactIfUnresolved');
    expect(impact).toBeDefined();
    expect(impact!.choices).toHaveLength(4);
    const cType = constraints!.fields.find((f) => f.internalName === 'ConstraintType');
    expect(cType).toBeDefined();
    expect(cType!.choices).toHaveLength(9);
  });

  it('Constraints Log: Owner is User, RelatedPermit is Text', () => {
    const constraints = PROJECT_CONTROLS_LIST_DEFINITIONS.find((l) => l.title === 'Constraints Log');
    expect(constraints).toBeDefined();
    const owner = constraints!.fields.find((f) => f.internalName === 'Owner');
    expect(owner).toBeDefined();
    expect(owner!.type).toBe('User');
    const permit = constraints!.fields.find((f) => f.internalName === 'RelatedPermit');
    expect(permit).toBeDefined();
    expect(permit!.type).toBe('Text');
  });

  it('no list has a ParentRecord or Lookup field (all cross-family refs are Text)', () => {
    for (const list of PROJECT_CONTROLS_LIST_DEFINITIONS) {
      const parentRecord = list.fields.find((f) => f.internalName === 'ParentRecord');
      expect(parentRecord, `${list.title} should not have ParentRecord`).toBeUndefined();
      const lookupFields = list.fields.filter((f) => f.type === 'Lookup');
      expect(lookupFields, `${list.title} should have no Lookup fields`).toHaveLength(0);
    }
  });
});
