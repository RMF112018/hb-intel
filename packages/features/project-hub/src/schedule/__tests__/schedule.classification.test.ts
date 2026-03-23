import { describe, expect, it } from 'vitest';

import {
  isExternalParticipantVisible,
  isOfflineCapableRecordType,
  resolveConflictResolution,
} from '../classification/index.js';

describe('P3-E5-T08 schedule classification and offline', () => {
  describe('isExternalParticipantVisible (§16.1)', () => {
    it('internal participants see all statuses', () => {
      expect(isExternalParticipantVisible('Draft', false)).toBe(true);
      expect(isExternalParticipantVisible('ReadyForReview', false)).toBe(true);
      expect(isExternalParticipantVisible('Published', false)).toBe(true);
    });

    it('external participants see Published and Superseded only', () => {
      expect(isExternalParticipantVisible('Published', true)).toBe(true);
      expect(isExternalParticipantVisible('Superseded', true)).toBe(true);
    });

    it('external participants cannot see Draft or ReadyForReview', () => {
      expect(isExternalParticipantVisible('Draft', true)).toBe(false);
      expect(isExternalParticipantVisible('ReadyForReview', true)).toBe(false);
    });
  });

  describe('resolveConflictResolution (§15.3)', () => {
    it('returns last-write-wins for non-governed field updates', () => {
      const result = resolveConflictResolution('NonGovernedFieldUpdate');
      expect(result).toContain('Last-write-wins');
    });

    it('returns server wins for governed status changes', () => {
      const result = resolveConflictResolution('GovernedStatusChange');
      expect(result).toContain('Server state wins');
    });

    it('returns PM reconciliation for commitment date conflicts', () => {
      const result = resolveConflictResolution('CommitmentDatePendingApproval');
      expect(result).toContain('PM');
    });

    it('returns ID regeneration for client ID collisions', () => {
      const result = resolveConflictResolution('CreateWithClientId');
      expect(result).toContain('regenerated');
    });
  });

  describe('isOfflineCapableRecordType (§15.1)', () => {
    it('FieldWorkPackage is offline-capable', () => {
      expect(isOfflineCapableRecordType('FieldWorkPackage')).toBe(true);
    });

    it('CommitmentRecord is offline-capable', () => {
      expect(isOfflineCapableRecordType('CommitmentRecord')).toBe(true);
    });

    it('BlockerRecord is offline-capable', () => {
      expect(isOfflineCapableRecordType('BlockerRecord')).toBe(true);
    });

    it('ProgressClaimRecord is offline-capable', () => {
      expect(isOfflineCapableRecordType('ProgressClaimRecord')).toBe(true);
    });

    it('LookAheadPlan is offline-capable', () => {
      expect(isOfflineCapableRecordType('LookAheadPlan')).toBe(true);
    });

    it('PublicationRecord is NOT offline-capable', () => {
      expect(isOfflineCapableRecordType('PublicationRecord')).toBe(false);
    });

    it('ScenarioBranch is NOT offline-capable', () => {
      expect(isOfflineCapableRecordType('ScenarioBranch')).toBe(false);
    });
  });
});
