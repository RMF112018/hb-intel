import { describe, expect, it } from 'vitest';

import {
  canSubmitContractObligationsCertification,
  computeObligationCounts,
  getMonitoringLeadDays,
  isObligationOverdue,
  isValidObligationTransition,
  requiresEvidenceForSatisfied,
  requiresPXForTransition,
  requiresWaiverNote,
  shouldAutoFlagForMonitoring,
} from '../../index.js';

import { createMockContractObligation } from '../../../testing/createMockContractObligation.js';

describe('P3-E11-T10 Stage 5 Startup contract obligations business rules', () => {
  // -- Lifecycle Transitions (T04 §4) ----------------------------------------

  describe('isValidObligationTransition', () => {
    it('allows OPEN → IN_PROGRESS', () => {
      expect(isValidObligationTransition('OPEN', 'IN_PROGRESS')).toBe(true);
    });

    it('allows OPEN → NOT_APPLICABLE', () => {
      expect(isValidObligationTransition('OPEN', 'NOT_APPLICABLE')).toBe(true);
    });

    it('allows OPEN → WAIVED', () => {
      expect(isValidObligationTransition('OPEN', 'WAIVED')).toBe(true);
    });

    it('allows IN_PROGRESS → SATISFIED', () => {
      expect(isValidObligationTransition('IN_PROGRESS', 'SATISFIED')).toBe(true);
    });

    it('allows IN_PROGRESS → OPEN (regression)', () => {
      expect(isValidObligationTransition('IN_PROGRESS', 'OPEN')).toBe(true);
    });

    it('allows IN_PROGRESS → WAIVED', () => {
      expect(isValidObligationTransition('IN_PROGRESS', 'WAIVED')).toBe(true);
    });

    it('allows SATISFIED → OPEN (reopen)', () => {
      expect(isValidObligationTransition('SATISFIED', 'OPEN')).toBe(true);
    });

    it('allows NOT_APPLICABLE → OPEN (reopen)', () => {
      expect(isValidObligationTransition('NOT_APPLICABLE', 'OPEN')).toBe(true);
    });

    it('allows WAIVED → OPEN (reopen)', () => {
      expect(isValidObligationTransition('WAIVED', 'OPEN')).toBe(true);
    });

    it('rejects OPEN → SATISFIED (must go through IN_PROGRESS)', () => {
      expect(isValidObligationTransition('OPEN', 'SATISFIED')).toBe(false);
    });

    it('rejects SATISFIED → IN_PROGRESS', () => {
      expect(isValidObligationTransition('SATISFIED', 'IN_PROGRESS')).toBe(false);
    });

    it('rejects same-state OPEN → OPEN', () => {
      expect(isValidObligationTransition('OPEN', 'OPEN')).toBe(false);
    });
  });

  // -- PX Guard (T04 §4) ----------------------------------------------------

  describe('requiresPXForTransition', () => {
    it('returns true for OPEN → WAIVED', () => {
      expect(requiresPXForTransition('OPEN', 'WAIVED')).toBe(true);
    });

    it('returns true for IN_PROGRESS → WAIVED', () => {
      expect(requiresPXForTransition('IN_PROGRESS', 'WAIVED')).toBe(true);
    });

    it('returns true for SATISFIED → OPEN (reopen)', () => {
      expect(requiresPXForTransition('SATISFIED', 'OPEN')).toBe(true);
    });

    it('returns true for NOT_APPLICABLE → OPEN (reopen)', () => {
      expect(requiresPXForTransition('NOT_APPLICABLE', 'OPEN')).toBe(true);
    });

    it('returns true for WAIVED → OPEN (reopen)', () => {
      expect(requiresPXForTransition('WAIVED', 'OPEN')).toBe(true);
    });

    it('returns false for OPEN → IN_PROGRESS', () => {
      expect(requiresPXForTransition('OPEN', 'IN_PROGRESS')).toBe(false);
    });

    it('returns false for IN_PROGRESS → SATISFIED', () => {
      expect(requiresPXForTransition('IN_PROGRESS', 'SATISFIED')).toBe(false);
    });

    it('returns false for invalid transition', () => {
      expect(requiresPXForTransition('OPEN', 'SATISFIED')).toBe(false);
    });
  });

  // -- Waiver Note (T04 §4) -------------------------------------------------

  describe('requiresWaiverNote', () => {
    it('returns true for WAIVED', () => {
      expect(requiresWaiverNote('WAIVED')).toBe(true);
    });

    it('returns false for SATISFIED', () => {
      expect(requiresWaiverNote('SATISFIED')).toBe(false);
    });

    it('returns false for OPEN', () => {
      expect(requiresWaiverNote('OPEN')).toBe(false);
    });
  });

  // -- Evidence for Satisfied (T04 §4) ---------------------------------------

  describe('requiresEvidenceForSatisfied', () => {
    it('returns true when evidence present', () => {
      expect(requiresEvidenceForSatisfied(['doc-001'], null)).toBe(true);
    });

    it('returns true when notes present instead', () => {
      expect(requiresEvidenceForSatisfied([], 'Verbal confirmation from Owner')).toBe(true);
    });

    it('returns false when neither evidence nor notes', () => {
      expect(requiresEvidenceForSatisfied([], null)).toBe(false);
    });

    it('returns false when notes is empty string', () => {
      expect(requiresEvidenceForSatisfied([], '')).toBe(false);
    });
  });

  // -- Overdue Logic (T04 §6) ------------------------------------------------

  describe('isObligationOverdue', () => {
    const now = new Date('2026-03-24');

    it('returns true when past due and OPEN', () => {
      expect(isObligationOverdue('2026-03-20', 'OPEN', now)).toBe(true);
    });

    it('returns true when past due and IN_PROGRESS', () => {
      expect(isObligationOverdue('2026-03-20', 'IN_PROGRESS', now)).toBe(true);
    });

    it('returns false when past due but SATISFIED', () => {
      expect(isObligationOverdue('2026-03-20', 'SATISFIED', now)).toBe(false);
    });

    it('returns false when past due but WAIVED', () => {
      expect(isObligationOverdue('2026-03-20', 'WAIVED', now)).toBe(false);
    });

    it('returns false when past due but NOT_APPLICABLE', () => {
      expect(isObligationOverdue('2026-03-20', 'NOT_APPLICABLE', now)).toBe(false);
    });

    it('returns false when future date', () => {
      expect(isObligationOverdue('2026-12-31', 'OPEN', now)).toBe(false);
    });

    it('returns false when dueDate is null', () => {
      expect(isObligationOverdue(null, 'OPEN', now)).toBe(false);
    });
  });

  // -- Monitoring Lead Days (T04 §6.2) ---------------------------------------

  describe('getMonitoringLeadDays', () => {
    it('returns 21 for HIGH', () => {
      expect(getMonitoringLeadDays('HIGH')).toBe(21);
    });

    it('returns 14 for MEDIUM', () => {
      expect(getMonitoringLeadDays('MEDIUM')).toBe(14);
    });

    it('returns 7 for LOW', () => {
      expect(getMonitoringLeadDays('LOW')).toBe(7);
    });
  });

  // -- Auto-Flag (T04 §5) ---------------------------------------------------

  describe('shouldAutoFlagForMonitoring', () => {
    it('returns true for LIQUIDATED_DAMAGES', () => {
      expect(shouldAutoFlagForMonitoring('LIQUIDATED_DAMAGES')).toBe(true);
    });

    it('returns false for SPECIAL_TERMS', () => {
      expect(shouldAutoFlagForMonitoring('SPECIAL_TERMS')).toBe(false);
    });

    it('returns false for OTHER', () => {
      expect(shouldAutoFlagForMonitoring('OTHER')).toBe(false);
    });
  });

  // -- Certification Eligibility (T04 §7) ------------------------------------

  describe('canSubmitContractObligationsCertification', () => {
    const now = new Date('2026-03-24');

    it('returns true with valid obligations', () => {
      const obls = [createMockContractObligation({
        obligationStatus: 'IN_PROGRESS',
        flagForMonitoring: true,
        notes: 'Tracking LD clause',
        dueDate: '2026-06-01',
        category: 'LIQUIDATED_DAMAGES',
      })];
      expect(canSubmitContractObligationsCertification(obls, now)).toBe(true);
    });

    it('returns false with empty obligation list', () => {
      expect(canSubmitContractObligationsCertification([], now)).toBe(false);
    });

    it('returns false when flagged obligation has no notes', () => {
      const obls = [createMockContractObligation({
        obligationStatus: 'OPEN',
        flagForMonitoring: true,
        notes: null,
        category: 'OTHER',
      })];
      expect(canSubmitContractObligationsCertification(obls, now)).toBe(false);
    });

    it('returns false when LIQUIDATED_DAMAGES has no dueDate', () => {
      const obls = [createMockContractObligation({
        category: 'LIQUIDATED_DAMAGES',
        dueDate: null,
        obligationStatus: 'SATISFIED',
      })];
      expect(canSubmitContractObligationsCertification(obls, now)).toBe(false);
    });

    it('returns false when INSURANCE_REQUIREMENTS has no dueDate', () => {
      const obls = [createMockContractObligation({
        category: 'INSURANCE_REQUIREMENTS',
        dueDate: null,
        obligationStatus: 'OPEN',
        flagForMonitoring: false,
        notes: 'Reviewed',
      })];
      expect(canSubmitContractObligationsCertification(obls, now)).toBe(false);
    });

    it('returns false when near-due OPEN obligation lacks notes+flag', () => {
      const obls = [createMockContractObligation({
        obligationStatus: 'OPEN',
        dueDate: '2026-04-10',
        flagForMonitoring: false,
        notes: null,
        category: 'OTHER',
      })];
      expect(canSubmitContractObligationsCertification(obls, now)).toBe(false);
    });

    it('allows near-due OPEN with notes and flag', () => {
      const obls = [createMockContractObligation({
        obligationStatus: 'OPEN',
        dueDate: '2026-04-10',
        flagForMonitoring: true,
        notes: 'Acknowledged and tracking',
        category: 'OTHER',
      })];
      expect(canSubmitContractObligationsCertification(obls, now)).toBe(true);
    });

    it('allows SATISFIED obligations without further requirements', () => {
      const obls = [createMockContractObligation({
        obligationStatus: 'SATISFIED',
        flagForMonitoring: false,
        notes: null,
        dueDate: '2026-06-01',
        category: 'ALLOWANCES',
      })];
      expect(canSubmitContractObligationsCertification(obls, now)).toBe(true);
    });
  });

  // -- Obligation Counts -----------------------------------------------------

  describe('computeObligationCounts', () => {
    const now = new Date('2026-03-24');

    it('counts all statuses correctly', () => {
      const obls = [
        createMockContractObligation({ obligationStatus: 'OPEN', flagForMonitoring: false, dueDate: null }),
        createMockContractObligation({ obligationStatus: 'OPEN', flagForMonitoring: true, dueDate: null }),
        createMockContractObligation({ obligationStatus: 'IN_PROGRESS', flagForMonitoring: false, dueDate: null }),
        createMockContractObligation({ obligationStatus: 'SATISFIED', flagForMonitoring: false, dueDate: null }),
        createMockContractObligation({ obligationStatus: 'WAIVED', flagForMonitoring: false, dueDate: null }),
      ];
      const counts = computeObligationCounts(obls, now);
      expect(counts.totalObligationCount).toBe(5);
      expect(counts.openObligationCount).toBe(2);
      expect(counts.inProgressObligationCount).toBe(1);
      expect(counts.flaggedObligationCount).toBe(1);
      expect(counts.overdueObligationCount).toBe(0);
    });

    it('counts overdue correctly', () => {
      const obls = [
        createMockContractObligation({ obligationStatus: 'OPEN', dueDate: '2026-03-20', flagForMonitoring: false }),
        createMockContractObligation({ obligationStatus: 'IN_PROGRESS', dueDate: '2026-03-20', flagForMonitoring: false }),
        createMockContractObligation({ obligationStatus: 'SATISFIED', dueDate: '2026-03-20', flagForMonitoring: false }),
      ];
      const counts = computeObligationCounts(obls, now);
      expect(counts.overdueObligationCount).toBe(2); // OPEN + IN_PROGRESS, not SATISFIED
    });

    it('handles empty array', () => {
      const counts = computeObligationCounts([], now);
      expect(counts.totalObligationCount).toBe(0);
      expect(counts.openObligationCount).toBe(0);
    });
  });

  // -- Mock factory -----------------------------------------------------------

  describe('createMockContractObligation', () => {
    it('creates a valid default obligation', () => {
      const obl = createMockContractObligation();
      expect(obl.obligationId).toBe('obl-001');
      expect(obl.obligationStatus).toBe('OPEN');
      expect(obl.flagForMonitoring).toBe(true);
      expect(obl.category).toBe('LIQUIDATED_DAMAGES');
    });

    it('accepts overrides', () => {
      const obl = createMockContractObligation({ obligationStatus: 'SATISFIED', category: 'WARRANTIES' });
      expect(obl.obligationStatus).toBe('SATISFIED');
      expect(obl.category).toBe('WARRANTIES');
    });
  });
});
