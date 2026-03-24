/**
 * P3-E11-T10 Stage 1 Project Startup Module foundation enumerations.
 * Program core, state machine, certification, waivers, blockers.
 */

// -- Readiness State Machine (T01 §4.1) ------------------------------------

/** The 8-state readiness lifecycle per T01 §4.1. */
export type StartupReadinessStateCode =
  | 'DRAFT'
  | 'ACTIVE_PLANNING'
  | 'READINESS_REVIEW'
  | 'READY_FOR_MOBILIZATION'
  | 'MOBILIZED'
  | 'STABILIZING'
  | 'BASELINE_LOCKED'
  | 'ARCHIVED';

// -- Sub-Surfaces (T02 §3.4) -----------------------------------------------

/** The 6 readiness sub-surfaces per T01 §3.2 / T02 §3.4. */
export type StartupSubSurface =
  | 'STARTUP_TASK_LIBRARY'
  | 'SAFETY_READINESS'
  | 'PERMIT_POSTING'
  | 'CONTRACT_OBLIGATIONS'
  | 'RESPONSIBILITY_MATRIX'
  | 'EXECUTION_BASELINE';

// -- Certification Status (T02 §3.4) ----------------------------------------

/** ReadinessCertification status values per T02 §3.4. */
export type StartupCertificationStatus =
  | 'NOT_SUBMITTED'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CONDITIONALLY_ACCEPTED'
  | 'WAIVED';

// -- Gate Outcome (T02 §3.5) ------------------------------------------------

/** ReadinessGateRecord outcome per T02 §3.5. */
export type GateOutcome =
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CONDITIONALLY_ACCEPTED';

// -- Gate Criterion Result (T02 §3.6) ---------------------------------------

/** ReadinessGateCriterion result per T02 §3.6. */
export type GateCriterionResult =
  | 'PASS'
  | 'FAIL'
  | 'WAIVED'
  | 'NOT_APPLICABLE';

// -- Waiver Status (T02 §3.9) -----------------------------------------------

/** ExceptionWaiverRecord status per T02 §3.9. */
export type WaiverStatus =
  | 'PENDING_PE_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'RESOLVED'
  | 'LAPSED';

// -- Program Blocker Scope (T02 §3.10) --------------------------------------

/** ProgramBlocker scope per T02 §3.10. */
export type ProgramBlockerScope =
  | 'PROGRAM'
  | 'MULTI_SURFACE';

// -- Program Blocker Type (T02 §3.10) ---------------------------------------

/** ProgramBlocker type per T02 §3.10. */
export type ProgramBlockerType =
  | 'OwnerContractNotExecuted'
  | 'NTPNotIssued'
  | 'KeyPersonnelNotNamed'
  | 'SiteNotAvailable'
  | 'InsuranceGap'
  | 'Other';

// -- Program Blocker Status (T02 §3.10) -------------------------------------

/** ProgramBlocker status per T02 §3.10. */
export type ProgramBlockerStatus =
  | 'OPEN'
  | 'RESOLVED'
  | 'WAIVED';

// -- Mobilization Auth Status (T02 §3.11) -----------------------------------

/** PEMobilizationAuthorization status per T02 §3.11. */
export type MobilizationAuthStatus =
  | 'ISSUED'
  | 'REVOKED';

// -- Transition Trigger Type (T01 §4.2) -------------------------------------

/** State transition trigger type per T01 §4.2. */
export type StartupTransitionTriggerType =
  | 'System'
  | 'PMAction'
  | 'PEAction'
  | 'Timer';

// -- Startup Functions (T01 §1.1) -------------------------------------------

/** The 3 architecturally distinct functions per T01 §1.1. */
export type StartupFunction =
  | 'ReadinessCertification'
  | 'PEMobilizationAuthorization'
  | 'BaselineContinuity';

// -- Record Tiers (T02 §1) --------------------------------------------------

/** The 4 record tiers per T02 §1. */
export type StartupTier =
  | 'ProgramCore'
  | 'GovernedTemplate'
  | 'ProjectScoped'
  | 'Continuity';

// -- Record Families — All 28 (T02 §1) --------------------------------------

/** All 28 Startup-owned record families per T02 §1. */
export type StartupRecordFamily =
  // Tier 1 — Program Core (9)
  | 'StartupProgram'
  | 'StartupProgramVersion'
  | 'StartupReadinessState'
  | 'ReadinessCertification'
  | 'ReadinessGateRecord'
  | 'ReadinessGateCriterion'
  | 'ExceptionWaiverRecord'
  | 'ProgramBlocker'
  | 'PEMobilizationAuthorization'
  // Tier 2 — Governed Template and Task Library (3)
  | 'StartupTaskTemplate'
  | 'StartupTaskInstance'
  | 'TaskBlocker'
  // Tier 3 — Project-Scoped Operational Surfaces (15)
  | 'JobsiteSafetyChecklist'
  | 'SafetyReadinessSection'
  | 'SafetyReadinessItem'
  | 'SafetyRemediationRecord'
  | 'PermitVerificationDetail'
  | 'ContractObligationsRegister'
  | 'ContractObligation'
  | 'ResponsibilityMatrix'
  | 'ResponsibilityMatrixRow'
  | 'ResponsibilityAssignment'
  | 'ProjectExecutionBaseline'
  | 'ExecutionBaselineSection'
  | 'BaselineSectionField'
  | 'ExecutionAssumption'
  | 'PlanTeamSignature'
  // Tier 4 — Continuity (1)
  | 'StartupBaseline';

// -- Record Families — Tier 1 Only (T02 §1) ---------------------------------

/** The 9 Tier 1 program-core record families per T02 §1. */
export type StartupTier1RecordFamily =
  | 'StartupProgram'
  | 'StartupProgramVersion'
  | 'StartupReadinessState'
  | 'ReadinessCertification'
  | 'ReadinessGateRecord'
  | 'ReadinessGateCriterion'
  | 'ExceptionWaiverRecord'
  | 'ProgramBlocker'
  | 'PEMobilizationAuthorization';

// -- Authority Roles (T09 §1) -----------------------------------------------

/** Roles with authority in the Startup Module per T09 §1. */
export type StartupAuthorityRole =
  | 'PM'
  | 'PA'
  | 'Superintendent'
  | 'SafetyManager'
  | 'PX'
  | 'PER'
  | 'QAQC'
  | 'Field'
  | 'Accounting'
  | 'System';

// -- PX-Exclusive Actions (T09 §1, T10 §2 Stage 1) -------------------------

/** Actions that require PX role per T09 and T10 Stage 1. */
export type PXExclusiveAction =
  | 'CertificationAcceptance'
  | 'CertificationWaiver'
  | 'MobilizationAuthorization'
  | 'BaselineLock'
  | 'WaiverApproval'
  | 'ReadinessReopen';

// -- Stage 1 Activity Spine Events (T10 §2 Stage 1) -------------------------

/** Activity Spine events emitted by Stage 1 per T10 §2 Stage 1. */
export type Stage1ActivityEvent =
  | 'StartupProgramCreated'
  | 'StartupStateTransitioned'
  | 'ProgramBlockerCreated'
  | 'ProgramBlockerResolved'
  | 'StartupMobilizationAuthorized'
  | 'StartupBaselineLocked';

// -- Stage 1 Health Spine Metrics (T10 §2 Stage 1) --------------------------

/** Health Spine metrics published by Stage 1 per T10 §2 Stage 1. */
export type Stage1HealthMetric =
  | 'startupReadinessState'
  | 'startupCertificationProgress'
  | 'startupOpenProgramBlockerCount';
