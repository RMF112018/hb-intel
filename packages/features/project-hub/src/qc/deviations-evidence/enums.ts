/**
 * P3-E15-T10 Stage 6 Project QC Module deviations-evidence enumerations.
 */

// -- Deviation Condition Type (T06 §3) ----------------------------------------

/** Deviation condition types per T06 §3. */
export type DeviationConditionType =
  | 'LIMITED_DURATION'
  | 'EXTRA_EVIDENCE'
  | 'ADDED_REVIEWER_CHECK'
  | 'ADDITIONAL_APPROVAL'
  | 'HEIGHTENED_MONITORING'
  | 'MANDATORY_CORRECTIVE_ACTION';

// -- Evidence Minimum Use Case (T06 §5) ---------------------------------------

/** Evidence minimum use cases per T06 §5. */
export type EvidenceMinimumUseCase =
  | 'PLAN_ACTIVATION'
  | 'REVIEW_PACKAGE_ACCEPTANCE'
  | 'GATE_ACCEPTANCE'
  | 'ISSUE_READY_FOR_REVIEW'
  | 'ACTION_VERIFICATION'
  | 'DEVIATION_APPROVAL'
  | 'EXTERNAL_APPROVAL_RECEIPT';

// -- Evidence Sufficiency Status (T06 §5) -------------------------------------

/** Evidence sufficiency statuses per T06 §5. */
export type EvidenceSufficiencyStatus =
  | 'SATISFIED'
  | 'NOT_SATISFIED'
  | 'REVIEW_PENDING'
  | 'NOT_APPLICABLE';

// -- Conflict Resolution Path (T06 §7) ---------------------------------------

/** Conflict resolution paths per T06 §7. */
export type ConflictResolutionPath =
  | 'ADOPT_NEWER_SOURCE'
  | 'RETAIN_APPROVED_BASIS'
  | 'TEMPORARY_EXCEPTION'
  | 'UNRESOLVED';

// -- Readiness Impact Action (T06 §8) ----------------------------------------

/** Readiness impact actions per T06 §8. */
export type ReadinessImpactAction =
  | 'NO_CHANGE'
  | 'DEGRADE_TO_BLOCKED'
  | 'DEGRADE_TO_NOT_READY'
  | 'DEGRADE_TO_CONDITIONAL'
  | 'ESCALATE'
  | 'RE_BLOCK';

// -- Approval Provenance Event (T06 §6.4) ------------------------------------

/** Approval provenance events per T06 §6.4. */
export type ApprovalProvenanceEvent =
  | 'IDENTIFIED'
  | 'SUBMITTED'
  | 'RESPONSE_RECEIVED'
  | 'PROOF_ATTACHED'
  | 'READINESS_RELEASED'
  | 'READINESS_BLOCKED';

// -- Deviation Readiness Effect (T06 §3) --------------------------------------

/** Deviation readiness effects per T06 §3. */
export type DeviationReadinessEffect =
  | 'STANDARD_READINESS'
  | 'READY_WITH_CONDITIONS'
  | 'NOT_READY'
  | 'BLOCKED';

// -- External Approval Resolution Type (T06 §9) ------------------------------

/** External approval resolution types per T06 §9. */
export type ExternalApprovalResolutionType =
  | 'APPROVED_WITH_PROOF'
  | 'REJECTED_WITH_REASON'
  | 'WAIVED_WITH_JUSTIFICATION'
  | 'EXPIRED_UNRESOLVED';
