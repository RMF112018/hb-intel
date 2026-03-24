import { describe, expect, it } from 'vitest';

import {
  computeCertificationStatus,
  shouldCascadeDesignation,
  isAcknowledgmentEvidenceRequired,
  isOrientationComplete,
  areRequiredSubmissionsApproved,
  isSubmissionResubmissionRequired,
  canUpgradeWorkerIdentity,
  hasSdsComplianceGap,
} from '../../index.js';

describe('P3-E8-T07 Compliance business rules', () => {
  // =========================================================================
  // Certification Status (§3)
  // =========================================================================

  describe('computeCertificationStatus', () => {
    it('null expiration → ACTIVE', () => {
      const result = computeCertificationStatus(null, false, '2026-03-24');
      expect(result.status).toBe('ACTIVE');
      expect(result.daysToExpiration).toBeNull();
    });

    it('future expiration > 30 days → ACTIVE', () => {
      const result = computeCertificationStatus('2026-06-01', false, '2026-03-24');
      expect(result.status).toBe('ACTIVE');
      expect(result.daysToExpiration).toBeGreaterThan(30);
    });

    it('expiration within 30 days → EXPIRING_SOON', () => {
      const result = computeCertificationStatus('2026-04-10', false, '2026-03-24');
      expect(result.status).toBe('EXPIRING_SOON');
      expect(result.daysToExpiration).toBeLessThanOrEqual(30);
      expect(result.daysToExpiration).toBeGreaterThanOrEqual(0);
    });

    it('past expiration → EXPIRED', () => {
      const result = computeCertificationStatus('2026-03-01', false, '2026-03-24');
      expect(result.status).toBe('EXPIRED');
      expect(result.daysToExpiration).toBeLessThan(0);
    });

    it('revoked flag overrides date → REVOKED', () => {
      const result = computeCertificationStatus('2026-06-01', true, '2026-03-24');
      expect(result.status).toBe('REVOKED');
    });

    it('revoked with null expiration → REVOKED', () => {
      const result = computeCertificationStatus(null, true, '2026-03-24');
      expect(result.status).toBe('REVOKED');
    });

    it('exactly 30 days → EXPIRING_SOON', () => {
      const result = computeCertificationStatus('2026-04-23', false, '2026-03-24');
      expect(result.status).toBe('EXPIRING_SOON');
      expect(result.daysToExpiration).toBe(30);
    });
  });

  // =========================================================================
  // Designation Cascade (§5.4)
  // =========================================================================

  describe('shouldCascadeDesignation', () => {
    it('EXPIRED → cascade', () => { expect(shouldCascadeDesignation('EXPIRED')).toBe(true); });
    it('REVOKED → cascade', () => { expect(shouldCascadeDesignation('REVOKED')).toBe(true); });
    it('ACTIVE → no cascade', () => { expect(shouldCascadeDesignation('ACTIVE')).toBe(false); });
    it('EXPIRING_SOON → no cascade', () => { expect(shouldCascadeDesignation('EXPIRING_SOON')).toBe(false); });
  });

  // =========================================================================
  // Acknowledgment Evidence (§1)
  // =========================================================================

  describe('isAcknowledgmentEvidenceRequired', () => {
    it('PHYSICAL_SIGNATURE → required', () => {
      expect(isAcknowledgmentEvidenceRequired('PHYSICAL_SIGNATURE')).toBe(true);
    });

    it('DIGITAL_SIGNATURE → not required', () => {
      expect(isAcknowledgmentEvidenceRequired('DIGITAL_SIGNATURE')).toBe(false);
    });

    it('VERBAL_CONFIRMED → not required', () => {
      expect(isAcknowledgmentEvidenceRequired('VERBAL_CONFIRMED')).toBe(false);
    });
  });

  // =========================================================================
  // Orientation Completeness (§1)
  // =========================================================================

  describe('isOrientationComplete', () => {
    it('COMPLETE + acknowledged → true', () => {
      expect(isOrientationComplete('COMPLETE', '2026-03-24T10:00:00Z')).toBe(true);
    });

    it('COMPLETE + null acknowledged → false', () => {
      expect(isOrientationComplete('COMPLETE', null)).toBe(false);
    });

    it('PENDING_ACKNOWLEDGMENT + acknowledged → false', () => {
      expect(isOrientationComplete('PENDING_ACKNOWLEDGMENT', '2026-03-24T10:00:00Z')).toBe(false);
    });

    it('VOIDED → false', () => {
      expect(isOrientationComplete('VOIDED', null)).toBe(false);
    });
  });

  // =========================================================================
  // Submission Review (§2)
  // =========================================================================

  describe('areRequiredSubmissionsApproved', () => {
    it('all required types APPROVED → true', () => {
      expect(areRequiredSubmissionsApproved(
        [
          { submissionType: 'COMPANY_SAFETY_PLAN', status: 'APPROVED' },
          { submissionType: 'HAZARD_COMMUNICATION', status: 'APPROVED' },
        ],
        ['COMPANY_SAFETY_PLAN', 'HAZARD_COMMUNICATION'],
      )).toBe(true);
    });

    it('missing required type → false', () => {
      expect(areRequiredSubmissionsApproved(
        [{ submissionType: 'COMPANY_SAFETY_PLAN', status: 'APPROVED' }],
        ['COMPANY_SAFETY_PLAN', 'HAZARD_COMMUNICATION'],
      )).toBe(false);
    });

    it('required type present but REJECTED → false', () => {
      expect(areRequiredSubmissionsApproved(
        [
          { submissionType: 'COMPANY_SAFETY_PLAN', status: 'APPROVED' },
          { submissionType: 'HAZARD_COMMUNICATION', status: 'REJECTED' },
        ],
        ['COMPANY_SAFETY_PLAN', 'HAZARD_COMMUNICATION'],
      )).toBe(false);
    });

    it('no required types → true', () => {
      expect(areRequiredSubmissionsApproved([], [])).toBe(true);
    });
  });

  describe('isSubmissionResubmissionRequired', () => {
    it('REJECTED → true', () => { expect(isSubmissionResubmissionRequired('REJECTED')).toBe(true); });
    it('REVISION_REQUESTED → true', () => { expect(isSubmissionResubmissionRequired('REVISION_REQUESTED')).toBe(true); });
    it('APPROVED → false', () => { expect(isSubmissionResubmissionRequired('APPROVED')).toBe(false); });
    it('PENDING_REVIEW → false', () => { expect(isSubmissionResubmissionRequired('PENDING_REVIEW')).toBe(false); });
  });

  // =========================================================================
  // Workforce Identity (§6)
  // =========================================================================

  describe('canUpgradeWorkerIdentity', () => {
    it('null workerId (provisional) → can upgrade', () => {
      expect(canUpgradeWorkerIdentity(null)).toBe(true);
    });

    it('non-null workerId (governed) → already linked', () => {
      expect(canUpgradeWorkerIdentity('worker-001')).toBe(false);
    });
  });

  // =========================================================================
  // SDS Compliance (§4)
  // =========================================================================

  describe('hasSdsComplianceGap', () => {
    it('active products with ACTIVE SDS → no gap', () => {
      expect(hasSdsComplianceGap(
        ['Product A'],
        [{ productName: 'Product A', status: 'ACTIVE' }],
      )).toBe(false);
    });

    it('active products without SDS → gap', () => {
      expect(hasSdsComplianceGap(
        ['Product A', 'Product B'],
        [{ productName: 'Product A', status: 'ACTIVE' }],
      )).toBe(true);
    });

    it('product with SUPERSEDED SDS only → gap', () => {
      expect(hasSdsComplianceGap(
        ['Product A'],
        [{ productName: 'Product A', status: 'SUPERSEDED' }],
      )).toBe(true);
    });

    it('no active products → no gap', () => {
      expect(hasSdsComplianceGap([], [])).toBe(false);
    });
  });
});
