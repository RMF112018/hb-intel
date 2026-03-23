import { describe, expect, it } from 'vitest';

import {
  calculatePPC,
  calculateWeightedProgress,
  isVerifiedAndAccepted,
  isWorkPackageInParentWindow,
  resolveBlockerSeverityRollUp,
  resolveCommitmentStatusRollUp,
  resolveReadinessRollUp,
} from '../field-execution/index.js';
import {
  blockerRollUpScenarios,
  commitmentRollUpScenarios,
} from '../../../testing/mockFieldExecutionScenarios.js';

describe('P3-E5-T05 field execution', () => {
  describe('calculatePPC (§9)', () => {
    it('returns 0 when no commitments', () => {
      expect(calculatePPC(0, 0)).toBe(0);
    });

    it('calculates correct percentage', () => {
      expect(calculatePPC(7, 10)).toBe(70);
    });

    it('rounds to 2 decimal places', () => {
      expect(calculatePPC(1, 3)).toBe(33.33);
    });

    it('returns 100 when all kept', () => {
      expect(calculatePPC(5, 5)).toBe(100);
    });
  });

  describe('resolveBlockerSeverityRollUp (§9.1)', () => {
    it('returns Critical when critical blocker is open', () => {
      expect(resolveBlockerSeverityRollUp([
        blockerRollUpScenarios.criticalOpen,
        blockerRollUpScenarios.informationalOpen,
      ])).toBe('Critical');
    });

    it('returns Informational when only informational open', () => {
      expect(resolveBlockerSeverityRollUp([blockerRollUpScenarios.informationalOpen])).toBe('Informational');
    });

    it('returns null when no open blockers', () => {
      expect(resolveBlockerSeverityRollUp([blockerRollUpScenarios.resolvedCritical])).toBeNull();
    });

    it('returns null for empty array', () => {
      expect(resolveBlockerSeverityRollUp([])).toBeNull();
    });
  });

  describe('resolveReadinessRollUp (§9.1)', () => {
    it('returns Unknown for empty array', () => {
      expect(resolveReadinessRollUp([])).toBe('Unknown');
    });

    it('returns NotReady when any record is NotReady', () => {
      const records = [
        { readinessId: 'r1', projectId: 'p1', workPackageId: null, externalActivityKey: null, assessedBy: 'u1', assessedAt: '2026-04-01', overallReadiness: 'Ready' as const, readinessDimensions: [], notes: null, blockerIds: [], syncStatus: 'Synced' as const, createdAt: '2026-04-01' },
        { readinessId: 'r2', projectId: 'p1', workPackageId: null, externalActivityKey: null, assessedBy: 'u1', assessedAt: '2026-04-01', overallReadiness: 'NotReady' as const, readinessDimensions: [], notes: null, blockerIds: [], syncStatus: 'Synced' as const, createdAt: '2026-04-01' },
      ];
      expect(resolveReadinessRollUp(records)).toBe('NotReady');
    });

    it('returns Ready when all are Ready', () => {
      const records = [
        { readinessId: 'r1', projectId: 'p1', workPackageId: null, externalActivityKey: null, assessedBy: 'u1', assessedAt: '2026-04-01', overallReadiness: 'Ready' as const, readinessDimensions: [], notes: null, blockerIds: [], syncStatus: 'Synced' as const, createdAt: '2026-04-01' },
      ];
      expect(resolveReadinessRollUp(records)).toBe('Ready');
    });
  });

  describe('resolveCommitmentStatusRollUp (§9.1)', () => {
    it('returns Missed when any commitment is Missed', () => {
      expect(resolveCommitmentStatusRollUp([
        commitmentRollUpScenarios.missed,
        commitmentRollUpScenarios.accepted,
      ])).toBe('Missed');
    });

    it('returns Accepted when only accepted commitments', () => {
      expect(resolveCommitmentStatusRollUp([commitmentRollUpScenarios.accepted])).toBe('Accepted');
    });

    it('returns null for empty array', () => {
      expect(resolveCommitmentStatusRollUp([])).toBeNull();
    });
  });

  describe('calculateWeightedProgress (§9.1)', () => {
    it('returns 0 for empty array', () => {
      expect(calculateWeightedProgress([])).toBe(0);
    });

    it('calculates weighted average by quantity', () => {
      const packages = [
        { reportedProgressPct: 80, quantityPlanned: 100 },
        { reportedProgressPct: 40, quantityPlanned: 100 },
      ];
      expect(calculateWeightedProgress(packages)).toBe(60);
    });

    it('weights packages by quantity', () => {
      const packages = [
        { reportedProgressPct: 100, quantityPlanned: 300 },
        { reportedProgressPct: 0, quantityPlanned: 100 },
      ];
      expect(calculateWeightedProgress(packages)).toBe(75);
    });

    it('uses weight=1 when no quantity planned', () => {
      const packages = [
        { reportedProgressPct: 50, quantityPlanned: null },
        { reportedProgressPct: 100, quantityPlanned: null },
      ];
      expect(calculateWeightedProgress(packages)).toBe(75);
    });
  });

  describe('isVerifiedAndAccepted (§8.2)', () => {
    it('returns true when verification not required', () => {
      expect(isVerifiedAndAccepted(
        { verificationRequired: false, verificationStatus: 'Pending' },
        null,
      )).toBe(true);
    });

    it('returns false when verification required but not verified', () => {
      expect(isVerifiedAndAccepted(
        { verificationRequired: true, verificationStatus: 'Pending' },
        null,
      )).toBe(false);
    });

    it('returns true when verified and PM acceptance not required', () => {
      expect(isVerifiedAndAccepted(
        { verificationRequired: true, verificationStatus: 'Verified' },
        { verificationOutcome: 'Confirmed', pmAcceptanceRequired: false, pmAcceptedAt: null },
      )).toBe(true);
    });

    it('returns false when PM acceptance required but not given', () => {
      expect(isVerifiedAndAccepted(
        { verificationRequired: true, verificationStatus: 'Verified' },
        { verificationOutcome: 'Confirmed', pmAcceptanceRequired: true, pmAcceptedAt: null },
      )).toBe(false);
    });

    it('returns true when verified and PM accepted', () => {
      expect(isVerifiedAndAccepted(
        { verificationRequired: true, verificationStatus: 'Verified' },
        { verificationOutcome: 'AdjustedDown', pmAcceptanceRequired: true, pmAcceptedAt: '2026-04-10' },
      )).toBe(true);
    });

    it('returns false when verification outcome is Rejected', () => {
      expect(isVerifiedAndAccepted(
        { verificationRequired: true, verificationStatus: 'Verified' },
        { verificationOutcome: 'Rejected', pmAcceptanceRequired: false, pmAcceptedAt: null },
      )).toBe(false);
    });
  });

  describe('isWorkPackageInParentWindow (§6.1)', () => {
    it('returns valid when within window', () => {
      const result = isWorkPackageInParentWindow(
        { plannedStartDate: '2026-04-05', plannedFinishDate: '2026-04-10' },
        '2026-04-01', '2026-04-15',
      );
      expect(result.valid).toBe(true);
      expect(result.warning).toBeUndefined();
    });

    it('warns when start is before parent', () => {
      const result = isWorkPackageInParentWindow(
        { plannedStartDate: '2026-03-28', plannedFinishDate: '2026-04-10' },
        '2026-04-01', '2026-04-15',
      );
      expect(result.valid).toBe(false);
      expect(result.warning).toContain('before parent');
    });

    it('warns when finish is after parent', () => {
      const result = isWorkPackageInParentWindow(
        { plannedStartDate: '2026-04-05', plannedFinishDate: '2026-04-20' },
        '2026-04-01', '2026-04-15',
      );
      expect(result.valid).toBe(false);
      expect(result.warning).toContain('after parent');
    });
  });
});
