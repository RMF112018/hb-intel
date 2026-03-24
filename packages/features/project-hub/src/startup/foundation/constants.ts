/**
 * P3-E11-T10 Stage 1 Project Startup Module foundation constants.
 * Program core governance data serialized from T01, T02, T10, and master index.
 */

import type {
  StartupCertificationStatus,
  GateCriterionResult,
  GateOutcome,
  MobilizationAuthStatus,
  ProgramBlockerScope,
  ProgramBlockerStatus,
  ProgramBlockerType,
  PXExclusiveAction,
  Stage1ActivityEvent,
  Stage1HealthMetric,
  StartupAuthorityRole,
  StartupFunction,
  StartupReadinessStateCode,
  StartupRecordFamily,
  StartupSubSurface,
  StartupTier,
  StartupTier1RecordFamily,
  StartupTransitionTriggerType,
  WaiverStatus,
} from './enums.js';
import type {
  IGovernedGateCriterionDef,
  IRoleScopedCertOwnership,
  IStage1ActivityEventDef,
  IStage1HealthMetricDef,
  IStartupCrossContractRef,
  IStartupLockedDecision,
  IStartupOperatingPrinciple,
  IStartupRecordFamilyDefinition,
  IStartupSharedPackageRequirement,
  IStartupSoTBoundary,
  IStartupStateTransition,
  IStartupSubSurfaceDefinition,
} from './types.js';

// -- Module Scope -----------------------------------------------------------

export const STARTUP_MODULE_SCOPE = 'startup' as const;
export const STARTUP_FOUNDATION_SCOPE = 'startup/foundation' as const;

// -- Enum Arrays ------------------------------------------------------------

export const STARTUP_READINESS_STATE_CODES = [
  'DRAFT', 'ACTIVE_PLANNING', 'READINESS_REVIEW', 'READY_FOR_MOBILIZATION',
  'MOBILIZED', 'STABILIZING', 'BASELINE_LOCKED', 'ARCHIVED',
] as const satisfies ReadonlyArray<StartupReadinessStateCode>;

export const STARTUP_SUB_SURFACES = [
  'STARTUP_TASK_LIBRARY', 'SAFETY_READINESS', 'PERMIT_POSTING',
  'CONTRACT_OBLIGATIONS', 'RESPONSIBILITY_MATRIX', 'EXECUTION_BASELINE',
] as const satisfies ReadonlyArray<StartupSubSurface>;

export const STARTUP_CERTIFICATION_STATUSES = [
  'NOT_SUBMITTED', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED',
  'REJECTED', 'CONDITIONALLY_ACCEPTED', 'WAIVED',
] as const satisfies ReadonlyArray<StartupCertificationStatus>;

export const GATE_OUTCOMES = [
  'ACCEPTED', 'REJECTED', 'CONDITIONALLY_ACCEPTED',
] as const satisfies ReadonlyArray<GateOutcome>;

export const GATE_CRITERION_RESULTS = [
  'PASS', 'FAIL', 'WAIVED', 'NOT_APPLICABLE',
] as const satisfies ReadonlyArray<GateCriterionResult>;

export const WAIVER_STATUSES = [
  'PENDING_PE_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED', 'LAPSED',
] as const satisfies ReadonlyArray<WaiverStatus>;

export const PROGRAM_BLOCKER_SCOPES = [
  'PROGRAM', 'MULTI_SURFACE',
] as const satisfies ReadonlyArray<ProgramBlockerScope>;

export const PROGRAM_BLOCKER_TYPES = [
  'OwnerContractNotExecuted', 'NTPNotIssued', 'KeyPersonnelNotNamed',
  'SiteNotAvailable', 'InsuranceGap', 'Other',
] as const satisfies ReadonlyArray<ProgramBlockerType>;

export const PROGRAM_BLOCKER_STATUSES = [
  'OPEN', 'RESOLVED', 'WAIVED',
] as const satisfies ReadonlyArray<ProgramBlockerStatus>;

export const MOBILIZATION_AUTH_STATUSES = [
  'ISSUED', 'REVOKED',
] as const satisfies ReadonlyArray<MobilizationAuthStatus>;

export const STARTUP_TRANSITION_TRIGGER_TYPES = [
  'System', 'PMAction', 'PEAction', 'Timer',
] as const satisfies ReadonlyArray<StartupTransitionTriggerType>;

export const STARTUP_FUNCTIONS = [
  'ReadinessCertification', 'PEMobilizationAuthorization', 'BaselineContinuity',
] as const satisfies ReadonlyArray<StartupFunction>;

export const STARTUP_TIERS = [
  'ProgramCore', 'GovernedTemplate', 'ProjectScoped', 'Continuity',
] as const satisfies ReadonlyArray<StartupTier>;

export const STARTUP_AUTHORITY_ROLES = [
  'PM', 'PA', 'Superintendent', 'SafetyManager', 'PX', 'PER',
  'QAQC', 'Field', 'Accounting', 'System',
] as const satisfies ReadonlyArray<StartupAuthorityRole>;

export const PX_EXCLUSIVE_ACTIONS = [
  'CertificationAcceptance', 'CertificationWaiver', 'MobilizationAuthorization',
  'BaselineLock', 'WaiverApproval', 'ReadinessReopen',
] as const satisfies ReadonlyArray<PXExclusiveAction>;

// -- Record Families — All 28 (T02 §1) --------------------------------------

export const STARTUP_RECORD_FAMILIES = [
  // Tier 1 — Program Core (9)
  'StartupProgram', 'StartupProgramVersion', 'StartupReadinessState',
  'ReadinessCertification', 'ReadinessGateRecord', 'ReadinessGateCriterion',
  'ExceptionWaiverRecord', 'ProgramBlocker', 'PEMobilizationAuthorization',
  // Tier 2 — Governed Template and Task Library (3)
  'StartupTaskTemplate', 'StartupTaskInstance', 'TaskBlocker',
  // Tier 3 — Project-Scoped Operational Surfaces (15)
  'JobsiteSafetyChecklist', 'SafetyReadinessSection', 'SafetyReadinessItem',
  'SafetyRemediationRecord', 'PermitVerificationDetail', 'ContractObligationsRegister',
  'ContractObligation', 'ResponsibilityMatrix', 'ResponsibilityMatrixRow',
  'ResponsibilityAssignment', 'ProjectExecutionBaseline', 'ExecutionBaselineSection',
  'BaselineSectionField', 'ExecutionAssumption', 'PlanTeamSignature',
  // Tier 4 — Continuity (1)
  'StartupBaseline',
] as const satisfies ReadonlyArray<StartupRecordFamily>;

export const STARTUP_TIER1_RECORD_FAMILIES = [
  'StartupProgram', 'StartupProgramVersion', 'StartupReadinessState',
  'ReadinessCertification', 'ReadinessGateRecord', 'ReadinessGateCriterion',
  'ExceptionWaiverRecord', 'ProgramBlocker', 'PEMobilizationAuthorization',
] as const satisfies ReadonlyArray<StartupTier1RecordFamily>;

// -- Record Family Definitions (T02 §1) --------------------------------------

export const STARTUP_RECORD_FAMILY_DEFINITIONS: ReadonlyArray<IStartupRecordFamilyDefinition> = [
  // Tier 1 — Program Core
  { family: 'StartupProgram', tier: 'ProgramCore', key: 'programId', notes: 'One per project; auto-created at project creation' },
  { family: 'StartupProgramVersion', tier: 'ProgramCore', key: 'versionId', notes: 'Immutable audit log; one entry per state transition' },
  { family: 'StartupReadinessState', tier: 'ProgramCore', key: 'stateId', notes: 'One active record per project; history in version table' },
  { family: 'ReadinessCertification', tier: 'ProgramCore', key: 'certId', notes: 'One per sub-surface per project (6 total)' },
  { family: 'ReadinessGateRecord', tier: 'ProgramCore', key: 'gateId', notes: 'PE gate evaluation per certification review cycle' },
  { family: 'ReadinessGateCriterion', tier: 'ProgramCore', key: 'criterionId', notes: 'One per criterion per gate evaluation' },
  { family: 'ExceptionWaiverRecord', tier: 'ProgramCore', key: 'waiverId', notes: '0+ per project; lapse model with PE attention' },
  { family: 'ProgramBlocker', tier: 'ProgramCore', key: 'blockerId', notes: '0+ per project; program or multi-surface scope' },
  { family: 'PEMobilizationAuthorization', tier: 'ProgramCore', key: 'authId', notes: 'One per project; PX-exclusive creation' },
  // Tier 2 — Governed Template and Task Library
  { family: 'StartupTaskTemplate', tier: 'GovernedTemplate', key: 'templateId', notes: 'MOE-governed; no projectId; versioned by release' },
  { family: 'StartupTaskInstance', tier: 'GovernedTemplate', key: 'instanceId', notes: 'Project-scoped; created from template; immutable taskNumber/title' },
  { family: 'TaskBlocker', tier: 'GovernedTemplate', key: 'blockerId', notes: '0+ per task; waiver path via ExceptionWaiverRecord' },
  // Tier 3 — Project-Scoped Operational Surfaces
  { family: 'JobsiteSafetyChecklist', tier: 'ProjectScoped', key: 'checklistId', notes: 'One per project; 2 sections' },
  { family: 'SafetyReadinessSection', tier: 'ProjectScoped', key: 'sectionId', notes: '2 per checklist' },
  { family: 'SafetyReadinessItem', tier: 'ProjectScoped', key: 'itemId', notes: '32 per checklist from template' },
  { family: 'SafetyRemediationRecord', tier: 'ProjectScoped', key: 'remediationId', notes: '0+ per Fail item; escalation and blocker linkage' },
  { family: 'PermitVerificationDetail', tier: 'ProjectScoped', key: 'verificationId', notes: 'One per Section 4 task; photo evidence on PWA' },
  { family: 'ContractObligationsRegister', tier: 'ProjectScoped', key: 'registerId', notes: 'One per project; active monitoring ledger' },
  { family: 'ContractObligation', tier: 'ProjectScoped', key: 'obligationId', notes: '0+ per register; 5-state lifecycle' },
  { family: 'ResponsibilityMatrix', tier: 'ProjectScoped', key: 'matrixId', notes: 'One per project; PM + Field sheets' },
  { family: 'ResponsibilityMatrixRow', tier: 'ProjectScoped', key: 'rowId', notes: 'Governed rows from template; custom rows allowed' },
  { family: 'ResponsibilityAssignment', tier: 'ProjectScoped', key: 'assignmentId', notes: 'Named assignments per column per row' },
  { family: 'ProjectExecutionBaseline', tier: 'ProjectScoped', key: 'baselineId', notes: 'One per project; 11 sections; PM Plan' },
  { family: 'ExecutionBaselineSection', tier: 'ProjectScoped', key: 'sectionId', notes: '11 per baseline' },
  { family: 'BaselineSectionField', tier: 'ProjectScoped', key: 'fieldId', notes: 'Typed commitment fields within sections' },
  { family: 'ExecutionAssumption', tier: 'ProjectScoped', key: 'assumptionId', notes: '0+ per baseline; categorized' },
  { family: 'PlanTeamSignature', tier: 'ProjectScoped', key: 'signatureId', notes: 'PM and PX signatures required for certification' },
  // Tier 4 — Continuity
  { family: 'StartupBaseline', tier: 'Continuity', key: 'baselineSnapshotId', notes: 'Immutable snapshot at BASELINE_LOCKED; Closeout reads' },
];

// -- State Transition Table (T01 §4.2) ----------------------------------------

export const STARTUP_STATE_TRANSITIONS: ReadonlyArray<IStartupStateTransition> = [
  { from: 'DRAFT', to: 'ACTIVE_PLANNING', triggerType: 'System', condition: 'First edit to any Tier 2 sub-surface record', requiresPE: false },
  { from: 'ACTIVE_PLANNING', to: 'READINESS_REVIEW', triggerType: 'PMAction', condition: 'PM submits ReadinessCertification for all 6 sub-surfaces (all certStatus ≠ NOT_SUBMITTED)', requiresPE: false },
  { from: 'READINESS_REVIEW', to: 'ACTIVE_PLANNING', triggerType: 'PEAction', condition: 'PE rejects any certification (certStatus → REJECTED); program regresses for correction', requiresPE: false },
  { from: 'READINESS_REVIEW', to: 'READY_FOR_MOBILIZATION', triggerType: 'PEAction', condition: 'All ReadinessGateRecord evaluations → ACCEPTED or WAIVED', requiresPE: true },
  { from: 'READY_FOR_MOBILIZATION', to: 'ACTIVE_PLANNING', triggerType: 'PEAction', condition: 'PE reopens readiness; PE-authored rationale note required', requiresPE: true },
  { from: 'READY_FOR_MOBILIZATION', to: 'MOBILIZED', triggerType: 'PEAction', condition: 'PE issues PEMobilizationAuthorization; all certs accepted/waived; no open PROGRAM-scope blockers', requiresPE: true },
  { from: 'MOBILIZED', to: 'STABILIZING', triggerType: 'System', condition: 'Auto-transition at mobilization confirmation timestamp', requiresPE: false },
  { from: 'STABILIZING', to: 'BASELINE_LOCKED', triggerType: 'PEAction', condition: 'PE closes stabilization window OR window expires', requiresPE: true },
  { from: 'BASELINE_LOCKED', to: 'ARCHIVED', triggerType: 'System', condition: 'Project archive event from project record', requiresPE: false },
];

// -- Sub-Surface Definitions (T01 §3.2) ----------------------------------------

export const STARTUP_SUB_SURFACE_DEFINITIONS: ReadonlyArray<IStartupSubSurfaceDefinition> = [
  { subSurface: 'STARTUP_TASK_LIBRARY', architecturalRole: 'Readiness task ledger', description: '55-item MOE-governed mobilization readiness task library; tri-state result (N/A / Yes / No); blocker and evidence attachment model', gateWeight: 'Required' },
  { subSurface: 'SAFETY_READINESS', architecturalRole: 'Verification surface — remediation-capable', description: '32-item startup-phase safety check (Pass/Fail/N/A); Fail items require remediation notes; distinct from Safety module ongoing inspections', gateWeight: 'Required' },
  { subSurface: 'PERMIT_POSTING', architecturalRole: 'Verification surface — evidence and cross-reference', description: 'Section 4 of the startup checklist; verifies permits are posted on jobsite; cross-references Permits module for context but does not write to it', gateWeight: 'Required' },
  { subSurface: 'CONTRACT_OBLIGATIONS', architecturalRole: 'Ledger — obligations lifecycle', description: 'Structured extraction and active monitoring of Owner contract obligations; certification review is based on documented routing/acknowledgment, not blanket closure', gateWeight: 'Required' },
  { subSurface: 'RESPONSIBILITY_MATRIX', architecturalRole: 'Ledger — accountability routing', description: 'Workbook-grounded PM/Field assignment engine with reminder-row preservation, category-level primary coverage, critical-category acknowledgment, and immutable governed task descriptions', gateWeight: 'Required' },
  { subSurface: 'EXECUTION_BASELINE', architecturalRole: 'Baseline record — structured commitments', description: '11-section PM Plan structured as project execution baseline; baseline fields capture explicit commitments for Closeout delta analysis; PM Plan is the primary delivery vehicle', gateWeight: 'Required' },
];

// -- SoT Boundary Matrix (T01 §8.2) -------------------------------------------

export const STARTUP_SOT_BOUNDARY_MATRIX: ReadonlyArray<IStartupSoTBoundary> = [
  { dataConcern: 'Project identity (name, number, sector, AHJ)', sotOwner: 'Project record (@hbc/project-core)', startupRelationship: 'Inherits at creation', direction: 'Read', notes: 'Startup never creates or modifies project fields' },
  { dataConcern: 'Project lifecycle phase', sotOwner: 'Project record', startupRelationship: 'Reads for context', direction: 'Read', notes: 'Startup 8-state machine is independent of project phase enum' },
  { dataConcern: 'Permit lifecycle, permit records, inspections', sotOwner: 'P3-E7 Permits', startupRelationship: 'Cross-reference for display', direction: 'Read', notes: 'Section 4 result never writes to Permits' },
  { dataConcern: 'Permit posting on jobsite', sotOwner: 'P3-E11 Startup (Section 4)', startupRelationship: 'Owns — exclusive write', direction: 'Write', notes: 'Startup Section 4 items are exclusive SoT for permit posting status' },
  { dataConcern: 'Ongoing safety inspections and scores', sotOwner: 'P3-E8 Safety', startupRelationship: 'Related Items link only', direction: 'Read (link)', notes: 'Startup registers Related Items relationship; reads Safety module inspection log identifier' },
  { dataConcern: 'Safety corrective-action ledger', sotOwner: 'P3-E8 Safety', startupRelationship: 'No relationship', direction: 'None', notes: 'Startup Fail items do not create Safety corrective actions' },
  { dataConcern: 'Safety readiness at mobilization', sotOwner: 'P3-E11 Startup (Safety Readiness)', startupRelationship: 'Owns — exclusive write', direction: 'Write', notes: 'Startup-phase safety pre-check is Startup data; Safety module has no visibility' },
  { dataConcern: 'Contract financial model, budget baseline', sotOwner: 'P3-E4 Financial', startupRelationship: 'Pre-fill signal only', direction: 'Read (hint)', notes: 'Financial contract amount may pre-fill Execution Baseline contractAmount; after lock independent' },
  { dataConcern: 'Live financial actuals, forecasts, cost model', sotOwner: 'P3-E4 Financial', startupRelationship: 'No relationship after lock', direction: 'None', notes: 'Startup contractAmount is launch-time commitment; Financial owns live cost data' },
  { dataConcern: 'Project schedule, CPM, milestones', sotOwner: 'P3-E5/E6 Schedule', startupRelationship: 'Pre-fill signal only', direction: 'Read (hint)', notes: 'Schedule date signals may pre-fill Execution Baseline date fields; after lock independent' },
  { dataConcern: 'Launch-time schedule commitments', sotOwner: 'P3-E11 Startup (Execution Baseline)', startupRelationship: 'Owns — exclusive write', direction: 'Write', notes: 'Planned start, SC date, NTP date, goal dates — all launch-time commitments owned by Startup' },
  { dataConcern: 'Subcontractor scorecards and lessons', sotOwner: 'P3-E10 Closeout', startupRelationship: 'No relationship', direction: 'None', notes: 'Startup does not read or write any Closeout operational records' },
  { dataConcern: 'StartupBaseline snapshot', sotOwner: 'P3-E11 Startup (Tier 3)', startupRelationship: 'Owns — exclusive write', direction: 'Write → Read', notes: 'Startup creates and owns the snapshot; Closeout reads via API for delta analysis' },
  { dataConcern: 'Org intelligence indexes', sotOwner: 'Org Intelligence Layer', startupRelationship: 'No publication path', direction: 'None', notes: 'Startup never publishes to org-wide derived intelligence' },
  { dataConcern: 'Activity Spine events', sotOwner: 'P3-D1', startupRelationship: 'Publishes events', direction: 'Write (events)', notes: 'Startup is an event source; spine stores and routes events' },
  { dataConcern: 'Health Spine metrics', sotOwner: 'P3-D2', startupRelationship: 'Publishes metrics', direction: 'Write (metrics)', notes: 'Startup publishes readiness state and surface metrics' },
  { dataConcern: 'Work Queue items', sotOwner: 'P3-D3', startupRelationship: 'Creates and clears items', direction: 'Write', notes: 'Work Queue items for Startup conditions are Startup-owned' },
  { dataConcern: 'Related Items registry', sotOwner: 'P3-D4', startupRelationship: 'Registers relationships', direction: 'Write', notes: 'Startup registers cross-module link pairs' },
];

// -- Governed Gate Criteria (T02 §3.7) -----------------------------------------

export const STARTUP_GOVERNED_GATE_CRITERIA: ReadonlyArray<IGovernedGateCriterionDef> = [
  // STARTUP_TASK_LIBRARY (3)
  { subSurface: 'STARTUP_TASK_LIBRARY', criterionCode: 'TASK_LIB_ALL_REVIEWED', criterionLabel: 'All 55 task instances have a result (Yes, No, or NA) or a documented blocker' },
  { subSurface: 'STARTUP_TASK_LIBRARY', criterionCode: 'TASK_LIB_CRITICAL_COMPLETE', criterionLabel: 'All tasks with severity = Critical have result = Yes or an approved waiver' },
  { subSurface: 'STARTUP_TASK_LIBRARY', criterionCode: 'TASK_LIB_NO_UNWAIVED_BLOCKERS', criterionLabel: 'All TaskBlockers in OPEN status have an approved ExceptionWaiverRecord' },
  // SAFETY_READINESS (3)
  { subSurface: 'SAFETY_READINESS', criterionCode: 'SAFETY_ALL_ASSESSED', criterionLabel: 'All 32 safety readiness items have a result' },
  { subSurface: 'SAFETY_READINESS', criterionCode: 'SAFETY_FAILS_REMEDIATED', criterionLabel: 'All Fail items have a SafetyRemediationRecord with remediationNote, assignedPersonName, and dueDate populated' },
  { subSurface: 'SAFETY_READINESS', criterionCode: 'SAFETY_OPEN_REMEDIATIONS_ACKNOWLEDGED', criterionLabel: 'PE has acknowledged all remediations remaining in PENDING or IN_PROGRESS status; none are PX-escalated or blocker-active unless waived' },
  // PERMIT_POSTING (2)
  { subSurface: 'PERMIT_POSTING', criterionCode: 'PERMITS_ALL_REVIEWED', criterionLabel: 'All 12 Section 4 items have a result' },
  { subSurface: 'PERMIT_POSTING', criterionCode: 'PERMITS_MATERIAL_PRESENT', criterionLabel: 'Items covering building permit and master permit are Yes or NA with documented rationale' },
  // CONTRACT_OBLIGATIONS (3)
  { subSurface: 'CONTRACT_OBLIGATIONS', criterionCode: 'CONTRACT_REGISTER_POPULATED', criterionLabel: 'At least one ContractObligation row exists' },
  { subSurface: 'CONTRACT_OBLIGATIONS', criterionCode: 'CONTRACT_FLAGGED_REVIEWED', criterionLabel: 'All flagged obligations have notes populated' },
  { subSurface: 'CONTRACT_OBLIGATIONS', criterionCode: 'CONTRACT_NEAR_DUE_ADDRESSED', criterionLabel: 'All obligations with dueDate within 30 days are addressed (not OPEN)' },
  // RESPONSIBILITY_MATRIX (2)
  { subSurface: 'RESPONSIBILITY_MATRIX', criterionCode: 'RM_PM_SHEET_ASSIGNED', criterionLabel: 'PM sheet has at least one named assignee per task category' },
  { subSurface: 'RESPONSIBILITY_MATRIX', criterionCode: 'RM_FIELD_SHEET_ASSIGNED', criterionLabel: 'Field sheet has at least one named assignee per task category' },
  // EXECUTION_BASELINE (3)
  { subSurface: 'EXECUTION_BASELINE', criterionCode: 'BASELINE_APPROVED', criterionLabel: 'ProjectExecutionBaseline.status = Approved' },
  { subSurface: 'EXECUTION_BASELINE', criterionCode: 'BASELINE_CRITICAL_FIELDS_SET', criterionLabel: 'safetyOfficerName, safetyOfficerRole, projectStartDate, substantialCompletionDate, noticeToProceedDate, goalSubstantialCompletionDate, and goalFinalCompletionDate are populated' },
  { subSurface: 'EXECUTION_BASELINE', criterionCode: 'BASELINE_SIGNED', criterionLabel: 'At least PM and PX signatures present in PlanTeamSignature array' },
];

// -- Role-Scoped Certification Ownership (T02 §3.8) ---------------------------

export const STARTUP_CERT_OWNERSHIP: ReadonlyArray<IRoleScopedCertOwnership> = [
  { subSurface: 'STARTUP_TASK_LIBRARY', requiredCertifiers: 'PM (any tier)', peReviewer: 'PX', notes: 'Single certifier' },
  { subSurface: 'SAFETY_READINESS', requiredCertifiers: 'PM + Safety Manager (co-sign)', peReviewer: 'PX', notes: 'Both must sign before submission' },
  { subSurface: 'PERMIT_POSTING', requiredCertifiers: 'PM', peReviewer: 'PX', notes: 'Superintendent contributes evidence and verification inputs, but PM submits certification' },
  { subSurface: 'CONTRACT_OBLIGATIONS', requiredCertifiers: 'PM', peReviewer: 'PX', notes: 'PA may assist with register upkeep, but PM submits certification' },
  { subSurface: 'RESPONSIBILITY_MATRIX', requiredCertifiers: 'PM (proposes) + PX (reviews as part of certification)', peReviewer: 'PX', notes: 'PX approval of Responsibility Matrix is part of the certification act' },
  { subSurface: 'EXECUTION_BASELINE', requiredCertifiers: 'PM (submits) + PX-approved PM Plan prerequisite', peReviewer: 'PX', notes: 'PM Plan approval is a prerequisite, but EXECUTION_BASELINE still proceeds through ReadinessCertification review' },
];

// -- Locked Architecture Decisions (P3-E11 Master Index) -----------------------

export const STARTUP_LOCKED_DECISIONS: ReadonlyArray<IStartupLockedDecision> = [
  { decisionId: 1, description: 'Project Startup is a top-level readiness program; its sub-surfaces are subordinate ledgers, verification surfaces, and baseline records — not five equal peer forms' },
  { decisionId: 2, description: 'Owner Contract Review is a Contract Obligations Register with obligation lifecycle states, active monitoring capability, and certification-review rules; it is not a one-time review form' },
  { decisionId: 3, description: 'Startup operates a formal readiness state machine with blocker tracking, evidence gates, readiness review, and exception handling including waivers' },
  { decisionId: 4, description: 'The Responsibility Matrix is a role-accountability and routing engine; category-level primary coverage and critical-category acknowledgment govern certification, while task descriptions remain immutable template entries' },
  { decisionId: 5, description: 'The PM Plan is a structured Project Execution Baseline; its sections capture explicit commitment records against which Closeout/Autopsy can compute deltas' },
  { decisionId: 6, description: 'Startup preserves explicit project-scoped StartupBaseline snapshot records that survive into the Closeout/Autopsy phase for delta analysis; Closeout may read these records but may not write to them' },
  { decisionId: 7, description: 'Startup Safety Readiness is a remediation-capable surface: Fail items require remediation notes; the Startup Safety surface does not feed Safety module corrective-action ledgers; the two surfaces are operationally independent' },
  { decisionId: 8, description: 'Permit Posting Verification (Section 4) is an evidence-and-cross-reference verification surface; it cross-references the Permits module for context but does not write to it; permit status from P3-E7 does not auto-resolve Section 4 items' },
  { decisionId: 9, description: 'The approval model is multi-party readiness certification plus PE mobilization authorization; mobilization authorization is the gate that triggers the stabilization window' },
  { decisionId: 10, description: 'Startup remains active through an early-execution stabilization window (configurable, default 14 days post-mobilization authorization); at window close, PE locks the baseline and the StartupBaseline snapshot is created; the snapshot is immutable from that point' },
];

// -- Cross-Contract References (T01 §9) ----------------------------------------

export const STARTUP_CROSS_CONTRACT_REFS: ReadonlyArray<IStartupCrossContractRef> = [
  { contract: 'P3-E1 §3.10', relationship: 'Module classification — always-on lifecycle module; readiness program' },
  { contract: 'P3-E2 §13', relationship: 'SoT and action-authority matrix — Startup SoT scope consistent with §13 entries' },
  { contract: 'P3-D1 Activity Spine', relationship: 'Startup publishes lifecycle events; event catalog in T08 §1' },
  { contract: 'P3-D2 Health Spine', relationship: 'Startup publishes readiness state and surface metrics; metric catalog in T08 §2' },
  { contract: 'P3-D3 Work Queue', relationship: 'Startup raises and clears Work Queue items; item catalog in T08 §3' },
  { contract: 'P3-D4 Related Items', relationship: 'Startup registers cross-module relationship pairs; pairs in T08 §4' },
  { contract: 'P3-E4 Financial', relationship: 'Read-only pre-fill signal for Execution Baseline; independent after lock' },
  { contract: 'P3-E7 Permits', relationship: 'Read-only display context for Section 4 Permit Posting Verification' },
  { contract: 'P3-E8 Safety', relationship: 'Related Items link only; Safety module is operationally independent' },
  { contract: 'P3-E10 Closeout', relationship: 'StartupBaseline read API; Closeout reads for delta analysis; no reverse flow' },
  { contract: 'P3-G1 §4.10', relationship: 'Lane capability — full parity; both PWA and SPFx deliver full Startup experience' },
  { contract: 'P3-H1 §18.6', relationship: 'Acceptance criteria for Startup; T10 §5 provides the updated 31-criterion gate' },
];

// -- Shared Package Requirements (T10 §1) --------------------------------------

export const STARTUP_SHARED_PACKAGE_REQUIREMENTS: ReadonlyArray<IStartupSharedPackageRequirement> = [
  { packageName: '@hbc/field-annotations', blockerLevel: 'Hard blocker', verificationRequired: 'Annotation write API callable; annotation layer isolated from operational record storage' },
  { packageName: '@hbc/versioned-record', blockerLevel: 'Hard blocker', verificationRequired: 'Version-on-write hooks available for record mutation events' },
  { packageName: '@hbc/project-canvas', blockerLevel: 'Hard blocker', verificationRequired: 'Canvas tile registration API accepts Startup StartupCanvasTileAdapter' },
  { packageName: '@hbc/my-work-feed', blockerLevel: 'Hard blocker', verificationRequired: 'Work Queue item creation API accepts Startup source module and all item type keys defined in T08 §3' },
  { packageName: '@hbc/activity-timeline', blockerLevel: 'Hard blocker', verificationRequired: 'Activity Timeline publication/runtime accepts Startup event types in T08 §1' },
  { packageName: 'P3-D2 Health Spine publication contract', blockerLevel: 'Hard blocker', verificationRequired: 'Health Spine publication contract accepts all Startup metric keys in T08 §2 and exposes them to Project Health Pulse consumers' },
];

// -- Operating Principles (T01 §1.1) ------------------------------------------

export const STARTUP_OPERATING_PRINCIPLES: ReadonlyArray<IStartupOperatingPrinciple> = [
  { id: 1, function: 'ReadinessCertification', description: 'Each sub-surface certifies independently; readiness is submitted for PE review and formally accepted or returned for correction' },
  { id: 2, function: 'PEMobilizationAuthorization', description: 'PE issues formal mobilization authorization; this is the gate that separates planning from execution; distinct from PE annotation and sub-surface approval' },
  { id: 3, function: 'BaselineContinuity', description: 'Startup locks an immutable StartupBaseline snapshot that captures every material commitment made at launch; this snapshot travels forward into Closeout/Autopsy as the reference for delta analysis' },
];

// -- Stage 1 Activity Spine Events (T10 §2 Stage 1) ---------------------------

export const STAGE1_ACTIVITY_EVENTS = [
  'StartupProgramCreated', 'StartupStateTransitioned', 'ProgramBlockerCreated',
  'ProgramBlockerResolved', 'StartupMobilizationAuthorized', 'StartupBaselineLocked',
] as const satisfies ReadonlyArray<Stage1ActivityEvent>;

export const STAGE1_ACTIVITY_EVENT_DEFINITIONS: ReadonlyArray<IStage1ActivityEventDef> = [
  { event: 'StartupProgramCreated', description: 'Startup program instantiated at project creation in DRAFT state' },
  { event: 'StartupStateTransitioned', description: 'Program readiness state advanced or regressed' },
  { event: 'ProgramBlockerCreated', description: 'New program-level or multi-surface blocker raised' },
  { event: 'ProgramBlockerResolved', description: 'Program blocker resolved or waived' },
  { event: 'StartupMobilizationAuthorized', description: 'PE issued formal mobilization authorization' },
  { event: 'StartupBaselineLocked', description: 'Stabilization window closed; StartupBaseline snapshot created; all Tier 2 records read-only' },
];

// -- Stage 1 Health Spine Metrics (T10 §2 Stage 1) ----------------------------

export const STAGE1_HEALTH_METRICS = [
  'startupReadinessState', 'startupCertificationProgress', 'startupOpenProgramBlockerCount',
] as const satisfies ReadonlyArray<Stage1HealthMetric>;

export const STAGE1_HEALTH_METRIC_DEFINITIONS: ReadonlyArray<IStage1HealthMetricDef> = [
  { metric: 'startupReadinessState', description: 'Current StartupReadinessStateCode for the project' },
  { metric: 'startupCertificationProgress', description: 'Count of ReadinessCertifications in ACCEPTED or WAIVED state out of 6 total' },
  { metric: 'startupOpenProgramBlockerCount', description: 'Count of ProgramBlockers with blockerStatus = OPEN' },
];

// -- Label Maps ---------------------------------------------------------------

export const STARTUP_READINESS_STATE_LABELS: Readonly<Record<StartupReadinessStateCode, string>> = {
  DRAFT: 'Draft',
  ACTIVE_PLANNING: 'Active Planning',
  READINESS_REVIEW: 'Readiness Review',
  READY_FOR_MOBILIZATION: 'Ready for Mobilization',
  MOBILIZED: 'Mobilized',
  STABILIZING: 'Stabilizing',
  BASELINE_LOCKED: 'Baseline Locked',
  ARCHIVED: 'Archived',
};

export const STARTUP_SUB_SURFACE_LABELS: Readonly<Record<StartupSubSurface, string>> = {
  STARTUP_TASK_LIBRARY: 'Startup Task Library',
  SAFETY_READINESS: 'Safety Readiness',
  PERMIT_POSTING: 'Permit Posting',
  CONTRACT_OBLIGATIONS: 'Contract Obligations',
  RESPONSIBILITY_MATRIX: 'Responsibility Matrix',
  EXECUTION_BASELINE: 'Execution Baseline',
};

export const STARTUP_CERTIFICATION_STATUS_LABELS: Readonly<Record<StartupCertificationStatus, string>> = {
  NOT_SUBMITTED: 'Not Submitted',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  CONDITIONALLY_ACCEPTED: 'Conditionally Accepted',
  WAIVED: 'Waived',
};

export const WAIVER_STATUS_LABELS: Readonly<Record<WaiverStatus, string>> = {
  PENDING_PE_REVIEW: 'Pending PE Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  RESOLVED: 'Resolved',
  LAPSED: 'Lapsed',
};

export const PROGRAM_BLOCKER_TYPE_LABELS: Readonly<Record<ProgramBlockerType, string>> = {
  OwnerContractNotExecuted: 'Owner Contract Not Executed',
  NTPNotIssued: 'NTP Not Issued',
  KeyPersonnelNotNamed: 'Key Personnel Not Named',
  SiteNotAvailable: 'Site Not Available',
  InsuranceGap: 'Insurance Gap',
  Other: 'Other',
};

export const STARTUP_TIER_LABELS: Readonly<Record<StartupTier, string>> = {
  ProgramCore: 'Tier 1 — Program Core',
  GovernedTemplate: 'Tier 2 — Governed Template and Task Library',
  ProjectScoped: 'Tier 3 — Project-Scoped Operational Surfaces',
  Continuity: 'Tier 4 — Continuity',
};

export const STARTUP_AUTHORITY_ROLE_LABELS: Readonly<Record<StartupAuthorityRole, string>> = {
  PM: 'Project Manager',
  PA: 'Project Accountant',
  Superintendent: 'Superintendent',
  SafetyManager: 'Safety Manager',
  PX: 'Project Executive',
  PER: 'Portfolio Executive Reviewer',
  QAQC: 'QA/QC Manager',
  Field: 'Field Engineer',
  Accounting: 'Accounting',
  System: 'System',
};
