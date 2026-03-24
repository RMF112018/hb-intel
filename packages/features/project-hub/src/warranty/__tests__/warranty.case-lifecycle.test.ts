import { describe, expect, it } from 'vitest';

import {
  canWarrantyReopenCase,
  computeWarrantySlaStatus,
  doesWarrantySlaClockPause,
  getWarrantyNextMove,
  getWarrantySlaDeadlineDays,
  getWarrantyTransitionActor,
  isDuplicateTargetValid,
  isValidWarrantyCaseTransition,
  isWarrantyVerificationRequired,
} from '../../index.js';

describe('P3-E14-T10 Stage 4 case-lifecycle business rules', () => {
  describe('isValidWarrantyCaseTransition', () => {
    it('Open → PendingCoverageDecision is valid', () => { expect(isValidWarrantyCaseTransition('Open', 'PendingCoverageDecision')).toBe(true); });
    it('PendingCoverageDecision → Assigned is valid', () => { expect(isValidWarrantyCaseTransition('PendingCoverageDecision', 'Assigned')).toBe(true); });
    it('Verified → Closed is valid', () => { expect(isValidWarrantyCaseTransition('Verified', 'Closed')).toBe(true); });
    it('Closed → Reopened is valid', () => { expect(isValidWarrantyCaseTransition('Closed', 'Reopened')).toBe(true); });
    it('Open → Closed is invalid', () => { expect(isValidWarrantyCaseTransition('Open', 'Closed')).toBe(false); });
    it('InProgress → Closed is invalid', () => { expect(isValidWarrantyCaseTransition('InProgress', 'Closed')).toBe(false); });
    it('PendingVerification → InProgress is valid (verification fails)', () => { expect(isValidWarrantyCaseTransition('PendingVerification', 'InProgress')).toBe(true); });
  });

  describe('getWarrantyTransitionActor', () => {
    it('Closed → Reopened requires PX', () => { expect(getWarrantyTransitionActor('Closed', 'Reopened')).toBe('PX'); });
    it('Open → PendingCoverageDecision requires PM_WARRANTY_MANAGER', () => { expect(getWarrantyTransitionActor('Open', 'PendingCoverageDecision')).toBe('PM_WARRANTY_MANAGER'); });
    it('Open → Voided requires PM_PX', () => { expect(getWarrantyTransitionActor('Open', 'Voided')).toBe('PM_PX'); });
  });

  describe('getWarrantyNextMove', () => {
    it('Open: Initiate coverage evaluation', () => { expect(getWarrantyNextMove('Open')?.nextMove).toContain('coverage evaluation'); });
    it('Verified: Create resolution record and close', () => { expect(getWarrantyNextMove('Verified')?.nextMove).toContain('resolution record'); });
    it('Closed: no next move (terminal)', () => { expect(getWarrantyNextMove('Closed')).toBeUndefined(); });
    it('Voided: no next move (terminal)', () => { expect(getWarrantyNextMove('Voided')).toBeUndefined(); });
  });

  describe('computeWarrantySlaStatus', () => {
    it('returns NotApplicable when deadline is null', () => { expect(computeWarrantySlaStatus(null, '2026-01-01')).toBe('NotApplicable'); });
    it('returns Overdue when deadline is past', () => { expect(computeWarrantySlaStatus('2020-01-01', '2026-01-01')).toBe('Overdue'); });
    it('returns WithinSla when deadline is far future', () => { expect(computeWarrantySlaStatus('2099-01-01', '2026-01-01')).toBe('WithinSla'); });
    it('returns Approaching when within threshold', () => { expect(computeWarrantySlaStatus('2026-01-04', '2026-01-01', 5)).toBe('Approaching'); });
  });

  describe('doesWarrantySlaClockPause', () => {
    it('pauses at AwaitingOwner', () => { expect(doesWarrantySlaClockPause('AwaitingOwner')).toBe(true); });
    it('does not pause at InProgress', () => { expect(doesWarrantySlaClockPause('InProgress')).toBe(false); });
    it('does not pause at AwaitingSubcontractor', () => { expect(doesWarrantySlaClockPause('AwaitingSubcontractor')).toBe(false); });
  });

  describe('getWarrantySlaDeadlineDays', () => {
    it('Standard Response = 5', () => { expect(getWarrantySlaDeadlineDays('Standard', 'Response')).toBe(5); });
    it('Expedited Response = 2', () => { expect(getWarrantySlaDeadlineDays('Expedited', 'Response')).toBe(2); });
    it('Standard Repair = 30', () => { expect(getWarrantySlaDeadlineDays('Standard', 'Repair')).toBe(30); });
    it('Expedited Repair = 10', () => { expect(getWarrantySlaDeadlineDays('Expedited', 'Repair')).toBe(10); });
    it('Standard Verification = 5', () => { expect(getWarrantySlaDeadlineDays('Standard', 'Verification')).toBe(5); });
    it('Expedited Verification = 2', () => { expect(getWarrantySlaDeadlineDays('Expedited', 'Verification')).toBe(2); });
  });

  describe('canWarrantyReopenCase', () => {
    it('PX can reopen', () => { expect(canWarrantyReopenCase('PX')).toBe(true); });
    it('PM cannot reopen', () => { expect(canWarrantyReopenCase('PM')).toBe(false); });
  });

  describe('isWarrantyVerificationRequired', () => {
    it('Corrected requires verification', () => { expect(isWarrantyVerificationRequired('Corrected')).toBe(true); });
    it('BackCharged requires verification', () => { expect(isWarrantyVerificationRequired('BackCharged')).toBe(true); });
    it('PmAccepted does NOT require verification', () => { expect(isWarrantyVerificationRequired('PmAccepted')).toBe(false); });
  });

  describe('isDuplicateTargetValid', () => {
    it('Open is valid target', () => { expect(isDuplicateTargetValid('Open')).toBe(true); });
    it('InProgress is valid target', () => { expect(isDuplicateTargetValid('InProgress')).toBe(true); });
    it('Closed is NOT valid (should reopen instead)', () => { expect(isDuplicateTargetValid('Closed')).toBe(false); });
    it('Voided is NOT valid', () => { expect(isDuplicateTargetValid('Voided')).toBe(false); });
    it('Duplicate is NOT valid', () => { expect(isDuplicateTargetValid('Duplicate')).toBe(false); });
  });
});
