import { describe, expect, it } from 'vitest';

import {
  canConfirmPermitPosted,
  canStartupWriteToPermitsModule,
  canSubmitPermitPostingCertification,
  isPermitVerificationComplete,
  isPhotoUploadAvailable,
  requiresDiscrepancyReason,
  shouldRaisePermitNotPostedWorkItem,
} from '../../index.js';

import { createMockPermitVerificationDetail } from '../../../testing/createMockPermitVerificationDetail.js';

describe('P3-E11-T10 Stage 4 Startup permit posting verification business rules', () => {
  // -- Verification Completeness (T07 §9.1) ----------------------------------

  describe('isPermitVerificationComplete', () => {
    it('returns true for Yes with all required fields', () => {
      const detail = createMockPermitVerificationDetail({
        verifiedBy: 'user-001',
        verifiedAt: '2026-03-24T10:00:00Z',
        physicalEvidenceAttachmentIds: ['photo-001'],
      });
      expect(isPermitVerificationComplete(detail, 'Yes')).toBe(true);
    });

    it('returns false for Yes missing verifiedBy', () => {
      const detail = createMockPermitVerificationDetail({
        verifiedAt: '2026-03-24T10:00:00Z',
        physicalEvidenceAttachmentIds: ['photo-001'],
      });
      expect(isPermitVerificationComplete(detail, 'Yes')).toBe(false);
    });

    it('returns false for Yes missing verifiedAt', () => {
      const detail = createMockPermitVerificationDetail({
        verifiedBy: 'user-001',
        physicalEvidenceAttachmentIds: ['photo-001'],
      });
      expect(isPermitVerificationComplete(detail, 'Yes')).toBe(false);
    });

    it('returns false for Yes missing evidence', () => {
      const detail = createMockPermitVerificationDetail({
        verifiedBy: 'user-001',
        verifiedAt: '2026-03-24T10:00:00Z',
      });
      expect(isPermitVerificationComplete(detail, 'Yes')).toBe(false);
    });

    it('returns true for No with discrepancyReason', () => {
      const detail = createMockPermitVerificationDetail({
        discrepancyReason: 'Permit not yet issued by AHJ',
      });
      expect(isPermitVerificationComplete(detail, 'No')).toBe(true);
    });

    it('returns false for No without discrepancyReason', () => {
      const detail = createMockPermitVerificationDetail();
      expect(isPermitVerificationComplete(detail, 'No')).toBe(false);
    });

    it('returns false for No with empty discrepancyReason', () => {
      const detail = createMockPermitVerificationDetail({ discrepancyReason: '' });
      expect(isPermitVerificationComplete(detail, 'No')).toBe(false);
    });

    it('returns true for NA regardless of detail fields', () => {
      const detail = createMockPermitVerificationDetail();
      expect(isPermitVerificationComplete(detail, 'NA')).toBe(true);
    });

    it('returns false for null result', () => {
      const detail = createMockPermitVerificationDetail();
      expect(isPermitVerificationComplete(detail, null)).toBe(false);
    });
  });

  // -- Confirm Permit Posted (T07 §9.1) --------------------------------------

  describe('canConfirmPermitPosted', () => {
    it('returns true when all 3 fields populated', () => {
      const detail = createMockPermitVerificationDetail({
        verifiedBy: 'user-001',
        verifiedAt: '2026-03-24T10:00:00Z',
        physicalEvidenceAttachmentIds: ['photo-001'],
      });
      expect(canConfirmPermitPosted(detail)).toBe(true);
    });

    it('returns false when verifiedBy is null', () => {
      const detail = createMockPermitVerificationDetail({
        verifiedAt: '2026-03-24T10:00:00Z',
        physicalEvidenceAttachmentIds: ['photo-001'],
      });
      expect(canConfirmPermitPosted(detail)).toBe(false);
    });

    it('returns false when evidence is empty', () => {
      const detail = createMockPermitVerificationDetail({
        verifiedBy: 'user-001',
        verifiedAt: '2026-03-24T10:00:00Z',
        physicalEvidenceAttachmentIds: [],
      });
      expect(canConfirmPermitPosted(detail)).toBe(false);
    });

    it('returns true with multiple evidence items', () => {
      const detail = createMockPermitVerificationDetail({
        verifiedBy: 'user-001',
        verifiedAt: '2026-03-24T10:00:00Z',
        physicalEvidenceAttachmentIds: ['photo-001', 'photo-002'],
      });
      expect(canConfirmPermitPosted(detail)).toBe(true);
    });
  });

  // -- Discrepancy Requirement (T07 §9.4) ------------------------------------

  describe('requiresDiscrepancyReason', () => {
    it('returns true for No', () => {
      expect(requiresDiscrepancyReason('No')).toBe(true);
    });

    it('returns false for Yes', () => {
      expect(requiresDiscrepancyReason('Yes')).toBe(false);
    });

    it('returns false for NA', () => {
      expect(requiresDiscrepancyReason('NA')).toBe(false);
    });

    it('returns false for null', () => {
      expect(requiresDiscrepancyReason(null)).toBe(false);
    });
  });

  // -- Work Queue (T07 §9.4) -------------------------------------------------

  describe('shouldRaisePermitNotPostedWorkItem', () => {
    it('returns true for No', () => {
      expect(shouldRaisePermitNotPostedWorkItem('No')).toBe(true);
    });

    it('returns false for Yes', () => {
      expect(shouldRaisePermitNotPostedWorkItem('Yes')).toBe(false);
    });

    it('returns false for NA', () => {
      expect(shouldRaisePermitNotPostedWorkItem('NA')).toBe(false);
    });

    it('returns false for null', () => {
      expect(shouldRaisePermitNotPostedWorkItem(null)).toBe(false);
    });
  });

  // -- Certification Eligibility (T07 §9.5) ----------------------------------

  describe('canSubmitPermitPostingCertification', () => {
    it('returns true when all items assessed and verified', () => {
      const items = [
        { taskInstanceId: 'a', result: 'Yes' as const },
        { taskInstanceId: 'b', result: 'NA' as const },
      ];
      const details = [{
        taskInstanceId: 'a',
        verifiedBy: 'user-001',
        verifiedAt: '2026-03-24T10:00:00Z',
        physicalEvidenceAttachmentIds: ['photo-001'],
        discrepancyReason: null,
      }];
      expect(canSubmitPermitPostingCertification(items, details)).toBe(true);
    });

    it('returns false when any item has null result', () => {
      const items = [
        { taskInstanceId: 'a', result: 'Yes' as const },
        { taskInstanceId: 'b', result: null },
      ];
      expect(canSubmitPermitPostingCertification(items, [])).toBe(false);
    });

    it('returns false when Yes item missing evidence', () => {
      const items = [{ taskInstanceId: 'a', result: 'Yes' as const }];
      const details = [{
        taskInstanceId: 'a',
        verifiedBy: 'user-001',
        verifiedAt: '2026-03-24T10:00:00Z',
        physicalEvidenceAttachmentIds: [] as string[],
        discrepancyReason: null,
      }];
      expect(canSubmitPermitPostingCertification(items, details)).toBe(false);
    });

    it('returns false when Yes item has no detail record', () => {
      const items = [{ taskInstanceId: 'a', result: 'Yes' as const }];
      expect(canSubmitPermitPostingCertification(items, [])).toBe(false);
    });

    it('returns true when No item has discrepancy reason', () => {
      const items = [{ taskInstanceId: 'a', result: 'No' as const }];
      const details = [{
        taskInstanceId: 'a',
        verifiedBy: null,
        verifiedAt: null,
        physicalEvidenceAttachmentIds: [] as string[],
        discrepancyReason: 'Permit pending inspection',
      }];
      expect(canSubmitPermitPostingCertification(items, details)).toBe(true);
    });

    it('returns false when No item missing discrepancy reason', () => {
      const items = [{ taskInstanceId: 'a', result: 'No' as const }];
      const details = [{
        taskInstanceId: 'a',
        verifiedBy: null,
        verifiedAt: null,
        physicalEvidenceAttachmentIds: [] as string[],
        discrepancyReason: null,
      }];
      expect(canSubmitPermitPostingCertification(items, details)).toBe(false);
    });

    it('skips NA items entirely', () => {
      const items = [
        { taskInstanceId: 'a', result: 'NA' as const },
        { taskInstanceId: 'b', result: 'NA' as const },
      ];
      expect(canSubmitPermitPostingCertification(items, [])).toBe(true);
    });
  });

  // -- Non-Interference (T07 §8.1) -------------------------------------------

  describe('canStartupWriteToPermitsModule', () => {
    it('always returns false', () => {
      expect(canStartupWriteToPermitsModule()).toBe(false);
    });
  });

  // -- PWA/SPFx Depth (T09 §7.2) ---------------------------------------------

  describe('isPhotoUploadAvailable', () => {
    it('returns true for PWA', () => {
      expect(isPhotoUploadAvailable('PWA')).toBe(true);
    });

    it('returns false for SPFx', () => {
      expect(isPhotoUploadAvailable('SPFx')).toBe(false);
    });
  });

  // -- Mock factory -----------------------------------------------------------

  describe('createMockPermitVerificationDetail', () => {
    it('creates a valid default detail', () => {
      const detail = createMockPermitVerificationDetail();
      expect(detail.detailId).toBe('pvd-001');
      expect(detail.permitType).toBe('Master');
      expect(detail.verifiedBy).toBeNull();
      expect(detail.physicalEvidenceAttachmentIds).toEqual([]);
    });

    it('accepts overrides', () => {
      const detail = createMockPermitVerificationDetail({
        permitType: 'Electrical',
        verifiedBy: 'user-001',
      });
      expect(detail.permitType).toBe('Electrical');
      expect(detail.verifiedBy).toBe('user-001');
    });
  });
});
