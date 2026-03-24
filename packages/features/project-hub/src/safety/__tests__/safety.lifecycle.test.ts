import { describe, expect, it } from 'vitest';

import {
  // State machine
  isTerminalSSSPStatus,
  isValidSSSPTransition,
  transitionSSSPStatus,
  isTerminalAddendumStatus,
  isValidAddendumTransition,
  transitionAddendumStatus,
  // Business rules
  isSSSPApprovalComplete,
  isAddendumApprovalComplete,
  canEditSSSPSection,
  isMaterialChange,
  canDraftAddendum,
  getRequiredApproversForAddendum,
  getRequiredApproversForBasePlan,
  createEmptySSSPApproval,
  createEmptyAddendumApproval,
} from '../../index.js';

import type { ISSSPApproval, ISSSPAddendumApproval, ISSSPApprovalSignature } from '../../index.js';

const mockSignature: ISSSPApprovalSignature = {
  userId: 'user-001',
  userName: 'Test User',
  role: 'SAFETY_MANAGER',
  signedAt: '2026-03-24T10:00:00Z',
  signatureMethod: 'DIGITAL',
  comments: null,
};

describe('P3-E8-T03 SSSP lifecycle business rules', () => {
  // =========================================================================
  // SSSP Base Plan State Machine
  // =========================================================================

  describe('SSSP state machine', () => {
    it('SUPERSEDED is terminal', () => {
      expect(isTerminalSSSPStatus('SUPERSEDED')).toBe(true);
    });

    it('DRAFT is not terminal', () => {
      expect(isTerminalSSSPStatus('DRAFT')).toBe(false);
    });

    it('APPROVED is not terminal (can be superseded)', () => {
      expect(isTerminalSSSPStatus('APPROVED')).toBe(false);
    });

    it('allows DRAFT → PENDING_APPROVAL', () => {
      expect(isValidSSSPTransition('DRAFT', 'PENDING_APPROVAL')).toBe(true);
    });

    it('allows PENDING_APPROVAL → APPROVED', () => {
      expect(isValidSSSPTransition('PENDING_APPROVAL', 'APPROVED')).toBe(true);
    });

    it('allows PENDING_APPROVAL → DRAFT (rejection)', () => {
      expect(isValidSSSPTransition('PENDING_APPROVAL', 'DRAFT')).toBe(true);
    });

    it('allows APPROVED → SUPERSEDED', () => {
      expect(isValidSSSPTransition('APPROVED', 'SUPERSEDED')).toBe(true);
    });

    it('rejects DRAFT → APPROVED (must go through PENDING_APPROVAL)', () => {
      expect(isValidSSSPTransition('DRAFT', 'APPROVED')).toBe(false);
    });

    it('rejects transition from SUPERSEDED', () => {
      const result = transitionSSSPStatus('SUPERSEDED', 'DRAFT');
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('terminal')]),
      );
    });

    it('returns valid for legal transition', () => {
      const result = transitionSSSPStatus('DRAFT', 'PENDING_APPROVAL');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('returns invalid with error for illegal transition', () => {
      const result = transitionSSSPStatus('DRAFT', 'APPROVED');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // SSSP Addendum State Machine
  // =========================================================================

  describe('Addendum state machine', () => {
    it('APPROVED is terminal for addendum', () => {
      expect(isTerminalAddendumStatus('APPROVED')).toBe(true);
    });

    it('VOIDED is terminal for addendum', () => {
      expect(isTerminalAddendumStatus('VOIDED')).toBe(true);
    });

    it('DRAFT is not terminal', () => {
      expect(isTerminalAddendumStatus('DRAFT')).toBe(false);
    });

    it('allows DRAFT → PENDING_APPROVAL', () => {
      expect(isValidAddendumTransition('DRAFT', 'PENDING_APPROVAL')).toBe(true);
    });

    it('allows DRAFT → VOIDED', () => {
      expect(isValidAddendumTransition('DRAFT', 'VOIDED')).toBe(true);
    });

    it('allows PENDING_APPROVAL → APPROVED', () => {
      expect(isValidAddendumTransition('PENDING_APPROVAL', 'APPROVED')).toBe(true);
    });

    it('allows PENDING_APPROVAL → DRAFT (rejection)', () => {
      expect(isValidAddendumTransition('PENDING_APPROVAL', 'DRAFT')).toBe(true);
    });

    it('rejects transition from APPROVED', () => {
      const result = transitionAddendumStatus('APPROVED', 'DRAFT');
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('terminal')]),
      );
    });
  });

  // =========================================================================
  // Approval Completeness
  // =========================================================================

  describe('isSSSPApprovalComplete', () => {
    it('returns false when empty', () => {
      expect(isSSSPApprovalComplete(createEmptySSSPApproval())).toBe(false);
    });

    it('returns false with only Safety Manager signed', () => {
      const approval: ISSSPApproval = {
        ...createEmptySSSPApproval(),
        safetyManagerApproval: mockSignature,
      };
      expect(isSSSPApprovalComplete(approval)).toBe(false);
    });

    it('returns false with 2 of 3 signed', () => {
      const approval: ISSSPApproval = {
        ...createEmptySSSPApproval(),
        safetyManagerApproval: mockSignature,
        pmApproval: { ...mockSignature, role: 'PM' },
      };
      expect(isSSSPApprovalComplete(approval)).toBe(false);
    });

    it('returns true when all 3 have signed', () => {
      const approval: ISSSPApproval = {
        ...createEmptySSSPApproval(),
        safetyManagerApproval: mockSignature,
        pmApproval: { ...mockSignature, role: 'PM' },
        superintendentApproval: { ...mockSignature, role: 'SUPERINTENDENT' },
      };
      expect(isSSSPApprovalComplete(approval)).toBe(true);
    });
  });

  describe('isAddendumApprovalComplete', () => {
    it('returns false when empty (non-operational)', () => {
      expect(isAddendumApprovalComplete(createEmptyAddendumApproval(), false)).toBe(false);
    });

    it('returns true with only Safety Manager for non-operational addendum', () => {
      const approval: ISSSPAddendumApproval = {
        ...createEmptyAddendumApproval(),
        safetyManagerApproval: mockSignature,
      };
      expect(isAddendumApprovalComplete(approval, false)).toBe(true);
    });

    it('returns false with only Safety Manager for operational addendum', () => {
      const approval: ISSSPAddendumApproval = {
        ...createEmptyAddendumApproval(),
        safetyManagerApproval: mockSignature,
      };
      expect(isAddendumApprovalComplete(approval, true)).toBe(false);
    });

    it('returns true with all 3 for operational addendum', () => {
      const approval: ISSSPAddendumApproval = {
        ...createEmptyAddendumApproval(),
        safetyManagerApproval: mockSignature,
        pmApproval: { ...mockSignature, role: 'PM' },
        superintendentApproval: { ...mockSignature, role: 'SUPERINTENDENT' },
      };
      expect(isAddendumApprovalComplete(approval, true)).toBe(true);
    });
  });

  // =========================================================================
  // Edit Access
  // =========================================================================

  describe('canEditSSSPSection', () => {
    it('Safety Manager can edit governed section in DRAFT', () => {
      expect(canEditSSSPSection('DRAFT', 'HAZARD_IDENTIFICATION', 'SafetyManager')).toBe(true);
    });

    it('ProjectManager cannot edit governed section in DRAFT', () => {
      expect(canEditSSSPSection('DRAFT', 'HAZARD_IDENTIFICATION', 'ProjectManager')).toBe(false);
    });

    it('ProjectManager can edit instance section in DRAFT', () => {
      expect(canEditSSSPSection('DRAFT', 'PROJECT_CONTACTS', 'ProjectManager')).toBe(true);
    });

    it('Superintendent can edit instance section in DRAFT', () => {
      expect(canEditSSSPSection('DRAFT', 'SUBCONTRACTOR_LIST', 'Superintendent')).toBe(true);
    });

    it('no one can edit in PENDING_APPROVAL', () => {
      expect(canEditSSSPSection('PENDING_APPROVAL', 'HAZARD_IDENTIFICATION', 'SafetyManager')).toBe(false);
      expect(canEditSSSPSection('PENDING_APPROVAL', 'PROJECT_CONTACTS', 'ProjectManager')).toBe(false);
    });

    it('no one can edit in APPROVED', () => {
      expect(canEditSSSPSection('APPROVED', 'PROJECT_CONTACTS', 'SafetyManager')).toBe(false);
    });

    it('no one can edit in SUPERSEDED', () => {
      expect(canEditSSSPSection('SUPERSEDED', 'PROJECT_CONTACTS', 'SafetyManager')).toBe(false);
    });
  });

  // =========================================================================
  // Material Change Detection
  // =========================================================================

  describe('isMaterialChange', () => {
    it('returns true for governed section (HAZARD_IDENTIFICATION)', () => {
      expect(isMaterialChange(['HAZARD_IDENTIFICATION'])).toBe(true);
    });

    it('returns true for EMERGENCY_RESPONSE', () => {
      expect(isMaterialChange(['EMERGENCY_RESPONSE'])).toBe(true);
    });

    it('returns false for instance section only', () => {
      expect(isMaterialChange(['PROJECT_CONTACTS'])).toBe(false);
    });

    it('returns false for multiple instance sections', () => {
      expect(isMaterialChange(['PROJECT_CONTACTS', 'SUBCONTRACTOR_LIST'])).toBe(false);
    });

    it('returns true if any section is material', () => {
      expect(isMaterialChange(['PROJECT_CONTACTS', 'HAZARD_IDENTIFICATION'])).toBe(true);
    });
  });

  // =========================================================================
  // Addendum Governance
  // =========================================================================

  describe('canDraftAddendum', () => {
    it('Safety Manager can draft addendum affecting governed section', () => {
      expect(canDraftAddendum(['HAZARD_IDENTIFICATION'], 'SafetyManager')).toBe(true);
    });

    it('ProjectManager cannot draft addendum affecting governed section', () => {
      expect(canDraftAddendum(['HAZARD_IDENTIFICATION'], 'ProjectManager')).toBe(false);
    });

    it('ProjectManager can draft addendum affecting instance section', () => {
      expect(canDraftAddendum(['PROJECT_CONTACTS'], 'ProjectManager')).toBe(true);
    });

    it('FieldEngineer cannot draft any addendum', () => {
      expect(canDraftAddendum(['PROJECT_CONTACTS'], 'FieldEngineer')).toBe(false);
    });
  });

  describe('getRequiredApproversForAddendum', () => {
    it('non-operational: only Safety Manager required', () => {
      const approvers = getRequiredApproversForAddendum(false);
      expect(approvers).toHaveLength(1);
      expect(approvers).toContain('SAFETY_MANAGER');
    });

    it('operational: all 3 required', () => {
      const approvers = getRequiredApproversForAddendum(true);
      expect(approvers).toHaveLength(3);
      expect(approvers).toContain('SAFETY_MANAGER');
      expect(approvers).toContain('PM');
      expect(approvers).toContain('SUPERINTENDENT');
    });
  });

  describe('getRequiredApproversForBasePlan', () => {
    it('always requires all 3 per Decision 20', () => {
      expect(getRequiredApproversForBasePlan()).toHaveLength(3);
    });
  });

  // =========================================================================
  // Factory Helpers
  // =========================================================================

  describe('Factory helpers', () => {
    it('createEmptySSSPApproval has all null signatures', () => {
      const a = createEmptySSSPApproval();
      expect(a.safetyManagerApproval).toBeNull();
      expect(a.pmApproval).toBeNull();
      expect(a.superintendentApproval).toBeNull();
      expect(a.allApprovedAt).toBeNull();
      expect(a.rejections).toEqual([]);
    });

    it('createEmptyAddendumApproval has all null signatures', () => {
      const a = createEmptyAddendumApproval();
      expect(a.safetyManagerApproval).toBeNull();
      expect(a.pmApproval).toBeNull();
      expect(a.superintendentApproval).toBeNull();
      expect(a.allRequiredApprovedAt).toBeNull();
      expect(a.rejections).toEqual([]);
    });
  });
});
