/**
 * P3-E4-T08 spine event factories for activity, health, and work queue integration.
 */

import type {
  FinancialActivityEventType,
  FinancialHealthMetricKey,
  FinancialWorkQueueItemType,
  IFinancialActivityEvent,
  IFinancialHealthMetric,
  IFinancialWorkQueueItem,
} from '../types/index.js';

export const FINANCIAL_SPINE_EVENTS_SCOPE = 'financial/spine-events';

/** Create a typed Financial activity spine event (T08 §14.1). */
export const createFinancialActivityEvent = (
  eventType: FinancialActivityEventType,
  projectId: string,
  payload: Record<string, unknown>,
): IFinancialActivityEvent => ({
  eventType,
  projectId,
  timestamp: new Date().toISOString(),
  payload,
});

/** Create a typed Financial health spine metric (T08 §14.2). */
export const createFinancialHealthMetric = (
  key: FinancialHealthMetricKey,
  value: number,
  unit: 'usd' | 'percent',
  updatedOn: string,
): IFinancialHealthMetric => ({
  key,
  value,
  unit,
  updatedAt: new Date().toISOString(),
  updatedOn,
});

/**
 * Create a full health metric snapshot from current financial state (T08 §14.2).
 * Returns the complete set of 10 metrics.
 */
export const createFinancialHealthSnapshot = (metrics: {
  readonly projectedOverUnder: number;
  readonly profitMargin: number;
  readonly estimatedCostAtCompletion: number;
  readonly totalCostExposureToDate: number;
  readonly percentBuyoutCompleteDollarWeighted: number;
  readonly totalRealizedBuyoutSavings: number;
  readonly totalUndispositionedSavings: number;
  readonly peakCashRequirement: number;
  readonly cashFlowAtRisk: number;
  readonly buyoutToCommittedCostsReconciliation: number;
}, updatedOn: string): IFinancialHealthMetric[] => [
  createFinancialHealthMetric('projectedOverUnder', metrics.projectedOverUnder, 'usd', updatedOn),
  createFinancialHealthMetric('profitMargin', metrics.profitMargin, 'percent', updatedOn),
  createFinancialHealthMetric('estimatedCostAtCompletion', metrics.estimatedCostAtCompletion, 'usd', updatedOn),
  createFinancialHealthMetric('totalCostExposureToDate', metrics.totalCostExposureToDate, 'usd', updatedOn),
  createFinancialHealthMetric('percentBuyoutCompleteDollarWeighted', metrics.percentBuyoutCompleteDollarWeighted, 'percent', updatedOn),
  createFinancialHealthMetric('totalRealizedBuyoutSavings', metrics.totalRealizedBuyoutSavings, 'usd', updatedOn),
  createFinancialHealthMetric('totalUndispositionedSavings', metrics.totalUndispositionedSavings, 'usd', updatedOn),
  createFinancialHealthMetric('peakCashRequirement', metrics.peakCashRequirement, 'usd', updatedOn),
  createFinancialHealthMetric('cashFlowAtRisk', metrics.cashFlowAtRisk, 'usd', updatedOn),
  createFinancialHealthMetric('buyoutToCommittedCostsReconciliation', metrics.buyoutToCommittedCostsReconciliation, 'percent', updatedOn),
];

/** Create a Financial work queue item (T08 §14.3). */
export const createFinancialWorkQueueItem = (
  itemType: FinancialWorkQueueItemType,
  projectId: string,
  assignedTo: string,
  message: string,
  context?: Record<string, unknown>,
): IFinancialWorkQueueItem => ({
  itemType,
  projectId,
  assignedTo,
  message,
  context: context ?? {},
  createdAt: new Date().toISOString(),
});
