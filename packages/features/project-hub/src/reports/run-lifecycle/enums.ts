/**
 * P3-E9-T04 reports run-lifecycle enumerations.
 * Run status, approval gates, release authority, generation pipeline, archival.
 */

// -- Run Lifecycle Status -----------------------------------------------------

export type RunLifecycleStatus =
  | 'QUEUED'
  | 'GENERATING'
  | 'GENERATED'
  | 'APPROVED'
  | 'RELEASED'
  | 'ARCHIVED'
  | 'FAILED';

// -- Approval Gate Requirement ------------------------------------------------

export type ApprovalGateRequirement =
  | 'PE_APPROVAL_REQUIRED'
  | 'NO_APPROVAL_GATE';

// -- Release Authority Level --------------------------------------------------

export type ReleaseAuthorityLevel =
  | 'PE_ONLY'
  | 'PER_PERMITTED'
  | 'GLOBAL';

// -- Generation Pipeline Step -------------------------------------------------

export type GenerationPipelineStep =
  | 'READINESS_CHECK'
  | 'CREATE_RUN_RECORD'
  | 'ENQUEUE_JOB'
  | 'ASSEMBLE_REPORT'
  | 'RENDER_PDF'
  | 'STORE_ARTIFACT'
  | 'RECORD_RESULT';

// -- Run Archival Reason ------------------------------------------------------

export type RunArchivalReason =
  | 'SUPERSEDED_BY_NEWER'
  | 'MANUAL_ARCHIVE'
  | 'POLICY_DRIVEN';

// -- Distribution Action ------------------------------------------------------

export type DistributionAction =
  | 'INTERNAL_DISTRIBUTION'
  | 'OWNER_DISTRIBUTION'
  | 'EXTERNAL_DISTRIBUTION';

// -- Approval Blocking Condition ----------------------------------------------

export type ApprovalBlockingCondition =
  | 'INTERNAL_REVIEW_CHAIN_INCOMPLETE'
  | 'APPROVAL_GATE_NOT_REQUIRED'
  | 'RUN_NOT_GENERATED';
