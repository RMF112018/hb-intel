import { describe, expect, it } from 'vitest';

import {
  CLOSEOUT_CHECKLIST_SECTION_KEYS,
  CLOSEOUT_MILESTONE_KEYS,
  CLOSEOUT_SPINE_EVENT_KEYS,
  CLOSEOUT_TEMPLATE_AUTHORITY_ROLES,
  CLOSEOUT_CHECKLIST_SECTIONS,
  CLOSEOUT_CHECKLIST_SECTION_LABELS,
  CLOSEOUT_MILESTONE_KEY_LABELS,
  CLOSEOUT_TEMPLATE_AUTHORITIES,
  CLOSEOUT_JURISDICTION_VARIANTS,
  CLOSEOUT_OVERLAY_RULES,
  CLOSEOUT_INSTANTIATION_SEQUENCE,
  CLOSEOUT_SECTION_GATE_RULES,
  CLOSEOUT_CALCULATED_ITEM_RULES,
  CLOSEOUT_INTEGRATION_DRIVEN_ITEMS,
  CLOSEOUT_SECTION_1_ITEMS,
  CLOSEOUT_SECTION_2_ITEMS,
  CLOSEOUT_SECTION_3_ITEMS,
  CLOSEOUT_SECTION_4_ITEMS,
  CLOSEOUT_SECTION_5_ITEMS,
  CLOSEOUT_SECTION_6_ITEMS,
  CLOSEOUT_SECTION_7_PBC_ITEMS,
  CLOSEOUT_ALL_GOVERNED_ITEMS,
} from '../../index.js';

describe('P3-E10-T03 Closeout checklist contract stability', () => {
  // -- Enum arrays -----------------------------------------------------------

  describe('CloseoutChecklistSectionKey', () => {
    it('has exactly 7 sections per §3', () => {
      expect(CLOSEOUT_CHECKLIST_SECTION_KEYS).toHaveLength(7);
    });

    it('includes all 7 sections in order', () => {
      expect([...CLOSEOUT_CHECKLIST_SECTION_KEYS]).toEqual([
        'Tasks', 'DocumentTracking', 'Inspections', 'Turnover',
        'PostTurnover', 'CompleteProjectCloseoutDocuments', 'PBCJurisdiction',
      ]);
    });
  });

  describe('CloseoutMilestoneKey', () => {
    it('has exactly 9 milestone keys', () => {
      expect(CLOSEOUT_MILESTONE_KEYS).toHaveLength(9);
    });
  });

  describe('CloseoutSpineEventKey', () => {
    it('has exactly 7 spine event keys', () => {
      expect(CLOSEOUT_SPINE_EVENT_KEYS).toHaveLength(7);
    });
  });

  describe('CloseoutTemplateAuthority', () => {
    it('has exactly 4 authority roles per §1.1', () => {
      expect(CLOSEOUT_TEMPLATE_AUTHORITY_ROLES).toHaveLength(4);
    });
  });

  // -- Section definitions ---------------------------------------------------

  describe('Checklist sections', () => {
    it('has exactly 7 sections', () => {
      expect(CLOSEOUT_CHECKLIST_SECTIONS).toHaveLength(7);
    });

    it('each section has all required fields', () => {
      for (const section of CLOSEOUT_CHECKLIST_SECTIONS) {
        expect(section.sectionNumber).toBeGreaterThan(0);
        expect(section.sectionKey).toBeTruthy();
        expect(section.name).toBeTruthy();
        expect(section.governedItemCount).toBeGreaterThanOrEqual(0);
      }
    });

    it('section numbers are 1-7', () => {
      const numbers = CLOSEOUT_CHECKLIST_SECTIONS.map((s) => s.sectionNumber);
      expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });
  });

  // -- Labels ----------------------------------------------------------------

  describe('Section labels', () => {
    it('labels all 7 sections', () => {
      expect(Object.keys(CLOSEOUT_CHECKLIST_SECTION_LABELS)).toHaveLength(7);
    });
  });

  describe('Milestone key labels', () => {
    it('labels all 9 milestone keys', () => {
      expect(Object.keys(CLOSEOUT_MILESTONE_KEY_LABELS)).toHaveLength(9);
    });
  });

  // -- Template authorities --------------------------------------------------

  describe('Template authorities', () => {
    it('has exactly 4 rows per §1.1', () => {
      expect(CLOSEOUT_TEMPLATE_AUTHORITIES).toHaveLength(4);
    });

    it('MOEAdmin has create/version/retire authority', () => {
      const moe = CLOSEOUT_TEMPLATE_AUTHORITIES.find((a) => a.role === 'MOEAdmin');
      expect(moe?.authority).toContain('Create');
    });

    it('PM has no template authority', () => {
      const pm = CLOSEOUT_TEMPLATE_AUTHORITIES.find((a) => a.role === 'PM');
      expect(pm?.authority).toContain('No template authority');
    });
  });

  // -- Jurisdiction variants -------------------------------------------------

  describe('Jurisdiction variants', () => {
    it('has exactly 2 variants per §1.3', () => {
      expect(CLOSEOUT_JURISDICTION_VARIANTS).toHaveLength(2);
    });

    it('PBC instantiates 16 items', () => {
      const pbc = CLOSEOUT_JURISDICTION_VARIANTS.find((v) => v.jurisdiction === 'PBC');
      expect(pbc?.section7ItemCount).toBe(16);
    });

    it('Other instantiates 0 items', () => {
      const other = CLOSEOUT_JURISDICTION_VARIANTS.find((v) => v.jurisdiction === 'Other');
      expect(other?.section7ItemCount).toBe(0);
    });
  });

  // -- Overlay rules ---------------------------------------------------------

  describe('Overlay rules', () => {
    it('maxPerSection is 5 per §4.1', () => {
      expect(CLOSEOUT_OVERLAY_RULES.maxPerSection).toBe(5);
    });

    it('items are not deletable per §4.1', () => {
      expect(CLOSEOUT_OVERLAY_RULES.deletable).toBe(false);
    });

    it('maxDescriptionLength is 500 per §4.1', () => {
      expect(CLOSEOUT_OVERLAY_RULES.maxDescriptionLength).toBe(500);
    });

    it('does not require PE approval per §4.1', () => {
      expect(CLOSEOUT_OVERLAY_RULES.requiresPEApproval).toBe(false);
    });

    it('is audit logged per §4.1', () => {
      expect(CLOSEOUT_OVERLAY_RULES.auditLogged).toBe(true);
    });

    it('is included in completion percentage per §4.1', () => {
      expect(CLOSEOUT_OVERLAY_RULES.includedInCompletionPct).toBe(true);
    });
  });

  // -- Instantiation sequence ------------------------------------------------

  describe('Instantiation sequence', () => {
    it('has exactly 9 steps per §5', () => {
      expect(CLOSEOUT_INSTANTIATION_SEQUENCE).toHaveLength(9);
    });

    it('steps are numbered 1-9', () => {
      const numbers = CLOSEOUT_INSTANTIATION_SEQUENCE.map((s) => s.stepNumber);
      expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });

  // -- Section gate rules ----------------------------------------------------

  describe('Section gate rules', () => {
    it('has 8 gate rules', () => {
      expect(CLOSEOUT_SECTION_GATE_RULES).toHaveLength(8);
    });

    it('each rule has required fields', () => {
      for (const rule of CLOSEOUT_SECTION_GATE_RULES) {
        expect(rule.sectionKey).toBeTruthy();
        expect(rule.milestoneKey).toBeTruthy();
        expect(rule.triggerCondition).toBeTruthy();
      }
    });
  });

  // -- Calculated item rules -------------------------------------------------

  describe('Calculated item rules', () => {
    it('has exactly 5 calculated items (4.14, 6.1, 6.3, 6.4, 6.5)', () => {
      expect(CLOSEOUT_CALCULATED_ITEM_RULES).toHaveLength(5);
    });

    it('includes item 4.14 with 80-day calculation', () => {
      const item414 = CLOSEOUT_CALCULATED_ITEM_RULES.find((r) => r.itemNumber === '4.14');
      expect(item414?.calculationSource).toContain('80 calendar days');
    });
  });

  // -- Integration-driven items ----------------------------------------------

  describe('Integration-driven items', () => {
    it('has exactly 5 items in Section 6', () => {
      expect(CLOSEOUT_INTEGRATION_DRIVEN_ITEMS).toHaveLength(5);
    });

    it('item 6.2 is not system-driven (manual entry)', () => {
      const item62 = CLOSEOUT_INTEGRATION_DRIVEN_ITEMS.find((i) => i.itemNumber === '6.2');
      expect(item62?.isSystemDriven).toBe(false);
    });

    it('items 6.1, 6.3, 6.4, 6.5 are system-driven', () => {
      const systemItems = CLOSEOUT_INTEGRATION_DRIVEN_ITEMS.filter((i) => i.isSystemDriven);
      expect(systemItems.map((i) => i.itemNumber)).toEqual(['6.1', '6.3', '6.4', '6.5']);
    });
  });

  // -- Governed Baseline Catalog (70 items) ----------------------------------

  describe('Section 1 — Tasks', () => {
    it('has exactly 5 items', () => {
      expect(CLOSEOUT_SECTION_1_ITEMS).toHaveLength(5);
    });
  });

  describe('Section 2 — Document Tracking', () => {
    it('has exactly 13 items', () => {
      expect(CLOSEOUT_SECTION_2_ITEMS).toHaveLength(13);
    });
  });

  describe('Section 3 — Inspections', () => {
    it('has exactly 11 items', () => {
      expect(CLOSEOUT_SECTION_3_ITEMS).toHaveLength(11);
    });

    it('item 3.11 has evidence hint for C.O.', () => {
      const item311 = CLOSEOUT_SECTION_3_ITEMS.find((i) => i.itemNumber === '3.11');
      expect(item311?.evidenceHint).toContain('C.O.');
      expect(item311?.milestoneGateKey).toBe('CO_OBTAINED');
    });
  });

  describe('Section 4 — Turnover', () => {
    it('has exactly 15 items', () => {
      expect(CLOSEOUT_SECTION_4_ITEMS).toHaveLength(15);
    });

    it('item 4.14 is calculated from item 4.13', () => {
      const item414 = CLOSEOUT_SECTION_4_ITEMS.find((i) => i.itemNumber === '4.14');
      expect(item414?.isCalculated).toBe(true);
      expect(item414?.calculationSource).toContain('item4.13');
    });
  });

  describe('Section 5 — Post Turnover', () => {
    it('has exactly 5 items', () => {
      expect(CLOSEOUT_SECTION_5_ITEMS).toHaveLength(5);
    });
  });

  describe('Section 6 — Complete Project Closeout Documents', () => {
    it('has exactly 5 items', () => {
      expect(CLOSEOUT_SECTION_6_ITEMS).toHaveLength(5);
    });

    it('4 of 5 items are calculated (system-driven)', () => {
      const calculated = CLOSEOUT_SECTION_6_ITEMS.filter((i) => i.isCalculated);
      expect(calculated).toHaveLength(4);
    });
  });

  describe('Section 7 — PBC Jurisdiction-Specific', () => {
    it('has exactly 16 items', () => {
      expect(CLOSEOUT_SECTION_7_PBC_ITEMS).toHaveLength(16);
    });

    it('all items belong to PBCJurisdiction section', () => {
      expect(CLOSEOUT_SECTION_7_PBC_ITEMS.every((i) => i.sectionKey === 'PBCJurisdiction')).toBe(true);
    });
  });

  describe('All governed items combined', () => {
    it('has exactly 70 items total', () => {
      expect(CLOSEOUT_ALL_GOVERNED_ITEMS).toHaveLength(70);
    });

    it('all items have isGoverned = true', () => {
      expect(CLOSEOUT_ALL_GOVERNED_ITEMS.every((i) => i.isGoverned === true)).toBe(true);
    });

    it('all items have required metadata fields', () => {
      for (const item of CLOSEOUT_ALL_GOVERNED_ITEMS) {
        expect(item.itemNumber).toBeTruthy();
        expect(item.description).toBeTruthy();
        expect(item.sectionKey).toBeTruthy();
        expect(item.responsibleRole).toBeTruthy();
        expect(item.lifecycleStageTrigger).toBeTruthy();
        expect(typeof item.isRequired).toBe('boolean');
        expect(typeof item.hasDateField).toBe('boolean');
        expect(typeof item.hasEvidenceRequirement).toBe('boolean');
        expect(typeof item.isCalculated).toBe('boolean');
      }
    });

    it('section item counts match section definitions', () => {
      for (const section of CLOSEOUT_CHECKLIST_SECTIONS) {
        const sectionItems = CLOSEOUT_ALL_GOVERNED_ITEMS.filter(
          (i) => i.sectionKey === section.sectionKey,
        );
        expect(sectionItems).toHaveLength(section.governedItemCount);
      }
    });
  });
});
