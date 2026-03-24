import { describe, expect, it } from 'vitest';

import {
  areCriticalFieldsPopulated,
  canApprovePMPlan,
  canEditPMPlan,
  canSubmitExecutionBaselineCertification,
  canSubmitPMPlan,
  computeBaselineSectionCompleteness,
  hasRequiredSignatures,
  isAssumptionValid,
  isValidBaselineStatusTransition,
} from '../../index.js';

import { createMockExecutionBaseline } from '../../../testing/createMockExecutionBaseline.js';

describe('P3-E11-T10 Stage 7 Startup execution baseline business rules', () => {
  // -- Approval Flow (T06 §2.1) ----------------------------------------------

  describe('isValidBaselineStatusTransition', () => {
    it('allows Draft → Submitted', () => {
      expect(isValidBaselineStatusTransition('Draft', 'Submitted')).toBe(true);
    });

    it('allows Submitted → Draft (revert)', () => {
      expect(isValidBaselineStatusTransition('Submitted', 'Draft')).toBe(true);
    });

    it('allows Submitted → Approved', () => {
      expect(isValidBaselineStatusTransition('Submitted', 'Approved')).toBe(true);
    });

    it('allows Approved → Archived', () => {
      expect(isValidBaselineStatusTransition('Approved', 'Archived')).toBe(true);
    });

    it('rejects Draft → Approved (must go through Submitted)', () => {
      expect(isValidBaselineStatusTransition('Draft', 'Approved')).toBe(false);
    });

    it('rejects Approved → Draft', () => {
      expect(isValidBaselineStatusTransition('Approved', 'Draft')).toBe(false);
    });

    it('rejects Archived → Draft', () => {
      expect(isValidBaselineStatusTransition('Archived', 'Draft')).toBe(false);
    });

    it('rejects same-state Draft → Draft', () => {
      expect(isValidBaselineStatusTransition('Draft', 'Draft')).toBe(false);
    });
  });

  describe('canSubmitPMPlan', () => {
    it('returns true for Draft', () => {
      expect(canSubmitPMPlan('Draft')).toBe(true);
    });

    it('returns false for Submitted', () => {
      expect(canSubmitPMPlan('Submitted')).toBe(false);
    });

    it('returns false for Approved', () => {
      expect(canSubmitPMPlan('Approved')).toBe(false);
    });
  });

  describe('canApprovePMPlan', () => {
    it('returns true for Submitted', () => {
      expect(canApprovePMPlan('Submitted')).toBe(true);
    });

    it('returns false for Draft', () => {
      expect(canApprovePMPlan('Draft')).toBe(false);
    });

    it('returns false for Approved', () => {
      expect(canApprovePMPlan('Approved')).toBe(false);
    });
  });

  describe('canEditPMPlan', () => {
    it('returns true for Draft', () => {
      expect(canEditPMPlan('Draft')).toBe(true);
    });

    it('returns false for Submitted', () => {
      expect(canEditPMPlan('Submitted')).toBe(false);
    });

    it('returns false for Approved', () => {
      expect(canEditPMPlan('Approved')).toBe(false);
    });

    it('returns false for Archived', () => {
      expect(canEditPMPlan('Archived')).toBe(false);
    });
  });

  // -- Critical Fields (T06 §2.3) --------------------------------------------

  describe('areCriticalFieldsPopulated', () => {
    const allCriticalFields = [
      { fieldKey: 'safetyOfficerName', value: 'John Smith' },
      { fieldKey: 'safetyOfficerRole', value: 'Safety Director' },
      { fieldKey: 'projectStartDate', value: '2026-04-01' },
      { fieldKey: 'substantialCompletionDate', value: '2027-06-01' },
      { fieldKey: 'noticeToProceedDate', value: '2026-03-15' },
      { fieldKey: 'goalSubstantialCompletionDate', value: '2027-05-15' },
      { fieldKey: 'goalFinalCompletionDate', value: '2027-07-01' },
    ];

    it('returns true when all 7 critical fields populated', () => {
      expect(areCriticalFieldsPopulated(allCriticalFields)).toBe(true);
    });

    it('returns false when safetyOfficerName missing', () => {
      const fields = allCriticalFields.filter((f) => f.fieldKey !== 'safetyOfficerName');
      expect(areCriticalFieldsPopulated(fields)).toBe(false);
    });

    it('returns false when a critical field has null value', () => {
      const fields = allCriticalFields.map((f) =>
        f.fieldKey === 'projectStartDate' ? { ...f, value: null } : f,
      );
      expect(areCriticalFieldsPopulated(fields)).toBe(false);
    });

    it('returns false when a critical field has empty string value', () => {
      const fields = allCriticalFields.map((f) =>
        f.fieldKey === 'safetyOfficerRole' ? { ...f, value: '' } : f,
      );
      expect(areCriticalFieldsPopulated(fields)).toBe(false);
    });

    it('returns false when no fields provided', () => {
      expect(areCriticalFieldsPopulated([])).toBe(false);
    });
  });

  // -- Signatures (T06 §2.2, T02 §3.8) --------------------------------------

  describe('hasRequiredSignatures', () => {
    it('returns true when both PM and PX have signedAt', () => {
      const sigs = [
        { role: 'PM', signedAt: '2026-03-24T10:00:00Z' },
        { role: 'PX', signedAt: '2026-03-24T11:00:00Z' },
      ];
      expect(hasRequiredSignatures(sigs)).toBe(true);
    });

    it('returns false when PM signature missing', () => {
      const sigs = [
        { role: 'PX', signedAt: '2026-03-24T11:00:00Z' },
      ];
      expect(hasRequiredSignatures(sigs)).toBe(false);
    });

    it('returns false when PX signature missing', () => {
      const sigs = [
        { role: 'PM', signedAt: '2026-03-24T10:00:00Z' },
      ];
      expect(hasRequiredSignatures(sigs)).toBe(false);
    });

    it('returns false when PM signedAt is null', () => {
      const sigs = [
        { role: 'PM', signedAt: null },
        { role: 'PX', signedAt: '2026-03-24T11:00:00Z' },
      ];
      expect(hasRequiredSignatures(sigs)).toBe(false);
    });

    it('returns false when PX signedAt is null', () => {
      const sigs = [
        { role: 'PM', signedAt: '2026-03-24T10:00:00Z' },
        { role: 'PX', signedAt: null },
      ];
      expect(hasRequiredSignatures(sigs)).toBe(false);
    });

    it('returns false for empty signatures array', () => {
      expect(hasRequiredSignatures([])).toBe(false);
    });

    it('returns true with additional non-required signers', () => {
      const sigs = [
        { role: 'PM', signedAt: '2026-03-24T10:00:00Z' },
        { role: 'PX', signedAt: '2026-03-24T11:00:00Z' },
        { role: 'Superintendent', signedAt: null },
      ];
      expect(hasRequiredSignatures(sigs)).toBe(true);
    });
  });

  // -- Certification Eligibility (T06 §2.3) ----------------------------------

  describe('canSubmitExecutionBaselineCertification', () => {
    const validFields = [
      { fieldKey: 'safetyOfficerName', value: 'John Smith' },
      { fieldKey: 'safetyOfficerRole', value: 'Safety Director' },
      { fieldKey: 'projectStartDate', value: '2026-04-01' },
      { fieldKey: 'substantialCompletionDate', value: '2027-06-01' },
      { fieldKey: 'noticeToProceedDate', value: '2026-03-15' },
      { fieldKey: 'goalSubstantialCompletionDate', value: '2027-05-15' },
      { fieldKey: 'goalFinalCompletionDate', value: '2027-07-01' },
    ];
    const validSigs = [
      { role: 'PM', signedAt: '2026-03-24T10:00:00Z' },
      { role: 'PX', signedAt: '2026-03-24T11:00:00Z' },
    ];

    it('returns true when Approved + fields + signatures all valid', () => {
      expect(canSubmitExecutionBaselineCertification('Approved', validFields, validSigs)).toBe(true);
    });

    it('returns false when status is Draft', () => {
      expect(canSubmitExecutionBaselineCertification('Draft', validFields, validSigs)).toBe(false);
    });

    it('returns false when status is Submitted (not yet Approved)', () => {
      expect(canSubmitExecutionBaselineCertification('Submitted', validFields, validSigs)).toBe(false);
    });

    it('returns false when critical field missing', () => {
      const missingField = validFields.filter((f) => f.fieldKey !== 'projectStartDate');
      expect(canSubmitExecutionBaselineCertification('Approved', missingField, validSigs)).toBe(false);
    });

    it('returns false when signature missing', () => {
      const missingSig = [{ role: 'PM', signedAt: '2026-03-24T10:00:00Z' }];
      expect(canSubmitExecutionBaselineCertification('Approved', validFields, missingSig)).toBe(false);
    });
  });

  // -- Assumption Validation (T06 §7, T10 Criterion 21) ----------------------

  describe('isAssumptionValid', () => {
    it('returns true for valid assumption without success criterion', () => {
      expect(isAssumptionValid({
        category: 'LOGISTICS',
        description: 'Site access available from main road',
        isSuccessCriterion: false,
        successMeasure: null,
      })).toBe(true);
    });

    it('returns true for valid success criterion with measure', () => {
      expect(isAssumptionValid({
        category: 'SUCCESS_CRITERIA',
        description: 'Zero OSHA recordable incidents',
        isSuccessCriterion: true,
        successMeasure: 'OSHA recordable count = 0 at project closeout',
      })).toBe(true);
    });

    it('returns false when category is null', () => {
      expect(isAssumptionValid({
        category: null,
        description: 'Test',
        isSuccessCriterion: false,
        successMeasure: null,
      })).toBe(false);
    });

    it('returns false when description is null', () => {
      expect(isAssumptionValid({
        category: 'RISK',
        description: null,
        isSuccessCriterion: false,
        successMeasure: null,
      })).toBe(false);
    });

    it('returns false when isSuccessCriterion is null', () => {
      expect(isAssumptionValid({
        category: 'RISK',
        description: 'Test',
        isSuccessCriterion: null,
        successMeasure: null,
      })).toBe(false);
    });

    it('returns false when isSuccessCriterion=true but successMeasure missing', () => {
      expect(isAssumptionValid({
        category: 'SUCCESS_CRITERIA',
        description: 'Achieve safety goal',
        isSuccessCriterion: true,
        successMeasure: null,
      })).toBe(false);
    });

    it('returns false when isSuccessCriterion=true but successMeasure empty', () => {
      expect(isAssumptionValid({
        category: 'SUCCESS_CRITERIA',
        description: 'Achieve safety goal',
        isSuccessCriterion: true,
        successMeasure: '',
      })).toBe(false);
    });
  });

  // -- Section Completeness --------------------------------------------------

  describe('computeBaselineSectionCompleteness', () => {
    it('returns 0 for all incomplete', () => {
      const sections = Array(11).fill({ isComplete: false });
      expect(computeBaselineSectionCompleteness(sections)).toBe(0);
    });

    it('returns 11 for all complete', () => {
      const sections = Array(11).fill({ isComplete: true });
      expect(computeBaselineSectionCompleteness(sections)).toBe(11);
    });

    it('returns correct count for mixed', () => {
      const sections = [
        { isComplete: true }, { isComplete: true }, { isComplete: false },
        { isComplete: true }, { isComplete: false }, { isComplete: true },
        { isComplete: false }, { isComplete: true }, { isComplete: false },
        { isComplete: false }, { isComplete: true },
      ];
      expect(computeBaselineSectionCompleteness(sections)).toBe(6);
    });

    it('returns 0 for empty array', () => {
      expect(computeBaselineSectionCompleteness([])).toBe(0);
    });
  });

  // -- Mock factory -----------------------------------------------------------

  describe('createMockExecutionBaseline', () => {
    it('creates a valid default baseline in Draft', () => {
      const bl = createMockExecutionBaseline();
      expect(bl.baselineId).toBe('bl-001');
      expect(bl.status).toBe('Draft');
      expect(bl.certificationStatus).toBe('NOT_SUBMITTED');
    });

    it('accepts overrides', () => {
      const bl = createMockExecutionBaseline({ status: 'Approved', planDate: '2026-03-24' });
      expect(bl.status).toBe('Approved');
      expect(bl.planDate).toBe('2026-03-24');
    });
  });
});
