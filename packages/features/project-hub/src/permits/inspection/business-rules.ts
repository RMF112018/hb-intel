/**
 * P3-E7-T04 Inspection, deficiency, and compliance control business rules.
 */

import type { DeficiencyResolutionStatus, DeficiencySeverity, ExpirationRiskTier, IssuedPermitStatus, PermitHealthTier } from '../records/enums.js';
import type { IInspectionDeficiency, IIssuedPermit, IRequiredInspectionCheckpoint } from '../records/types.js';
import type { IComplianceCloseoutGateResult, ITemplateImportRow, ITemplateImportRowValidation } from './types.js';
import { DEFICIENCY_HEALTH_IMPACT_RULES } from './constants.js';

// ── Expiration Risk (§4.2) ──────────────────────────────────────────

export const calculateDaysToExpiration = (expirationDate: string, today: string): number => {
  const exp = new Date(expirationDate);
  const now = new Date(today);
  return Math.floor((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

export const calcExpirationRiskTier = (expirationDate: string, today: string): ExpirationRiskTier => {
  const days = calculateDaysToExpiration(expirationDate, today);
  if (days < 0) return 'CRITICAL';
  if (days <= 30) return 'HIGH';
  if (days <= 90) return 'MEDIUM';
  return 'LOW';
};

// ── Deficiency Health Impact (§3.3) ─────────────────────────────────

export const getDeficiencyHealthImpact = (
  severity: DeficiencySeverity,
  resolutionStatus: DeficiencyResolutionStatus,
): PermitHealthTier | null => {
  const rule = DEFICIENCY_HEALTH_IMPACT_RULES.find(
    (r) => r.severity === severity && r.resolutionStatus === resolutionStatus,
  );
  return rule?.healthTierImpact ?? null;
};

// ── Compliance Close-Out Gate (§6) ──────────────────────────────────

export const isComplianceCloseoutGateMet = (
  permit: Pick<IIssuedPermit, 'currentStatus' | 'expirationDate'>,
  checkpoints: readonly Pick<IRequiredInspectionCheckpoint, 'isBlockingCloseout' | 'currentResult'>[],
  deficiencies: readonly Pick<IInspectionDeficiency, 'resolutionStatus'>[],
  today: string,
): IComplianceCloseoutGateResult => {
  const unmetConditions: string[] = [];

  // Condition 1: All blocking checkpoints passed or N/A
  const blockingNotPassed = checkpoints.filter(
    (c) => c.isBlockingCloseout && c.currentResult !== 'PASS' && c.currentResult !== 'NOT_APPLICABLE',
  );
  if (blockingNotPassed.length > 0) {
    unmetConditions.push(`${blockingNotPassed.length} blocking checkpoint(s) have not passed.`);
  }

  // Condition 2: No open/acknowledged/in-progress deficiencies
  const openStatuses: readonly DeficiencyResolutionStatus[] = ['OPEN', 'ACKNOWLEDGED', 'REMEDIATION_IN_PROGRESS'];
  const openDeficiencies = deficiencies.filter((d) => openStatuses.includes(d.resolutionStatus));
  if (openDeficiencies.length > 0) {
    unmetConditions.push(`${openDeficiencies.length} deficiency(ies) still open or in progress.`);
  }

  // Condition 3: Permit status is ACTIVE or UNDER_INSPECTION
  const validStatuses: readonly IssuedPermitStatus[] = ['ACTIVE', 'UNDER_INSPECTION'];
  if (!validStatuses.includes(permit.currentStatus)) {
    unmetConditions.push(`Permit status is '${permit.currentStatus}'; must be ACTIVE or UNDER_INSPECTION.`);
  }

  // Condition 4: Not expired
  const daysToExp = calculateDaysToExpiration(permit.expirationDate, today);
  if (daysToExp < 0) {
    unmetConditions.push('Permit has expired. Renewal required before closeout.');
  }

  return { canClose: unmetConditions.length === 0, unmetConditions };
};

// ── Template Import Validation (§5.2) ───────────────────────────────

export const validateTemplateImportRow = (
  row: ITemplateImportRow,
  rowNumber: number,
): ITemplateImportRowValidation => {
  const errors: string[] = [];

  if (!row.inspection || row.inspection.trim().length === 0) {
    errors.push('checkpointName (Inspection column) must be non-empty.');
  }

  const validResults = ['PASS', 'FAIL', 'NOT_APPLICABLE', 'PENDING'];
  if (!validResults.includes(row.result)) {
    errors.push(`result must be one of: ${validResults.join(', ')}.`);
  }

  return { valid: errors.length === 0, errors, rowNumber };
};
