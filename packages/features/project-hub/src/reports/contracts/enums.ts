/**
 * P3-E9-T02 reports contracts enumerations.
 * Runtime model, section types, release classes, review chain, validation.
 */

// -- Report Section Content Type ----------------------------------------------

/** Content type for a report section definition. */
export type ReportSectionContentType =
  | 'MODULE_SNAPSHOT'
  | 'CALCULATED_ROLLUP'
  | 'NARRATIVE_ONLY';

// -- Release Class ------------------------------------------------------------

/** Classification of report release audience scope. */
export type ReleaseClass =
  | 'INTERNAL_ONLY'
  | 'OWNER_FACING'
  | 'EXTERNAL_LIMITED'
  | 'PUBLIC';

// -- Internal Review Chain Status ---------------------------------------------

/** Status of the PM→PE internal review chain for a report run. */
export type InternalReviewChainStatus =
  | 'NOT_STARTED'
  | 'SUBMITTED'
  | 'RETURNED'
  | 'COMPLETE';

// -- Config Version State -----------------------------------------------------

/** Lifecycle state for a project family configuration version. */
export type ConfigVersionState =
  | 'DRAFT'
  | 'ACTIVE'
  | 'SUPERSEDED'
  | 'REJECTED';

// -- Template Promotion Status ------------------------------------------------

/** Promotion lifecycle for a project template submitted for corporate review. */
export type TemplatePromotionStatus =
  | 'NOT_SUBMITTED'
  | 'SUBMITTED_FOR_REVIEW'
  | 'UNDER_REVIEW'
  | 'APPROVED_PROMOTED'
  | 'REJECTED';

// -- Report Validation Rule ---------------------------------------------------

/** Validation rules enforced on report run records and configurations. */
export type ReportValidationRule =
  | 'FAMILY_KEY_REQUIRED'
  | 'PROJECT_ID_REQUIRED'
  | 'CONFIG_VERSION_REQUIRED'
  | 'SNAPSHOT_REFS_REQUIRED'
  | 'RELEASE_CLASS_VALID'
  | 'AUDIENCE_CLASS_VALID'
  | 'GENERATED_BY_REQUIRED'
  | 'APPROVED_BY_REQUIRED'
  | 'RELEASED_BY_REQUIRED'
  | 'RELEASE_CLASS_MATCH'
  | 'NARRATIVE_PM_PE_ONLY'
  | 'SCORE_READ_ONLY'
  | 'RECOMMENDATION_READ_ONLY'
  | 'SNAPSHOT_IMMUTABLE';
