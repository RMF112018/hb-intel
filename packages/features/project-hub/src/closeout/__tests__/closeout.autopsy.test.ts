import { describe, expect, it } from 'vitest';

import {
  isAutopsyWaiverValid,
  isSectionApplicable,
  getApplicableSections,
  canPublishOutput,
  getOutputPublicationBlockers,
  isActionTitleValid,
} from '../../index.js';

import { createMockAutopsyRecord } from '../../../testing/createMockAutopsyRecord.js';

describe('P3-E10-T07 Closeout autopsy business rules', () => {
  // -- Waiver (§4.2) ---------------------------------------------------------

  describe('isAutopsyWaiverValid', () => {
    it('valid when waived=true with note', () => {
      expect(isAutopsyWaiverValid(true, 'Project terminated before substantial completion')).toBe(true);
    });

    it('invalid when waived=true without note', () => {
      expect(isAutopsyWaiverValid(true, null)).toBe(false);
      expect(isAutopsyWaiverValid(true, '')).toBe(false);
      expect(isAutopsyWaiverValid(true, '   ')).toBe(false);
    });

    it('invalid when waived=false', () => {
      expect(isAutopsyWaiverValid(false, 'Some note')).toBe(false);
    });
  });

  // -- Section Applicability (§9.1) ------------------------------------------

  describe('isSectionApplicable', () => {
    it('first 10 sections always applicable', () => {
      expect(isSectionApplicable('BusinessCase', false, false)).toBe(true);
      expect(isSectionApplicable('CloseoutHandover', false, false)).toBe(true);
    });

    it('OccupancyUserExperience requires operationalOutcomesApplicable', () => {
      expect(isSectionApplicable('OccupancyUserExperience', true, false)).toBe(true);
      expect(isSectionApplicable('OccupancyUserExperience', false, false)).toBe(false);
    });

    it('DeveloperAssetOutcomes requires developerProjectApplicable', () => {
      expect(isSectionApplicable('DeveloperAssetOutcomes', false, true)).toBe(true);
      expect(isSectionApplicable('DeveloperAssetOutcomes', false, false)).toBe(false);
    });
  });

  describe('getApplicableSections', () => {
    it('returns 10 sections for standard project', () => {
      expect(getApplicableSections(false, false)).toHaveLength(10);
    });

    it('returns 11 sections with operational outcomes', () => {
      expect(getApplicableSections(true, false)).toHaveLength(11);
    });

    it('returns 12 sections with both flags', () => {
      expect(getApplicableSections(true, true)).toHaveLength(12);
    });
  });

  // -- Output Publication (§14.4) --------------------------------------------

  describe('canPublishOutput', () => {
    it('true when all three conditions met', () => {
      expect(canPublishOutput('PE_APPROVED', 'PE_APPROVED', 'ARCHIVED')).toBe(true);
    });

    it('false when output not PE_APPROVED', () => {
      expect(canPublishOutput('DRAFT', 'PE_APPROVED', 'ARCHIVED')).toBe(false);
    });

    it('false when autopsy not PE_APPROVED', () => {
      expect(canPublishOutput('PE_APPROVED', 'SUBMITTED', 'ARCHIVED')).toBe(false);
    });

    it('false when project not ARCHIVED', () => {
      expect(canPublishOutput('PE_APPROVED', 'PE_APPROVED', 'ARCHIVE_READY')).toBe(false);
    });
  });

  describe('getOutputPublicationBlockers', () => {
    it('returns empty when all conditions met', () => {
      expect(getOutputPublicationBlockers('PE_APPROVED', 'PE_APPROVED', 'ARCHIVED')).toHaveLength(0);
    });

    it('returns 3 blockers when nothing is ready', () => {
      expect(getOutputPublicationBlockers('DRAFT', 'DRAFT', 'IN_PROGRESS')).toHaveLength(3);
    });

    it('returns 1 blocker when only lifecycle is wrong', () => {
      const blockers = getOutputPublicationBlockers('PE_APPROVED', 'PE_APPROVED', 'ARCHIVE_READY');
      expect(blockers).toHaveLength(1);
      expect(blockers[0]).toContain('ARCHIVED');
    });
  });

  // -- Action Title Validation (§13.1) ---------------------------------------

  describe('isActionTitleValid', () => {
    it('accepts approved action verbs', () => {
      expect(isActionTitleValid('Implement weekly safety audits')).toBe(true);
      expect(isActionTitleValid('Revise standard subcontract language')).toBe(true);
      expect(isActionTitleValid('Train all PMs on look-ahead planning')).toBe(true);
    });

    it('rejects non-verb starts', () => {
      expect(isActionTitleValid('The team should implement')).toBe(false);
      expect(isActionTitleValid('Safety audit improvements')).toBe(false);
    });

    it('rejects empty', () => {
      expect(isActionTitleValid('')).toBe(false);
    });
  });

  // -- Mock factory ----------------------------------------------------------

  describe('createMockAutopsyRecord', () => {
    it('creates valid default record', () => {
      const record = createMockAutopsyRecord();
      expect(record.autopsyId).toBeTruthy();
      expect(record.waived).toBe(false);
      expect(record.findingCount).toBe(0);
    });

    it('accepts overrides', () => {
      const record = createMockAutopsyRecord({ waived: true, waiverNote: 'Terminated' });
      expect(record.waived).toBe(true);
      expect(record.waiverNote).toBe('Terminated');
    });
  });
});
