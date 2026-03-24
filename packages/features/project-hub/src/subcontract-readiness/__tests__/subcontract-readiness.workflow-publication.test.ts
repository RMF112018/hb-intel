import { describe, expect, it } from 'vitest';

import {
  canBuildBespokeApprovalRouting,
  canUseLocalNotificationSystem,
  canUseLocalReminderTable,
  getTimerAnchor,
  isEscalationPolicyDriven,
  isLocalSubstituteProhibited,
  isPublicationDownstreamOnly,
  isRoutedWorkItem,
  isSharedPackageRequired,
  isTimerAnchoredToSubmission,
  READINESS_TIMER_TYPES,
  REQUIRED_SHARED_PACKAGES,
} from '../../index.js';

describe('P3-E13-T08 Stage 5 workflow-publication business rules', () => {
  // -- Timer Validation (T05 §2.1)
  describe('isTimerAnchoredToSubmission', () => {
    it('returns true for PENDING_EVALUATOR_REVIEW', () => {
      expect(isTimerAnchoredToSubmission('PENDING_EVALUATOR_REVIEW')).toBe(true);
    });
    it('returns true for PENDING_EXCEPTION_APPROVAL', () => {
      expect(isTimerAnchoredToSubmission('PENDING_EXCEPTION_APPROVAL')).toBe(true);
    });
    it('returns false for MISSING_PACKAGE_ITEM', () => {
      expect(isTimerAnchoredToSubmission('MISSING_PACKAGE_ITEM')).toBe(false);
    });
    it('returns false for UPCOMING_EXPIRATION_OR_RENEWAL', () => {
      expect(isTimerAnchoredToSubmission('UPCOMING_EXPIRATION_OR_RENEWAL')).toBe(false);
    });
    it('returns false for STALE_DECISION_NEAR_EXECUTION', () => {
      expect(isTimerAnchoredToSubmission('STALE_DECISION_NEAR_EXECUTION')).toBe(false);
    });
  });

  describe('getTimerAnchor', () => {
    it('returns anchor for every timer type', () => {
      for (const t of READINESS_TIMER_TYPES) {
        expect(getTimerAnchor(t)).toBeDefined();
      }
    });
  });

  // -- Routed Output Guards (T05 §3)
  describe('isRoutedWorkItem', () => {
    it('always returns true', () => {
      expect(isRoutedWorkItem()).toBe(true);
    });
  });

  describe('isEscalationPolicyDriven', () => {
    it('always returns true', () => {
      expect(isEscalationPolicyDriven()).toBe(true);
    });
  });

  // -- Publication Guards (T05 §4)
  describe('isPublicationDownstreamOnly', () => {
    it('always returns true', () => {
      expect(isPublicationDownstreamOnly()).toBe(true);
    });
  });

  // -- Shared Package Use (T05 §5)
  describe('isSharedPackageRequired', () => {
    it('returns true for all 10 required packages', () => {
      for (const pkg of REQUIRED_SHARED_PACKAGES) {
        expect(isSharedPackageRequired(pkg)).toBe(true);
      }
    });
  });

  // -- Local Substitute Prohibition (T05 §5.1)
  describe('isLocalSubstituteProhibited', () => {
    it('returns true for LOCAL_REMINDER_TABLE', () => {
      expect(isLocalSubstituteProhibited('LOCAL_REMINDER_TABLE')).toBe(true);
    });
    it('returns true for LOCAL_NOTIFICATION_SYSTEM', () => {
      expect(isLocalSubstituteProhibited('LOCAL_NOTIFICATION_SYSTEM')).toBe(true);
    });
    it('returns true for LOCAL_NEXT_MOVE_PROMPT', () => {
      expect(isLocalSubstituteProhibited('LOCAL_NEXT_MOVE_PROMPT')).toBe(true);
    });
    it('returns true for BESPOKE_APPROVAL_ROUTING', () => {
      expect(isLocalSubstituteProhibited('BESPOKE_APPROVAL_ROUTING')).toBe(true);
    });
    it('returns true for LOCAL_ANNOTATION_STORE', () => {
      expect(isLocalSubstituteProhibited('LOCAL_ANNOTATION_STORE')).toBe(true);
    });
    it('returns true for LOCAL_HISTORY_SYSTEM', () => {
      expect(isLocalSubstituteProhibited('LOCAL_HISTORY_SYSTEM')).toBe(true);
    });
  });

  describe('prohibition guards', () => {
    it('canUseLocalReminderTable always returns false', () => {
      expect(canUseLocalReminderTable()).toBe(false);
    });
    it('canUseLocalNotificationSystem always returns false', () => {
      expect(canUseLocalNotificationSystem()).toBe(false);
    });
    it('canBuildBespokeApprovalRouting always returns false', () => {
      expect(canBuildBespokeApprovalRouting()).toBe(false);
    });
  });
});
