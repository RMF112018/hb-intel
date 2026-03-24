import { describe, expect, it } from 'vitest';

import {
  isTerminalApplicationStatus,
  isValidApplicationTransition,
  transitionApplicationStatus,
  isTerminalIssuedPermitStatus,
  isNotesRequiredForAction,
  isAcknowledgmentRequiredForAction,
  validateLifecycleAction,
  resolveNewStatus,
  canEditApplication,
  getRequiredFieldsForApplicationTransition,
  isStopWorkOrViolationBlocking,
  isExpirationWarningNeeded,
} from '../../index.js';

describe('P3-E7-T03 Permits lifecycle rules', () => {
  // ── Application Lifecycle ─────────────────────────────────────────

  describe('isTerminalApplicationStatus', () => {
    it('APPROVED is terminal', () => expect(isTerminalApplicationStatus('APPROVED')).toBe(true));
    it('REJECTED is terminal', () => expect(isTerminalApplicationStatus('REJECTED')).toBe(true));
    it('WITHDRAWN is terminal', () => expect(isTerminalApplicationStatus('WITHDRAWN')).toBe(true));
    it('DRAFT is not terminal', () => expect(isTerminalApplicationStatus('DRAFT')).toBe(false));
    it('SUBMITTED is not terminal', () => expect(isTerminalApplicationStatus('SUBMITTED')).toBe(false));
  });

  describe('isValidApplicationTransition', () => {
    it('DRAFT → SUBMITTED is valid', () => expect(isValidApplicationTransition('DRAFT', 'SUBMITTED')).toBe(true));
    it('UNDER_REVIEW → APPROVED is valid', () => expect(isValidApplicationTransition('UNDER_REVIEW', 'APPROVED')).toBe(true));
    it('UNDER_REVIEW → REJECTED is valid', () => expect(isValidApplicationTransition('UNDER_REVIEW', 'REJECTED')).toBe(true));
    it('DRAFT → APPROVED is invalid', () => expect(isValidApplicationTransition('DRAFT', 'APPROVED')).toBe(false));
    it('any → WITHDRAWN is valid (wildcard)', () => expect(isValidApplicationTransition('SUBMITTED', 'WITHDRAWN')).toBe(true));
  });

  describe('transitionApplicationStatus', () => {
    it('accepts valid transition', () => {
      const result = transitionApplicationStatus('DRAFT', 'SUBMITTED');
      expect(result.valid).toBe(true);
    });

    it('rejects from terminal status', () => {
      const result = transitionApplicationStatus('APPROVED', 'SUBMITTED');
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(expect.arrayContaining([expect.stringContaining('terminal')]));
    });

    it('rejects invalid transition', () => {
      const result = transitionApplicationStatus('DRAFT', 'APPROVED');
      expect(result.valid).toBe(false);
    });
  });

  // ── Issued Permit Lifecycle ───────────────────────────────────────

  describe('isTerminalIssuedPermitStatus', () => {
    it('EXPIRED is terminal', () => expect(isTerminalIssuedPermitStatus('EXPIRED')).toBe(true));
    it('REVOKED is terminal', () => expect(isTerminalIssuedPermitStatus('REVOKED')).toBe(true));
    it('CLOSED is terminal', () => expect(isTerminalIssuedPermitStatus('CLOSED')).toBe(true));
    it('ACTIVE is not terminal', () => expect(isTerminalIssuedPermitStatus('ACTIVE')).toBe(false));
  });

  describe('isNotesRequiredForAction', () => {
    it('STOP_WORK_ISSUED requires notes', () => expect(isNotesRequiredForAction('STOP_WORK_ISSUED')).toBe(true));
    it('ISSUED does not require notes', () => expect(isNotesRequiredForAction('ISSUED')).toBe(false));
    it('REVOKED requires notes', () => expect(isNotesRequiredForAction('REVOKED')).toBe(true));
  });

  describe('isAcknowledgmentRequiredForAction', () => {
    it('STOP_WORK_ISSUED requires ack', () => expect(isAcknowledgmentRequiredForAction('STOP_WORK_ISSUED')).toBe(true));
    it('DEFICIENCY_RESOLVED requires ack', () => expect(isAcknowledgmentRequiredForAction('DEFICIENCY_RESOLVED')).toBe(true));
    it('ISSUED does not require ack', () => expect(isAcknowledgmentRequiredForAction('ISSUED')).toBe(false));
  });

  describe('validateLifecycleAction', () => {
    it('accepts valid action on ACTIVE permit', () => {
      const result = validateLifecycleAction('ACTIVE', 'INSPECTION_PASSED');
      expect(result.valid).toBe(true);
    });

    it('rejects action on terminal permit (§4.1)', () => {
      const result = validateLifecycleAction('CLOSED', 'INSPECTION_PASSED');
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(expect.arrayContaining([expect.stringContaining('terminal')]));
    });

    it('rejects STOP_WORK_LIFTED on ACTIVE (must be STOP_WORK)', () => {
      const result = validateLifecycleAction('ACTIVE', 'STOP_WORK_LIFTED', 'Lifting stop work');
      expect(result.valid).toBe(false);
    });

    it('accepts STOP_WORK_LIFTED on STOP_WORK', () => {
      const result = validateLifecycleAction('STOP_WORK', 'STOP_WORK_LIFTED', 'Lifting stop work');
      expect(result.valid).toBe(true);
    });

    it('rejects STOP_WORK_ISSUED without notes', () => {
      const result = validateLifecycleAction('ACTIVE', 'STOP_WORK_ISSUED');
      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(expect.arrayContaining([expect.stringContaining('notes')]));
    });

    it('accepts STOP_WORK_ISSUED with notes', () => {
      const result = validateLifecycleAction('ACTIVE', 'STOP_WORK_ISSUED', 'Structural concern');
      expect(result.valid).toBe(true);
    });
  });

  describe('resolveNewStatus', () => {
    it('ISSUED → ACTIVE', () => expect(resolveNewStatus('ACTIVE', 'ISSUED')).toBe('ACTIVE'));
    it('STOP_WORK_ISSUED → STOP_WORK', () => expect(resolveNewStatus('ACTIVE', 'STOP_WORK_ISSUED')).toBe('STOP_WORK'));
    it('INSPECTION_PASSED → SAME (stays ACTIVE)', () => expect(resolveNewStatus('ACTIVE', 'INSPECTION_PASSED')).toBe('ACTIVE'));
    it('RENEWAL_APPROVED → RENEWED', () => expect(resolveNewStatus('RENEWAL_IN_PROGRESS', 'RENEWAL_APPROVED')).toBe('RENEWED'));
    it('invalid returns null', () => expect(resolveNewStatus('ACTIVE', 'STOP_WORK_LIFTED')).toBeNull());
  });

  // ── Business Rules ────────────────────────────────────────────────

  describe('canEditApplication', () => {
    it('Creator can edit DRAFT', () => expect(canEditApplication('DRAFT', 'Creator')).toBe(true));
    it('ProjectManager can edit DRAFT', () => expect(canEditApplication('DRAFT', 'ProjectManager')).toBe(true));
    it('nobody can edit APPROVED', () => expect(canEditApplication('APPROVED', 'ProjectManager')).toBe(false));
  });

  describe('getRequiredFieldsForApplicationTransition', () => {
    it('SUBMITTED requires submittedById', () => {
      expect(getRequiredFieldsForApplicationTransition('SUBMITTED')).toContain('submittedById');
    });

    it('REJECTED requires rejectionReason', () => {
      expect(getRequiredFieldsForApplicationTransition('REJECTED')).toContain('rejectionReason');
    });

    it('unknown status returns empty array', () => {
      expect(getRequiredFieldsForApplicationTransition('UNKNOWN')).toEqual([]);
    });
  });

  describe('isStopWorkOrViolationBlocking', () => {
    it('STOP_WORK is blocking', () => expect(isStopWorkOrViolationBlocking('STOP_WORK')).toBe(true));
    it('VIOLATION_ISSUED is blocking', () => expect(isStopWorkOrViolationBlocking('VIOLATION_ISSUED')).toBe(true));
    it('ACTIVE is not blocking', () => expect(isStopWorkOrViolationBlocking('ACTIVE')).toBe(false));
  });

  describe('isExpirationWarningNeeded', () => {
    it('returns true when ≤30 days and ACTIVE', () => expect(isExpirationWarningNeeded(25, 'ACTIVE')).toBe(true));
    it('returns false when >30 days', () => expect(isExpirationWarningNeeded(60, 'ACTIVE')).toBe(false));
    it('returns false when not ACTIVE', () => expect(isExpirationWarningNeeded(10, 'SUSPENDED')).toBe(false));
  });
});
