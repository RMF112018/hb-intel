/**
 * P3-E6-T01 Risk Ledger health spine metric helpers (§1.8).
 * All functions are pure and operate on arrays of IRiskRecord.
 */

import type { IRiskRecord } from './types.js';
import { DEFAULT_HIGH_RISK_SCORE_THRESHOLD, TERMINAL_RISK_STATUSES } from './constants.js';
import type { RiskStatus } from './enums.js';

const isOpenRisk = (record: IRiskRecord): boolean =>
  !(TERMINAL_RISK_STATUSES as readonly RiskStatus[]).includes(record.status);

/** Count of risks where status is not terminal. */
export const calculateOpenRiskCount = (records: readonly IRiskRecord[]): number =>
  records.filter(isOpenRisk).length;

/**
 * Count of open risks where riskScore >= threshold.
 * Default threshold is governed (DEFAULT_HIGH_RISK_SCORE_THRESHOLD = 15).
 */
export const calculateHighRiskCount = (
  records: readonly IRiskRecord[],
  threshold: number = DEFAULT_HIGH_RISK_SCORE_THRESHOLD,
): number =>
  records.filter((r) => isOpenRisk(r) && r.riskScore >= threshold).length;

/** Count of open risks where targetMitigationDate < today. */
export const calculateOverdueRiskCount = (
  records: readonly IRiskRecord[],
  today: string,
): number =>
  records.filter((r) => isOpenRisk(r) && r.targetMitigationDate < today).length;

/** Count of open risks grouped by category. */
export const calculateRiskCountByCategory = (
  records: readonly IRiskRecord[],
): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const record of records) {
    if (isOpenRisk(record)) {
      counts[record.category] = (counts[record.category] ?? 0) + 1;
    }
  }
  return counts;
};

/**
 * Count of risks that moved to MaterializationPending within the governed review window.
 * Uses statusDate to determine if the transition occurred within [periodStart, periodEnd].
 */
export const calculateMaterializationRate = (
  records: readonly IRiskRecord[],
  periodStart: string,
  periodEnd: string,
): number =>
  records.filter(
    (r) =>
      r.status === 'MaterializationPending' &&
      r.statusDate >= periodStart &&
      r.statusDate <= periodEnd,
  ).length;
