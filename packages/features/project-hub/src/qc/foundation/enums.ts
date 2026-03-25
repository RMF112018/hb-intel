/**
 * P3-E15-T10 Stage 1 Project QC Module foundation enumerations.
 * Operating model, SoT boundaries, adjacent modules, record families, governance.
 */

// -- Key Actor (T01 §3, §5) ---------------------------------------------------

/** Key actors per T01 §3 and §5. */
export type QcKeyActor =
  | 'PM_PE_PA'
  | 'SUPERINTENDENT'
  | 'QC_MANAGER'
  | 'AUTHORIZED_HB_VERIFIER'
  | 'READ_ONLY_LEADERSHIP'
  | 'MOE_ADMIN'
  | 'DISCIPLINE_REVIEWER';

// -- Phase 3 Access Posture (T01 §3) ------------------------------------------

/** Phase 3 access posture per T01 §3. */
export type QcPhase3AccessPosture =
  | 'FULL_AUTHORING_REVIEW'
  | 'EXECUTION_READINESS_FOLLOWUP'
  | 'HIGH_RISK_REVIEW_CANDIDATE_AUTHORING'
  | 'VERIFICATION_CLOSURE'
  | 'READ_ONLY_PROJECTION'
  | 'HIDDEN';

// -- Anti-Goal (T01 §1.2) -----------------------------------------------------

/** Anti-goals per T01 §1.2 — what QC is not. */
export type QcAntiGoal =
  | 'MOBILE_FIRST_FIELD_APP'
  | 'PUNCH_WARRANTY_SYSTEM'
  | 'SUBMITTAL_WORKFLOW_ENGINE'
  | 'DOCUMENT_REPOSITORY'
  | 'OWNER_SUBCONTRACTOR_PORTAL'
  | 'STARTUP_CLOSEOUT_REPLACEMENT';

// -- Lifecycle Handoff Target (T01 §2.2) --------------------------------------

/** Lifecycle handoff targets per T01 §2.2. */
export type QcLifecycleHandoffTarget =
  | 'FORMAL_PUNCH'
  | 'STARTUP_COMMISSIONING'
  | 'CLOSEOUT_ASSEMBLY'
  | 'WARRANTY_CASE_OPS';

// -- Adjacent Module (T01 §6) -------------------------------------------------

/** Adjacent modules with explicit boundaries per T01 §6. */
export type QcAdjacentModule =
  | 'STARTUP'
  | 'CLOSEOUT'
  | 'WARRANTY'
  | 'SCHEDULE'
  | 'REPORTS'
  | 'MY_WORK'
  | 'RELATED_ITEMS'
  | 'FUTURE_SITE_CONTROLS';

// -- Out-of-Scope Items (T01 §7.1) --------------------------------------------

/** Explicit Phase 3 out-of-scope items per T01 §7.1. */
export type QcOutOfScopeItem =
  | 'PUNCH_LIST'
  | 'OWNER_PORTAL'
  | 'SUBCONTRACTOR_PORTAL'
  | 'EXTERNAL_COLLABORATION'
  | 'FILE_STORAGE'
  | 'MOBILE_FIRST_ENGINE'
  | 'FULL_SUBMITTAL_WORKFLOW'
  | 'OFFLINE_FIELD_EXECUTION'
  | 'OWNER_FACING_RELEASE';

// -- Operational Ownership Area (T01 §5) --------------------------------------

/** Operational ownership areas per T01 §5. */
export type QcOperationalOwnershipArea =
  | 'REVIEW_PACKAGE_ADMIN'
  | 'EXECUTION_READINESS'
  | 'HIGH_RISK_REVIEW'
  | 'VERIFICATION_CLOSURE';

// -- Lane Capability (T01 §7) -------------------------------------------------

/** Lane capability posture per T01 §7. */
export type QcLaneCapability =
  | 'PWA_BASELINE_VISIBLE'
  | 'SPFX_BASELINE_VISIBLE'
  | 'DEEPER_FIELD_MOBILE_DEFERRED';

// -- Governed Core Concern (T02 §2) -------------------------------------------

/** Governed core concerns per T02 §2. */
export type GovernedCoreConcern =
  | 'STANDARDS_LIBRARY'
  | 'TAXONOMY_FLOOR'
  | 'MANDATORY_PLAN_SETS'
  | 'DOCUMENT_FAMILY_REQUIREMENTS'
  | 'MAPPING_ENGINE_RULES'
  | 'EVIDENCE_MINIMUMS'
  | 'SLA_AGING_MATRICES'
  | 'ROOT_CAUSE_MODEL'
  | 'SCORECARD_FORMULAS'
  | 'RESPONSIBLE_ORG_ROLLUP_LOGIC'
  | 'OFFICIAL_SOURCE_CURRENTNESS_RULES';

// -- Promotion Decision Outcome (T02 §3.2) ------------------------------------

/** Promotion decision outcomes per T02 §3.2. */
export type PromotionDecisionOutcome =
  | 'APPROVED_PROMOTED'
  | 'APPROVED_PROJECT_ONLY'
  | 'REJECTED'
  | 'RETURNED_FOR_REVISION';

// -- Update Notice Adoption State (T02 §6.2) ----------------------------------

/** Update notice adoption states per T02 §6.2. */
export type UpdateNoticeAdoptionState =
  | 'PENDING_REVIEW'
  | 'ACCEPTED'
  | 'ACCEPTED_WITH_PROJECT_BASIS_RETAINED'
  | 'APPROVED_EXCEPTION'
  | 'SUPERSEDED';

// -- Record Family (T03 §1) ---------------------------------------------------

/** QC canonical record families per T03 §1. */
export type QcRecordFamily =
  | 'GovernedQualityStandard'
  | 'ProjectQualityExtension'
  | 'WorkPackageQualityPlan'
  | 'PreconstructionReviewPackage'
  | 'ReviewFinding'
  | 'QcIssue'
  | 'CorrectiveAction'
  | 'DeviationOrWaiverRecord'
  | 'EvidenceReference'
  | 'ExternalApprovalDependency'
  | 'ResponsiblePartyAssignment'
  | 'RootCauseAndRecurrenceRecord'
  | 'QualityHealthSnapshot'
  | 'GovernedUpdateNotice'
  | 'ProjectQcSnapshot'
  | 'ResponsibleOrgPerformanceRollupInput'
  | 'SubmittalItemRecord'
  | 'DocumentInventoryEntry'
  | 'AdvisoryVerdict'
  | 'AdvisoryException'
  | 'VersionDriftAlert';

// -- Supporting Reference Family (T03 §1) -------------------------------------

/** QC supporting reference families per T03 §1. */
export type QcSupportingRefFamily =
  | 'SubmittalSpecLinkRef'
  | 'SubmittalPackageLinkRef'
  | 'WorkPackageRef'
  | 'ReviewPackageRef'
  | 'DownstreamHandoffRef';

// -- SoT Authority (T03 §3) ---------------------------------------------------

/** Source-of-truth authority owners per T03 §3. */
export type QcSoTAuthority =
  | 'QC_GOVERNED_CORE'
  | 'QC_PROJECT_STORE'
  | 'QC_SNAPSHOT_STORE'
  | 'QC_GOVERNED_NOTICE_STORE'
  | 'QC_DERIVED_INPUT_STORE'
  | 'STARTUP_MODULE'
  | 'CLOSEOUT_MODULE'
  | 'WARRANTY_MODULE'
  | 'SCHEDULE_MODULE'
  | 'DOCUMENT_SYSTEM'
  | 'WORK_QUEUE_SPINE'
  | 'RELATED_ITEMS_SPINE'
  | 'HEALTH_SPINE';

// -- SoT Relationship (T03 §3) ------------------------------------------------

/** QC relationship to each data concern per T03 §3. */
export type QcSoTRelationship =
  | 'AUTHOR_AND_MAINTAIN'
  | 'CONSUME_AS_REFERENCE'
  | 'PUBLISH_ONLY'
  | 'DERIVED_PROJECTION';

// -- State Lifecycle Enums (T03 §2) -------------------------------------------

/** GovernedQualityStandard state per T03 §2.1. */
export type GovernedStandardState =
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'PUBLISHED'
  | 'SUPERSEDED'
  | 'RETIRED';

/** ProjectQualityExtension state per T03 §2.1. */
export type ProjectExtensionState =
  | 'DRAFT'
  | 'APPROVED_PROJECT_ONLY'
  | 'SUBMITTED_FOR_PROMOTION'
  | 'PROMOTED'
  | 'REJECTED'
  | 'RETIRED';

/** WorkPackageQualityPlan state per T03 §2.2. */
export type WorkPackagePlanState =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'PRELIMINARILY_ACTIVE'
  | 'ACTIVE'
  | 'READY_FOR_CONTROL_GATES'
  | 'REVISED'
  | 'SUPERSEDED'
  | 'CLOSED';

/** PreconstructionReviewPackage state per T03 §2.2. */
export type ReviewPackageState =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'ACCEPTED_WITH_CONDITIONS'
  | 'RETURNED'
  | 'VOIDED';

/** ReviewFinding state per T03 §2.2. */
export type ReviewFindingState =
  | 'OPEN'
  | 'ACCEPTED'
  | 'DEFERRED'
  | 'CONVERTED_TO_ISSUE'
  | 'CLOSED';

/** QcIssue state per T03 §2.3. */
export type QcIssueState =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'READY_FOR_REVIEW'
  | 'VERIFIED'
  | 'CLOSED'
  | 'VOIDED'
  | 'ESCALATED';

/** CorrectiveAction state per T03 §2.3. */
export type CorrectiveActionState =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'READY_FOR_REVIEW'
  | 'VERIFIED'
  | 'CLOSED'
  | 'OVERDUE'
  | 'VOIDED';

/** DeviationOrWaiverRecord state per T03 §2.3. */
export type DeviationState =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'WITHDRAWN'
  | 'RESOLVED';

/** EvidenceReference state per T03 §2.4. */
export type EvidenceRefState =
  | 'CAPTURED'
  | 'SUBMITTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'SUPERSEDED';

/** ExternalApprovalDependency state per T03 §2.4. */
export type ExternalApprovalState =
  | 'NOT_STARTED'
  | 'SUBMITTED'
  | 'AWAITING_RESPONSE'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'WAIVED';

/** ResponsiblePartyAssignment state per T03 §2.4. */
export type ResponsiblePartyState =
  | 'ACTIVE'
  | 'SUPERSEDED'
  | 'ENDED';

/** RootCauseAndRecurrenceRecord state per T03 §2.5. */
export type RootCauseState =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'PUBLISHED_TO_LEARNING'
  | 'SUPERSEDED';

/** QualityHealthSnapshot state per T03 §2.5. */
export type QualityHealthSnapshotState =
  | 'COMPUTED'
  | 'PUBLISHED'
  | 'SUPERSEDED';

/** ProjectQcSnapshot state per T03 §2.5. */
export type ProjectQcSnapshotState =
  | 'WORKING'
  | 'PROJECT_BASELINE'
  | 'SNAPSHOT_PUBLISHED'
  | 'SUPERSEDED';

/** GovernedUpdateNotice state per T03 §2.5. */
export type GovernedUpdateNoticeState =
  | 'PUBLISHED'
  | 'RESOLVED'
  | 'SUPERSEDED';

/** ResponsibleOrgPerformanceRollupInput state per T03 §2.5. */
export type RollupInputState =
  | 'COMPUTED'
  | 'CONSUMED'
  | 'SUPERSEDED';

/** SubmittalItemRecord state per T03 §2.6. */
export type SubmittalItemState =
  | 'DRAFT'
  | 'PRELIMINARY_GUIDANCE'
  | 'PACKAGE_REVIEW_ACTIVE'
  | 'ACCEPTED_ADVISORY'
  | 'EXCEPTION_APPROVED'
  | 'MANUAL_REVIEW_REQUIRED'
  | 'SUPERSEDED';

/** DocumentInventoryEntry state per T03 §2.6. */
export type DocInventoryState =
  | 'CAPTURED'
  | 'CONFIRMED'
  | 'VERIFIED'
  | 'UNABLE_TO_VERIFY'
  | 'SUPERSEDED';

/** AdvisoryVerdict state per T03 §2.6. */
export type AdvisoryVerdictState =
  | 'ISSUED'
  | 'SUPERSEDED';

/** AdvisoryException state per T03 §2.6. */
export type AdvisoryExceptionState =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED';

/** VersionDriftAlert state per T03 §2.6. */
export type VersionDriftAlertState =
  | 'OPEN'
  | 'ACKNOWLEDGED'
  | 'RECHECKED'
  | 'RESOLVED'
  | 'SUPERSEDED';

// -- QcIssue Origin (T03 §2.3) ------------------------------------------------

/** QcIssue origin classification per T03 §2.3. */
export type QcIssueOrigin =
  | 'FINDING'
  | 'GATE'
  | 'AD_HOC'
  | 'ADVISORY'
  | 'DEVIATION_FALLBACK';
