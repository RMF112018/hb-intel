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

// ── Risk/Watch Classification ───────────────────────────────────────

export interface BuyoutPackageRisk {
  readonly lineId: string;
  readonly divisionDescription: string;
  readonly risk: 'critical' | 'high' | 'standard' | 'none';
  readonly reasons: readonly string[];
}

/**
 * Classify risk level for each buyout package based on status, exposure, and savings.
 */
export const classifyBuyoutPackageRisks = (
  lines: readonly IBuyoutLineItem[],
): BuyoutPackageRisk[] => {
  return lines
    .filter((l) => l.status !== 'Void')
    .map((line) => {
      const reasons: string[] = [];

      if (line.overUnder !== null && line.overUnder > 0) {
        reasons.push(`Over budget by $${line.overUnder.toLocaleString()}`);
      }
      if (line.savingsDispositionStatus === 'Undispositioned' && line.buyoutSavingsAmount > 0) {
        reasons.push(`$${line.buyoutSavingsAmount.toLocaleString()} undispositioned savings`);
      }
      if (line.status === 'NotStarted' && line.originalBudget > 200000) {
        reasons.push('Large scope not yet started');
      }

      const risk: BuyoutPackageRisk['risk'] =
        line.overUnder !== null && line.overUnder > 50000 ? 'critical'
        : reasons.length >= 2 ? 'high'
        : reasons.length > 0 ? 'standard'
        : 'none';

      return {
        lineId: line.buyoutLineId,
        divisionDescription: line.divisionDescription,
        risk,
        reasons,
      };
    })
    .filter((r) => r.risk !== 'none');
};

/**
 * Determine commitment readiness — is the line ready for contract execution?
 */
export interface BuyoutCommitmentReadiness {
  readonly lineId: string;
  readonly isReady: boolean;
  readonly blockers: readonly string[];
  readonly recommendEscalation: boolean;
}

export const assessCommitmentReadiness = (
  line: IBuyoutLineItem,
  checklistStatus: string | null,
  waiverStatus: string | null,
): BuyoutCommitmentReadiness => {
  const blockers: string[] = [];

  if (line.status === 'NotStarted') {
    blockers.push('Buyout not yet initiated');
  }
  if (line.status === 'LoiPending' && !line.loiDateToBeSent) {
    blockers.push('LOI send date not set');
  }
  if (line.status === 'ContractPending') {
    const gate = validateContractExecutedGate(line.subcontractChecklistId, checklistStatus, waiverStatus);
    if (!gate.canTransition) {
      blockers.push(...gate.blockers);
    }
  }

  return {
    lineId: line.buyoutLineId,
    isReady: blockers.length === 0 && line.status !== 'NotStarted',
    blockers,
    recommendEscalation: blockers.length > 0 && line.originalBudget > 500000,
  };
};

/**
 * Generate forecast implication summary from buyout state.
 */
export interface BuyoutForecastImplication {
  readonly description: string;
  readonly module: string;
  readonly severity: 'critical' | 'high' | 'standard';
}

export const generateForecastImplications = (
  metrics: IBuyoutSummaryMetrics,
): BuyoutForecastImplication[] => {
  const implications: BuyoutForecastImplication[] = [];

  if (metrics.totalUndispositionedSavings > 0) {
    implications.push({
      description: `$${metrics.totalUndispositionedSavings.toLocaleString()} in undispositioned savings affects forecast margin`,
      module: 'Forecast Summary',
      severity: metrics.totalUndispositionedSavings > 50000 ? 'high' : 'standard',
    });
  }

  if (metrics.totalOverUnder > 0) {
    implications.push({
      description: `$${metrics.totalOverUnder.toLocaleString()} net over-budget exposure increases EAC`,
      module: 'Forecast Summary',
      severity: metrics.totalOverUnder > 100000 ? 'critical' : 'high',
    });
  }

  if (metrics.percentBuyoutCompleteDollarWeighted < 50) {
    implications.push({
      description: `Only ${metrics.percentBuyoutCompleteDollarWeighted.toFixed(0)}% bought out — significant unresolved scope`,
      module: 'Financial Control Center',
      severity: 'high',
    });
  }

  return implications;
};

/**
 * Warning explanation payloads for buyout health metrics.
 */
export interface BuyoutWarningExplanation {
  readonly metric: string;
  readonly value: number | string;
  readonly severity: 'healthy' | 'watch' | 'at-risk' | 'critical';
  readonly explanation: string;
  readonly recommendation: string;
}

export const explainBuyoutWarnings = (
  metrics: IBuyoutSummaryMetrics,
): BuyoutWarningExplanation[] => {
  const warnings: BuyoutWarningExplanation[] = [];

  if (metrics.totalUndispositionedSavings > 0) {
    warnings.push({
      metric: 'totalUndispositionedSavings',
      value: metrics.totalUndispositionedSavings,
      severity: metrics.totalUndispositionedSavings > 50000 ? 'at-risk' : 'watch',
      explanation: `$${metrics.totalUndispositionedSavings.toLocaleString()} in buyout savings not yet dispositioned`,
      recommendation: 'PM must disposition savings (Apply to Forecast, Hold in Contingency, or Release to Governed)',
    });
  }

  if (metrics.totalOverUnder > 0) {
    warnings.push({
      metric: 'totalOverUnder',
      value: metrics.totalOverUnder,
      severity: metrics.totalOverUnder > 100000 ? 'critical' : 'watch',
      explanation: `Net buyout exposure of $${metrics.totalOverUnder.toLocaleString()} over budget`,
      recommendation: 'Review over-budget lines for scope or pricing negotiation opportunity',
    });
  }

  if (metrics.percentBuyoutCompleteDollarWeighted < 60) {
    warnings.push({
      metric: 'percentBuyoutCompleteDollarWeighted',
      value: `${metrics.percentBuyoutCompleteDollarWeighted.toFixed(0)}%`,
      severity: metrics.percentBuyoutCompleteDollarWeighted < 40 ? 'critical' : 'watch',
      explanation: `Buyout is only ${metrics.percentBuyoutCompleteDollarWeighted.toFixed(0)}% complete (dollar-weighted)`,
      recommendation: 'Accelerate procurement for remaining scope packages',
    });
  }

  return warnings;
};
