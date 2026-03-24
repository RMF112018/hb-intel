import { describe, expect, it } from 'vitest';

import {
  canEditIteration,
  canPublishAsPrecedent,
  doesDelegationPreserveSlot,
  doesPrecedentAutoApprove,
  doesPrecedentAutoSatisfy,
  doesPrecedentBypassLocalEvaluation,
  getSlotActionForIteration,
  isApprovalSequenceComplete,
  isDelegationValid,
  isIterationImmutable,
  isSlotActionComplete,
  isSlotRequired,
} from '../../index.js';

import type {
  IExceptionApprovalAction,
  IExceptionApprovalSlot,
} from '../../index.js';

const createMockSlot = (
  overrides: Partial<IExceptionApprovalSlot> = {},
): IExceptionApprovalSlot => ({
  approvalSlotId: 'slot-001',
  exceptionCaseId: 'exc-001',
  slotRole: 'PX',
  slotSequence: 1,
  assignedUserId: 'user-001',
  slotRequired: true,
  slotStatus: 'PENDING',
  ...overrides,
});

const createMockAction = (
  overrides: Partial<IExceptionApprovalAction> = {},
): IExceptionApprovalAction => ({
  approvalActionId: 'action-001',
  approvalSlotId: 'slot-001',
  exceptionSubmissionIterationId: 'iter-001',
  actorUserId: 'user-001',
  actionOutcome: 'APPROVED',
  actionNotes: null,
  actionTimestamp: '2026-03-24T00:00:00Z',
  ...overrides,
});

describe('P3-E13-T08 Stage 4 exception-governance business rules', () => {
  // -- Iteration Immutability (T04 §2.1)
  describe('isIterationImmutable', () => {
    it('returns true for SUBMITTED', () => {
      expect(isIterationImmutable('SUBMITTED')).toBe(true);
    });
    it('returns true for UNDER_REVIEW', () => {
      expect(isIterationImmutable('UNDER_REVIEW')).toBe(true);
    });
    it('returns true for REJECTED', () => {
      expect(isIterationImmutable('REJECTED')).toBe(true);
    });
    it('returns true for WITHDRAWN', () => {
      expect(isIterationImmutable('WITHDRAWN')).toBe(true);
    });
    it('returns false for DRAFT', () => {
      expect(isIterationImmutable('DRAFT')).toBe(false);
    });
  });

  describe('canEditIteration', () => {
    it('returns true for DRAFT', () => {
      expect(canEditIteration('DRAFT')).toBe(true);
    });
    it('returns false for SUBMITTED', () => {
      expect(canEditIteration('SUBMITTED')).toBe(false);
    });
    it('returns false for REJECTED', () => {
      expect(canEditIteration('REJECTED')).toBe(false);
    });
  });

  // -- Slot Validation (T04 §3.1)
  describe('isSlotRequired', () => {
    it('returns true for required slot', () => {
      expect(isSlotRequired(createMockSlot({ slotRequired: true }))).toBe(true);
    });
    it('returns false for optional slot', () => {
      expect(isSlotRequired(createMockSlot({ slotRequired: false }))).toBe(false);
    });
  });

  describe('isSlotActionComplete', () => {
    it('returns true for APPROVED', () => {
      expect(isSlotActionComplete('APPROVED')).toBe(true);
    });
    it('returns true for REJECTED', () => {
      expect(isSlotActionComplete('REJECTED')).toBe(true);
    });
    it('returns true for RETURNED', () => {
      expect(isSlotActionComplete('RETURNED')).toBe(true);
    });
    it('returns false for PENDING', () => {
      expect(isSlotActionComplete('PENDING')).toBe(false);
    });
    it('returns false for DELEGATED', () => {
      expect(isSlotActionComplete('DELEGATED')).toBe(false);
    });
  });

  describe('isApprovalSequenceComplete', () => {
    it('returns true when all required slots are resolved', () => {
      const slots = [
        createMockSlot({ slotRequired: true, slotStatus: 'APPROVED' }),
        createMockSlot({ approvalSlotId: 'slot-002', slotRequired: true, slotStatus: 'APPROVED' }),
      ];
      expect(isApprovalSequenceComplete(slots)).toBe(true);
    });

    it('returns false when a required slot is still PENDING', () => {
      const slots = [
        createMockSlot({ slotRequired: true, slotStatus: 'APPROVED' }),
        createMockSlot({ approvalSlotId: 'slot-002', slotRequired: true, slotStatus: 'PENDING' }),
      ];
      expect(isApprovalSequenceComplete(slots)).toBe(false);
    });

    it('returns true when only optional slots are PENDING', () => {
      const slots = [
        createMockSlot({ slotRequired: true, slotStatus: 'APPROVED' }),
        createMockSlot({ approvalSlotId: 'slot-002', slotRequired: false, slotStatus: 'PENDING' }),
      ];
      expect(isApprovalSequenceComplete(slots)).toBe(true);
    });

    it('returns true for empty slots array', () => {
      expect(isApprovalSequenceComplete([])).toBe(true);
    });

    it('returns true when required slot is REJECTED (terminal)', () => {
      const slots = [
        createMockSlot({ slotRequired: true, slotStatus: 'REJECTED' }),
      ];
      expect(isApprovalSequenceComplete(slots)).toBe(true);
    });
  });

  // -- Delegation (T04 §4.2)
  describe('isDelegationValid', () => {
    it('returns true when delegator is current assignee and slot is PENDING', () => {
      expect(isDelegationValid(createMockSlot(), 'user-001')).toBe(true);
    });

    it('returns false when delegator is not the current assignee', () => {
      expect(isDelegationValid(createMockSlot(), 'user-999')).toBe(false);
    });

    it('returns false when slot is not PENDING', () => {
      expect(isDelegationValid(createMockSlot({ slotStatus: 'APPROVED' }), 'user-001')).toBe(false);
    });
  });

  describe('doesDelegationPreserveSlot', () => {
    it('returns true when role is preserved', () => {
      expect(doesDelegationPreserveSlot('PX', 'PX')).toBe(true);
    });
    it('returns false when role changes', () => {
      expect(doesDelegationPreserveSlot('PX', 'CFO')).toBe(false);
    });
  });

  // -- Precedent Publication (T04 §6)
  describe('canPublishAsPrecedent', () => {
    it('returns true when all required slots approved', () => {
      expect(canPublishAsPrecedent(true)).toBe(true);
    });
    it('returns false when not all required slots approved', () => {
      expect(canPublishAsPrecedent(false)).toBe(false);
    });
  });

  describe('precedent prohibitions', () => {
    it('doesPrecedentAutoApprove always returns false', () => {
      expect(doesPrecedentAutoApprove()).toBe(false);
    });
    it('doesPrecedentAutoSatisfy always returns false', () => {
      expect(doesPrecedentAutoSatisfy()).toBe(false);
    });
    it('doesPrecedentBypassLocalEvaluation always returns false', () => {
      expect(doesPrecedentBypassLocalEvaluation()).toBe(false);
    });
  });

  // -- Action Lookup (T04 §3.2)
  describe('getSlotActionForIteration', () => {
    const actions = [
      createMockAction({ approvalSlotId: 'slot-001', exceptionSubmissionIterationId: 'iter-001' }),
      createMockAction({ approvalActionId: 'action-002', approvalSlotId: 'slot-002', exceptionSubmissionIterationId: 'iter-001' }),
      createMockAction({ approvalActionId: 'action-003', approvalSlotId: 'slot-001', exceptionSubmissionIterationId: 'iter-002' }),
    ];

    it('returns matching action for slot and iteration', () => {
      const result = getSlotActionForIteration(actions, 'slot-001', 'iter-001');
      expect(result).toBeDefined();
      expect(result?.approvalActionId).toBe('action-001');
    });

    it('returns undefined for non-matching slot', () => {
      expect(getSlotActionForIteration(actions, 'slot-999', 'iter-001')).toBeUndefined();
    });

    it('returns undefined for non-matching iteration', () => {
      expect(getSlotActionForIteration(actions, 'slot-001', 'iter-999')).toBeUndefined();
    });

    it('returns correct action for slot-001 iter-002', () => {
      const result = getSlotActionForIteration(actions, 'slot-001', 'iter-002');
      expect(result?.approvalActionId).toBe('action-003');
    });
  });
});
