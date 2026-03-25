/**
 * P3-E15-T10 Stage 7 Project QC Module submittal-advisory enumerations.
 */

// -- Conditional Status (T07 §3) ----------------------------------------------

/** Conditional status for document inventory items per T07 §3. */
export type ConditionalStatus =
  | 'RECEIVED'
  | 'MISSING'
  | 'NOT_APPLICABLE'
  | 'DEFERRED_LATER_PHASE'
  | 'REPLACED_BY_APPROVED_EQUIVALENT'
  | 'WAIVED_BY_APPROVED_EXCEPTION';

// -- Submittal Revision Reason (T07 §4) ---------------------------------------

/** Reasons for submittal revision per T07 §4. */
export type SubmittalRevisionReason =
  | 'RESUBMITTAL'
  | 'PACKAGE_UPDATE'
  | 'OFFICIAL_SOURCE_CHANGE'
  | 'OVERLAY_CHANGE'
  | 'EXCEPTION_CHANGE'
  | 'OWNER_CORRECTION';

// -- Official Source Type (T07 §5) --------------------------------------------

/** Official source types per T07 §5. */
export type OfficialSourceType =
  | 'MANUFACTURER_SITE'
  | 'MANUFACTURER_PORTAL'
  | 'LISTED_CERTIFIER'
  | 'OFFICIAL_STANDARDS_PUBLISHER';

// -- Capture Method (T07 §5) --------------------------------------------------

/** Capture methods for official source references per T07 §5. */
export type CaptureMethod =
  | 'MANUAL_REFERENCE'
  | 'ASSISTED_REFERENCE'
  | 'INTEGRATED_REFERENCE';

// -- Inventory Confirmation State (T07 §3) ------------------------------------

/** Inventory confirmation states per T07 §3. */
export type InventoryConfirmationState =
  | 'DRAFT_EXTRACTED'
  | 'OWNER_CONFIRMED'
  | 'REVIEW_CONFIRMED'
  | 'SUPERSEDED';

// -- Package Completeness (T07 §6) --------------------------------------------

/** Package completeness verdicts per T07 §6. */
export type PackageCompleteness =
  | 'COMPLETE'
  | 'COMPLETE_WITH_CONDITIONS'
  | 'INCOMPLETE';

// -- Document Currentness (T07 §6) --------------------------------------------

/** Document currentness rollup verdicts per T07 §6. */
export type DocumentCurrentness =
  | 'CURRENT'
  | 'MIXED'
  | 'OUTDATED'
  | 'UNABLE_TO_VERIFY_ROLLUP';

// -- Advisory Currentness Status (T07 §5) -------------------------------------

/** Advisory-level currentness status per T07 §5. */
export type AdvisoryCurrentnessStatus =
  | 'CURRENT'
  | 'OUTDATED'
  | 'UNABLE_TO_VERIFY';

// -- Manual Review Reason Code (T07 §6) ---------------------------------------

/** Reason codes that force manual review per T07 §6. */
export type ManualReviewReasonCode =
  | 'NO_OFFICIAL_SOURCE'
  | 'INSUFFICIENT_METADATA'
  | 'SOURCE_INACCESSIBLE'
  | 'SOURCE_NON_VERSIONED'
  | 'REQUIRES_TECHNICAL_INTERPRETATION'
  | 'UNABLE_TO_VERIFY_CURRENTNESS';

// -- Submittal Item Type (T07 §2) ---------------------------------------------

/** Submittal item types per T07 §2. */
export type SubmittalItemType =
  | 'PRODUCT'
  | 'MATERIAL'
  | 'SYSTEM';

// -- Submittal Created From (T07 §2) ------------------------------------------

/** Origin of submittal item creation per T07 §2. */
export type SubmittalCreatedFrom =
  | 'MANUAL'
  | 'IMPORT_ASSISTED'
  | 'INTEGRATED';

// -- Document Family Class (T07 §3) -------------------------------------------

/** Document family classification per T07 §3. */
export type DocumentFamilyClass =
  | 'PRODUCT_TECHNICAL_DATA'
  | 'INSTALLATION_REQUIREMENTS'
  | 'DETAIL_CONFIGURATION_GUIDANCE'
  | 'PERFORMANCE_CERTIFICATION_EVIDENCE'
  | 'FINISH_SELECTION_CONFIRMATION'
  | 'OPERATIONS_WARRANTY_REFERENCE'
  | 'EQUIVALENT_SUBSTITUTION_BASIS';

// -- Drift Urgency Risk Class (T07 §7) ----------------------------------------

/** Drift urgency risk classification per T07 §7. */
export type DriftUrgencyRiskClass =
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'INFORMATIONAL';

// -- Drift Required Next Action (T07 §7) --------------------------------------

/** Required next action for version drift per T07 §7. */
export type DriftRequiredNextAction =
  | 'RECHECK_BEFORE_MILESTONE'
  | 'GENERATE_QC_ISSUE'
  | 'PUBLISH_READINESS_WARNING'
  | 'MANUAL_REVIEW_NEEDED';

// -- Activation Stage Result (T07 §8) -----------------------------------------

/** Activation stage result per T07 §8. */
export type ActivationStageResult =
  | 'PRELIMINARY_GUIDANCE_ISSUED'
  | 'FULL_ACTIVATION_ISSUED'
  | 'ACTIVATION_BLOCKED'
  | 'ACTIVATION_DEFERRED';
