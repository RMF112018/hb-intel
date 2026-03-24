import { describe, expect, it } from 'vitest';

import {
  canRoleAuthorOperationalContent,
  canRoleMutateReadinessState,
  doesAnnotationFlipFinancialStatus,
  doesApprovalFlipFinancialStatus,
  isAnnotationNonMutating,
  isAnnotationStoredInFieldAnnotations,
  isExceptionApprovalRole,
  isPWAOnlyCapability,
  isReviewOnlyRole,
  shouldSPFxLaunchToPWA,
} from '../../index.js';

describe('P3-E13-T08 Stage 6 lanes-permissions business rules', () => {
  describe('isAnnotationNonMutating', () => {
    it('always returns true per T06 §3', () => { expect(isAnnotationNonMutating()).toBe(true); });
  });

  describe('isAnnotationStoredInFieldAnnotations', () => {
    it('always returns true per T06 §3', () => { expect(isAnnotationStoredInFieldAnnotations()).toBe(true); });
  });

  describe('doesAnnotationFlipFinancialStatus', () => {
    it('always returns false per T06 §2', () => { expect(doesAnnotationFlipFinancialStatus()).toBe(false); });
  });

  describe('doesApprovalFlipFinancialStatus', () => {
    it('always returns false per T06 §2', () => { expect(doesApprovalFlipFinancialStatus()).toBe(false); });
  });

  describe('canRoleMutateReadinessState', () => {
    it('returns true for COMPLIANCE_RISK', () => { expect(canRoleMutateReadinessState('COMPLIANCE_RISK')).toBe(true); });
    it('returns false for PM_APM_PA', () => { expect(canRoleMutateReadinessState('PM_APM_PA')).toBe(false); });
    it('returns false for PX', () => { expect(canRoleMutateReadinessState('PX')).toBe(false); });
    it('returns false for PER_REVIEW_ONLY', () => { expect(canRoleMutateReadinessState('PER_REVIEW_ONLY')).toBe(false); });
    it('returns false for READ_ONLY_CONSUMER', () => { expect(canRoleMutateReadinessState('READ_ONLY_CONSUMER')).toBe(false); });
  });

  describe('isReviewOnlyRole', () => {
    it('returns true for PER_REVIEW_ONLY', () => { expect(isReviewOnlyRole('PER_REVIEW_ONLY')).toBe(true); });
    it('returns true for READ_ONLY_CONSUMER', () => { expect(isReviewOnlyRole('READ_ONLY_CONSUMER')).toBe(true); });
    it('returns false for COMPLIANCE_RISK', () => { expect(isReviewOnlyRole('COMPLIANCE_RISK')).toBe(false); });
    it('returns false for PM_APM_PA', () => { expect(isReviewOnlyRole('PM_APM_PA')).toBe(false); });
  });

  describe('canRoleAuthorOperationalContent', () => {
    it('returns true for PM_APM_PA', () => { expect(canRoleAuthorOperationalContent('PM_APM_PA')).toBe(true); });
    it('returns false for COMPLIANCE_RISK', () => { expect(canRoleAuthorOperationalContent('COMPLIANCE_RISK')).toBe(false); });
    it('returns false for PER_REVIEW_ONLY', () => { expect(canRoleAuthorOperationalContent('PER_REVIEW_ONLY')).toBe(false); });
  });

  describe('isExceptionApprovalRole', () => {
    it('returns true for PX', () => { expect(isExceptionApprovalRole('PX')).toBe(true); });
    it('returns true for CFO', () => { expect(isExceptionApprovalRole('CFO')).toBe(true); });
    it('returns true for COMPLIANCE_MANAGER', () => { expect(isExceptionApprovalRole('COMPLIANCE_MANAGER')).toBe(true); });
    it('returns false for PM_APM_PA', () => { expect(isExceptionApprovalRole('PM_APM_PA')).toBe(false); });
    it('returns false for COMPLIANCE_RISK', () => { expect(isExceptionApprovalRole('COMPLIANCE_RISK')).toBe(false); });
  });

  describe('isPWAOnlyCapability', () => {
    it('returns true for DENSE_EVALUATION', () => { expect(isPWAOnlyCapability('DENSE_EVALUATION')).toBe(true); });
    it('returns true for PRECEDENT_MANAGEMENT', () => { expect(isPWAOnlyCapability('PRECEDENT_MANAGEMENT')).toBe(true); });
    it('returns true for all 7 PWA capabilities', () => {
      const pwaCaps = ['DENSE_EVALUATION', 'EXCEPTION_HISTORY', 'ITERATION_DIFF',
        'LINEAGE_INSPECTION', 'CROSS_MODULE_ANALYSIS', 'CASE_DETAIL_AUTHORING', 'PRECEDENT_MANAGEMENT'];
      for (const cap of pwaCaps) {
        expect(isPWAOnlyCapability(cap as never)).toBe(true);
      }
    });
  });

  describe('shouldSPFxLaunchToPWA', () => {
    it('returns true for DENSE_EVALUATION', () => { expect(shouldSPFxLaunchToPWA('DENSE_EVALUATION')).toBe(true); });
    it('returns true for ITERATION_DIFF', () => { expect(shouldSPFxLaunchToPWA('ITERATION_DIFF')).toBe(true); });
    it('returns false for CASE_LIST_SUMMARY (SPFx-native)', () => { expect(shouldSPFxLaunchToPWA('CASE_LIST_SUMMARY')).toBe(false); });
    it('returns false for SIMPLE_APPROVAL_ACTIONS (SPFx-native)', () => { expect(shouldSPFxLaunchToPWA('SIMPLE_APPROVAL_ACTIONS')).toBe(false); });
  });
});
