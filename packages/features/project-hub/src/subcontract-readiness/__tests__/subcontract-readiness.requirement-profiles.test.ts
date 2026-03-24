import { describe, expect, it } from 'vitest';

import {
  canPMSuppressRequirement,
  canSpecialistDeclareNotRequired,
  getMissingProfileInputs,
  isDualStateConsistent,
  isEvaluationBlocking,
  isEvaluationSatisfied,
  isItemBlocking,
  isItemConditional,
  isProfileBindingComplete,
  isRenewalActionRequired,
  isRenewalDue,
  isSDIOutcomeBlocking,
  isSDIOutcomeSatisfied,
  PROFILE_INPUT_DIMENSIONS,
} from '../../index.js';

describe('P3-E13-T08 Stage 3 requirement-profiles business rules', () => {
  // -- Dual-State Consistency (T03 §5.2) --------------------------------------

  describe('isDualStateConsistent', () => {
    it('RECEIVED_ACCEPTED + DEFICIENT is valid (T03 §5.2 example 1)', () => {
      expect(isDualStateConsistent('RECEIVED_ACCEPTED', 'DEFICIENT')).toBe(true);
    });

    it('NOT_PROVIDED + NOT_REQUIRED_BY_RULE is valid (T03 §5.2 example 2)', () => {
      expect(isDualStateConsistent('NOT_PROVIDED', 'NOT_REQUIRED_BY_RULE')).toBe(true);
    });

    it('RECEIVED_ACCEPTED + EXCEPTION_REQUIRED is valid (T03 §5.2 example 3)', () => {
      expect(isDualStateConsistent('RECEIVED_ACCEPTED', 'EXCEPTION_REQUIRED')).toBe(true);
    });

    it('RECEIVED_ACCEPTED + SATISFIED_WITH_CONDITIONS is valid (T03 §5.2 example 4)', () => {
      expect(isDualStateConsistent('RECEIVED_ACCEPTED', 'SATISFIED_WITH_CONDITIONS')).toBe(true);
    });

    it('NOT_PROVIDED + NOT_STARTED is valid', () => {
      expect(isDualStateConsistent('NOT_PROVIDED', 'NOT_STARTED')).toBe(true);
    });

    it('REQUESTED + UNDER_REVIEW is valid', () => {
      expect(isDualStateConsistent('REQUESTED', 'UNDER_REVIEW')).toBe(true);
    });
  });

  // -- PM Override Doctrine (T03 §6) ------------------------------------------

  describe('canPMSuppressRequirement', () => {
    it('always returns false per T03 §6', () => {
      expect(canPMSuppressRequirement()).toBe(false);
    });
  });

  describe('canSpecialistDeclareNotRequired', () => {
    it('returns true for COMPLIANCE_RISK', () => {
      expect(canSpecialistDeclareNotRequired('COMPLIANCE_RISK')).toBe(true);
    });

    it('returns true for Compliance Specialist', () => {
      expect(canSpecialistDeclareNotRequired('Compliance Specialist')).toBe(true);
    });

    it('returns true for Risk Analyst', () => {
      expect(canSpecialistDeclareNotRequired('Risk Analyst')).toBe(true);
    });

    it('returns false for PM', () => {
      expect(canSpecialistDeclareNotRequired('PM')).toBe(false);
    });

    it('returns false for APM', () => {
      expect(canSpecialistDeclareNotRequired('APM')).toBe(false);
    });

    it('returns false for PA', () => {
      expect(canSpecialistDeclareNotRequired('PA')).toBe(false);
    });
  });

  // -- Blocking Severity (T03 §3.1) ------------------------------------------

  describe('isItemBlocking', () => {
    it('returns true for BLOCKER', () => {
      expect(isItemBlocking('BLOCKER')).toBe(true);
    });

    it('returns false for CONDITIONAL', () => {
      expect(isItemBlocking('CONDITIONAL')).toBe(false);
    });

    it('returns false for ADVISORY', () => {
      expect(isItemBlocking('ADVISORY')).toBe(false);
    });

    it('returns false for NOT_REQUIRED', () => {
      expect(isItemBlocking('NOT_REQUIRED')).toBe(false);
    });
  });

  describe('isItemConditional', () => {
    it('returns true for CONDITIONAL', () => {
      expect(isItemConditional('CONDITIONAL')).toBe(true);
    });

    it('returns false for BLOCKER', () => {
      expect(isItemConditional('BLOCKER')).toBe(false);
    });
  });

  // -- Renewal Logic ----------------------------------------------------------

  describe('isRenewalDue', () => {
    it('returns false when expiresAt is null', () => {
      expect(isRenewalDue(null)).toBe(false);
    });

    it('returns true when expiration date is in the past', () => {
      expect(isRenewalDue('2020-01-01T00:00:00Z')).toBe(true);
    });

    it('returns false when expiration date is in the future', () => {
      expect(isRenewalDue('2099-01-01T00:00:00Z')).toBe(false);
    });

    it('returns true when expiration date is now', () => {
      const now = new Date();
      expect(isRenewalDue(now.toISOString(), now)).toBe(true);
    });
  });

  describe('isRenewalActionRequired', () => {
    it('returns true for DUE', () => {
      expect(isRenewalActionRequired('DUE')).toBe(true);
    });

    it('returns false for NONE', () => {
      expect(isRenewalActionRequired('NONE')).toBe(false);
    });

    it('returns false for ELIGIBLE', () => {
      expect(isRenewalActionRequired('ELIGIBLE')).toBe(false);
    });

    it('returns false for EXEMPTED', () => {
      expect(isRenewalActionRequired('EXEMPTED')).toBe(false);
    });
  });

  // -- SDI Prequalification Outcomes (T03 §7.1) --------------------------------

  describe('isSDIOutcomeBlocking', () => {
    it('returns true for ExceptionRequired', () => {
      expect(isSDIOutcomeBlocking('ExceptionRequired')).toBe(true);
    });

    it('returns true for Rejected', () => {
      expect(isSDIOutcomeBlocking('Rejected')).toBe(true);
    });

    it('returns false for Qualified', () => {
      expect(isSDIOutcomeBlocking('Qualified')).toBe(false);
    });

    it('returns false for NotRequiredByRule', () => {
      expect(isSDIOutcomeBlocking('NotRequiredByRule')).toBe(false);
    });

    it('returns false for AlternateRiskTreatmentApproved', () => {
      expect(isSDIOutcomeBlocking('AlternateRiskTreatmentApproved')).toBe(false);
    });
  });

  describe('isSDIOutcomeSatisfied', () => {
    it('returns true for Qualified', () => {
      expect(isSDIOutcomeSatisfied('Qualified')).toBe(true);
    });

    it('returns true for NotRequiredByRule', () => {
      expect(isSDIOutcomeSatisfied('NotRequiredByRule')).toBe(true);
    });

    it('returns true for AlternateRiskTreatmentApproved', () => {
      expect(isSDIOutcomeSatisfied('AlternateRiskTreatmentApproved')).toBe(true);
    });

    it('returns false for ExceptionRequired', () => {
      expect(isSDIOutcomeSatisfied('ExceptionRequired')).toBe(false);
    });

    it('returns false for Rejected', () => {
      expect(isSDIOutcomeSatisfied('Rejected')).toBe(false);
    });
  });

  // -- Profile Binding Validation (T03 §1.2) ----------------------------------

  describe('isProfileBindingComplete', () => {
    it('returns true when all 9 dimensions are provided', () => {
      expect(isProfileBindingComplete([...PROFILE_INPUT_DIMENSIONS])).toBe(true);
    });

    it('returns false when a dimension is missing', () => {
      const partial = PROFILE_INPUT_DIMENSIONS.slice(0, 8);
      expect(isProfileBindingComplete(partial)).toBe(false);
    });

    it('returns false when empty', () => {
      expect(isProfileBindingComplete([])).toBe(false);
    });
  });

  describe('getMissingProfileInputs', () => {
    it('returns empty array when all dimensions provided', () => {
      expect(getMissingProfileInputs([...PROFILE_INPUT_DIMENSIONS])).toHaveLength(0);
    });

    it('returns all 9 dimensions when none provided', () => {
      expect(getMissingProfileInputs([])).toHaveLength(9);
    });

    it('returns only missing dimensions', () => {
      const partial = PROFILE_INPUT_DIMENSIONS.slice(0, 7);
      const missing = getMissingProfileInputs(partial);
      expect(missing).toHaveLength(2);
    });
  });

  // -- Evaluation State Helpers -----------------------------------------------

  describe('isEvaluationBlocking', () => {
    it('returns true for DEFICIENT', () => {
      expect(isEvaluationBlocking('DEFICIENT')).toBe(true);
    });

    it('returns true for EXCEPTION_REQUIRED', () => {
      expect(isEvaluationBlocking('EXCEPTION_REQUIRED')).toBe(true);
    });

    it('returns true for REJECTED', () => {
      expect(isEvaluationBlocking('REJECTED')).toBe(true);
    });

    it('returns false for SATISFIED', () => {
      expect(isEvaluationBlocking('SATISFIED')).toBe(false);
    });

    it('returns false for NOT_STARTED', () => {
      expect(isEvaluationBlocking('NOT_STARTED')).toBe(false);
    });
  });

  describe('isEvaluationSatisfied', () => {
    it('returns true for SATISFIED', () => {
      expect(isEvaluationSatisfied('SATISFIED')).toBe(true);
    });

    it('returns true for SATISFIED_WITH_CONDITIONS', () => {
      expect(isEvaluationSatisfied('SATISFIED_WITH_CONDITIONS')).toBe(true);
    });

    it('returns true for NOT_REQUIRED_BY_RULE', () => {
      expect(isEvaluationSatisfied('NOT_REQUIRED_BY_RULE')).toBe(true);
    });

    it('returns false for DEFICIENT', () => {
      expect(isEvaluationSatisfied('DEFICIENT')).toBe(false);
    });

    it('returns false for NOT_STARTED', () => {
      expect(isEvaluationSatisfied('NOT_STARTED')).toBe(false);
    });
  });
});
