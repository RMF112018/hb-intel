import { describe, it, expect } from 'vitest';
import { SAFETY_LIST_DEFINITIONS } from './safety-list-definitions.js';

/**
 * W0-G2-T04: Schema compliance tests for the 8 safety-family list definitions.
 */
describe('SAFETY_LIST_DEFINITIONS — safety-family schema compliance', () => {
  it('contains exactly 8 lists', () => {
    expect(SAFETY_LIST_DEFINITIONS).toHaveLength(8);
  });

  it('contains all expected list titles', () => {
    const titles = SAFETY_LIST_DEFINITIONS.map((l) => l.title);
    expect(titles).toContain('JHA Log');
    expect(titles).toContain('JHA Steps');
    expect(titles).toContain('JHA Attendees');
    expect(titles).toContain('Incident Log');
    expect(titles).toContain('Site Safety Plans');
    expect(titles).toContain('Toolbox Talk Log');
    expect(titles).toContain('Safety Walk Log');
    expect(titles).toContain('Sub Safety Certifications');
  });

  it('every list has a pid field with required, indexed, and defaultValue', () => {
    for (const list of SAFETY_LIST_DEFINITIONS) {
      const pid = list.fields.find((f) => f.internalName === 'pid');
      expect(pid, `${list.title} missing pid field`).toBeDefined();
      expect(pid!.type).toBe('Text');
      expect(pid!.required).toBe(true);
      expect(pid!.indexed).toBe(true);
      expect(pid!.defaultValue).toBe('{{projectNumber}}');
    }
  });

  it('every list has a Title field', () => {
    for (const list of SAFETY_LIST_DEFINITIONS) {
      const title = list.fields.find((f) => f.internalName === 'Title');
      expect(title, `${list.title} missing Title field`).toBeDefined();
      expect(title!.required).toBe(true);
    }
  });

  it('all listFamily values are "safety"', () => {
    for (const list of SAFETY_LIST_DEFINITIONS) {
      expect(list.listFamily).toBe('safety');
    }
  });

  it('JHA Steps and JHA Attendees are child lists with ParentRecord Lookup to JHA Log', () => {
    const childLists = SAFETY_LIST_DEFINITIONS.filter((l) => l.parentListTitle);
    expect(childLists).toHaveLength(2);

    const childTitles = childLists.map((l) => l.title).sort();
    expect(childTitles).toEqual(['JHA Attendees', 'JHA Steps']);

    for (const child of childLists) {
      expect(child.parentListTitle).toBe('JHA Log');

      const parentRecord = child.fields.find((f) => f.internalName === 'ParentRecord');
      expect(parentRecord, `${child.title} missing ParentRecord`).toBeDefined();
      expect(parentRecord!.type).toBe('Lookup');
      expect(parentRecord!.required).toBe(true);
      expect(parentRecord!.lookupListTitle).toBe('JHA Log');
    }
  });

  it('parent provisioningOrder < child provisioningOrder', () => {
    const childLists = SAFETY_LIST_DEFINITIONS.filter((l) => l.parentListTitle);
    for (const child of childLists) {
      const parent = SAFETY_LIST_DEFINITIONS.find((l) => l.title === child.parentListTitle);
      expect(parent, `parent "${child.parentListTitle}" not found`).toBeDefined();
      expect(parent!.provisioningOrder).toBeLessThan(child.provisioningOrder!);
    }
  });

  it('Choice fields have non-empty choices arrays', () => {
    for (const list of SAFETY_LIST_DEFINITIONS) {
      for (const field of list.fields) {
        if (field.type === 'Choice') {
          expect(field.choices, `${list.title}.${field.internalName} missing choices`).toBeDefined();
          expect(field.choices!.length, `${list.title}.${field.internalName} has empty choices`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('JHA Steps: all 8 PPE boolean fields exist', () => {
    const steps = SAFETY_LIST_DEFINITIONS.find((l) => l.title === 'JHA Steps');
    expect(steps).toBeDefined();

    const ppeFields = [
      'PPE_HardHat', 'PPE_SafetyGlasses', 'PPE_HiVis', 'PPE_Gloves',
      'PPE_HearingProtection', 'PPE_Respirator', 'PPE_Harness', 'PPE_WorkBoots',
    ];
    for (const ppe of ppeFields) {
      const field = steps!.fields.find((f) => f.internalName === ppe);
      expect(field, `JHA Steps missing ${ppe}`).toBeDefined();
      expect(field!.type).toBe('Boolean');
    }
  });

  it('JHA Steps: StepNumber, StepDescription, Hazards, Controls are all required', () => {
    const steps = SAFETY_LIST_DEFINITIONS.find((l) => l.title === 'JHA Steps');
    expect(steps).toBeDefined();

    const requiredFields = ['StepNumber', 'StepDescription', 'Hazards', 'Controls'];
    for (const name of requiredFields) {
      const field = steps!.fields.find((f) => f.internalName === name);
      expect(field, `JHA Steps missing ${name}`).toBeDefined();
      expect(field!.required, `JHA Steps.${name} should be required`).toBe(true);
    }
  });

  it('Incident Log: IncidentType has 9 choices', () => {
    const incident = SAFETY_LIST_DEFINITIONS.find((l) => l.title === 'Incident Log');
    expect(incident).toBeDefined();

    const incidentType = incident!.fields.find((f) => f.internalName === 'IncidentType');
    expect(incidentType).toBeDefined();
    expect(incidentType!.choices).toHaveLength(9);
  });

  it('Incident Log: OSHARecordable is Boolean and not required', () => {
    const incident = SAFETY_LIST_DEFINITIONS.find((l) => l.title === 'Incident Log');
    expect(incident).toBeDefined();

    const osha = incident!.fields.find((f) => f.internalName === 'OSHARecordable');
    expect(osha).toBeDefined();
    expect(osha!.type).toBe('Boolean');
    expect(osha!.required).toBeFalsy();
  });

  it('Site Safety Plans: DocumentLink field has type URL', () => {
    const plans = SAFETY_LIST_DEFINITIONS.find((l) => l.title === 'Site Safety Plans');
    expect(plans).toBeDefined();

    const docLink = plans!.fields.find((f) => f.internalName === 'DocumentLink');
    expect(docLink).toBeDefined();
    expect(docLink!.type).toBe('URL');
  });

  it('Sub Safety Certifications: DocumentLink field has type URL', () => {
    const certs = SAFETY_LIST_DEFINITIONS.find((l) => l.title === 'Sub Safety Certifications');
    expect(certs).toBeDefined();

    const docLink = certs!.fields.find((f) => f.internalName === 'DocumentLink');
    expect(docLink).toBeDefined();
    expect(docLink!.type).toBe('URL');
  });

  it('flat lists have no parentListTitle', () => {
    const flatTitles = ['Incident Log', 'Site Safety Plans', 'Toolbox Talk Log', 'Safety Walk Log', 'Sub Safety Certifications'];
    for (const title of flatTitles) {
      const list = SAFETY_LIST_DEFINITIONS.find((l) => l.title === title);
      expect(list, `${title} not found`).toBeDefined();
      expect(list!.parentListTitle, `${title} should not have parentListTitle`).toBeUndefined();
    }
  });
});
