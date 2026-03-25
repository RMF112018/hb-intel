/**
 * Stage 8.1 annotation-integration enumerations.
 * PER executive review annotation governance.
 */

// -- Annotation-Eligible Module ---------------------------------------------------

export type AnnotationEligibleModule =
  | 'FINANCIAL'
  | 'SCHEDULE'
  | 'CONSTRAINTS'
  | 'PERMITS'
  | 'PROJECT_CLOSEOUT'
  | 'PROJECT_STARTUP'
  | 'SUBCONTRACT_EXECUTION_READINESS';

// -- Annotation-Excluded Module ---------------------------------------------------

export type AnnotationExcludedModule = 'SAFETY';

// -- Annotation Anchor Level ------------------------------------------------------

export type AnnotationAnchorLevel = 'FIELD' | 'SECTION' | 'BLOCK';

// -- Annotation Access Role -------------------------------------------------------

export type AnnotationAccessRole = 'PER_WRITE' | 'READ_ONLY' | 'NO_ACCESS';

// -- Annotation Isolation Rule ----------------------------------------------------

export type AnnotationIsolationRule =
  | 'ANNOTATION_LAYER_ONLY'
  | 'NO_MODULE_RECORD_MUTATION'
  | 'NO_DOMAIN_TABLE_WRITE';

// -- Review Surface Policy --------------------------------------------------------

export type ReviewSurfacePolicy =
  | 'FULL_ANNOTATION'
  | 'READ_ONLY_ANNOTATION'
  | 'NO_ANNOTATION';

// -- Stage 8.2 Isolation Enforcement Enums ----------------------------------------

/** Annotation write-path validation result per P3-E2 §11.2. */
export type AnnotationWritePathValidation =
  | 'VALID_ANNOTATION_LAYER'
  | 'BLOCKED_MODULE_MUTATION'
  | 'BLOCKED_DOMAIN_TABLE_WRITE'
  | 'BLOCKED_SAFETY_MODULE';

/** Isolation proof test result per P3-E2 §11.2. */
export type IsolationProofResult =
  | 'ZERO_MODULE_WRITES'
  | 'MODULE_WRITE_DETECTED'
  | 'DOMAIN_TABLE_WRITE_DETECTED';

/** Annotation mutation audit event types per P3-E2 §11.2. */
export type AnnotationMutationAuditEvent =
  | 'ANNOTATION_CREATED'
  | 'ANNOTATION_UPDATED'
  | 'ANNOTATION_RESOLVED'
  | 'ANNOTATION_DELETED'
  | 'MODULE_MUTATION_BLOCKED'
  | 'DOMAIN_WRITE_BLOCKED'
  | 'SAFETY_WRITE_BLOCKED';

/** Module domain tables protected from annotation writes per P3-E2 §3-§16. */
export type ModuleDomainTable =
  | 'FINANCIAL_FORECAST'
  | 'FINANCIAL_BUDGET'
  | 'SCHEDULE_SOURCE'
  | 'SCHEDULE_COMMITMENT'
  | 'CONSTRAINTS_LEDGER'
  | 'PERMITS_REGISTRY'
  | 'CLOSEOUT_CHECKLIST'
  | 'STARTUP_PROGRAM'
  | 'SUBCONTRACT_READINESS_CASE'
  | 'REPORTS_RUN_LEDGER';
