import { describe, expect, it } from 'vitest';

import {
  // Enum arrays
  REPORT_RUN_TYPES,
  REPORT_RUN_STATUSES,
  REPORT_RUN_INITIATORS,
  SNAPSHOT_SOURCE_POLICIES,
  REVIEWER_RUN_RESTRICTIONS,
  ANNOTATION_ATTACHMENT_MODES,
  REVIEWER_RUN_VISIBILITIES,
  PER_REPORT_POSTURES,
  // Label maps
  REPORT_RUN_TYPE_LABELS,
  REPORT_RUN_STATUS_LABELS,
  REVIEWER_RUN_RESTRICTION_LABELS,
  // Definition arrays
  REVIEWER_RUN_ALL_RESTRICTIONS,
  PER_REPORT_POSTURE_DEFINITIONS,
  REVIEWER_RUN_ACCEPTANCE_CRITERIA,
  // Business rules
  isReviewerGeneratedRun,
  canReviewerRunAccessDraft,
  canReviewerRunModifyDraft,
  canReviewerRunTriggerDraftConfirmation,
  canReviewerRunModifyRunHistory,
  canReviewerRunAccessNarrative,
  getSnapshotSourcePolicyForRunType,
  canPerApprovePxReviewRun,
  canPerAdvanceReviewChain,
  canPerModifyRunLedger,
  isReviewerRunDraftIsolationValid,
  getPerReportPosture,
  canReviewerRunAttachAnnotation,
  isReviewerRunAnnotationIsolated,
} from '../index.js';

import type {
  IRunLedgerEntry,
  IReviewerGeneratedRunConfig,
  IReviewerRunDraftIsolation,
} from '../index.js';

// =============================================================================
// Contract stability
// =============================================================================

describe('Stage 8.3 run-ledger contract stability', () => {
  describe('enum array lengths', () => {
    it('REPORT_RUN_TYPES has 2 entries', () => {
      expect(REPORT_RUN_TYPES).toHaveLength(2);
    });

    it('REPORT_RUN_STATUSES has 5 entries', () => {
      expect(REPORT_RUN_STATUSES).toHaveLength(5);
    });

    it('REPORT_RUN_INITIATORS has 3 entries', () => {
      expect(REPORT_RUN_INITIATORS).toHaveLength(3);
    });

    it('SNAPSHOT_SOURCE_POLICIES has 3 entries', () => {
      expect(SNAPSHOT_SOURCE_POLICIES).toHaveLength(3);
    });

    it('REVIEWER_RUN_RESTRICTIONS has 5 entries', () => {
      expect(REVIEWER_RUN_RESTRICTIONS).toHaveLength(5);
    });

    it('ANNOTATION_ATTACHMENT_MODES has 2 entries', () => {
      expect(ANNOTATION_ATTACHMENT_MODES).toHaveLength(2);
    });

    it('REVIEWER_RUN_VISIBILITIES has 2 entries', () => {
      expect(REVIEWER_RUN_VISIBILITIES).toHaveLength(2);
    });

    it('PER_REPORT_POSTURES has 3 entries', () => {
      expect(PER_REPORT_POSTURES).toHaveLength(3);
    });
  });

  describe('label map key counts', () => {
    it('REPORT_RUN_TYPE_LABELS has 2 keys', () => {
      expect(Object.keys(REPORT_RUN_TYPE_LABELS)).toHaveLength(2);
    });

    it('REPORT_RUN_STATUS_LABELS has 5 keys', () => {
      expect(Object.keys(REPORT_RUN_STATUS_LABELS)).toHaveLength(5);
    });

    it('REVIEWER_RUN_RESTRICTION_LABELS has 5 keys', () => {
      expect(Object.keys(REVIEWER_RUN_RESTRICTION_LABELS)).toHaveLength(5);
    });
  });

  describe('definition arrays', () => {
    it('REVIEWER_RUN_ALL_RESTRICTIONS has 5 entries', () => {
      expect(REVIEWER_RUN_ALL_RESTRICTIONS).toHaveLength(5);
    });

    it('PER_REPORT_POSTURE_DEFINITIONS has 3 entries', () => {
      expect(PER_REPORT_POSTURE_DEFINITIONS).toHaveLength(3);
    });

    it('REVIEWER_RUN_ACCEPTANCE_CRITERIA has 7 entries', () => {
      expect(REVIEWER_RUN_ACCEPTANCE_CRITERIA).toHaveLength(7);
    });

    it('all PER postures have isAllowed true', () => {
      for (const def of PER_REPORT_POSTURE_DEFINITIONS) {
        expect(def.isAllowed).toBe(true);
      }
    });

    it('all acceptance criteria have isSatisfied true', () => {
      for (const criterion of REVIEWER_RUN_ACCEPTANCE_CRITERIA) {
        expect(criterion.isSatisfied).toBe(true);
      }
    });
  });

  describe('type checks', () => {
    it('IRunLedgerEntry is structurally valid', () => {
      const entry: IRunLedgerEntry = {
        runId: 'run-1',
        familyKey: 'px-review',
        projectId: 'proj-1',
        generatedAt: '2026-03-25T00:00:00Z',
        generatedBy: 'user-1',
        runType: 'STANDARD',
        snapshotVersion: 'v1',
        artifactUrl: null,
        status: 'PENDING',
        approvalMetadata: null,
        releaseMetadata: null,
        annotationArtifactRef: null,
      };
      expect(entry.runId).toBe('run-1');
    });

    it('IReviewerGeneratedRunConfig is structurally valid', () => {
      const config: IReviewerGeneratedRunConfig = {
        runConfigId: 'cfg-1',
        projectId: 'proj-1',
        initiator: 'PER',
        snapshotSourcePolicy: 'LATEST_CONFIRMED_ONLY',
        restrictions: ['NO_DRAFT_ACCESS'],
        annotationAttachment: 'ATTACHED',
        visibility: 'PROJECT_TEAM_AND_PER',
        perIdentity: 'per-1',
      };
      expect(config.runConfigId).toBe('cfg-1');
    });

    it('IReviewerRunDraftIsolation is structurally valid', () => {
      const isolation: IReviewerRunDraftIsolation = {
        isolationId: 'iso-1',
        runId: 'run-1',
        pmDraftStateAccessed: false,
        pmDraftStateModified: false,
        pmNarrativeAccessed: false,
        pmRunHistoryModified: false,
      };
      expect(isolation.isolationId).toBe('iso-1');
    });
  });
});

// =============================================================================
// Business rules
// =============================================================================

describe('Stage 8.3 run-ledger business rules', () => {
  describe('isReviewerGeneratedRun', () => {
    it('returns true for REVIEWER_GENERATED', () => {
      expect(isReviewerGeneratedRun('REVIEWER_GENERATED')).toBe(true);
    });

    it('returns false for STANDARD', () => {
      expect(isReviewerGeneratedRun('STANDARD')).toBe(false);
    });
  });

  describe('reviewer run draft isolation guards', () => {
    it('canReviewerRunAccessDraft returns false', () => {
      expect(canReviewerRunAccessDraft()).toBe(false);
    });

    it('canReviewerRunModifyDraft returns false', () => {
      expect(canReviewerRunModifyDraft()).toBe(false);
    });

    it('canReviewerRunTriggerDraftConfirmation returns false', () => {
      expect(canReviewerRunTriggerDraftConfirmation()).toBe(false);
    });

    it('canReviewerRunModifyRunHistory returns false', () => {
      expect(canReviewerRunModifyRunHistory()).toBe(false);
    });

    it('canReviewerRunAccessNarrative returns false', () => {
      expect(canReviewerRunAccessNarrative()).toBe(false);
    });
  });

  describe('getSnapshotSourcePolicyForRunType', () => {
    it('returns LATEST_CONFIRMED_ONLY for REVIEWER_GENERATED', () => {
      expect(getSnapshotSourcePolicyForRunType('REVIEWER_GENERATED')).toBe(
        'LATEST_CONFIRMED_ONLY',
      );
    });

    it('returns CURRENT_DRAFT for STANDARD', () => {
      expect(getSnapshotSourcePolicyForRunType('STANDARD')).toBe('CURRENT_DRAFT');
    });
  });

  describe('PER authority guards', () => {
    it('canPerApprovePxReviewRun returns false', () => {
      expect(canPerApprovePxReviewRun()).toBe(false);
    });

    it('canPerAdvanceReviewChain returns false', () => {
      expect(canPerAdvanceReviewChain()).toBe(false);
    });

    it('canPerModifyRunLedger returns false', () => {
      expect(canPerModifyRunLedger()).toBe(false);
    });
  });

  describe('isReviewerRunDraftIsolationValid', () => {
    it('returns true when all flags are false', () => {
      expect(
        isReviewerRunDraftIsolationValid({
          isolationId: 'iso-1',
          runId: 'run-1',
          pmDraftStateAccessed: false,
          pmDraftStateModified: false,
          pmNarrativeAccessed: false,
          pmRunHistoryModified: false,
        }),
      ).toBe(true);
    });

    it('returns false when pmDraftStateAccessed is true', () => {
      expect(
        isReviewerRunDraftIsolationValid({
          isolationId: 'iso-1',
          runId: 'run-1',
          pmDraftStateAccessed: true,
          pmDraftStateModified: false,
          pmNarrativeAccessed: false,
          pmRunHistoryModified: false,
        }),
      ).toBe(false);
    });

    it('returns false when pmDraftStateModified is true', () => {
      expect(
        isReviewerRunDraftIsolationValid({
          isolationId: 'iso-1',
          runId: 'run-1',
          pmDraftStateAccessed: false,
          pmDraftStateModified: true,
          pmNarrativeAccessed: false,
          pmRunHistoryModified: false,
        }),
      ).toBe(false);
    });

    it('returns false when pmNarrativeAccessed is true', () => {
      expect(
        isReviewerRunDraftIsolationValid({
          isolationId: 'iso-1',
          runId: 'run-1',
          pmDraftStateAccessed: false,
          pmDraftStateModified: false,
          pmNarrativeAccessed: true,
          pmRunHistoryModified: false,
        }),
      ).toBe(false);
    });

    it('returns false when pmRunHistoryModified is true', () => {
      expect(
        isReviewerRunDraftIsolationValid({
          isolationId: 'iso-1',
          runId: 'run-1',
          pmDraftStateAccessed: false,
          pmDraftStateModified: false,
          pmNarrativeAccessed: false,
          pmRunHistoryModified: true,
        }),
      ).toBe(false);
    });
  });

  describe('getPerReportPosture', () => {
    it('returns correct definition for VIEW', () => {
      const result = getPerReportPosture('VIEW');
      expect(result).not.toBeNull();
      expect(result!.posture).toBe('VIEW');
      expect(result!.isAllowed).toBe(true);
      expect(result!.governingSpecRef).toBe('P3-F1 §8.6');
    });

    it('returns null for unknown posture', () => {
      const result = getPerReportPosture('UNKNOWN' as never);
      expect(result).toBeNull();
    });
  });

  describe('annotation rules', () => {
    it('canReviewerRunAttachAnnotation returns true', () => {
      expect(canReviewerRunAttachAnnotation()).toBe(true);
    });

    it('isReviewerRunAnnotationIsolated returns true', () => {
      expect(isReviewerRunAnnotationIsolated()).toBe(true);
    });
  });
});
