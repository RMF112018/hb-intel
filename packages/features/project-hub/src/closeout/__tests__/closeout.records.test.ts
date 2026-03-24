import { describe, expect, it } from 'vitest';

import {
  isEditableState,
  isOrgEligibleState,
  isTerminalState,
  canTransitionTo,
  usesPublicationStates,
  isOrgPublishable,
  requiresNaJustification,
  isGovernedItemDescriptionImmutable,
  isInterimOrgEligible,
  isFinalCloseoutOrgEligible,
  isRecommendationValid,
  CLOSEOUT_PUBLICATION_STATES,
} from '../../index.js';

import {
  createMockCloseoutChecklist,
  createMockSubcontractorScorecard,
  createMockLessonEntry,
} from '../../../testing/createMockCloseoutRecordFamily.js';

describe('P3-E10-T02 Closeout records business rules', () => {
  // -- Publication State Rules (§2) ------------------------------------------

  describe('isEditableState', () => {
    it('returns true for DRAFT', () => {
      expect(isEditableState('DRAFT')).toBe(true);
    });

    it('returns true for REVISION_REQUIRED', () => {
      expect(isEditableState('REVISION_REQUIRED')).toBe(true);
    });

    it('returns false for all non-editable states', () => {
      const nonEditable = ['SUBMITTED', 'PE_REVIEW', 'PE_APPROVED', 'PUBLISHED', 'SUPERSEDED', 'ARCHIVED'] as const;
      for (const state of nonEditable) {
        expect(isEditableState(state)).toBe(false);
      }
    });
  });

  describe('isOrgEligibleState', () => {
    it('returns true for PE_APPROVED only', () => {
      expect(isOrgEligibleState('PE_APPROVED')).toBe(true);
    });

    it('returns false for all other states', () => {
      const nonEligible = ['DRAFT', 'SUBMITTED', 'PE_REVIEW', 'REVISION_REQUIRED', 'PUBLISHED', 'SUPERSEDED', 'ARCHIVED'] as const;
      for (const state of nonEligible) {
        expect(isOrgEligibleState(state)).toBe(false);
      }
    });
  });

  describe('isTerminalState', () => {
    it('returns true for PUBLISHED, SUPERSEDED, ARCHIVED', () => {
      expect(isTerminalState('PUBLISHED')).toBe(true);
      expect(isTerminalState('SUPERSEDED')).toBe(true);
      expect(isTerminalState('ARCHIVED')).toBe(true);
    });

    it('returns false for non-terminal states', () => {
      const nonTerminal = ['DRAFT', 'SUBMITTED', 'PE_REVIEW', 'REVISION_REQUIRED', 'PE_APPROVED'] as const;
      for (const state of nonTerminal) {
        expect(isTerminalState(state)).toBe(false);
      }
    });
  });

  describe('canTransitionTo', () => {
    it('DRAFT → SUBMITTED is valid', () => {
      expect(canTransitionTo('DRAFT', 'SUBMITTED')).toBe(true);
    });

    it('SUBMITTED → PE_REVIEW is valid', () => {
      expect(canTransitionTo('SUBMITTED', 'PE_REVIEW')).toBe(true);
    });

    it('PE_REVIEW → PE_APPROVED is valid', () => {
      expect(canTransitionTo('PE_REVIEW', 'PE_APPROVED')).toBe(true);
    });

    it('PE_REVIEW → REVISION_REQUIRED is valid', () => {
      expect(canTransitionTo('PE_REVIEW', 'REVISION_REQUIRED')).toBe(true);
    });

    it('REVISION_REQUIRED → DRAFT is valid', () => {
      expect(canTransitionTo('REVISION_REQUIRED', 'DRAFT')).toBe(true);
    });

    it('PE_APPROVED → PUBLISHED is valid', () => {
      expect(canTransitionTo('PE_APPROVED', 'PUBLISHED')).toBe(true);
    });

    it('PUBLISHED → SUPERSEDED is valid', () => {
      expect(canTransitionTo('PUBLISHED', 'SUPERSEDED')).toBe(true);
    });

    it('any non-terminal state → ARCHIVED is valid', () => {
      const archivable = ['DRAFT', 'SUBMITTED', 'PE_REVIEW', 'REVISION_REQUIRED', 'PE_APPROVED'] as const;
      for (const state of archivable) {
        expect(canTransitionTo(state, 'ARCHIVED')).toBe(true);
      }
    });

    it('ARCHIVED is terminal — no transitions out', () => {
      for (const state of CLOSEOUT_PUBLICATION_STATES) {
        if (state !== 'ARCHIVED') {
          expect(canTransitionTo('ARCHIVED', state)).toBe(false);
        }
      }
    });

    it('SUPERSEDED is terminal — no transitions out', () => {
      for (const state of CLOSEOUT_PUBLICATION_STATES) {
        if (state !== 'SUPERSEDED') {
          expect(canTransitionTo('SUPERSEDED', state)).toBe(false);
        }
      }
    });

    it('rejects invalid transitions', () => {
      expect(canTransitionTo('DRAFT', 'PE_APPROVED')).toBe(false);
      expect(canTransitionTo('SUBMITTED', 'DRAFT')).toBe(false);
      expect(canTransitionTo('PE_APPROVED', 'DRAFT')).toBe(false);
    });
  });

  // -- Publication Applicability (§2.1) --------------------------------------

  describe('usesPublicationStates', () => {
    it('returns true for SubcontractorScorecard', () => {
      expect(usesPublicationStates('SubcontractorScorecard')).toBe(true);
    });

    it('returns true for LessonEntry', () => {
      expect(usesPublicationStates('LessonEntry')).toBe(true);
    });

    it('returns true for LessonsLearningReport', () => {
      expect(usesPublicationStates('LessonsLearningReport')).toBe(true);
    });

    it('returns true for AutopsyRecord', () => {
      expect(usesPublicationStates('AutopsyRecord')).toBe(true);
    });

    it('returns true for LearningLegacyOutput', () => {
      expect(usesPublicationStates('LearningLegacyOutput')).toBe(true);
    });

    it('returns false for CloseoutChecklist', () => {
      expect(usesPublicationStates('CloseoutChecklist')).toBe(false);
    });

    it('returns false for CloseoutChecklistItem', () => {
      expect(usesPublicationStates('CloseoutChecklistItem')).toBe(false);
    });

    it('returns false for AutopsyFinding', () => {
      expect(usesPublicationStates('AutopsyFinding')).toBe(false);
    });

    it('returns false for AutopsyAction', () => {
      expect(usesPublicationStates('AutopsyAction')).toBe(false);
    });

    it('returns false for unknown families', () => {
      expect(usesPublicationStates('UnknownFamily')).toBe(false);
    });
  });

  describe('isOrgPublishable', () => {
    it('returns true for the 5 org-publishable families', () => {
      expect(isOrgPublishable('SubcontractorScorecard')).toBe(true);
      expect(isOrgPublishable('LessonEntry')).toBe(true);
      expect(isOrgPublishable('LessonsLearningReport')).toBe(true);
      expect(isOrgPublishable('AutopsyRecord')).toBe(true);
      expect(isOrgPublishable('LearningLegacyOutput')).toBe(true);
    });

    it('returns false for non-publishable families', () => {
      expect(isOrgPublishable('CloseoutChecklist')).toBe(false);
      expect(isOrgPublishable('AutopsyFinding')).toBe(false);
      expect(isOrgPublishable('ChecklistTemplate')).toBe(false);
    });
  });

  // -- Checklist Item Rules (§4.2) -------------------------------------------

  describe('requiresNaJustification', () => {
    it('returns true when isRequired=true and result=NA', () => {
      expect(requiresNaJustification(true, 'NA')).toBe(true);
    });

    it('returns false when isRequired=false and result=NA', () => {
      expect(requiresNaJustification(false, 'NA')).toBe(false);
    });

    it('returns false when isRequired=true and result=Yes', () => {
      expect(requiresNaJustification(true, 'Yes')).toBe(false);
    });

    it('returns false when isRequired=true and result=No', () => {
      expect(requiresNaJustification(true, 'No')).toBe(false);
    });

    it('returns false when isRequired=true and result=Pending', () => {
      expect(requiresNaJustification(true, 'Pending')).toBe(false);
    });
  });

  describe('isGovernedItemDescriptionImmutable', () => {
    it('returns true for governed items', () => {
      expect(isGovernedItemDescriptionImmutable(true)).toBe(true);
    });

    it('returns false for overlay items', () => {
      expect(isGovernedItemDescriptionImmutable(false)).toBe(false);
    });
  });

  // -- Scorecard Rules (§4.3) ------------------------------------------------

  describe('isInterimOrgEligible', () => {
    it('always returns false', () => {
      expect(isInterimOrgEligible()).toBe(false);
    });
  });

  describe('isFinalCloseoutOrgEligible', () => {
    it('always returns true', () => {
      expect(isFinalCloseoutOrgEligible()).toBe(true);
    });
  });

  // -- Lesson Entry Rules (§4.4) ---------------------------------------------

  describe('isRecommendationValid', () => {
    it('accepts recommendations starting with action verbs', () => {
      expect(isRecommendationValid('Implement weekly safety audits')).toBe(true);
      expect(isRecommendationValid('Review subcontractor qualifications')).toBe(true);
      expect(isRecommendationValid('Establish early communication protocols')).toBe(true);
      expect(isRecommendationValid('Require pre-task planning for all activities')).toBe(true);
    });

    it('rejects empty recommendations', () => {
      expect(isRecommendationValid('')).toBe(false);
      expect(isRecommendationValid('   ')).toBe(false);
    });

    it('rejects recommendations starting with articles', () => {
      expect(isRecommendationValid('The team should implement weekly audits')).toBe(false);
      expect(isRecommendationValid('A review of subcontractor qualifications')).toBe(false);
      expect(isRecommendationValid('An early communication protocol')).toBe(false);
    });

    it('rejects recommendations starting with pronouns', () => {
      expect(isRecommendationValid('We should implement weekly audits')).toBe(false);
      expect(isRecommendationValid('It is recommended to review')).toBe(false);
      expect(isRecommendationValid('They need to establish protocols')).toBe(false);
    });

    it('rejects recommendations starting with conjunctions', () => {
      expect(isRecommendationValid('And implement weekly audits')).toBe(false);
      expect(isRecommendationValid('But review subcontractor qualifications')).toBe(false);
    });
  });

  // -- Mock factories --------------------------------------------------------

  describe('createMockCloseoutChecklist', () => {
    it('creates a valid default checklist', () => {
      const checklist = createMockCloseoutChecklist();
      expect(checklist.checklistId).toBeTruthy();
      expect(checklist.projectId).toBeTruthy();
      expect(checklist.jurisdiction).toBe('PBC');
      expect(checklist.completionPercentage).toBe(0);
    });

    it('accepts overrides', () => {
      const checklist = createMockCloseoutChecklist({ jurisdiction: 'Other', completionPercentage: 50 });
      expect(checklist.jurisdiction).toBe('Other');
      expect(checklist.completionPercentage).toBe(50);
    });
  });

  describe('createMockSubcontractorScorecard', () => {
    it('creates a valid default scorecard', () => {
      const scorecard = createMockSubcontractorScorecard();
      expect(scorecard.scorecardId).toBeTruthy();
      expect(scorecard.evaluationType).toBe('FinalCloseout');
      expect(scorecard.publicationStatus).toBe('DRAFT');
      expect(scorecard.eligibleForPublication).toBe(true);
    });

    it('accepts overrides', () => {
      const scorecard = createMockSubcontractorScorecard({ evaluationType: 'Interim', eligibleForPublication: false });
      expect(scorecard.evaluationType).toBe('Interim');
      expect(scorecard.eligibleForPublication).toBe(false);
    });
  });

  describe('createMockLessonEntry', () => {
    it('creates a valid default lesson entry', () => {
      const lesson = createMockLessonEntry();
      expect(lesson.lessonId).toBeTruthy();
      expect(lesson.publicationStatus).toBe('DRAFT');
      expect(lesson.applicability).toBeGreaterThanOrEqual(1);
      expect(lesson.applicability).toBeLessThanOrEqual(5);
    });

    it('accepts overrides', () => {
      const lesson = createMockLessonEntry({ category: 'Safety', applicability: 5 });
      expect(lesson.category).toBe('Safety');
      expect(lesson.applicability).toBe(5);
    });
  });
});
