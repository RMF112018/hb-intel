/**
 * P3-E13-T08 Stage 7 Subcontract Execution Readiness Module cross-module-contracts business rules.
 * Financial gate enforcement, Startup boundary, downstream projection guards, external input limits.
 */

import type {
  ReadinessRelatedItemPair,
} from './enums.js';
import {
  READINESS_RELATED_ITEM_PAIRS,
} from './constants.js';

// -- Financial Gate Contract (T07 §1.3) ----------------------------------------

/**
 * Returns true if Financial may progress to ContractExecuted per T07 §1.3.
 * Only when the gate projection outcome indicates execution is allowed.
 */
export const canFinancialProgressToContractExecuted = (
  gateOutcome: string,
): boolean =>
  gateOutcome === 'READY' || gateOutcome === 'READY_WITH_APPROVED_EXCEPTION';

/**
 * Financial must not infer readiness from raw item rows per T07 §1.3.
 * Always returns false.
 */
export const canFinancialInferFromRawItems = (): false => false;

/**
 * Financial must not write readiness records per T07 §1.3.
 * Always returns false.
 */
export const canFinancialWriteReadinessRecords = (): false => false;

/**
 * Financial must not mutate exception outcomes per T07 §1.3.
 * Always returns false.
 */
export const canFinancialMutateExceptionOutcomes = (): false => false;

// -- Startup Boundary (T07 §2) ------------------------------------------------

/**
 * Startup may not own the readiness workflow per T07 §2.
 * Always returns false.
 */
export const canStartupOwnReadinessWorkflow = (): false => false;

/**
 * Startup may not own evaluation ledgers per T07 §2.
 * Always returns false.
 */
export const canStartupOwnEvaluationLedgers = (): false => false;

// -- Downstream Projection Guards (T07 §3) ------------------------------------

/**
 * All downstream consumers receive projections only per T07 §3.
 * The source-of-truth workflow remains in the readiness module.
 * Always returns true.
 */
export const isDownstreamProjectionOnly = (): true => true;

// -- Related Item Pairs (T07 §4.1) --------------------------------------------

/**
 * Returns true if the pair is a valid related-item pair per T07 §4.1.
 */
export const isValidRelatedItemPair = (
  pair: ReadinessRelatedItemPair,
): boolean =>
  (READINESS_RELATED_ITEM_PAIRS as readonly string[]).includes(pair);

// -- Future External Inputs (T07 §5) ------------------------------------------

/**
 * External systems are input contributors only per T07 §5.
 * Always returns true.
 */
export const isExternalInputContributorOnly = (): true => true;

/**
 * External systems cannot displace the parent readiness case per T07 §5.
 * Always returns false.
 */
export const canExternalSystemDisplaceReadinessCase = (): false => false;

/**
 * External systems cannot displace specialist evaluation per T07 §5.
 * Always returns false.
 */
export const canExternalSystemDisplaceEvaluation = (): false => false;

/**
 * External systems cannot displace the project-level decision per T07 §5.
 * Always returns false.
 */
export const canExternalSystemDisplaceDecision = (): false => false;
