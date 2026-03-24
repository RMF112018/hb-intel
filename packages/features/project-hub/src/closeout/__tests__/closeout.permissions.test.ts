import { describe, expect, it } from 'vitest';

import {
  canPerformAction,
  isSubIntelligenceFieldVisible,
  isSuptChecklistSectionMutable,
  isPEWorkQueueTrigger,
  isAnnotationVisibleToRole,
} from '../../index.js';

describe('P3-E10-T09 Closeout permissions business rules', () => {
  // -- Master Role Matrix (§2) -----------------------------------------------

  describe('canPerformAction', () => {
    it('PM can mark items Yes/No/NA', () => {
      expect(canPerformAction('PM', 'Mark items Yes/No/NA')).toBe(true);
    });

    it('SUPT can mark items with field scope qualifier', () => {
      expect(canPerformAction('SUPT', 'Mark items Yes/No/NA')).toBe('field scope');
    });

    it('PE cannot mark items', () => {
      expect(canPerformAction('PE', 'Mark items Yes/No/NA')).toBe(false);
    });

    it('PE can approve FinalCloseout for org publication', () => {
      expect(canPerformAction('PE', 'Approve FinalCloseout for org publication')).toBe(true);
    });

    it('PM cannot approve FinalCloseout', () => {
      expect(canPerformAction('PM', 'Approve FinalCloseout for org publication')).toBe(false);
    });

    it('MOE can create/update/retire template versions', () => {
      expect(canPerformAction('MOE', 'Create / update / retire template version')).toBe(true);
    });

    it('PER can annotate but not approve', () => {
      expect(canPerformAction('PER', 'Annotate any Closeout record')).toBe(true);
      expect(canPerformAction('PER', 'Approve ARCHIVE_READY')).toBe(false);
    });

    it('returns false for unknown action', () => {
      expect(canPerformAction('PM', 'Unknown action')).toBe(false);
    });
  });

  // -- SubIntelligence Field Visibility (§3.3) --------------------------------

  describe('isSubIntelligenceFieldVisible', () => {
    it('subcontractorName visible to all access levels', () => {
      expect(isSubIntelligenceFieldVisible('subcontractorName', 'PE_PER_MOE')).toBe(true);
      expect(isSubIntelligenceFieldVisible('subcontractorName', 'SUB_INTELLIGENCE_VIEWER')).toBe(true);
    });

    it('subcontractorName not visible to general user', () => {
      expect(isSubIntelligenceFieldVisible('subcontractorName', 'GeneralUser')).toBe(false);
    });

    it('keyStrengths visible only to PE/PER/MOE', () => {
      expect(isSubIntelligenceFieldVisible('keyStrengths', 'PE_PER_MOE')).toBe(true);
      expect(isSubIntelligenceFieldVisible('keyStrengths', 'SUB_INTELLIGENCE_VIEWER')).toBe(false);
      expect(isSubIntelligenceFieldVisible('keyStrengths', 'GeneralUser')).toBe(false);
    });

    it('contractValue visible only to PE/PER/MOE', () => {
      expect(isSubIntelligenceFieldVisible('contractValue', 'PE_PER_MOE')).toBe(true);
      expect(isSubIntelligenceFieldVisible('contractValue', 'SUB_INTELLIGENCE_VIEWER')).toBe(false);
    });

    it('returns false for unknown field', () => {
      expect(isSubIntelligenceFieldVisible('unknownField', 'PE_PER_MOE')).toBe(false);
    });
  });

  // -- SUPT Checklist Scope (§7) ----------------------------------------------

  describe('isSuptChecklistSectionMutable', () => {
    it('Section 1 (Tasks) — mutable', () => { expect(isSuptChecklistSectionMutable(1)).toBe(true); });
    it('Section 2 (Documents) — read only', () => { expect(isSuptChecklistSectionMutable(2)).toBe(false); });
    it('Section 3 (Inspections) — mutable', () => { expect(isSuptChecklistSectionMutable(3)).toBe(true); });
    it('Section 4 (Turnover) — mutable (field)', () => { expect(isSuptChecklistSectionMutable(4)).toBe(true); });
    it('Section 5 (Estimating) — read only', () => { expect(isSuptChecklistSectionMutable(5)).toBe(false); });
    it('Section 6 (Intelligence) — read only', () => { expect(isSuptChecklistSectionMutable(6)).toBe(false); });
  });

  // -- PE Work Queue Triggers (§6.2/6.3) -------------------------------------

  describe('isPEWorkQueueTrigger', () => {
    it('Owner Acceptance evidence submitted triggers PE WQ', () => {
      expect(isPEWorkQueueTrigger('OWNER_ACCEPTANCE evidence submitted')).toBe(true);
    });

    it('Archive Ready criteria triggers PE WQ', () => {
      expect(isPEWorkQueueTrigger('Archive Ready criteria all pass')).toBe(true);
    });

    it('routine checklist marking does NOT trigger PE WQ', () => {
      expect(isPEWorkQueueTrigger('Marking checklist item Yes')).toBe(false);
    });
  });

  // -- Annotation Visibility (§4.3) ------------------------------------------

  describe('isAnnotationVisibleToRole', () => {
    it('PE annotations visible to all roles except MOE', () => {
      expect(isAnnotationVisibleToRole('PE', 'PM')).toBe(true);
      expect(isAnnotationVisibleToRole('PE', 'SUPT')).toBe(true);
      expect(isAnnotationVisibleToRole('PE', 'PE')).toBe(true);
      expect(isAnnotationVisibleToRole('PE', 'PER')).toBe(true);
    });

    it('PER annotations NOT visible to SUPT per §4.3', () => {
      expect(isAnnotationVisibleToRole('PER', 'SUPT')).toBe(false);
    });

    it('PER annotations visible to PM, PE, PER', () => {
      expect(isAnnotationVisibleToRole('PER', 'PM')).toBe(true);
      expect(isAnnotationVisibleToRole('PER', 'PE')).toBe(true);
      expect(isAnnotationVisibleToRole('PER', 'PER')).toBe(true);
    });
  });
});
