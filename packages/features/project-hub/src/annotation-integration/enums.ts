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
