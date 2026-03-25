/**
 * Stage 8.3 run-ledger enumerations.
 * Report run types, PER reviewer-generated run enforcement.
 */

// -- Report Run Type ----------------------------------------------------------

export type ReportRunType = 'STANDARD' | 'REVIEWER_GENERATED';

// -- Report Run Status --------------------------------------------------------

export type ReportRunStatus =
  | 'PENDING'
  | 'GENERATING'
  | 'COMPLETED'
  | 'FAILED'
  | 'SUPERSEDED';

// -- Report Run Initiator -----------------------------------------------------

export type ReportRunInitiator = 'PM' | 'PE' | 'PER';

// -- Snapshot Source Policy ----------------------------------------------------

export type SnapshotSourcePolicy =
  | 'LATEST_CONFIRMED_ONLY'
  | 'CURRENT_DRAFT'
  | 'ANY_VERSION';

// -- Reviewer Run Restriction -------------------------------------------------

export type ReviewerRunRestriction =
  | 'NO_DRAFT_ACCESS'
  | 'NO_DRAFT_MODIFICATION'
  | 'NO_NARRATIVE_ACCESS'
  | 'NO_RUN_HISTORY_MODIFICATION'
  | 'NO_DRAFT_CONFIRMATION_TRIGGER';

// -- Annotation Attachment Mode -----------------------------------------------

export type AnnotationAttachmentMode = 'ATTACHED' | 'NOT_ATTACHED';

// -- Reviewer Run Visibility --------------------------------------------------

export type ReviewerRunVisibility =
  | 'PROJECT_TEAM_AND_PER'
  | 'REVIEW_CIRCLE_ONLY';

// -- PER Report Posture -------------------------------------------------------

export type PerReportPosture =
  | 'VIEW'
  | 'ANNOTATE_REVIEW_LAYER'
  | 'GENERATE_REVIEWER_RUN';
