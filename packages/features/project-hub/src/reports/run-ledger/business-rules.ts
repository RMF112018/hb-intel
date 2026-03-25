/**
 * Stage 8.3 run-ledger business rules.
 * PER reviewer-generated run enforcement per P3-F1 §8.6.
 */

import type {
  PerReportPosture,
  ReportRunType,
  SnapshotSourcePolicy,
} from './enums.js';
import type {
  IPerReportPostureDef,
  IReviewerRunDraftIsolation,
} from './types.js';
import { PER_REPORT_POSTURE_DEFINITIONS } from './constants.js';

export const isReviewerGeneratedRun = (runType: ReportRunType): boolean =>
  runType === 'REVIEWER_GENERATED';

export const canReviewerRunAccessDraft = (): false => false;
export const canReviewerRunModifyDraft = (): false => false;
export const canReviewerRunTriggerDraftConfirmation = (): false => false;
export const canReviewerRunModifyRunHistory = (): false => false;
export const canReviewerRunAccessNarrative = (): false => false;

export const getSnapshotSourcePolicyForRunType = (
  runType: ReportRunType,
): SnapshotSourcePolicy =>
  runType === 'REVIEWER_GENERATED' ? 'LATEST_CONFIRMED_ONLY' : 'CURRENT_DRAFT';

export const canPerApprovePxReviewRun = (): false => false;
export const canPerAdvanceReviewChain = (): false => false;
export const canPerModifyRunLedger = (): false => false;

export const isReviewerRunDraftIsolationValid = (
  isolation: IReviewerRunDraftIsolation,
): boolean =>
  !isolation.pmDraftStateAccessed &&
  !isolation.pmDraftStateModified &&
  !isolation.pmNarrativeAccessed &&
  !isolation.pmRunHistoryModified;

export const getPerReportPosture = (
  posture: PerReportPosture,
): IPerReportPostureDef | null =>
  PER_REPORT_POSTURE_DEFINITIONS.find((d) => d.posture === posture) ?? null;

export const canReviewerRunAttachAnnotation = (): true => true;
export const isReviewerRunAnnotationIsolated = (): true => true;
