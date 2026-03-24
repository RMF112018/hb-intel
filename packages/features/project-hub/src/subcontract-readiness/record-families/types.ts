/**
 * P3-E13-T08 Stage 2 Subcontract Execution Readiness Module record-families TypeScript contracts.
 * Parent case, requirement items, evaluation, exception aggregate, formal decision, projections.
 */

import type {
  ExecutionReadinessOutcome,
  InCaseContinuityReason,
  OutcomeReasonCode,
  ReadinessLedgerType,
  ReadinessRecordFamily,
  ReadinessWorkflowStatus,
  SupersedeVoidTrigger,
} from './enums.js';

// -- SubcontractReadinessCase (T02 §2) ----------------------------------------

/** Parent source-of-truth record per T02 §2. One active case per identity. */
export interface ISubcontractReadinessCase {
  // Identity fields (§2.1)
  readonly readinessCaseId: string;
  readonly projectId: string;
  readonly subcontractorLegalEntityId: string;
  readonly linkedBuyoutLineId: string | null;
  readonly awardPathFingerprint: string;
  // Lineage fields (§2.1)
  readonly sourceCaseId: string | null;
  readonly supersedesCaseId: string | null;
  readonly supersededByCaseId: string | null;
  readonly caseVersion: number;
  // Operational headers (§2.2)
  readonly workflowStatus: ReadinessWorkflowStatus;
  readonly plannedExecutionDate: string | null;
  readonly activeRequirementProfileId: string | null;
  readonly activeRequirementProfileVersion: number | null;
  readonly activeDecisionId: string | null;
  readonly activeExceptionCaseId: string | null;
  readonly lastSubmittedAt: string | null;
  readonly lastEvaluatedAt: string | null;
  readonly lastRenewedAt: string | null;
  // Audit
  readonly createdAt: string;
  readonly createdBy: string;
  readonly lastModifiedAt: string;
  readonly lastModifiedBy: string | null;
}

// -- ExecutionReadinessDecision (T02 §5) --------------------------------------

/** Formal issued decision for gate consumption per T02 §5. */
export interface IExecutionReadinessDecision {
  readonly executionReadinessDecisionId: string;
  readonly readinessCaseId: string;
  readonly issuedAt: string;
  readonly issuedByUserId: string;
  readonly issuedByRole: string;
  readonly outcome: ExecutionReadinessOutcome;
  readonly outcomeReasonCode: OutcomeReasonCode;
  readonly blockingItemCountAtIssue: number;
  readonly exceptionIterationIdsAtIssue: readonly string[];
  readonly supersededByDecisionId: string | null;
}

// -- ReadinessRequirementItem (T02 §6) ----------------------------------------

/** Governed requirement item scaffold per T02 §6. */
export interface IReadinessRequirementItem {
  readonly requirementItemId: string;
  readonly readinessCaseId: string;
  readonly requirementFamilyCode: string;
  readonly profileProvenance: string;
  readonly profileVersion: number;
  readonly blockingSeverity: string;
  readonly renewalExpirationDate: string | null;
  readonly createdAt: string;
  readonly createdBy: string;
}

// -- RequirementArtifact (T02 §6) ---------------------------------------------

/** Linked evidence and receipt provenance per T02 §6. */
export interface IRequirementArtifact {
  readonly artifactId: string;
  readonly requirementItemId: string;
  readonly readinessCaseId: string;
  readonly artifactName: string;
  readonly artifactType: string;
  readonly uploadedAt: string;
  readonly uploadedBy: string;
  readonly receiptProvenance: string | null;
}

// -- RequirementEvaluation (T02 §6) -------------------------------------------

/** Specialist evaluation result and typed ruling per T02 §6. */
export interface IRequirementEvaluation {
  readonly evaluationId: string;
  readonly requirementItemId: string;
  readonly readinessCaseId: string;
  readonly evaluatedAt: string;
  readonly evaluatedBy: string;
  readonly evaluatedByRole: string;
  readonly evaluationResult: string;
  readonly deficiencyNote: string | null;
}

// -- ExceptionCase (T02 §7) ---------------------------------------------------

/** Parent governed exception aggregate per T02 §7. */
export interface IExceptionCase {
  readonly exceptionCaseId: string;
  readonly readinessCaseId: string;
  readonly linkedRequirementItemIds: readonly string[];
  readonly createdAt: string;
  readonly createdBy: string;
}

// -- Supporting Types ---------------------------------------------------------

/** Record family definition row per T02 §1. */
export interface IReadinessRecordFamilyDef {
  readonly family: ReadinessRecordFamily;
  readonly purpose: string;
  readonly ledgerType: ReadinessLedgerType;
}

/** Supersede/void trigger definition per T02 §3.3. */
export interface ISupersedeVoidTriggerDef {
  readonly trigger: SupersedeVoidTrigger;
  readonly description: string;
}

/** In-case continuity definition per T02 §3.2. */
export interface IInCaseContinuityDef {
  readonly reason: InCaseContinuityReason;
  readonly description: string;
}
