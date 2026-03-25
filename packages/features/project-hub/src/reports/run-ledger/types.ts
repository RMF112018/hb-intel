/**
 * Stage 8.3 run-ledger TypeScript contracts.
 * Run-ledger entries, reviewer-run configs, PER enforcement.
 */

import type {
  AnnotationAttachmentMode,
  PerReportPosture,
  ReportRunInitiator,
  ReportRunStatus,
  ReportRunType,
  ReviewerRunRestriction,
  ReviewerRunVisibility,
  SnapshotSourcePolicy,
} from './enums.js';

export interface IRunLedgerEntry {
  readonly runId: string;
  readonly familyKey: string;
  readonly projectId: string;
  readonly generatedAt: string;
  readonly generatedBy: string;
  readonly runType: ReportRunType;
  readonly snapshotVersion: string;
  readonly artifactUrl: string | null;
  readonly status: ReportRunStatus;
  readonly approvalMetadata: string | null;
  readonly releaseMetadata: string | null;
  readonly annotationArtifactRef: string | null;
}

export interface IReviewerGeneratedRunConfig {
  readonly runConfigId: string;
  readonly projectId: string;
  readonly initiator: ReportRunInitiator;
  readonly snapshotSourcePolicy: SnapshotSourcePolicy;
  readonly restrictions: readonly ReviewerRunRestriction[];
  readonly annotationAttachment: AnnotationAttachmentMode;
  readonly visibility: ReviewerRunVisibility;
  readonly perIdentity: string;
}

export interface IReviewerRunDraftIsolation {
  readonly isolationId: string;
  readonly runId: string;
  readonly pmDraftStateAccessed: boolean;
  readonly pmDraftStateModified: boolean;
  readonly pmNarrativeAccessed: boolean;
  readonly pmRunHistoryModified: boolean;
}

export interface IPerReportPostureDef {
  readonly posture: PerReportPosture;
  readonly description: string;
  readonly isAllowed: boolean;
  readonly governingSpecRef: string;
}

export interface IReviewerRunAcceptanceCriterion {
  readonly criterionId: string;
  readonly description: string;
  readonly isSatisfied: boolean;
  readonly evidenceRef: string;
}
