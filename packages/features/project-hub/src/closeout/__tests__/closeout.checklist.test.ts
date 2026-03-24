import { describe, expect, it } from 'vitest';

import {
  isItemComplete,
  calculateSectionCompletionPct,
  calculateOverallCompletionPct,
  canAddOverlayItem,
  formatOverlayItemNumber,
  isOverlayItemDeletable,
  getJurisdictionSection7Behavior,
  isItemActiveForStage,
  calculateLienDeadline,
  isSection6Item63Complete,
  isSection6Item65Complete,
  getGovernedItemsForJurisdiction,
  isSectionGateSatisfied,
} from '../../index.js';

import {
  createMockGovernedChecklistItem,
  createMockChecklistSectionDefinition,
} from '../../../testing/createMockGovernedChecklistItem.js';

describe('P3-E10-T03 Closeout checklist business rules', () => {
  // -- Item Completion (§6.1) ------------------------------------------------

  describe('isItemComplete', () => {
    it('Yes is complete', () => {
      expect(isItemComplete('Yes')).toBe(true);
    });

    it('NA is complete', () => {
      expect(isItemComplete('NA')).toBe(true);
    });

    it('No is not complete', () => {
      expect(isItemComplete('No')).toBe(false);
    });

    it('Pending is not complete', () => {
      expect(isItemComplete('Pending')).toBe(false);
    });
  });

  // -- Section Completion (§6.2) ---------------------------------------------

  describe('calculateSectionCompletionPct', () => {
    it('returns 0 when all items are Pending', () => {
      const items = [{ result: 'Pending' as const }, { result: 'Pending' as const }];
      expect(calculateSectionCompletionPct(items)).toBe(0);
    });

    it('returns 100 when all items are Yes', () => {
      const items = [{ result: 'Yes' as const }, { result: 'Yes' as const }];
      expect(calculateSectionCompletionPct(items)).toBe(100);
    });

    it('returns 100 when all items are NA (fully waived)', () => {
      const items = [{ result: 'NA' as const }, { result: 'NA' as const }];
      expect(calculateSectionCompletionPct(items)).toBe(100);
    });

    it('excludes NA items from denominator', () => {
      // 1 Yes, 1 Pending, 1 NA → 1/2 = 50%
      const items = [
        { result: 'Yes' as const },
        { result: 'Pending' as const },
        { result: 'NA' as const },
      ];
      expect(calculateSectionCompletionPct(items)).toBe(50);
    });

    it('rounds to integer', () => {
      // 1 Yes, 2 Pending → 1/3 = 33.33... → 33%
      const items = [
        { result: 'Yes' as const },
        { result: 'Pending' as const },
        { result: 'Pending' as const },
      ];
      expect(calculateSectionCompletionPct(items)).toBe(33);
    });
  });

  // -- Overall Completion (§6.3) ---------------------------------------------

  describe('calculateOverallCompletionPct', () => {
    it('calculates across all items same as section formula', () => {
      const items = [
        { result: 'Yes' as const },
        { result: 'Yes' as const },
        { result: 'Pending' as const },
        { result: 'NA' as const },
      ];
      // 2 Yes / 3 applicable = 67%
      expect(calculateOverallCompletionPct(items)).toBe(67);
    });
  });

  // -- Overlay Rules (§4.1) --------------------------------------------------

  describe('canAddOverlayItem', () => {
    it('allows when count is 0', () => {
      expect(canAddOverlayItem(0)).toBe(true);
    });

    it('allows when count is 4', () => {
      expect(canAddOverlayItem(4)).toBe(true);
    });

    it('disallows when count is 5 (max reached)', () => {
      expect(canAddOverlayItem(5)).toBe(false);
    });

    it('disallows when count exceeds 5', () => {
      expect(canAddOverlayItem(6)).toBe(false);
    });
  });

  describe('formatOverlayItemNumber', () => {
    it('formats as {section}.OL-{sequence}', () => {
      expect(formatOverlayItemNumber(3, 1)).toBe('3.OL-1');
      expect(formatOverlayItemNumber(1, 5)).toBe('1.OL-5');
      expect(formatOverlayItemNumber(7, 3)).toBe('7.OL-3');
    });
  });

  describe('isOverlayItemDeletable', () => {
    it('always returns false', () => {
      expect(isOverlayItemDeletable()).toBe(false);
    });
  });

  // -- Jurisdiction (§1.3) ---------------------------------------------------

  describe('getJurisdictionSection7Behavior', () => {
    it('PBC instantiates 16 items', () => {
      const result = getJurisdictionSection7Behavior('PBC');
      expect(result.instantiateItems).toBe(true);
      expect(result.itemCount).toBe(16);
    });

    it('Other does not instantiate items', () => {
      const result = getJurisdictionSection7Behavior('Other');
      expect(result.instantiateItems).toBe(false);
      expect(result.itemCount).toBe(0);
    });
  });

  // -- Stage Activation ------------------------------------------------------

  describe('isItemActiveForStage', () => {
    it('ALWAYS items are active at any stage', () => {
      expect(isItemActiveForStage('ALWAYS', 'ALWAYS')).toBe(true);
      expect(isItemActiveForStage('ALWAYS', 'ARCHIVE_READY')).toBe(true);
    });

    it('TURNOVER items are active at TURNOVER and later', () => {
      expect(isItemActiveForStage('TURNOVER', 'TURNOVER')).toBe(true);
      expect(isItemActiveForStage('TURNOVER', 'POST_TURNOVER')).toBe(true);
      expect(isItemActiveForStage('TURNOVER', 'ARCHIVE_READY')).toBe(true);
    });

    it('TURNOVER items are not active at INSPECTIONS', () => {
      expect(isItemActiveForStage('TURNOVER', 'INSPECTIONS')).toBe(false);
    });

    it('ARCHIVE_READY items are only active at ARCHIVE_READY', () => {
      expect(isItemActiveForStage('ARCHIVE_READY', 'ARCHIVE_READY')).toBe(true);
      expect(isItemActiveForStage('ARCHIVE_READY', 'FINAL_COMPLETION')).toBe(false);
    });
  });

  // -- Lien Deadline (§3 Section 4 item 4.14) --------------------------------

  describe('calculateLienDeadline', () => {
    it('adds 80 calendar days to last work date', () => {
      // 2026-01-15 + 80 days = 2026-04-05
      expect(calculateLienDeadline('2026-01-15')).toBe('2026-04-05');
    });

    it('handles month boundary crossing', () => {
      // 2026-03-01 + 80 days = 2026-05-20
      expect(calculateLienDeadline('2026-03-01')).toBe('2026-05-20');
    });
  });

  // -- Section 6 Integration (§3 Section 6) ----------------------------------

  describe('isSection6Item63Complete', () => {
    it('returns true when all subs have FinalCloseout PE_APPROVED', () => {
      const scorecards = [
        { evaluationType: 'FinalCloseout', publicationStatus: 'PE_APPROVED' as const },
        { evaluationType: 'FinalCloseout', publicationStatus: 'PE_APPROVED' as const },
      ];
      expect(isSection6Item63Complete(scorecards)).toBe(true);
    });

    it('returns false when a sub has SUBMITTED (not yet approved)', () => {
      const scorecards = [
        { evaluationType: 'FinalCloseout', publicationStatus: 'PE_APPROVED' as const },
        { evaluationType: 'FinalCloseout', publicationStatus: 'SUBMITTED' as const },
      ];
      expect(isSection6Item63Complete(scorecards)).toBe(false);
    });

    it('returns false when a sub has only Interim evaluation', () => {
      const scorecards = [
        { evaluationType: 'Interim', publicationStatus: 'PE_APPROVED' as const },
      ];
      expect(isSection6Item63Complete(scorecards)).toBe(false);
    });

    it('returns false when no scorecards exist', () => {
      expect(isSection6Item63Complete([])).toBe(false);
    });
  });

  describe('isSection6Item65Complete', () => {
    it('returns true when report is PE_APPROVED', () => {
      expect(isSection6Item65Complete('PE_APPROVED')).toBe(true);
    });

    it('returns false when report is SUBMITTED', () => {
      expect(isSection6Item65Complete('SUBMITTED')).toBe(false);
    });

    it('returns false when report is DRAFT', () => {
      expect(isSection6Item65Complete('DRAFT')).toBe(false);
    });
  });

  // -- Governed Items by Jurisdiction ----------------------------------------

  describe('getGovernedItemsForJurisdiction', () => {
    it('PBC returns all 70 items', () => {
      expect(getGovernedItemsForJurisdiction('PBC')).toHaveLength(70);
    });

    it('Other returns 54 items (sections 1-6 only)', () => {
      expect(getGovernedItemsForJurisdiction('Other')).toHaveLength(54);
    });

    it('Other excludes all PBCJurisdiction items', () => {
      const otherItems = getGovernedItemsForJurisdiction('Other');
      expect(otherItems.every((i) => i.sectionKey !== 'PBCJurisdiction')).toBe(true);
    });
  });

  // -- Section Gate Satisfaction ---------------------------------------------

  describe('isSectionGateSatisfied', () => {
    it('returns true when all required items are Yes for "All" gate', () => {
      const items = [
        { itemNumber: '1.1', isRequired: false, result: 'Pending' as const },
        { itemNumber: '1.2', isRequired: true, result: 'Yes' as const },
        { itemNumber: '1.3', isRequired: true, result: 'Yes' as const },
      ];
      const gate = { sectionKey: 'Tasks' as const, milestoneKey: 'TASKS_COMPLETE' as const, triggerCondition: 'All items = Yes (or required items with NA+justification)' };
      expect(isSectionGateSatisfied(items, gate)).toBe(true);
    });

    it('returns true when required items are NA (with justification)', () => {
      const items = [
        { itemNumber: '1.2', isRequired: true, result: 'NA' as const },
        { itemNumber: '1.3', isRequired: true, result: 'Yes' as const },
      ];
      const gate = { sectionKey: 'Tasks' as const, milestoneKey: 'TASKS_COMPLETE' as const, triggerCondition: 'All items = Yes (or required items with NA+justification)' };
      expect(isSectionGateSatisfied(items, gate)).toBe(true);
    });

    it('returns false when a required item is Pending', () => {
      const items = [
        { itemNumber: '1.2', isRequired: true, result: 'Yes' as const },
        { itemNumber: '1.3', isRequired: true, result: 'Pending' as const },
      ];
      const gate = { sectionKey: 'Tasks' as const, milestoneKey: 'TASKS_COMPLETE' as const, triggerCondition: 'All items = Yes (or required items with NA+justification)' };
      expect(isSectionGateSatisfied(items, gate)).toBe(false);
    });

    it('returns true for specific-item gate when named items are Yes', () => {
      const items = [
        { itemNumber: '2.6', isRequired: true, result: 'Yes' as const },
        { itemNumber: '2.10', isRequired: true, result: 'Yes' as const },
        { itemNumber: '2.1', isRequired: false, result: 'Pending' as const },
      ];
      const gate = { sectionKey: 'DocumentTracking' as const, milestoneKey: 'DOCUMENTS_COMPLETE' as const, triggerCondition: 'Items 2.6 and 2.10 both = Yes' };
      expect(isSectionGateSatisfied(items, gate)).toBe(true);
    });

    it('returns false for specific-item gate when a named item is not Yes', () => {
      const items = [
        { itemNumber: '2.6', isRequired: true, result: 'Yes' as const },
        { itemNumber: '2.10', isRequired: true, result: 'Pending' as const },
      ];
      const gate = { sectionKey: 'DocumentTracking' as const, milestoneKey: 'DOCUMENTS_COMPLETE' as const, triggerCondition: 'Items 2.6 and 2.10 both = Yes' };
      expect(isSectionGateSatisfied(items, gate)).toBe(false);
    });
  });

  // -- Mock factories --------------------------------------------------------

  describe('createMockGovernedChecklistItem', () => {
    it('creates a valid default governed item', () => {
      const item = createMockGovernedChecklistItem();
      expect(item.isGoverned).toBe(true);
      expect(item.itemNumber).toBeTruthy();
      expect(item.sectionKey).toBeTruthy();
    });

    it('accepts overrides', () => {
      const item = createMockGovernedChecklistItem({ itemNumber: '3.11', isRequired: true });
      expect(item.itemNumber).toBe('3.11');
      expect(item.isRequired).toBe(true);
    });
  });

  describe('createMockChecklistSectionDefinition', () => {
    it('creates a valid default section', () => {
      const section = createMockChecklistSectionDefinition();
      expect(section.sectionNumber).toBe(1);
      expect(section.name).toBeTruthy();
    });

    it('accepts overrides', () => {
      const section = createMockChecklistSectionDefinition({ sectionNumber: 3, name: 'Inspections' });
      expect(section.sectionNumber).toBe(3);
      expect(section.name).toBe('Inspections');
    });
  });
});
