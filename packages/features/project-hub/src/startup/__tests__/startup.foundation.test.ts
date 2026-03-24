import { describe, expect, it } from 'vitest';

import {
  canAdvanceToReadyForMobilization,
  canIssueMobilizationAuth,
  canStartupMutateCrossModuleData,
  getTransitionTriggerType,
  isPXExclusiveAction,
  isStartupOwnedRecord,
  isValidStateTransition,
  isWaiverLapsed,
  requiresPEForTransition,
  STARTUP_RECORD_FAMILIES,
  STARTUP_STATE_TRANSITIONS,
} from '../../index.js';

import { createMockStartupProgram } from '../../../testing/createMockStartupProgram.js';

describe('P3-E11-T10 Stage 1 Startup foundation business rules', () => {
  // -- State Machine Validation (T01 §4.2) ----------------------------------

  describe('isValidStateTransition', () => {
    it('returns true for all 9 valid transitions', () => {
      for (const t of STARTUP_STATE_TRANSITIONS) {
        expect(isValidStateTransition(t.from, t.to)).toBe(true);
      }
    });

    it('returns false for invalid DRAFT → READINESS_REVIEW', () => {
      expect(isValidStateTransition('DRAFT', 'READINESS_REVIEW')).toBe(false);
    });

    it('returns false for invalid DRAFT → MOBILIZED', () => {
      expect(isValidStateTransition('DRAFT', 'MOBILIZED')).toBe(false);
    });

    it('returns false for backward ARCHIVED → BASELINE_LOCKED', () => {
      expect(isValidStateTransition('ARCHIVED', 'BASELINE_LOCKED')).toBe(false);
    });

    it('returns false for same-state DRAFT → DRAFT', () => {
      expect(isValidStateTransition('DRAFT', 'DRAFT')).toBe(false);
    });

    it('returns false for skipping ACTIVE_PLANNING → READY_FOR_MOBILIZATION', () => {
      expect(isValidStateTransition('ACTIVE_PLANNING', 'READY_FOR_MOBILIZATION')).toBe(false);
    });
  });

  describe('requiresPEForTransition', () => {
    it('returns true for READINESS_REVIEW → READY_FOR_MOBILIZATION', () => {
      expect(requiresPEForTransition('READINESS_REVIEW', 'READY_FOR_MOBILIZATION')).toBe(true);
    });

    it('returns true for READY_FOR_MOBILIZATION → MOBILIZED', () => {
      expect(requiresPEForTransition('READY_FOR_MOBILIZATION', 'MOBILIZED')).toBe(true);
    });

    it('returns true for READY_FOR_MOBILIZATION → ACTIVE_PLANNING (reopen)', () => {
      expect(requiresPEForTransition('READY_FOR_MOBILIZATION', 'ACTIVE_PLANNING')).toBe(true);
    });

    it('returns true for STABILIZING → BASELINE_LOCKED', () => {
      expect(requiresPEForTransition('STABILIZING', 'BASELINE_LOCKED')).toBe(true);
    });

    it('returns false for DRAFT → ACTIVE_PLANNING (system)', () => {
      expect(requiresPEForTransition('DRAFT', 'ACTIVE_PLANNING')).toBe(false);
    });

    it('returns false for MOBILIZED → STABILIZING (system)', () => {
      expect(requiresPEForTransition('MOBILIZED', 'STABILIZING')).toBe(false);
    });

    it('returns false for BASELINE_LOCKED → ARCHIVED (system)', () => {
      expect(requiresPEForTransition('BASELINE_LOCKED', 'ARCHIVED')).toBe(false);
    });

    it('returns false for invalid transitions', () => {
      expect(requiresPEForTransition('DRAFT', 'ARCHIVED')).toBe(false);
    });
  });

  describe('getTransitionTriggerType', () => {
    it('returns System for DRAFT → ACTIVE_PLANNING', () => {
      expect(getTransitionTriggerType('DRAFT', 'ACTIVE_PLANNING')).toBe('System');
    });

    it('returns PMAction for ACTIVE_PLANNING → READINESS_REVIEW', () => {
      expect(getTransitionTriggerType('ACTIVE_PLANNING', 'READINESS_REVIEW')).toBe('PMAction');
    });

    it('returns PEAction for READINESS_REVIEW → READY_FOR_MOBILIZATION', () => {
      expect(getTransitionTriggerType('READINESS_REVIEW', 'READY_FOR_MOBILIZATION')).toBe('PEAction');
    });

    it('returns PEAction for STABILIZING → BASELINE_LOCKED', () => {
      expect(getTransitionTriggerType('STABILIZING', 'BASELINE_LOCKED')).toBe('PEAction');
    });

    it('returns undefined for invalid transitions', () => {
      expect(getTransitionTriggerType('DRAFT', 'ARCHIVED')).toBeUndefined();
    });
  });

  // -- Certification Gate Checks (T10 §2 Stage 1) ---------------------------

  describe('canAdvanceToReadyForMobilization', () => {
    it('returns true when all 6 certs are ACCEPTED', () => {
      const certs = Array(6).fill('ACCEPTED') as readonly string[];
      expect(canAdvanceToReadyForMobilization(certs as never)).toBe(true);
    });

    it('returns true when all 6 certs are WAIVED', () => {
      const certs = Array(6).fill('WAIVED') as readonly string[];
      expect(canAdvanceToReadyForMobilization(certs as never)).toBe(true);
    });

    it('returns true for mix of ACCEPTED and WAIVED', () => {
      const certs = ['ACCEPTED', 'WAIVED', 'ACCEPTED', 'ACCEPTED', 'WAIVED', 'ACCEPTED'] as const;
      expect(canAdvanceToReadyForMobilization(certs)).toBe(true);
    });

    it('returns false when any cert is REJECTED', () => {
      const certs = ['ACCEPTED', 'ACCEPTED', 'REJECTED', 'ACCEPTED', 'ACCEPTED', 'ACCEPTED'] as const;
      expect(canAdvanceToReadyForMobilization(certs)).toBe(false);
    });

    it('returns false when any cert is NOT_SUBMITTED', () => {
      const certs = ['ACCEPTED', 'NOT_SUBMITTED', 'ACCEPTED', 'ACCEPTED', 'ACCEPTED', 'ACCEPTED'] as const;
      expect(canAdvanceToReadyForMobilization(certs)).toBe(false);
    });

    it('returns false when fewer than 6 certs', () => {
      const certs = ['ACCEPTED', 'ACCEPTED', 'ACCEPTED'] as const;
      expect(canAdvanceToReadyForMobilization(certs)).toBe(false);
    });

    it('returns false for empty array', () => {
      expect(canAdvanceToReadyForMobilization([])).toBe(false);
    });
  });

  describe('canIssueMobilizationAuth', () => {
    it('returns true when all certs cleared and no open blockers', () => {
      const certs = Array(6).fill('ACCEPTED') as readonly string[];
      expect(canIssueMobilizationAuth(certs as never, 0)).toBe(true);
    });

    it('returns false when open program blockers exist', () => {
      const certs = Array(6).fill('ACCEPTED') as readonly string[];
      expect(canIssueMobilizationAuth(certs as never, 1)).toBe(false);
    });

    it('returns false when certs not all cleared', () => {
      const certs = ['ACCEPTED', 'SUBMITTED', 'ACCEPTED', 'ACCEPTED', 'ACCEPTED', 'ACCEPTED'] as const;
      expect(canIssueMobilizationAuth(certs, 0)).toBe(false);
    });

    it('returns false when both certs incomplete and blockers exist', () => {
      const certs = ['REJECTED', 'ACCEPTED', 'ACCEPTED', 'ACCEPTED', 'ACCEPTED', 'ACCEPTED'] as const;
      expect(canIssueMobilizationAuth(certs, 2)).toBe(false);
    });
  });

  // -- Record Ownership (T02 §1) ---------------------------------------------

  describe('isStartupOwnedRecord', () => {
    it('returns true for all 28 record families', () => {
      for (const family of STARTUP_RECORD_FAMILIES) {
        expect(isStartupOwnedRecord(family)).toBe(true);
      }
    });

    it('returns false for unknown record families', () => {
      expect(isStartupOwnedRecord('CloseoutChecklist')).toBe(false);
      expect(isStartupOwnedRecord('Unknown')).toBe(false);
    });
  });

  // -- PX-Exclusive Actions (T09 §1) ----------------------------------------

  describe('isPXExclusiveAction', () => {
    it('returns true for CertificationAcceptance', () => {
      expect(isPXExclusiveAction('CertificationAcceptance')).toBe(true);
    });

    it('returns true for MobilizationAuthorization', () => {
      expect(isPXExclusiveAction('MobilizationAuthorization')).toBe(true);
    });

    it('returns true for BaselineLock', () => {
      expect(isPXExclusiveAction('BaselineLock')).toBe(true);
    });

    it('returns true for WaiverApproval', () => {
      expect(isPXExclusiveAction('WaiverApproval')).toBe(true);
    });

    it('returns true for CertificationWaiver', () => {
      expect(isPXExclusiveAction('CertificationWaiver')).toBe(true);
    });

    it('returns true for ReadinessReopen', () => {
      expect(isPXExclusiveAction('ReadinessReopen')).toBe(true);
    });
  });

  // -- Waiver Lapse Check (T02 §3.9) ----------------------------------------

  describe('isWaiverLapsed', () => {
    it('returns true when planned date has passed and waiver not resolved', () => {
      const pastDate = '2026-01-01';
      const now = new Date('2026-03-24');
      expect(isWaiverLapsed(pastDate, 'APPROVED', now)).toBe(true);
    });

    it('returns false when planned date is in the future', () => {
      const futureDate = '2026-12-31';
      const now = new Date('2026-03-24');
      expect(isWaiverLapsed(futureDate, 'APPROVED', now)).toBe(false);
    });

    it('returns false when waiver is RESOLVED regardless of date', () => {
      const pastDate = '2026-01-01';
      const now = new Date('2026-03-24');
      expect(isWaiverLapsed(pastDate, 'RESOLVED', now)).toBe(false);
    });

    it('returns true when PENDING_PE_REVIEW and date passed', () => {
      const pastDate = '2026-01-01';
      const now = new Date('2026-03-24');
      expect(isWaiverLapsed(pastDate, 'PENDING_PE_REVIEW', now)).toBe(true);
    });
  });

  // -- Cross-Module Immutability ---------------------------------------------

  describe('canStartupMutateCrossModuleData', () => {
    it('always returns false', () => {
      expect(canStartupMutateCrossModuleData()).toBe(false);
    });
  });

  // -- Mock factory -----------------------------------------------------------

  describe('createMockStartupProgram', () => {
    it('creates a valid default StartupProgram in DRAFT state', () => {
      const program = createMockStartupProgram();
      expect(program.programId).toBe('prg-001');
      expect(program.currentStateCode).toBe('DRAFT');
      expect(program.stabilizationWindowDays).toBe(14);
      expect(program.baselineLockedAt).toBeNull();
    });

    it('accepts overrides', () => {
      const program = createMockStartupProgram({
        currentStateCode: 'ACTIVE_PLANNING',
        projectName: 'Override Project',
      });
      expect(program.currentStateCode).toBe('ACTIVE_PLANNING');
      expect(program.projectName).toBe('Override Project');
    });
  });
});
