import { describe, expect, it } from 'vitest';

import {
  canExternalPartyAccessQcSurfaces,
  canGateBeReadyWithConditions,
  canQcStoreEvidenceFiles,
  doesExpiredDeviationAffectReadiness,
  doesRejectedApprovalBlockReadiness,
  getReadinessEffectForDeviationState,
  isApprovalProvenanceRequired,
  isDeviationConditionEnforceable,
  isDeviationExpiredBlockingReadiness,
  isEvidenceSufficiencyInferredFromFilePresence,
  isEvidenceSufficiencySatisfied,
  isExternalApprovalInternallyTracked,
  isOfficialSourceConflictSilentlyResolvable,
  mustConflictRouteToExplicitReview,
  requiresReviewerAcceptanceForSufficiency,
} from '../../index.js';

describe('P3-E15-T10 Stage 6 QC deviations-evidence business rules', () => {
  describe('canGateBeReadyWithConditions', () => {
    it('returns true for APPROVED', () => {
      expect(canGateBeReadyWithConditions('APPROVED')).toBe(true);
    });
    it('returns false for SUBMITTED', () => {
      expect(canGateBeReadyWithConditions('SUBMITTED')).toBe(false);
    });
    it('returns false for EXPIRED', () => {
      expect(canGateBeReadyWithConditions('EXPIRED')).toBe(false);
    });
    it('returns false for DRAFT', () => {
      expect(canGateBeReadyWithConditions('DRAFT')).toBe(false);
    });
  });

  describe('isDeviationExpiredBlockingReadiness', () => {
    it('returns true for EXPIRED', () => {
      expect(isDeviationExpiredBlockingReadiness('EXPIRED')).toBe(true);
    });
    it('returns false for APPROVED', () => {
      expect(isDeviationExpiredBlockingReadiness('APPROVED')).toBe(false);
    });
    it('returns false for RESOLVED', () => {
      expect(isDeviationExpiredBlockingReadiness('RESOLVED')).toBe(false);
    });
  });

  describe('isEvidenceSufficiencyInferredFromFilePresence', () => {
    it('always returns false', () => {
      expect(isEvidenceSufficiencyInferredFromFilePresence()).toBe(false);
    });
  });

  describe('isEvidenceSufficiencySatisfied', () => {
    it('returns true for SATISFIED', () => {
      expect(isEvidenceSufficiencySatisfied('SATISFIED')).toBe(true);
    });
    it('returns false for NOT_SATISFIED', () => {
      expect(isEvidenceSufficiencySatisfied('NOT_SATISFIED')).toBe(false);
    });
    it('returns false for REVIEW_PENDING', () => {
      expect(isEvidenceSufficiencySatisfied('REVIEW_PENDING')).toBe(false);
    });
  });

  describe('requiresReviewerAcceptanceForSufficiency', () => {
    it('always returns true', () => {
      expect(requiresReviewerAcceptanceForSufficiency()).toBe(true);
    });
  });

  describe('canQcStoreEvidenceFiles', () => {
    it('always returns false', () => {
      expect(canQcStoreEvidenceFiles()).toBe(false);
    });
  });

  describe('isOfficialSourceConflictSilentlyResolvable', () => {
    it('always returns false', () => {
      expect(isOfficialSourceConflictSilentlyResolvable()).toBe(false);
    });
  });

  describe('mustConflictRouteToExplicitReview', () => {
    it('always returns true', () => {
      expect(mustConflictRouteToExplicitReview()).toBe(true);
    });
  });

  describe('isExternalApprovalInternallyTracked', () => {
    it('always returns true', () => {
      expect(isExternalApprovalInternallyTracked()).toBe(true);
    });
  });

  describe('canExternalPartyAccessQcSurfaces', () => {
    it('always returns false', () => {
      expect(canExternalPartyAccessQcSurfaces()).toBe(false);
    });
  });

  describe('doesExpiredDeviationAffectReadiness', () => {
    it('always returns true', () => {
      expect(doesExpiredDeviationAffectReadiness()).toBe(true);
    });
  });

  describe('doesRejectedApprovalBlockReadiness', () => {
    it('always returns true', () => {
      expect(doesRejectedApprovalBlockReadiness()).toBe(true);
    });
  });

  describe('getReadinessEffectForDeviationState', () => {
    it('returns READY_WITH_CONDITIONS for APPROVED', () => {
      expect(getReadinessEffectForDeviationState('APPROVED')).toBe('READY_WITH_CONDITIONS');
    });
    it('returns NOT_READY for SUBMITTED', () => {
      expect(getReadinessEffectForDeviationState('SUBMITTED')).toBe('NOT_READY');
    });
    it('returns BLOCKED for EXPIRED', () => {
      expect(getReadinessEffectForDeviationState('EXPIRED')).toBe('BLOCKED');
    });
    it('returns STANDARD_READINESS for WITHDRAWN', () => {
      expect(getReadinessEffectForDeviationState('WITHDRAWN')).toBe('STANDARD_READINESS');
    });
    it('returns STANDARD_READINESS for RESOLVED', () => {
      expect(getReadinessEffectForDeviationState('RESOLVED')).toBe('STANDARD_READINESS');
    });
  });

  describe('isDeviationConditionEnforceable', () => {
    it('returns true for LIMITED_DURATION', () => {
      expect(isDeviationConditionEnforceable('LIMITED_DURATION')).toBe(true);
    });
    it('returns true for EXTRA_EVIDENCE', () => {
      expect(isDeviationConditionEnforceable('EXTRA_EVIDENCE')).toBe(true);
    });
    it('returns true for ADDED_REVIEWER_CHECK', () => {
      expect(isDeviationConditionEnforceable('ADDED_REVIEWER_CHECK')).toBe(true);
    });
    it('returns true for ADDITIONAL_APPROVAL', () => {
      expect(isDeviationConditionEnforceable('ADDITIONAL_APPROVAL')).toBe(true);
    });
    it('returns true for HEIGHTENED_MONITORING', () => {
      expect(isDeviationConditionEnforceable('HEIGHTENED_MONITORING')).toBe(true);
    });
    it('returns true for MANDATORY_CORRECTIVE_ACTION', () => {
      expect(isDeviationConditionEnforceable('MANDATORY_CORRECTIVE_ACTION')).toBe(true);
    });
  });

  describe('isApprovalProvenanceRequired', () => {
    it('always returns true', () => {
      expect(isApprovalProvenanceRequired()).toBe(true);
    });
  });
});
