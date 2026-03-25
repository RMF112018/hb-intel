import { describe, expect, it } from 'vitest';
import {
  canGovernanceRolePerformAction,
  isGovernedStandardImmutableOncePublished,
  validateProjectExtension,
  isPromotionRequiresBothReviewers,
  canCandidateBeResubmitted,
  isValidCandidateTransition,
  isAdoptionDecisionPmOwned,
  canAdoptUpdateNotice,
  isOfficialSourceOnly,
  canSilentlyReplaceBasis,
  isBasisConflictResolved,
  isGovernedContentVersioned,
  canProjectOverrideRollupSemantics,
  canProjectOverrideCurrentnessPolicy,
  getProjectDecisionLatitude,
} from '../../index.js';

describe('QC governance business rules', () => {
  describe('canGovernanceRolePerformAction', () => {
    it('MOE_ADMIN can PUBLISH_GOVERNED_CORE', () => {
      expect(canGovernanceRolePerformAction('MOE_ADMIN', 'PUBLISH_GOVERNED_CORE')).toBe(true);
    });

    it('QC_MANAGER cannot PUBLISH_GOVERNED_CORE', () => {
      expect(canGovernanceRolePerformAction('QC_MANAGER', 'PUBLISH_GOVERNED_CORE')).toBe(false);
    });

    it('PM_PE_PA can AUTHOR_PROJECT_RECORDS', () => {
      expect(canGovernanceRolePerformAction('PM_PE_PA', 'AUTHOR_PROJECT_RECORDS')).toBe(true);
    });

    it('PM_PE_PA can ADOPT_UPDATE_NOTICE', () => {
      expect(canGovernanceRolePerformAction('PM_PE_PA', 'ADOPT_UPDATE_NOTICE')).toBe(true);
    });

    it('AUTHORIZED_HB_VERIFIER can VERIFY_COMPLETION', () => {
      expect(canGovernanceRolePerformAction('AUTHORIZED_HB_VERIFIER', 'VERIFY_COMPLETION')).toBe(true);
    });

    it('READ_ONLY_LEADERSHIP cannot perform any action', () => {
      expect(canGovernanceRolePerformAction('READ_ONLY_LEADERSHIP', 'AUTHOR_PROJECT_RECORDS')).toBe(false);
      expect(canGovernanceRolePerformAction('READ_ONLY_LEADERSHIP', 'PUBLISH_GOVERNED_CORE')).toBe(false);
    });
  });

  describe('isGovernedStandardImmutableOncePublished', () => {
    it('PUBLISHED is immutable', () => {
      expect(isGovernedStandardImmutableOncePublished('PUBLISHED')).toBe(true);
    });

    it('SUPERSEDED is immutable', () => {
      expect(isGovernedStandardImmutableOncePublished('SUPERSEDED')).toBe(true);
    });

    it('RETIRED is immutable', () => {
      expect(isGovernedStandardImmutableOncePublished('RETIRED')).toBe(true);
    });

    it('DRAFT is not immutable', () => {
      expect(isGovernedStandardImmutableOncePublished('DRAFT')).toBe(false);
    });

    it('UNDER_REVIEW is not immutable', () => {
      expect(isGovernedStandardImmutableOncePublished('UNDER_REVIEW')).toBe(false);
    });
  });

  describe('validateProjectExtension', () => {
    it('returns VALID when all conditions met', () => {
      expect(validateProjectExtension(true, false, true, true)).toBe('VALID');
    });

    it('returns MISSING_PARENT_CATEGORY when no parent', () => {
      expect(validateProjectExtension(false, false, true, true)).toBe('MISSING_PARENT_CATEGORY');
    });

    it('returns WEAKENS_GOVERNED_MINIMUM when weakens', () => {
      expect(validateProjectExtension(true, true, true, true)).toBe('WEAKENS_GOVERNED_MINIMUM');
    });

    it('returns MISSING_PROVENANCE when no provenance', () => {
      expect(validateProjectExtension(true, false, false, true)).toBe('MISSING_PROVENANCE');
    });

    it('returns MISSING_APPROVAL when no approval', () => {
      expect(validateProjectExtension(true, false, true, false)).toBe('MISSING_APPROVAL');
    });
  });

  describe('isPromotionRequiresBothReviewers', () => {
    it('always returns true', () => {
      expect(isPromotionRequiresBothReviewers()).toBe(true);
    });
  });

  describe('canCandidateBeResubmitted', () => {
    it('RETURNED_FOR_REVISION can be resubmitted', () => {
      expect(canCandidateBeResubmitted('RETURNED_FOR_REVISION')).toBe(true);
    });

    it('DRAFT cannot be resubmitted', () => {
      expect(canCandidateBeResubmitted('DRAFT')).toBe(false);
    });

    it('SUBMITTED cannot be resubmitted', () => {
      expect(canCandidateBeResubmitted('SUBMITTED')).toBe(false);
    });

    it('REJECTED cannot be resubmitted', () => {
      expect(canCandidateBeResubmitted('REJECTED')).toBe(false);
    });
  });

  describe('isValidCandidateTransition', () => {
    it('DRAFT to SUBMITTED is valid', () => {
      expect(isValidCandidateTransition('DRAFT', 'SUBMITTED')).toBe(true);
    });

    it('SUBMITTED to UNDER_REVIEW is valid', () => {
      expect(isValidCandidateTransition('SUBMITTED', 'UNDER_REVIEW')).toBe(true);
    });

    it('UNDER_REVIEW to PUBLISHED is valid', () => {
      expect(isValidCandidateTransition('UNDER_REVIEW', 'PUBLISHED')).toBe(true);
    });

    it('DRAFT to PUBLISHED is invalid', () => {
      expect(isValidCandidateTransition('DRAFT', 'PUBLISHED')).toBe(false);
    });
  });

  describe('isAdoptionDecisionPmOwned', () => {
    it('always returns true', () => {
      expect(isAdoptionDecisionPmOwned()).toBe(true);
    });
  });

  describe('canAdoptUpdateNotice', () => {
    it('PM_PE_PA can adopt', () => {
      expect(canAdoptUpdateNotice('PM_PE_PA')).toBe(true);
    });

    it('QC_MANAGER cannot adopt', () => {
      expect(canAdoptUpdateNotice('QC_MANAGER')).toBe(false);
    });
  });

  describe('isOfficialSourceOnly', () => {
    it('always returns true', () => {
      expect(isOfficialSourceOnly()).toBe(true);
    });
  });

  describe('canSilentlyReplaceBasis', () => {
    it('always returns false', () => {
      expect(canSilentlyReplaceBasis()).toBe(false);
    });
  });

  describe('isBasisConflictResolved', () => {
    it('ADOPT_NEW_BASIS is resolved', () => {
      expect(isBasisConflictResolved('ADOPT_NEW_BASIS')).toBe(true);
    });

    it('RETAIN_APPROVED_BASIS is resolved', () => {
      expect(isBasisConflictResolved('RETAIN_APPROVED_BASIS')).toBe(true);
    });

    it('APPROVED_EXCEPTION is resolved', () => {
      expect(isBasisConflictResolved('APPROVED_EXCEPTION')).toBe(true);
    });

    it('MANUAL_REVIEW_REQUIRED is resolved', () => {
      expect(isBasisConflictResolved('MANUAL_REVIEW_REQUIRED')).toBe(true);
    });

    it('null is not resolved', () => {
      expect(isBasisConflictResolved(null)).toBe(false);
    });
  });

  describe('isGovernedContentVersioned', () => {
    it('STANDARDS_LIBRARY is versioned', () => {
      expect(isGovernedContentVersioned('STANDARDS_LIBRARY')).toBe(true);
    });

    it('UNKNOWN is not versioned', () => {
      expect(isGovernedContentVersioned('UNKNOWN')).toBe(false);
    });
  });

  describe('canProjectOverrideRollupSemantics', () => {
    it('always returns false', () => {
      expect(canProjectOverrideRollupSemantics()).toBe(false);
    });
  });

  describe('canProjectOverrideCurrentnessPolicy', () => {
    it('always returns false', () => {
      expect(canProjectOverrideCurrentnessPolicy()).toBe(false);
    });
  });

  describe('getProjectDecisionLatitude', () => {
    it('Taxonomy returns CONTROLLED_EXTENSION', () => {
      expect(getProjectDecisionLatitude('Taxonomy')).toBe('CONTROLLED_EXTENSION');
    });

    it('Unknown returns null', () => {
      expect(getProjectDecisionLatitude('Unknown')).toBeNull();
    });
  });
});
