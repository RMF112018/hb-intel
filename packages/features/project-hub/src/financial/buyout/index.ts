/**
 * P3-E4-T06 buyout sub-domain computors and gate validation.
 * All functions are pure and deterministic.
 */

import type {
  IBuyoutLineItem,
  IBuyoutReconciliationResult,
  IBuyoutSavingsDisposition,
  IBuyoutSummaryMetrics,
  IContractExecutedGateResult,
} from '../types/index.js';
import { BUYOUT_IN_PROGRESS_STATUSES, BUYOUT_RECONCILIATION_TOLERANCE } from '../constants/index.js';

export const FINANCIAL_BUYOUT_SCOPE = 'financial/buyout';

/**
 * Compute buyout over/under (T06 §8.1).
 * Positive = over budget (unfavorable); negative = under budget (favorable/savings).
 * Returns null when contractAmount is null.
 */
export const computeBuyoutOverUnder = (
  contractAmount: number | null,
  originalBudget: number,
): number | null => {
  if (contractAmount === null) return null;
  return contractAmount - originalBudget;
};

/**
 * Compute buyout savings amount (T06 §8.1).
 * max(0, originalBudget - contractAmount) when contract is below budget; 0 otherwise.
 */
export const computeBuyoutSavingsAmount = (
  contractAmount: number | null,
  originalBudget: number,
): number => {
  if (contractAmount === null) return 0;
  return Math.max(0, originalBudget - contractAmount);
};

/**
 * Compute dollar-weighted buyout summary metrics (T06 §8.4).
 * Void lines are excluded from budget totals and active count.
 */
export const computeBuyoutSummaryMetrics = (
  lines: readonly IBuyoutLineItem[],
): IBuyoutSummaryMetrics => {
  const activeLines = lines.filter((l) => l.status !== 'Void');

  const totalBudget = activeLines.reduce((sum, l) => sum + l.originalBudget, 0);

  const executedLines = activeLines.filter(
    (l) => l.status === 'ContractExecuted' || l.status === 'Complete',
  );
  const totalContractAmount = executedLines.reduce(
    (sum, l) => sum + (l.contractAmount ?? 0),
    0,
  );
  const totalOverUnder = executedLines.reduce(
    (sum, l) => sum + (l.overUnder ?? 0),
    0,
  );
  const totalRealizedBuyoutSavings = executedLines.reduce(
    (sum, l) => sum + l.buyoutSavingsAmount,
    0,
  );

  const totalUndispositionedSavings = activeLines
    .filter((l) =>
      l.savingsDispositionStatus === 'Undispositioned' ||
      l.savingsDispositionStatus === 'PartiallyDispositioned',
    )
    .reduce((sum, l) => sum + l.buyoutSavingsAmount, 0);

  const percentBuyoutCompleteDollarWeighted = totalBudget > 0
    ? (totalContractAmount / totalBudget) * 100
    : 0;

  const linesNotStarted = activeLines.filter((l) => l.status === 'NotStarted').length;
  const linesInProgress = activeLines.filter((l) =>
    (BUYOUT_IN_PROGRESS_STATUSES as readonly string[]).includes(l.status),
  ).length;
  const linesComplete = lines.filter((l) => l.status === 'Complete').length;
  const linesVoid = lines.filter((l) => l.status === 'Void').length;

  return {
    totalBudget,
    totalContractAmount,
    totalOverUnder,
    totalRealizedBuyoutSavings,
    totalUndispositionedSavings,
    percentBuyoutCompleteDollarWeighted,
    linesNotStarted,
    linesInProgress,
    linesComplete,
    linesVoid,
    totalLinesActive: activeLines.length,
  };
};

/**
 * Validate the ContractExecuted gate (T06 §8.3).
 * Gate requires: checklistId non-null, checklist complete, waiver approved (if present).
 */
export const validateContractExecutedGate = (
  subcontractChecklistId: string | null,
  checklistStatus: string | null,
  waiverStatus: string | null,
): IContractExecutedGateResult => {
  const blockers: string[] = [];

  if (subcontractChecklistId === null) {
    blockers.push('Subcontract checklist is not linked (subcontractChecklistId is null)');
  }

  if (checklistStatus !== 'Complete') {
    blockers.push(`Subcontract checklist status is "${checklistStatus ?? 'null'}", expected "Complete"`);
  }

  if (waiverStatus !== null && waiverStatus !== 'Approved') {
    blockers.push(`Compliance waiver status is "${waiverStatus}", expected "Approved" or no waiver required`);
  }

  return { canTransition: blockers.length === 0, blockers };
};

/** Create a new savings disposition record when savings are recognized (T06 §8.6). */
export const createSavingsDisposition = (
  buyoutLineId: string,
  projectId: string,
  totalSavingsAmount: number,
): IBuyoutSavingsDisposition => {
  const now = new Date().toISOString();
  return {
    dispositionId: crypto.randomUUID(),
    buyoutLineId,
    projectId,
    totalSavingsAmount,
    dispositionedAmount: 0,
    undispositionedAmount: totalSavingsAmount,
    dispositionItems: [],
    createdAt: now,
    lastUpdatedAt: now,
  };
};

/**
 * Compute buyout-to-committed-costs reconciliation (T06 §8.7).
 * Acceptable tolerance: 5%.
 */
export const computeBuyoutReconciliation = (
  totalContractAmount: number,
  totalCommittedCosts: number,
): IBuyoutReconciliationResult => {
  if (totalCommittedCosts === 0) {
    return {
      variance: totalContractAmount,
      variancePercent: totalContractAmount === 0 ? 0 : 100,
      withinTolerance: totalContractAmount === 0,
    };
  }

  const variance = Math.abs(totalContractAmount - totalCommittedCosts);
  const variancePercent = (variance / totalCommittedCosts) * 100;

  return {
    variance,
    variancePercent,
    withinTolerance: variancePercent <= BUYOUT_RECONCILIATION_TOLERANCE * 100,
  };
};
