/**
 * P3-E6-T01 Risk Ledger business rules.
 * Pure functions implementing R-01 through R-06.
 */

import type { RiskImpact, RiskProbability, RiskStatus } from './enums.js';
import type { IRiskImmutabilityResult, IRiskRecord } from './types.js';
import { RISK_IMMUTABLE_FIELDS, TERMINAL_RISK_STATUSES } from './constants.js';

/**
 * R-04: Calculate risk score as probability × impact.
 * Range: 1–25 (ordinal multiplication).
 */
export const calculateRiskScore = (
  probability: RiskProbability,
  impact: RiskImpact,
): number => probability * impact;

/**
 * Check whether a risk is overdue.
 * A risk is overdue when its targetMitigationDate is before today
 * AND its status is not terminal.
 */
export const isRiskOverdue = (
  record: Pick<IRiskRecord, 'targetMitigationDate' | 'status'>,
  today: string,
): boolean => {
  if ((TERMINAL_RISK_STATUSES as readonly RiskStatus[]).includes(record.status)) {
    return false;
  }
  return record.targetMitigationDate < today;
};

/**
 * Generate a risk number in RISK-### format.
 * Pads the sequence number to at least 3 digits.
 */
export const generateRiskNumber = (sequenceNumber: number): string =>
  `RISK-${String(sequenceNumber).padStart(3, '0')}`;

/**
 * R-01: Validate that immutable fields have not been changed.
 * Compares proposed updates against the original record for all fields in RISK_IMMUTABLE_FIELDS.
 * Returns violations for any immutable field that appears in the update with a different value.
 */
export const validateRiskRecordImmutability = (
  original: IRiskRecord,
  updated: Partial<IRiskRecord>,
): IRiskImmutabilityResult => {
  const violations: string[] = [];

  for (const field of RISK_IMMUTABLE_FIELDS) {
    if (field in updated && updated[field as keyof IRiskRecord] !== original[field as keyof IRiskRecord]) {
      violations.push(`Field '${field}' is immutable and cannot be changed after creation.`);
    }
  }

  return { valid: violations.length === 0, violations };
};
