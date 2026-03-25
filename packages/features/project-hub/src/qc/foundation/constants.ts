/**
 * P3-E15-T10 Stage 1 Project QC Module foundation constants.
 * Operating model governance data serialized from T01, T02, T03.
 */

import type {
  AdvisoryExceptionState,
  AdvisoryVerdictState,
  CorrectiveActionState,
  DeviationState,
  DocInventoryState,
  EvidenceRefState,
  ExternalApprovalState,
  GovernedCoreConcern,
  GovernedStandardState,
  GovernedUpdateNoticeState,
  ProjectExtensionState,
  ProjectQcSnapshotState,
  PromotionDecisionOutcome,
  QcAdjacentModule,
  QcAntiGoal,
  QcIssueOrigin,
  QcIssueState,
  QcKeyActor,
  QcLaneCapability,
  QcLifecycleHandoffTarget,
  QcOperationalOwnershipArea,
  QcOutOfScopeItem,
  QcPhase3AccessPosture,
  QcRecordFamily,
  QcSoTAuthority,
  QcSoTRelationship,
  QcSupportingRefFamily,
  QualityHealthSnapshotState,
  ResponsiblePartyState,
  ReviewFindingState,
  ReviewPackageState,
  RollupInputState,
  RootCauseState,
  SubmittalItemState,
  UpdateNoticeAdoptionState,
  VersionDriftAlertState,
  WorkPackagePlanState,
} from './enums.js';
import type {
  IQcAdjacentModuleBoundary,
  IQcAntiGoalDef,
  IQcCrossContractRef,
  IQcDownstreamHandoff,
  IQcGovernedCoreConcernDef,
  IQcHistoricalInputBoundary,
  IQcLaneCapabilityDef,
  IQcLineageChainStep,
  IQcLockedInvariant,
  IQcOperationalOwnershipDef,
  IQcOutOfScopeDef,
  IQcProjectExtensionRule,
  IQcRecordFamilyDef,
  IQcRoleAction,
  IQcSharedPackageRequirement,
  IQcSoTBoundary,
  IQcVerifierDesignationRule,
} from './types.js';

// -- Enum Arrays ----------------------------------------------------------------

export const QC_KEY_ACTORS = [
  'PM_PE_PA', 'SUPERINTENDENT', 'QC_MANAGER', 'AUTHORIZED_HB_VERIFIER',
  'READ_ONLY_LEADERSHIP', 'MOE_ADMIN', 'DISCIPLINE_REVIEWER',
] as const satisfies ReadonlyArray<QcKeyActor>;

export const QC_PHASE3_ACCESS_POSTURES = [
  'FULL_AUTHORING_REVIEW', 'EXECUTION_READINESS_FOLLOWUP',
  'HIGH_RISK_REVIEW_CANDIDATE_AUTHORING', 'VERIFICATION_CLOSURE',
  'READ_ONLY_PROJECTION', 'HIDDEN',
] as const satisfies ReadonlyArray<QcPhase3AccessPosture>;

export const QC_ANTI_GOALS = [
  'MOBILE_FIRST_FIELD_APP', 'PUNCH_WARRANTY_SYSTEM', 'SUBMITTAL_WORKFLOW_ENGINE',
  'DOCUMENT_REPOSITORY', 'OWNER_SUBCONTRACTOR_PORTAL', 'STARTUP_CLOSEOUT_REPLACEMENT',
] as const satisfies ReadonlyArray<QcAntiGoal>;

export const QC_LIFECYCLE_HANDOFF_TARGETS = [
  'FORMAL_PUNCH', 'STARTUP_COMMISSIONING', 'CLOSEOUT_ASSEMBLY', 'WARRANTY_CASE_OPS',
] as const satisfies ReadonlyArray<QcLifecycleHandoffTarget>;

export const QC_ADJACENT_MODULES = [
  'STARTUP', 'CLOSEOUT', 'WARRANTY', 'SCHEDULE',
  'REPORTS', 'MY_WORK', 'RELATED_ITEMS', 'FUTURE_SITE_CONTROLS',
] as const satisfies ReadonlyArray<QcAdjacentModule>;

export const QC_OUT_OF_SCOPE_ITEMS = [
  'PUNCH_LIST', 'OWNER_PORTAL', 'SUBCONTRACTOR_PORTAL',
  'EXTERNAL_COLLABORATION', 'FILE_STORAGE', 'MOBILE_FIRST_ENGINE',
  'FULL_SUBMITTAL_WORKFLOW', 'OFFLINE_FIELD_EXECUTION', 'OWNER_FACING_RELEASE',
] as const satisfies ReadonlyArray<QcOutOfScopeItem>;

export const QC_OPERATIONAL_OWNERSHIP_AREAS = [
  'REVIEW_PACKAGE_ADMIN', 'EXECUTION_READINESS', 'HIGH_RISK_REVIEW', 'VERIFICATION_CLOSURE',
] as const satisfies ReadonlyArray<QcOperationalOwnershipArea>;

export const QC_LANE_CAPABILITIES = [
  'PWA_BASELINE_VISIBLE', 'SPFX_BASELINE_VISIBLE', 'DEEPER_FIELD_MOBILE_DEFERRED',
] as const satisfies ReadonlyArray<QcLaneCapability>;

export const QC_GOVERNED_CORE_CONCERNS = [
  'STANDARDS_LIBRARY', 'TAXONOMY_FLOOR', 'MANDATORY_PLAN_SETS',
  'DOCUMENT_FAMILY_REQUIREMENTS', 'MAPPING_ENGINE_RULES', 'EVIDENCE_MINIMUMS',
  'SLA_AGING_MATRICES', 'ROOT_CAUSE_MODEL', 'SCORECARD_FORMULAS',
  'RESPONSIBLE_ORG_ROLLUP_LOGIC', 'OFFICIAL_SOURCE_CURRENTNESS_RULES',
] as const satisfies ReadonlyArray<GovernedCoreConcern>;

export const QC_PROMOTION_DECISION_OUTCOMES = [
  'APPROVED_PROMOTED', 'APPROVED_PROJECT_ONLY', 'REJECTED', 'RETURNED_FOR_REVISION',
] as const satisfies ReadonlyArray<PromotionDecisionOutcome>;

export const QC_UPDATE_NOTICE_ADOPTION_STATES = [
  'PENDING_REVIEW', 'ACCEPTED', 'ACCEPTED_WITH_PROJECT_BASIS_RETAINED',
  'APPROVED_EXCEPTION', 'SUPERSEDED',
] as const satisfies ReadonlyArray<UpdateNoticeAdoptionState>;

export const QC_RECORD_FAMILIES = [
  'GovernedQualityStandard', 'ProjectQualityExtension', 'WorkPackageQualityPlan',
  'PreconstructionReviewPackage', 'ReviewFinding', 'QcIssue', 'CorrectiveAction',
  'DeviationOrWaiverRecord', 'EvidenceReference', 'ExternalApprovalDependency',
  'ResponsiblePartyAssignment', 'RootCauseAndRecurrenceRecord', 'QualityHealthSnapshot',
  'GovernedUpdateNotice', 'ProjectQcSnapshot', 'ResponsibleOrgPerformanceRollupInput',
  'SubmittalItemRecord', 'DocumentInventoryEntry', 'AdvisoryVerdict',
  'AdvisoryException', 'VersionDriftAlert',
] as const satisfies ReadonlyArray<QcRecordFamily>;

export const QC_SUPPORTING_REF_FAMILIES = [
  'SubmittalSpecLinkRef', 'SubmittalPackageLinkRef', 'WorkPackageRef',
  'ReviewPackageRef', 'DownstreamHandoffRef',
] as const satisfies ReadonlyArray<QcSupportingRefFamily>;

export const QC_SOT_AUTHORITIES = [
  'QC_GOVERNED_CORE', 'QC_PROJECT_STORE', 'QC_SNAPSHOT_STORE',
  'QC_GOVERNED_NOTICE_STORE', 'QC_DERIVED_INPUT_STORE',
  'STARTUP_MODULE', 'CLOSEOUT_MODULE', 'WARRANTY_MODULE', 'SCHEDULE_MODULE',
  'DOCUMENT_SYSTEM', 'WORK_QUEUE_SPINE', 'RELATED_ITEMS_SPINE', 'HEALTH_SPINE',
] as const satisfies ReadonlyArray<QcSoTAuthority>;

export const QC_SOT_RELATIONSHIPS = [
  'AUTHOR_AND_MAINTAIN', 'CONSUME_AS_REFERENCE', 'PUBLISH_ONLY', 'DERIVED_PROJECTION',
] as const satisfies ReadonlyArray<QcSoTRelationship>;

// -- State Lifecycle Enum Arrays ------------------------------------------------

export const GOVERNED_STANDARD_STATES = [
  'DRAFT', 'UNDER_REVIEW', 'PUBLISHED', 'SUPERSEDED', 'RETIRED',
] as const satisfies ReadonlyArray<GovernedStandardState>;

export const PROJECT_EXTENSION_STATES = [
  'DRAFT', 'APPROVED_PROJECT_ONLY', 'SUBMITTED_FOR_PROMOTION', 'PROMOTED', 'REJECTED', 'RETIRED',
] as const satisfies ReadonlyArray<ProjectExtensionState>;

export const WORK_PACKAGE_PLAN_STATES = [
  'DRAFT', 'IN_REVIEW', 'PRELIMINARILY_ACTIVE', 'ACTIVE', 'READY_FOR_CONTROL_GATES', 'REVISED', 'SUPERSEDED', 'CLOSED',
] as const satisfies ReadonlyArray<WorkPackagePlanState>;

export const REVIEW_PACKAGE_STATES = [
  'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'ACCEPTED_WITH_CONDITIONS', 'RETURNED', 'VOIDED',
] as const satisfies ReadonlyArray<ReviewPackageState>;

export const REVIEW_FINDING_STATES = [
  'OPEN', 'ACCEPTED', 'DEFERRED', 'CONVERTED_TO_ISSUE', 'CLOSED',
] as const satisfies ReadonlyArray<ReviewFindingState>;

export const QC_ISSUE_STATES = [
  'OPEN', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'VERIFIED', 'CLOSED', 'VOIDED', 'ESCALATED',
] as const satisfies ReadonlyArray<QcIssueState>;

export const CORRECTIVE_ACTION_STATES = [
  'OPEN', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'VERIFIED', 'CLOSED', 'OVERDUE', 'VOIDED',
] as const satisfies ReadonlyArray<CorrectiveActionState>;

export const DEVIATION_STATES = [
  'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'EXPIRED', 'WITHDRAWN',
] as const satisfies ReadonlyArray<DeviationState>;

export const EVIDENCE_REF_STATES = [
  'CAPTURED', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'SUPERSEDED',
] as const satisfies ReadonlyArray<EvidenceRefState>;

export const EXTERNAL_APPROVAL_STATES = [
  'NOT_STARTED', 'SUBMITTED', 'AWAITING_RESPONSE', 'APPROVED', 'REJECTED', 'EXPIRED', 'WAIVED',
] as const satisfies ReadonlyArray<ExternalApprovalState>;

export const RESPONSIBLE_PARTY_STATES = [
  'ACTIVE', 'SUPERSEDED', 'ENDED',
] as const satisfies ReadonlyArray<ResponsiblePartyState>;

export const ROOT_CAUSE_STATES = [
  'DRAFT', 'CONFIRMED', 'PUBLISHED_TO_LEARNING', 'SUPERSEDED',
] as const satisfies ReadonlyArray<RootCauseState>;

export const QUALITY_HEALTH_SNAPSHOT_STATES = [
  'COMPUTED', 'PUBLISHED', 'SUPERSEDED',
] as const satisfies ReadonlyArray<QualityHealthSnapshotState>;

export const PROJECT_QC_SNAPSHOT_STATES = [
  'WORKING', 'PROJECT_BASELINE', 'SNAPSHOT_PUBLISHED', 'SUPERSEDED',
] as const satisfies ReadonlyArray<ProjectQcSnapshotState>;

export const GOVERNED_UPDATE_NOTICE_STATES = [
  'PUBLISHED', 'RESOLVED', 'SUPERSEDED',
] as const satisfies ReadonlyArray<GovernedUpdateNoticeState>;

export const ROLLUP_INPUT_STATES = [
  'COMPUTED', 'CONSUMED', 'SUPERSEDED',
] as const satisfies ReadonlyArray<RollupInputState>;

export const SUBMITTAL_ITEM_STATES = [
  'DRAFT', 'PRELIMINARY_GUIDANCE', 'PACKAGE_REVIEW_ACTIVE',
  'ACCEPTED_ADVISORY', 'EXCEPTION_APPROVED', 'MANUAL_REVIEW_REQUIRED', 'SUPERSEDED',
] as const satisfies ReadonlyArray<SubmittalItemState>;

export const DOC_INVENTORY_STATES = [
  'CAPTURED', 'CONFIRMED', 'VERIFIED', 'UNABLE_TO_VERIFY', 'SUPERSEDED',
] as const satisfies ReadonlyArray<DocInventoryState>;

export const ADVISORY_VERDICT_STATES = [
  'ISSUED', 'SUPERSEDED',
] as const satisfies ReadonlyArray<AdvisoryVerdictState>;

export const ADVISORY_EXCEPTION_STATES = [
  'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'EXPIRED',
] as const satisfies ReadonlyArray<AdvisoryExceptionState>;

export const VERSION_DRIFT_ALERT_STATES = [
  'OPEN', 'ACKNOWLEDGED', 'RECHECKED', 'RESOLVED', 'SUPERSEDED',
] as const satisfies ReadonlyArray<VersionDriftAlertState>;

export const QC_ISSUE_ORIGINS = [
  'FINDING', 'AD_HOC', 'ADVISORY', 'DEVIATION_FALLBACK',
] as const satisfies ReadonlyArray<QcIssueOrigin>;

// -- Label Maps -----------------------------------------------------------------

export const QC_KEY_ACTOR_LABELS: Readonly<Record<QcKeyActor, string>> = {
  PM_PE_PA: 'PM / PE / PA / Project Engineer',
  SUPERINTENDENT: 'Superintendent / field leadership',
  QC_MANAGER: 'Quality Control Manager',
  AUTHORIZED_HB_VERIFIER: 'Authorized HB verifier',
  READ_ONLY_LEADERSHIP: 'Read-only internal leadership',
  MOE_ADMIN: 'MOE / Admin',
  DISCIPLINE_REVIEWER: 'Discipline reviewer',
};

export const QC_ADJACENT_MODULE_LABELS: Readonly<Record<QcAdjacentModule, string>> = {
  STARTUP: 'Project Startup (P3-E11)',
  CLOSEOUT: 'Project Closeout (P3-E10)',
  WARRANTY: 'Project Warranty (P3-E14)',
  SCHEDULE: 'Schedule (P3-E5)',
  REPORTS: 'Reports (P3-F1)',
  MY_WORK: 'My Work / Project Work Queue (P3-D3)',
  RELATED_ITEMS: 'Related Items (P3-D4)',
  FUTURE_SITE_CONTROLS: 'Future Site Controls',
};

export const QC_OUT_OF_SCOPE_LABELS: Readonly<Record<QcOutOfScopeItem, string>> = {
  PUNCH_LIST: 'Punch list ownership',
  OWNER_PORTAL: 'Owner portal',
  SUBCONTRACTOR_PORTAL: 'Subcontractor portal',
  EXTERNAL_COLLABORATION: 'Direct external collaboration workspace',
  FILE_STORAGE: 'File storage or file-system replacement behavior',
  MOBILE_FIRST_ENGINE: 'Mobile-first execution engine',
  FULL_SUBMITTAL_WORKFLOW: 'Full submittal workflow or routing',
  OFFLINE_FIELD_EXECUTION: 'Broad offline/deferred-sync field execution',
  OWNER_FACING_RELEASE: 'Owner-facing release or distribution behavior',
};

export const QC_RECORD_FAMILY_LABELS: Readonly<Record<QcRecordFamily, string>> = {
  GovernedQualityStandard: 'Governed Quality Standard',
  ProjectQualityExtension: 'Project Quality Extension',
  WorkPackageQualityPlan: 'Work Package Quality Plan',
  PreconstructionReviewPackage: 'Preconstruction Review Package',
  ReviewFinding: 'Review Finding',
  QcIssue: 'QC Issue',
  CorrectiveAction: 'Corrective Action',
  DeviationOrWaiverRecord: 'Deviation or Waiver Record',
  EvidenceReference: 'Evidence Reference',
  ExternalApprovalDependency: 'External Approval Dependency',
  ResponsiblePartyAssignment: 'Responsible Party Assignment',
  RootCauseAndRecurrenceRecord: 'Root Cause and Recurrence Record',
  QualityHealthSnapshot: 'Quality Health Snapshot',
  GovernedUpdateNotice: 'Governed Update Notice',
  ProjectQcSnapshot: 'Project QC Snapshot',
  ResponsibleOrgPerformanceRollupInput: 'Responsible Org Performance Rollup Input',
  SubmittalItemRecord: 'Submittal Item Record',
  DocumentInventoryEntry: 'Document Inventory Entry',
  AdvisoryVerdict: 'Advisory Verdict',
  AdvisoryException: 'Advisory Exception',
  VersionDriftAlert: 'Version Drift Alert',
};

export const QC_GOVERNED_CORE_CONCERN_LABELS: Readonly<Record<GovernedCoreConcern, string>> = {
  STANDARDS_LIBRARY: 'Standards library',
  TAXONOMY_FLOOR: 'Taxonomy floor',
  MANDATORY_PLAN_SETS: 'Mandatory plan sets',
  DOCUMENT_FAMILY_REQUIREMENTS: 'Document-family requirements',
  MAPPING_ENGINE_RULES: 'Mapping engine rules',
  EVIDENCE_MINIMUMS: 'Evidence minimums',
  SLA_AGING_MATRICES: 'SLA / aging matrices',
  ROOT_CAUSE_MODEL: 'Root-cause model',
  SCORECARD_FORMULAS: 'Scorecard formulas',
  RESPONSIBLE_ORG_ROLLUP_LOGIC: 'Responsible-organization rollup logic',
  OFFICIAL_SOURCE_CURRENTNESS_RULES: 'Official-source currentness rules',
};

export const QC_SOT_AUTHORITY_LABELS: Readonly<Record<QcSoTAuthority, string>> = {
  QC_GOVERNED_CORE: 'QC governed-core store',
  QC_PROJECT_STORE: 'QC project store',
  QC_SNAPSHOT_STORE: 'QC snapshot store',
  QC_GOVERNED_NOTICE_STORE: 'QC governed-notice store',
  QC_DERIVED_INPUT_STORE: 'QC derived-input store',
  STARTUP_MODULE: 'Project Startup module',
  CLOSEOUT_MODULE: 'Project Closeout module',
  WARRANTY_MODULE: 'Project Warranty module',
  SCHEDULE_MODULE: 'Schedule module',
  DOCUMENT_SYSTEM: 'Governed document system',
  WORK_QUEUE_SPINE: 'Work Queue spine',
  RELATED_ITEMS_SPINE: 'Related Items spine',
  HEALTH_SPINE: 'Health spine',
};

export const QC_LANE_CAPABILITY_LABELS: Readonly<Record<QcLaneCapability, string>> = {
  PWA_BASELINE_VISIBLE: 'PWA baseline-visible',
  SPFX_BASELINE_VISIBLE: 'SPFx baseline-visible',
  DEEPER_FIELD_MOBILE_DEFERRED: 'Deeper field/mobile deferred to Site Controls',
};

export const QC_OPERATIONAL_OWNERSHIP_AREA_LABELS: Readonly<Record<QcOperationalOwnershipArea, string>> = {
  REVIEW_PACKAGE_ADMIN: 'Review-package administration',
  EXECUTION_READINESS: 'Execution-side readiness',
  HIGH_RISK_REVIEW: 'High-risk content review',
  VERIFICATION_CLOSURE: 'Completion verification and closure',
};

// -- SoT Boundary Matrix (T03 §3) ---------------------------------------------

export const QC_SOT_BOUNDARIES: ReadonlyArray<IQcSoTBoundary> = [
  { dataConcern: 'Quality standards, plans, findings, issues, deviations, evidence refs, approval dependencies, advisory records, snapshots', sotOwner: 'QC_GOVERNED_CORE', qcRelationship: 'AUTHOR_AND_MAINTAIN', notes: 'QC owns governed core, project store, snapshot store, notice store, and derived input store' },
  { dataConcern: 'Startup commissioning execution and certification', sotOwner: 'STARTUP_MODULE', qcRelationship: 'CONSUME_AS_REFERENCE', notes: 'QC does not write Startup records or replace startup certification' },
  { dataConcern: 'Closeout turnover package and archive gate', sotOwner: 'CLOSEOUT_MODULE', qcRelationship: 'CONSUME_AS_REFERENCE', notes: 'Closeout owns turnover package assembly, archive readiness, and closeout-led artifact publication' },
  { dataConcern: 'Warranty case lifecycle and coverage operations', sotOwner: 'WARRANTY_MODULE', qcRelationship: 'CONSUME_AS_REFERENCE', notes: 'Warranty owns coverage registry, case lifecycle, and post-turnover remediation operations' },
  { dataConcern: 'Detailed schedule network and milestone authority', sotOwner: 'SCHEDULE_MODULE', qcRelationship: 'CONSUME_AS_REFERENCE', notes: 'Schedule owns CPM, milestone authority, and forecast publication' },
  { dataConcern: 'File storage and artifact binaries', sotOwner: 'DOCUMENT_SYSTEM', qcRelationship: 'CONSUME_AS_REFERENCE', notes: 'QC stores metadata, lineage, and references; file storage remains in governed document systems' },
  { dataConcern: 'My Work routing and aggregation', sotOwner: 'WORK_QUEUE_SPINE', qcRelationship: 'PUBLISH_ONLY', notes: 'QC publishes obligations, due actions, escalations, and verification requests' },
  { dataConcern: 'Relationship graph rendering', sotOwner: 'RELATED_ITEMS_SPINE', qcRelationship: 'PUBLISH_ONLY', notes: 'QC publishes lineage links; Related Items owns relationship registry and presentation logic' },
  { dataConcern: 'Project-canvas health tile semantics', sotOwner: 'HEALTH_SPINE', qcRelationship: 'PUBLISH_ONLY', notes: 'QC publishes metrics; Health spine and Project Canvas own tile semantics' },
];

// -- Adjacent Module Boundaries (T01 §6) --------------------------------------

export const QC_ADJACENT_MODULE_BOUNDARIES: ReadonlyArray<IQcAdjacentModuleBoundary> = [
  { adjacentModule: 'STARTUP', whatAdjacentOwns: 'Mobilization certification and commissioning execution', whatQcDoes: 'Provides quality-baseline and readiness context that may influence startup readiness', qcBoundary: 'QC does not write Startup records or replace startup certification' },
  { adjacentModule: 'CLOSEOUT', whatAdjacentOwns: 'Turnover package assembly, archive readiness, and closeout-led artifact publication', whatQcDoes: 'Provides turnover-quality readiness posture, unresolved quality lineage, and supporting references', qcBoundary: 'QC does not write Closeout records or replace closeout artifact assembly' },
  { adjacentModule: 'WARRANTY', whatAdjacentOwns: 'Coverage registry, case lifecycle, and post-turnover remediation operations', whatQcDoes: 'Hands off unresolved or documented quality context relevant to post-turnover defects', qcBoundary: 'QC does not create warranty cases or write warranty records' },
  { adjacentModule: 'SCHEDULE', whatAdjacentOwns: 'CPM, milestone authority, and forecast publication', whatQcDoes: 'Reads baseline and near-term schedule context for readiness windows and quality-critical sequencing', qcBoundary: 'QC does not write schedule records or alter milestone authority' },
  { adjacentModule: 'REPORTS', whatAdjacentOwns: 'Report artifact assembly and release', whatQcDoes: 'Publishes governed snapshots and derived signals for report consumption', qcBoundary: 'Reports owns the artifact; QC owns the underlying data' },
  { adjacentModule: 'MY_WORK', whatAdjacentOwns: 'Aggregation, routing, and surfacing of work items', whatQcDoes: 'Publishes obligations, due actions, escalations, and verification requests', qcBoundary: 'Work Queue routes and aggregates; it does not own QC state' },
  { adjacentModule: 'RELATED_ITEMS', whatAdjacentOwns: 'Relationship registry and presentation logic', whatQcDoes: 'Publishes lineage links across plans, findings, issues, deviations, approvals, snapshots, and downstream seams', qcBoundary: 'Related Items owns the graph; QC publishes links' },
  { adjacentModule: 'FUTURE_SITE_CONTROLS', whatAdjacentOwns: 'Deeper field/mobile execution, site walkthroughs, degraded-connectivity workflows', whatQcDoes: 'Supplies the control-layer record model and downstream execution seam', qcBoundary: 'Site Controls later owns deeper field/mobile execution' },
];

// -- Anti-Goal Definitions (T01 §1.2) -----------------------------------------

export const QC_ANTI_GOAL_DEFINITIONS: ReadonlyArray<IQcAntiGoalDef> = [
  { antiGoal: 'MOBILE_FIRST_FIELD_APP', correctBoundary: 'Project Hub QC owns the internal control layer; future Site Controls owns deeper field/mobile execution' },
  { antiGoal: 'PUNCH_WARRANTY_SYSTEM', correctBoundary: 'QC stops at pre-punch and turnover-quality readiness; downstream punch and warranty modules own their operations' },
  { antiGoal: 'SUBMITTAL_WORKFLOW_ENGINE', correctBoundary: 'QC only provides completeness/currentness advisory; it does not replace submittal routing or approval workflow' },
  { antiGoal: 'DOCUMENT_REPOSITORY', correctBoundary: 'QC stores metadata, lineage, and references; file storage remains in governed document systems' },
  { antiGoal: 'OWNER_SUBCONTRACTOR_PORTAL', correctBoundary: 'Phase 3 QC is internal-only' },
  { antiGoal: 'STARTUP_CLOSEOUT_REPLACEMENT', correctBoundary: 'QC hands structured quality readiness and evidence context into those modules; it does not absorb their lifecycle ownership' },
];

// -- Out-of-Scope Definitions (T01 §7.1) --------------------------------------

export const QC_OUT_OF_SCOPE_DEFINITIONS: ReadonlyArray<IQcOutOfScopeDef> = [
  { item: 'PUNCH_LIST', reasonDeferred: 'Downstream punch module owns punch list execution' },
  { item: 'OWNER_PORTAL', reasonDeferred: 'Phase 3 QC is internal-only; no external portal' },
  { item: 'SUBCONTRACTOR_PORTAL', reasonDeferred: 'Phase 3 QC is internal-only; no external portal' },
  { item: 'EXTERNAL_COLLABORATION', reasonDeferred: 'No direct external collaboration workspace in Phase 3' },
  { item: 'FILE_STORAGE', reasonDeferred: 'File storage remains in governed document systems' },
  { item: 'MOBILE_FIRST_ENGINE', reasonDeferred: 'Deferred to future Site Controls' },
  { item: 'FULL_SUBMITTAL_WORKFLOW', reasonDeferred: 'QC provides advisory only; does not replace submittal routing' },
  { item: 'OFFLINE_FIELD_EXECUTION', reasonDeferred: 'Deferred to future Site Controls' },
  { item: 'OWNER_FACING_RELEASE', reasonDeferred: 'No owner-facing release or distribution behavior in Phase 3' },
];

// -- Operational Ownership Definitions (T01 §5) --------------------------------

export const QC_OPERATIONAL_OWNERSHIP_DEFINITIONS: ReadonlyArray<IQcOperationalOwnershipDef> = [
  { area: 'REVIEW_PACKAGE_ADMIN', primaryOwner: 'PM_PE_PA', notes: 'Package administration, spec linkage, version-adoption decisions, external approval tracking, project coordination, report hygiene' },
  { area: 'EXECUTION_READINESS', primaryOwner: 'SUPERINTENDENT', notes: 'Execution-side readiness inputs, hold points, tests, mockups, preinstallation meetings, issue follow-up, ready-for-review routing' },
  { area: 'HIGH_RISK_REVIEW', primaryOwner: 'QC_MANAGER', notes: 'High-risk content review, governed candidate content authoring, discipline challenge, quality methodology guidance' },
  { area: 'VERIFICATION_CLOSURE', primaryOwner: 'AUTHORIZED_HB_VERIFIER', notes: 'Completion verification and closure; must be centrally eligible and project/work-package designated' },
];

// -- Lane Capability Definitions (T01 §7) --------------------------------------

export const QC_LANE_CAPABILITY_DEFINITIONS: ReadonlyArray<IQcLaneCapabilityDef> = [
  { lane: 'PWA_BASELINE_VISIBLE', description: 'PWA may surface QC context, status, and controlled internal interactions consistent with the family' },
  { lane: 'SPFX_BASELINE_VISIBLE', description: 'SPFx may surface QC context, status, and controlled internal interactions consistent with the family' },
  { lane: 'DEEPER_FIELD_MOBILE_DEFERRED', description: 'Deeper field/mobile execution depth deferred to future Site Controls' },
];

// -- Role Action Matrix (T02 §4) -----------------------------------------------

export const QC_ROLE_ACTION_MATRIX: ReadonlyArray<IQcRoleAction> = [
  { action: 'Author project plan / review package / issue / dependency records', pmPePa: true, superintendent: true, qcManager: true, authorizedHbVerifier: false, moeAdmin: false, disciplineReviewer: false },
  { action: 'Author candidate governed content', pmPePa: false, superintendent: false, qcManager: true, authorizedHbVerifier: false, moeAdmin: true, disciplineReviewer: false },
  { action: 'Publish governed core', pmPePa: false, superintendent: false, qcManager: false, authorizedHbVerifier: false, moeAdmin: true, disciplineReviewer: false },
  { action: 'Review high-risk content', pmPePa: true, superintendent: true, qcManager: true, authorizedHbVerifier: false, moeAdmin: true, disciplineReviewer: true },
  { action: 'Verify completion', pmPePa: false, superintendent: false, qcManager: true, authorizedHbVerifier: true, moeAdmin: false, disciplineReviewer: false },
  { action: 'Close verified obligation', pmPePa: false, superintendent: false, qcManager: true, authorizedHbVerifier: true, moeAdmin: false, disciplineReviewer: false },
  { action: 'Approve DeviationOrWaiverRecord', pmPePa: true, superintendent: false, qcManager: false, authorizedHbVerifier: false, moeAdmin: true, disciplineReviewer: true },
  { action: 'Designate verifier for project/work package', pmPePa: true, superintendent: false, qcManager: true, authorizedHbVerifier: false, moeAdmin: false, disciplineReviewer: false },
  { action: 'Publish governed update notice', pmPePa: false, superintendent: false, qcManager: false, authorizedHbVerifier: false, moeAdmin: true, disciplineReviewer: false },
];

// -- Governed Core Concern Definitions (T02 §2) --------------------------------

export const QC_GOVERNED_CORE_CONCERN_DEFINITIONS: ReadonlyArray<IQcGovernedCoreConcernDef> = [
  { concern: 'STANDARDS_LIBRARY', governedOwner: 'MOE/Admin', projectExtensionAllowed: true, extensionConstraint: 'Project may add a ProjectQualityExtension only within the governed taxonomy and promotion workflow' },
  { concern: 'TAXONOMY_FLOOR', governedOwner: 'MOE/Admin', projectExtensionAllowed: true, extensionConstraint: 'Project extensions must classify into governed parent categories' },
  { concern: 'MANDATORY_PLAN_SETS', governedOwner: 'MOE/Admin', projectExtensionAllowed: true, extensionConstraint: 'Projects may add high-risk additions but may not remove governed mandatory minimums' },
  { concern: 'DOCUMENT_FAMILY_REQUIREMENTS', governedOwner: 'MOE/Admin', projectExtensionAllowed: true, extensionConstraint: 'Project/spec overlays may add requirements but may not weaken governed minimum currentness rules' },
  { concern: 'MAPPING_ENGINE_RULES', governedOwner: 'MOE/Admin', projectExtensionAllowed: true, extensionConstraint: 'Project overlays may add project-specific mappings but may not redefine the governed verdict vocabulary' },
  { concern: 'EVIDENCE_MINIMUMS', governedOwner: 'MOE/Admin', projectExtensionAllowed: true, extensionConstraint: 'Project may tighten requirements; may not loosen the enterprise minimum without approved deviation' },
  { concern: 'SLA_AGING_MATRICES', governedOwner: 'MOE/Admin', projectExtensionAllowed: true, extensionConstraint: 'Project adjustments must stay inside governed adjustment bounds and carry provenance' },
  { concern: 'ROOT_CAUSE_MODEL', governedOwner: 'MOE/Admin', projectExtensionAllowed: false, extensionConstraint: 'Projects may classify within the governed model; they may not invent an alternate root-cause schema' },
  { concern: 'SCORECARD_FORMULAS', governedOwner: 'MOE/Admin', projectExtensionAllowed: false, extensionConstraint: 'Projects may choose enabled drilldowns and thresholds where permitted; core formulas remain governed' },
  { concern: 'RESPONSIBLE_ORG_ROLLUP_LOGIC', governedOwner: 'MOE/Admin', projectExtensionAllowed: false, extensionConstraint: 'Rollup semantics are enterprise-governed for comparability' },
  { concern: 'OFFICIAL_SOURCE_CURRENTNESS_RULES', governedOwner: 'MOE/Admin', projectExtensionAllowed: false, extensionConstraint: 'Current-version checks use manufacturer or official publisher sources only' },
];

// -- Project Extension Rules (T02 §2.1) ----------------------------------------

export const QC_PROJECT_EXTENSION_RULES: ReadonlyArray<IQcProjectExtensionRule> = [
  { ruleNumber: 1, description: 'The project need is real and bounded' },
  { ruleNumber: 2, description: 'The extension attaches to a governed parent category' },
  { ruleNumber: 3, description: 'The extension does not weaken governed minimums' },
  { ruleNumber: 4, description: 'The extension carries provenance and approval metadata' },
  { ruleNumber: 5, description: 'The extension is eligible for later promotion or retirement' },
];

// -- Verifier Designation Rules (T02 §4.1) -------------------------------------

export const QC_VERIFIER_DESIGNATION_RULES: ReadonlyArray<IQcVerifierDesignationRule> = [
  { step: 1, description: 'MOE/Admin publishes the eligible verifier-role policy' },
  { step: 2, description: 'The project designates one or more actual verifiers per work package from that eligible pool' },
];

// -- Record Family Definitions (T03 §2) ----------------------------------------

export const QC_RECORD_FAMILY_DEFINITIONS: ReadonlyArray<IQcRecordFamilyDef> = [
  { family: 'GovernedQualityStandard', sotOwner: 'QC_GOVERNED_CORE', identifiers: ['governedQualityStandardId', 'standardKey', 'governedVersionId'], stateFoundation: 'draft → under-review → published → superseded / retired', lineageRole: 'Upstream root of plans, review templates, mapping logic, and issue lineage' },
  { family: 'ProjectQualityExtension', sotOwner: 'QC_PROJECT_STORE', identifiers: ['projectQualityExtensionId', 'projectId', 'parentGovernedKey', 'extensionVersionId'], stateFoundation: 'draft → approved-project-only / submitted-for-promotion → promoted / rejected / retired', lineageRole: 'Attaches to governed core; may flow into plans and advisory logic' },
  { family: 'WorkPackageQualityPlan', sotOwner: 'QC_PROJECT_STORE', identifiers: ['workPackageQualityPlanId', 'projectId', 'workPackageKey', 'planVersionId'], stateFoundation: 'draft → in-review → active → revised / superseded / closed', lineageRole: 'Instantiated from governed standards; feeds review packages, issues, deviations, health, and handoffs' },
  { family: 'PreconstructionReviewPackage', sotOwner: 'QC_PROJECT_STORE', identifiers: ['preconstructionReviewPackageId', 'projectId', 'reviewPackageKey', 'reviewVersionId'], stateFoundation: 'draft → submitted → under-review → accepted / accepted-with-conditions / returned / voided', lineageRole: 'Consumes plans and standards; produces ReviewFinding records and downstream obligations' },
  { family: 'ReviewFinding', sotOwner: 'QC_PROJECT_STORE', identifiers: ['reviewFindingId', 'projectId', 'findingKey'], stateFoundation: 'open → accepted / deferred / converted-to-issue / closed', lineageRole: 'Must preserve lineage to originating review package and may spawn QcIssue' },
  { family: 'QcIssue', sotOwner: 'QC_PROJECT_STORE', identifiers: ['qcIssueId', 'projectId', 'issueKey'], stateFoundation: 'open → in-progress → ready-for-review → verified / closed / voided / escalated', lineageRole: 'May originate from findings or ad hoc; feeds corrective actions, health, rollups, and downstream handoffs' },
  { family: 'CorrectiveAction', sotOwner: 'QC_PROJECT_STORE', identifiers: ['correctiveActionId', 'projectId', 'actionKey', 'qcIssueId'], stateFoundation: 'open → in-progress → ready-for-review → verified / closed / overdue / voided', lineageRole: 'Child of QcIssue; may reference evidence, approval dependencies, and deviations' },
  { family: 'DeviationOrWaiverRecord', sotOwner: 'QC_PROJECT_STORE', identifiers: ['deviationOrWaiverRecordId', 'projectId', 'exceptionKey'], stateFoundation: 'draft → submitted → approved / rejected / expired / withdrawn', lineageRole: 'May temporarily alter plan, issue, advisory, or evidence requirements; must preserve affected lineage' },
  { family: 'EvidenceReference', sotOwner: 'QC_PROJECT_STORE', identifiers: ['evidenceReferenceId', 'projectId', 'evidenceKey'], stateFoundation: 'captured → submitted → accepted / rejected / superseded', lineageRole: 'Supports plans, issues, corrective actions, deviations, approval dependencies, and handoffs' },
  { family: 'ExternalApprovalDependency', sotOwner: 'QC_PROJECT_STORE', identifiers: ['externalApprovalDependencyId', 'projectId', 'dependencyKey'], stateFoundation: 'not-started → submitted → awaiting-response → approved / rejected / expired / waived', lineageRole: 'May block readiness, corrective-action closure, or plan activation; feeds issue and health posture' },
  { family: 'ResponsiblePartyAssignment', sotOwner: 'QC_PROJECT_STORE', identifiers: ['responsiblePartyAssignmentId', 'projectId', 'assignmentKey'], stateFoundation: 'active → superseded / ended', lineageRole: 'Shared assignment primitive for plans, issues, actions, deviations, approval dependencies, and advisory follow-up' },
  { family: 'RootCauseAndRecurrenceRecord', sotOwner: 'QC_PROJECT_STORE', identifiers: ['rootCauseAndRecurrenceRecordId', 'projectId', 'analysisKey'], stateFoundation: 'draft → confirmed → published-to-learning / superseded', lineageRole: 'Consumes issue lineage and feeds health snapshots and responsible-org rollups' },
  { family: 'QualityHealthSnapshot', sotOwner: 'QC_SNAPSHOT_STORE', identifiers: ['qualityHealthSnapshotId', 'projectId', 'snapshotAt'], stateFoundation: 'computed → published / superseded', lineageRole: 'Drives Project Hub projection and management visibility only; no direct edits' },
  { family: 'GovernedUpdateNotice', sotOwner: 'QC_GOVERNED_NOTICE_STORE', identifiers: ['governedUpdateNoticeId', 'governedChangeKey', 'publishedVersionId'], stateFoundation: 'published → resolved / superseded', lineageRole: 'Informs project adoption and recheck flows; may force advisory review or plan rebasing' },
  { family: 'ProjectQcSnapshot', sotOwner: 'QC_SNAPSHOT_STORE', identifiers: ['projectQcSnapshotId', 'projectId', 'snapshotVersionId'], stateFoundation: 'working → project-baseline / snapshot-published → superseded', lineageRole: 'Used for update notices, downstream module handoff, and management projection' },
  { family: 'ResponsibleOrgPerformanceRollupInput', sotOwner: 'QC_DERIVED_INPUT_STORE', identifiers: ['responsibleOrgPerformanceRollupInputId', 'projectId', 'organizationKey', 'sourceSnapshotId'], stateFoundation: 'computed → consumed / superseded', lineageRole: 'Feeds responsible-organization rollup logic and scorecards' },
  { family: 'SubmittalItemRecord', sotOwner: 'QC_PROJECT_STORE', identifiers: ['submittalItemRecordId', 'projectId', 'itemKey'], stateFoundation: 'draft → preliminary-guidance → package-review-active → accepted-advisory / exception-approved / manual-review-required / superseded', lineageRole: 'Parallel advisory lineage: spec + package ref + inventory + verdicts + drift alerts' },
  { family: 'DocumentInventoryEntry', sotOwner: 'QC_PROJECT_STORE', identifiers: ['documentInventoryEntryId', 'projectId', 'submittalItemRecordId', 'inventoryKey'], stateFoundation: 'captured → confirmed → verified / unable-to-verify / superseded', lineageRole: 'Child inventory record for advisory evaluation' },
  { family: 'AdvisoryVerdict', sotOwner: 'QC_PROJECT_STORE', identifiers: ['advisoryVerdictId', 'projectId', 'submittalItemRecordId', 'verdictVersionId'], stateFoundation: 'issued → superseded', lineageRole: 'Derived from item + inventory + governed mapping; may generate issue/advisory follow-up' },
  { family: 'AdvisoryException', sotOwner: 'QC_PROJECT_STORE', identifiers: ['advisoryExceptionId', 'projectId', 'submittalItemRecordId', 'exceptionVersionId'], stateFoundation: 'draft → submitted → approved / rejected / expired', lineageRole: 'Applies only to advisory follow-up; does not replace project basis or workflow lineage' },
  { family: 'VersionDriftAlert', sotOwner: 'QC_PROJECT_STORE', identifiers: ['versionDriftAlertId', 'projectId', 'submittalItemRecordId', 'alertKey'], stateFoundation: 'open → acknowledged → rechecked / resolved / superseded', lineageRole: 'Extends advisory lineage after initial verdict issuance' },
];

// -- Main Lineage Chain (T03 §5.2) ---------------------------------------------

export const QC_MAIN_LINEAGE_CHAIN: ReadonlyArray<IQcLineageChainStep> = [
  { family: 'GovernedQualityStandard', depth: 0, description: 'Governed standards / project extensions root' },
  { family: 'WorkPackageQualityPlan', depth: 1, description: 'Instantiated from governed standards' },
  { family: 'PreconstructionReviewPackage', depth: 2, description: 'Consumes plans and standards' },
  { family: 'ReviewFinding', depth: 3, description: 'Produced by review packages' },
  { family: 'QcIssue', depth: 4, description: 'May originate from findings or ad hoc' },
  { family: 'CorrectiveAction', depth: 5, description: 'Child of QcIssue' },
  { family: 'EvidenceReference', depth: 6, description: 'Supports plans, issues, corrective actions, deviations, approval dependencies' },
  { family: 'QualityHealthSnapshot', depth: 7, description: 'Derived projection for management visibility' },
];

// -- Advisory Lineage Chain (T03 §5.2) -----------------------------------------

export const QC_ADVISORY_LINEAGE_CHAIN: ReadonlyArray<IQcLineageChainStep> = [
  { family: 'SubmittalItemRecord', depth: 0, description: 'Advisory root record' },
  { family: 'SubmittalSpecLinkRef', depth: 1, description: 'Required spec linkage' },
  { family: 'SubmittalPackageLinkRef', depth: 1, description: 'Required package linkage' },
  { family: 'DocumentInventoryEntry', depth: 2, description: 'Child inventory record' },
  { family: 'AdvisoryVerdict', depth: 3, description: 'Derived from item + inventory + governed mapping' },
  { family: 'AdvisoryException', depth: 4, description: 'Approved advisory exception' },
  { family: 'VersionDriftAlert', depth: 5, description: 'Extends advisory lineage after verdict issuance' },
];

// -- Shared Package Requirements (T02 §9 / T03 §8) ----------------------------

export const QC_SHARED_PACKAGE_REQUIREMENTS: ReadonlyArray<IQcSharedPackageRequirement> = [
  { packageName: '@hbc/versioned-record', requiredUse: 'Record mutation history, governed version lineage, and snapshot evolution' },
  { packageName: '@hbc/record-form', requiredUse: 'Form-state, trust-state, recovery-state, and review-step behavior for QC record authoring' },
  { packageName: '@hbc/saved-views', requiredUse: 'System and user views for plan, issue, advisory, and rollup workspaces' },
  { packageName: '@hbc/publish-workflow', requiredUse: 'Governed publication lifecycle for standards, snapshots, and notices' },
  { packageName: '@hbc/my-work-feed', requiredUse: 'Personal and team obligation routing' },
  { packageName: '@hbc/related-items', requiredUse: 'Cross-record lineage and handoff presentation' },
  { packageName: '@hbc/project-canvas', requiredUse: 'Baseline-visible QC tile and contextual module projections' },
  { packageName: '@hbc/notification-intelligence', requiredUse: 'Escalations, update notices, drift alerts, and overdue signals' },
  { packageName: '@hbc/session-state', requiredUse: 'Draft persistence and recovery only; never canonical QC truth' },
  { packageName: '@hbc/sharepoint-docs', requiredUse: 'Document link/reference handling only; not a QC-owned storage layer' },
];

// -- Downstream Handoffs (T03 §7) ----------------------------------------------

export const QC_DOWNSTREAM_HANDOFFS: ReadonlyArray<IQcDownstreamHandoff> = [
  { target: 'STARTUP', handoffContent: 'Quality readiness posture, unresolved soft-gate context, commissioning-adjacent quality references' },
  { target: 'CLOSEOUT', handoffContent: 'Turnover-quality readiness posture, unresolved issue lineage, evidence-reference context' },
  { target: 'WARRANTY', handoffContent: 'Quality lineage relevant to post-turnover defects where needed; no direct warranty-case creation' },
  { target: 'SCHEDULE', handoffContent: 'Quality-critical sequencing, readiness dependencies, and near-term advisory signals' },
  { target: 'FUTURE_SITE_CONTROLS', handoffContent: 'Control-layer record references, readiness state, issue follow-up posture, and evidence-reference context for deeper field execution' },
];

// -- Locked Invariants ----------------------------------------------------------

export const QC_LOCKED_INVARIANTS: ReadonlyArray<IQcLockedInvariant> = [
  { invariant: 'INTERNAL_ONLY_PHASE3', description: 'QC is an internal-only surface in Phase 3; no owner-facing, subcontractor-facing, or public collaboration path is permitted' },
  { invariant: 'CONTROL_NOT_FIELD', description: 'QC owns the control layer for quality, not field-first execution depth; deeper field/mobile deferred to Site Controls' },
  { invariant: 'NO_FILE_STORAGE', description: 'QC stores metadata, lineage, and references; file storage and artifact binaries remain in governed document systems' },
  { invariant: 'VERIFIER_SEPARATION', description: 'The verifier path is deliberately separate from the responsible-party path; the verifier, not the responsible party, marks obligations as verified/closed' },
  { invariant: 'GOVERNED_CORE_IMMUTABLE', description: 'Published governed core content is immutable; changes create new governed versions and update notices' },
  { invariant: 'NO_EXTENSION_WEAKENING', description: 'Project extensions may not weaken governed minimums without an approved deviation' },
];

// -- Historical Input Boundary (T01 §7.2) --------------------------------------

export const QC_HISTORICAL_INPUT_BOUNDARY: IQcHistoricalInputBoundary = {
  source: 'PH7-ProjectHub-7-QualityControl.md',
  constraint: 'Historical input only; does not govern Phase 3 QC architecture',
};

// -- Cross-Contract References (P3-E15) ----------------------------------------

export const QC_CROSS_CONTRACT_REFS: ReadonlyArray<IQcCrossContractRef> = [
  { sourceDoc: 'P3-E15-T01', concern: 'Module scope, operating model, and lane boundary' },
  { sourceDoc: 'P3-E15-T02', concern: 'Governance, ownership, and versioning' },
  { sourceDoc: 'P3-E15-T03', concern: 'Record families, authority, and data model' },
  { sourceDoc: 'P3-E15-T04', concern: 'Quality plans, reviews, and control gates' },
  { sourceDoc: 'P3-E15-T05', concern: 'Issues, corrective actions, and work queue publication' },
  { sourceDoc: 'P3-E15-T06', concern: 'Deviations, evidence, and external approval dependencies' },
  { sourceDoc: 'P3-E15-T07', concern: 'Submittal completeness advisory' },
  { sourceDoc: 'P3-E15-T08', concern: 'Health scorecards, root cause, and responsible org performance' },
  { sourceDoc: 'P3-E15-T09', concern: 'Schedule awareness, lifecycle handoffs, and downstream integrations' },
  { sourceDoc: 'P3-E15-T10', concern: 'Implementation and acceptance' },
  { sourceDoc: 'P3-E15-QC-Module-Field-Specification', concern: 'Master index and module overview' },
  { sourceDoc: 'P3-E15-T01 §7.2', concern: 'PH7.7 historical input boundary' },
];
