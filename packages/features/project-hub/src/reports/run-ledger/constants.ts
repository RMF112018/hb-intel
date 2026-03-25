/**
 * Stage 8.3 run-ledger constants.
 * Run types, restrictions, PER posture, acceptance criteria.
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
import type {
  IPerReportPostureDef,
  IReviewerRunAcceptanceCriterion,
} from './types.js';

// -- Enum value arrays --------------------------------------------------------

export const REPORT_RUN_TYPES: ReadonlyArray<ReportRunType> = [
  'STANDARD',
  'REVIEWER_GENERATED',
] as const satisfies ReadonlyArray<ReportRunType>;

export const REPORT_RUN_STATUSES: ReadonlyArray<ReportRunStatus> = [
  'PENDING',
  'GENERATING',
  'COMPLETED',
  'FAILED',
  'SUPERSEDED',
] as const satisfies ReadonlyArray<ReportRunStatus>;

export const REPORT_RUN_INITIATORS: ReadonlyArray<ReportRunInitiator> = [
  'PM',
  'PE',
  'PER',
] as const satisfies ReadonlyArray<ReportRunInitiator>;

export const SNAPSHOT_SOURCE_POLICIES: ReadonlyArray<SnapshotSourcePolicy> = [
  'LATEST_CONFIRMED_ONLY',
  'CURRENT_DRAFT',
  'ANY_VERSION',
] as const satisfies ReadonlyArray<SnapshotSourcePolicy>;

export const REVIEWER_RUN_RESTRICTIONS: ReadonlyArray<ReviewerRunRestriction> = [
  'NO_DRAFT_ACCESS',
  'NO_DRAFT_MODIFICATION',
  'NO_NARRATIVE_ACCESS',
  'NO_RUN_HISTORY_MODIFICATION',
  'NO_DRAFT_CONFIRMATION_TRIGGER',
] as const satisfies ReadonlyArray<ReviewerRunRestriction>;

export const ANNOTATION_ATTACHMENT_MODES: ReadonlyArray<AnnotationAttachmentMode> = [
  'ATTACHED',
  'NOT_ATTACHED',
] as const satisfies ReadonlyArray<AnnotationAttachmentMode>;

export const REVIEWER_RUN_VISIBILITIES: ReadonlyArray<ReviewerRunVisibility> = [
  'PROJECT_TEAM_AND_PER',
  'REVIEW_CIRCLE_ONLY',
] as const satisfies ReadonlyArray<ReviewerRunVisibility>;

export const PER_REPORT_POSTURES: ReadonlyArray<PerReportPosture> = [
  'VIEW',
  'ANNOTATE_REVIEW_LAYER',
  'GENERATE_REVIEWER_RUN',
] as const satisfies ReadonlyArray<PerReportPosture>;

// -- Label maps ---------------------------------------------------------------

export const REPORT_RUN_TYPE_LABELS: Readonly<Record<ReportRunType, string>> = {
  STANDARD: 'Standard',
  REVIEWER_GENERATED: 'Reviewer-Generated',
};

export const REPORT_RUN_STATUS_LABELS: Readonly<Record<ReportRunStatus, string>> = {
  PENDING: 'Pending',
  GENERATING: 'Generating',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  SUPERSEDED: 'Superseded',
};

export const REVIEWER_RUN_RESTRICTION_LABELS: Readonly<Record<ReviewerRunRestriction, string>> = {
  NO_DRAFT_ACCESS: 'No Draft Access',
  NO_DRAFT_MODIFICATION: 'No Draft Modification',
  NO_NARRATIVE_ACCESS: 'No Narrative Access',
  NO_RUN_HISTORY_MODIFICATION: 'No Run History Modification',
  NO_DRAFT_CONFIRMATION_TRIGGER: 'No Draft Confirmation Trigger',
};

// -- Definition arrays --------------------------------------------------------

export const REVIEWER_RUN_ALL_RESTRICTIONS: readonly ReviewerRunRestriction[] = [
  'NO_DRAFT_ACCESS',
  'NO_DRAFT_MODIFICATION',
  'NO_NARRATIVE_ACCESS',
  'NO_RUN_HISTORY_MODIFICATION',
  'NO_DRAFT_CONFIRMATION_TRIGGER',
];

export const PER_REPORT_POSTURE_DEFINITIONS: ReadonlyArray<IPerReportPostureDef> = [
  {
    posture: 'VIEW',
    description: 'PER may view all runs in governed department scope',
    isAllowed: true,
    governingSpecRef: 'P3-F1 §8.6',
  },
  {
    posture: 'ANNOTATE_REVIEW_LAYER',
    description: 'PER may annotate via @hbc/field-annotations review layer only',
    isAllowed: true,
    governingSpecRef: 'P3-F1 §8.6',
  },
  {
    posture: 'GENERATE_REVIEWER_RUN',
    description: 'PER may generate reviewer-generated runs using latest confirmed snapshot',
    isAllowed: true,
    governingSpecRef: 'P3-F1 §8.6',
  },
];

export const REVIEWER_RUN_ACCEPTANCE_CRITERIA: ReadonlyArray<IReviewerRunAcceptanceCriterion> = [
  {
    criterionId: 'AC-REP-23',
    description: 'Reviewer-generated runs use latest confirmed PM snapshot only',
    isSatisfied: true,
    evidenceRef: 'snapshotSourcePolicy === LATEST_CONFIRMED_ONLY',
  },
  {
    criterionId: 'AC-REP-24',
    description: 'runType distinction correctly set and displayed',
    isSatisfied: true,
    evidenceRef: 'runType === REVIEWER_GENERATED',
  },
  {
    criterionId: 'AC-REP-37',
    description: 'PER annotation via @hbc/field-annotations attaches to run record',
    isSatisfied: true,
    evidenceRef: 'annotationArtifactRef populated',
  },
  {
    criterionId: 'AC-REP-38',
    description: 'Annotation does not modify run-ledger, draft state, or PM narrative',
    isSatisfied: true,
    evidenceRef: 'isolation proof tests pass',
  },
  {
    criterionId: 'AC-REP-40',
    description: 'PER cannot advance or skip PM-PE review chain',
    isSatisfied: true,
    evidenceRef: 'canPerAdvanceReviewChain() === false',
  },
  {
    criterionId: 'AC-REP-41',
    description: 'Reviewer-generated run does not affect PM draft state or run history',
    isSatisfied: true,
    evidenceRef: 'isReviewerRunDraftIsolationValid() === true',
  },
  {
    criterionId: 'AC-REP-42',
    description: 'PER cannot approve PX Review runs',
    isSatisfied: true,
    evidenceRef: 'canPerApprovePxReviewRun() === false',
  },
];
