/**
 * P3-E13-T08 Stage 2 Subcontract Execution Readiness Module record-families business rules.
 * Identity enforcement, lifecycle validation, decision boundaries, projection guards.
 */

import type {
  ExecutionReadinessOutcome,
  InCaseContinuityReason,
  ReadinessRecordFamily,
  ReadinessWorkflowStatus,
  SupersedeVoidTrigger,
} from './enums.js';
import type {
  ISubcontractReadinessCase,
} from './types.js';
import type { ICaseIdentityConstraint } from '../foundation/types.js';
import {
  ACTIVE_WORKFLOW_STATUSES,
  DOWNSTREAM_PROJECTION_FAMILIES,
  IN_CASE_CONTINUITY_REASONS,
  PRIMARY_LEDGER_FAMILIES,
  READINESS_RECORD_FAMILY_DEFINITIONS,
  SUPERSEDE_VOID_TRIGGERS,
  TERMINAL_WORKFLOW_STATUSES,
} from './constants.js';

// -- One-Active-Case Enforcement (T02 §3.1) -----------------------------------

/**
 * Returns true if adding a new case would violate the one-active-case rule per T02 §3.1.
 * Checks if any existing non-terminal case matches the new identity.
 */
export const isOneActiveCaseViolated = (
  existingCases: readonly ISubcontractReadinessCase[],
  newIdentity: ICaseIdentityConstraint,
): boolean =>
  existingCases.some(
    (c) =>
      !isTerminalWorkflowStatus(c.workflowStatus) &&
      c.projectId === newIdentity.projectId &&
      c.subcontractorLegalEntityId === newIdentity.subcontractorLegalEntityId &&
      c.awardPathFingerprint === newIdentity.awardBuyoutIntent,
  );

// -- In-Case Continuity (T02 §3.2) -------------------------------------------

/**
 * Returns true if the reason is a valid in-case continuity event per T02 §3.2.
 * These activities remain within the same case — no new case needed.
 */
export const isInCaseContinuityEvent = (
  reason: InCaseContinuityReason,
): boolean =>
  (IN_CASE_CONTINUITY_REASONS as readonly string[]).includes(reason);

// -- Supersede / Void Triggers (T02 §3.3) ------------------------------------

/**
 * Returns true if the trigger is a valid supersede/void trigger per T02 §3.3.
 */
export const isSupersedeVoidTrigger = (
  trigger: SupersedeVoidTrigger,
): boolean =>
  (SUPERSEDE_VOID_TRIGGERS as readonly string[]).includes(trigger);

/**
 * Returns true if the string matches a known supersede/void trigger.
 * Material identity changes require supersede/void + new case per T02 §3.3.
 */
export const shouldSupersedeOrVoid = (
  trigger: string,
): boolean =>
  (SUPERSEDE_VOID_TRIGGERS as readonly string[]).includes(trigger);

// -- Workflow Status Helpers (T02 §4) -----------------------------------------

/**
 * Returns true if the workflow status is terminal (SUPERSEDED or VOID) per T02 §4.1.
 */
export const isTerminalWorkflowStatus = (
  status: ReadinessWorkflowStatus,
): boolean =>
  (TERMINAL_WORKFLOW_STATUSES as readonly string[]).includes(status);

/**
 * Returns true if the workflow status is active (non-terminal) per T02 §4.1.
 */
export const isActiveWorkflowStatus = (
  status: ReadinessWorkflowStatus,
): boolean =>
  (ACTIVE_WORKFLOW_STATUSES as readonly string[]).includes(status);

// -- Workflow / Outcome Independence (T02 §4.3) --------------------------------

/**
 * Returns true if the workflow status and outcome combination is consistent per T02 §4.3.
 * Key rule: workflow status ≠ readiness decision. They are related but independent.
 *
 * Invalid combinations:
 * - DRAFT/ASSEMBLING with READY/BLOCKED/READY_WITH_APPROVED_EXCEPTION (can't have outcome before review)
 * - SUPERSEDED workflow must pair with SUPERSEDED outcome
 * - VOID workflow must pair with VOID outcome
 */
export const isWorkflowOutcomeConsistent = (
  workflowStatus: ReadinessWorkflowStatus,
  outcome: ExecutionReadinessOutcome,
): boolean => {
  const ws: string = workflowStatus;
  const oc: string = outcome;

  // Terminal statuses must have matching outcomes
  if (ws === 'SUPERSEDED') return oc === 'SUPERSEDED';
  if (ws === 'VOID') return oc === 'VOID';

  // Terminal outcomes must have matching workflow
  if (oc === 'SUPERSEDED') return ws === 'SUPERSEDED';
  if (oc === 'VOID') return ws === 'VOID';

  // Pre-review statuses cannot have issued outcomes
  if (ws === 'DRAFT' || ws === 'ASSEMBLING') {
    return oc === 'NOT_ISSUED';
  }

  // All other active workflow + non-terminal outcome combos are valid
  return true;
};

// -- Financial Consumption Boundary (T02 §5.2) --------------------------------

/**
 * Returns true if Financial may consume the decision per T02 §5.2.
 * Financial may only consume when a formal decision exists.
 */
export const canFinancialConsumeDecision = (
  decisionId: string | null,
): boolean =>
  decisionId !== null && decisionId.length > 0;

/**
 * Financial must not read raw item rows or exception actions directly per T02 §5.2.
 * Always returns false.
 */
export const canFinancialReadRawItems = (): false => false;

// -- Record Family Classification (T02 §1) ------------------------------------

/**
 * Returns true if the record family is a primary ledger per T02 §1.
 */
export const isRecordFamilyPrimaryLedger = (
  family: ReadinessRecordFamily,
): boolean =>
  (PRIMARY_LEDGER_FAMILIES as readonly string[]).includes(family);

/**
 * Returns true if the record family is a downstream projection per T02 §8.
 * Projections must never be treated as the authoritative place to update workflow state.
 */
export const isDownstreamProjection = (
  family: ReadinessRecordFamily,
): boolean =>
  (DOWNSTREAM_PROJECTION_FAMILIES as readonly string[]).includes(family);

/**
 * Returns the ledger type for a record family per T02 §1.
 * Returns undefined if the family is not in the definition map.
 */
export const getRecordFamilyLedgerType = (
  family: ReadinessRecordFamily,
): string | undefined =>
  READINESS_RECORD_FAMILY_DEFINITIONS.find((d) => d.family === family)?.ledgerType;
