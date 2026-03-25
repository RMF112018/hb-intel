import { describe, expect, it } from 'vitest';

import {
  canProjectExtensionWeakenGovernedMinimum,
  canQcStoreFiles,
  canQcWriteToCloseout,
  canQcWriteToSchedule,
  canQcWriteToStartup,
  canQcWriteToWarranty,
  isDeeperFieldMobileDeferred,
  isGovernedUpdateNoticeImmutable,
  isInternalOnlyPhase3,
  isOutOfScopeForPhase3Qc,
  isPh77HistoricalInputOnly,
  isQcOwnedConcern,
  isRoleActionPermitted,
  isSnapshotImmutableOncePublished,
  isVerifierSameAsResponsibleParty,
} from '../../index.js';

describe('P3-E15-T10 Stage 1 QC foundation business rules', () => {
  describe('isQcOwnedConcern', () => {
    it('returns true for QC-owned quality standards concern', () => {
      expect(isQcOwnedConcern('Quality standards, plans, findings, issues, deviations, evidence refs, approval dependencies, advisory records, snapshots')).toBe(true);
    });
    it('returns false for adjacent module concern (Startup)', () => {
      expect(isQcOwnedConcern('Startup commissioning execution and certification')).toBe(false);
    });
    it('returns false for adjacent module concern (Closeout)', () => {
      expect(isQcOwnedConcern('Closeout turnover package and archive gate')).toBe(false);
    });
    it('returns false for unknown concern', () => {
      expect(isQcOwnedConcern('Unknown concern')).toBe(false);
    });
  });

  describe('adjacent module boundary guards', () => {
    it('canQcWriteToStartup always false', () => { expect(canQcWriteToStartup()).toBe(false); });
    it('canQcWriteToCloseout always false', () => { expect(canQcWriteToCloseout()).toBe(false); });
    it('canQcWriteToWarranty always false', () => { expect(canQcWriteToWarranty()).toBe(false); });
    it('canQcWriteToSchedule always false', () => { expect(canQcWriteToSchedule()).toBe(false); });
    it('canQcStoreFiles always false', () => { expect(canQcStoreFiles()).toBe(false); });
  });

  describe('isOutOfScopeForPhase3Qc', () => {
    it('returns true for all 9 out-of-scope items', () => {
      const items: readonly string[] = [
        'PUNCH_LIST', 'OWNER_PORTAL', 'SUBCONTRACTOR_PORTAL',
        'EXTERNAL_COLLABORATION', 'FILE_STORAGE', 'MOBILE_FIRST_ENGINE',
        'FULL_SUBMITTAL_WORKFLOW', 'OFFLINE_FIELD_EXECUTION', 'OWNER_FACING_RELEASE',
      ];
      for (const item of items) {
        expect(isOutOfScopeForPhase3Qc(item as never)).toBe(true);
      }
    });
  });

  describe('Phase 3 posture guards', () => {
    it('isInternalOnlyPhase3 always true', () => { expect(isInternalOnlyPhase3()).toBe(true); });
    it('isDeeperFieldMobileDeferred always true', () => { expect(isDeeperFieldMobileDeferred()).toBe(true); });
    it('isPh77HistoricalInputOnly always true', () => { expect(isPh77HistoricalInputOnly()).toBe(true); });
  });

  describe('governance guards', () => {
    it('canProjectExtensionWeakenGovernedMinimum always false', () => {
      expect(canProjectExtensionWeakenGovernedMinimum()).toBe(false);
    });
  });

  describe('isRoleActionPermitted', () => {
    it('MOE_ADMIN can publish governed core', () => {
      expect(isRoleActionPermitted('Publish governed core', 'MOE_ADMIN')).toBe(true);
    });
    it('QC_MANAGER cannot publish governed core', () => {
      expect(isRoleActionPermitted('Publish governed core', 'QC_MANAGER')).toBe(false);
    });
    it('PM_PE_PA can author project plan / review package / issue / dependency records', () => {
      expect(isRoleActionPermitted('Author project plan / review package / issue / dependency records', 'PM_PE_PA')).toBe(true);
    });
    it('AUTHORIZED_HB_VERIFIER can verify completion', () => {
      expect(isRoleActionPermitted('Verify completion', 'AUTHORIZED_HB_VERIFIER')).toBe(true);
    });
    it('READ_ONLY_LEADERSHIP cannot perform any action', () => {
      expect(isRoleActionPermitted('Publish governed core', 'READ_ONLY_LEADERSHIP')).toBe(false);
    });
    it('returns false for unknown action', () => {
      expect(isRoleActionPermitted('Unknown action', 'PM_PE_PA')).toBe(false);
    });
  });

  describe('verifier guards', () => {
    it('isVerifierSameAsResponsibleParty always false', () => {
      expect(isVerifierSameAsResponsibleParty()).toBe(false);
    });
  });

  describe('snapshot immutability', () => {
    it('isSnapshotImmutableOncePublished true for SNAPSHOT_PUBLISHED', () => {
      expect(isSnapshotImmutableOncePublished('SNAPSHOT_PUBLISHED')).toBe(true);
    });
    it('isSnapshotImmutableOncePublished true for SUPERSEDED', () => {
      expect(isSnapshotImmutableOncePublished('SUPERSEDED')).toBe(true);
    });
    it('isSnapshotImmutableOncePublished false for WORKING', () => {
      expect(isSnapshotImmutableOncePublished('WORKING')).toBe(false);
    });
    it('isSnapshotImmutableOncePublished false for PROJECT_BASELINE', () => {
      expect(isSnapshotImmutableOncePublished('PROJECT_BASELINE')).toBe(false);
    });
  });

  describe('governed update notice immutability', () => {
    it('isGovernedUpdateNoticeImmutable true for PUBLISHED', () => {
      expect(isGovernedUpdateNoticeImmutable('PUBLISHED')).toBe(true);
    });
    it('isGovernedUpdateNoticeImmutable true for RESOLVED', () => {
      expect(isGovernedUpdateNoticeImmutable('RESOLVED')).toBe(true);
    });
    it('isGovernedUpdateNoticeImmutable true for SUPERSEDED', () => {
      expect(isGovernedUpdateNoticeImmutable('SUPERSEDED')).toBe(true);
    });
  });
});
