import { describe, expect, it } from 'vitest';
import {
  isValidQcIssueTransition,
  isValidCorrectiveActionTransition,
  isValidDeviationTransition,
  isRecordProjectScoped,
  isRecordWorkPackageScoped,
  requiresResponsibleParty,
  canFindingSpawnIssue,
  mustPreserveOriginLineage,
  isSnapshotFamilyImmutable,
  isAdvisoryParallelToMainChain,
  doesFindingToIssuePreserveAllFields,
  canQcRecordStoreFiles,
  isUuidPrimaryKeyRequired,
  isQcIssueTerminal,
  isCorrectiveActionTerminal,
  isDeviationTerminal,
} from '../../index.js';

describe('QC record-families business rules', () => {
  describe('isValidQcIssueTransition', () => {
    it('OPEN to IN_PROGRESS is valid', () => {
      expect(isValidQcIssueTransition('OPEN', 'IN_PROGRESS')).toBe(true);
    });

    it('OPEN to CLOSED is invalid', () => {
      expect(isValidQcIssueTransition('OPEN', 'CLOSED')).toBe(false);
    });

    it('VERIFIED to CLOSED is valid', () => {
      expect(isValidQcIssueTransition('VERIFIED', 'CLOSED')).toBe(true);
    });
  });

  describe('isValidCorrectiveActionTransition', () => {
    it('OPEN to IN_PROGRESS is valid', () => {
      expect(isValidCorrectiveActionTransition('OPEN', 'IN_PROGRESS')).toBe(true);
    });

    it('OPEN to CLOSED is invalid', () => {
      expect(isValidCorrectiveActionTransition('OPEN', 'CLOSED')).toBe(false);
    });
  });

  describe('isValidDeviationTransition', () => {
    it('DRAFT to SUBMITTED is valid', () => {
      expect(isValidDeviationTransition('DRAFT', 'SUBMITTED')).toBe(true);
    });

    it('DRAFT to APPROVED is invalid', () => {
      expect(isValidDeviationTransition('DRAFT', 'APPROVED')).toBe(false);
    });
  });

  describe('isRecordProjectScoped', () => {
    it('QcIssue is project-scoped', () => {
      expect(isRecordProjectScoped('QcIssue')).toBe(true);
    });

    it('GovernedQualityStandard is not project-scoped', () => {
      expect(isRecordProjectScoped('GovernedQualityStandard')).toBe(false);
    });
  });

  describe('isRecordWorkPackageScoped', () => {
    it('WorkPackageQualityPlan is work-package-scoped', () => {
      expect(isRecordWorkPackageScoped('WorkPackageQualityPlan')).toBe(true);
    });

    it('QcIssue is not work-package-scoped', () => {
      expect(isRecordWorkPackageScoped('QcIssue')).toBe(false);
    });
  });

  describe('requiresResponsibleParty', () => {
    it('QcIssue requires responsible party', () => {
      expect(requiresResponsibleParty('QcIssue')).toBe(true);
    });

    it('AdvisoryVerdict does not require responsible party', () => {
      expect(requiresResponsibleParty('AdvisoryVerdict')).toBe(false);
    });
  });

  describe('canFindingSpawnIssue', () => {
    it('OPEN can spawn issue', () => {
      expect(canFindingSpawnIssue('OPEN')).toBe(true);
    });

    it('ACCEPTED can spawn issue', () => {
      expect(canFindingSpawnIssue('ACCEPTED')).toBe(true);
    });

    it('CLOSED cannot spawn issue', () => {
      expect(canFindingSpawnIssue('CLOSED')).toBe(false);
    });

    it('DEFERRED cannot spawn issue', () => {
      expect(canFindingSpawnIssue('DEFERRED')).toBe(false);
    });
  });

  describe('mustPreserveOriginLineage', () => {
    it('QcIssue must preserve origin lineage', () => {
      expect(mustPreserveOriginLineage('QcIssue')).toBe(true);
    });

    it('GovernedQualityStandard does not require origin lineage', () => {
      expect(mustPreserveOriginLineage('GovernedQualityStandard')).toBe(false);
    });
  });

  describe('isSnapshotFamilyImmutable', () => {
    it('QualityHealthSnapshot is immutable', () => {
      expect(isSnapshotFamilyImmutable('QualityHealthSnapshot')).toBe(true);
    });

    it('WorkPackageQualityPlan is not immutable', () => {
      expect(isSnapshotFamilyImmutable('WorkPackageQualityPlan')).toBe(false);
    });
  });

  describe('isAdvisoryParallelToMainChain', () => {
    it('always returns true', () => {
      expect(isAdvisoryParallelToMainChain()).toBe(true);
    });
  });

  describe('doesFindingToIssuePreserveAllFields', () => {
    it('always returns true', () => {
      expect(doesFindingToIssuePreserveAllFields()).toBe(true);
    });
  });

  describe('canQcRecordStoreFiles', () => {
    it('always returns false', () => {
      expect(canQcRecordStoreFiles()).toBe(false);
    });
  });

  describe('isUuidPrimaryKeyRequired', () => {
    it('always returns true for any QcRecordFamily', () => {
      expect(isUuidPrimaryKeyRequired('QcIssue')).toBe(true);
      expect(isUuidPrimaryKeyRequired('GovernedQualityStandard')).toBe(true);
      expect(isUuidPrimaryKeyRequired('AdvisoryVerdict')).toBe(true);
    });
  });

  describe('isQcIssueTerminal', () => {
    it('CLOSED is terminal', () => {
      expect(isQcIssueTerminal('CLOSED')).toBe(true);
    });

    it('VOIDED is terminal', () => {
      expect(isQcIssueTerminal('VOIDED')).toBe(true);
    });

    it('OPEN is not terminal', () => {
      expect(isQcIssueTerminal('OPEN')).toBe(false);
    });
  });

  describe('isCorrectiveActionTerminal', () => {
    it('CLOSED is terminal', () => {
      expect(isCorrectiveActionTerminal('CLOSED')).toBe(true);
    });

    it('OPEN is not terminal', () => {
      expect(isCorrectiveActionTerminal('OPEN')).toBe(false);
    });
  });

  describe('isDeviationTerminal', () => {
    it('APPROVED is terminal', () => {
      expect(isDeviationTerminal('APPROVED')).toBe(true);
    });

    it('DRAFT is not terminal', () => {
      expect(isDeviationTerminal('DRAFT')).toBe(false);
    });
  });
});
