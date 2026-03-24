/**
 * P3-E7-T01 Permits Module foundation business rules.
 * Thread model, authority checks, and compliance health derivation.
 */

import type { ComplianceHealthSignalType, DerivedHealthTier, PermitAuthorityAction, PermitAuthorityRole, PermitRecordType } from './enums.js';
import type { IComplianceHealthResult, IPermitThreadNode } from './types.js';
import { COMPLIANCE_HEALTH_SIGNALS, PERMIT_AUTHORITY_MATRIX } from './constants.js';

// ── Thread Model (§4) ──────────────────────────────────────────────

/** Returns true if the node is a thread root (no parent). */
export const isThreadRoot = (node: IPermitThreadNode): boolean =>
  node.threadRelationshipType === 'THREAD_ROOT';

/** Returns true if the permit is standalone (no thread relationships). */
export const isStandalone = (node: IPermitThreadNode): boolean =>
  node.threadRelationshipType === 'STANDALONE';

/** Returns true if the node is a child within a thread. */
export const isThreadChild = (node: IPermitThreadNode): boolean =>
  !isThreadRoot(node) && !isStandalone(node);

// ── Authority Model (§7.1) ──────────────────────────────────────────

/**
 * Check if a role is authorized to perform a specific action on a record type.
 */
export const canRolePerformAction = (
  role: PermitAuthorityRole,
  recordType: PermitRecordType,
  action: PermitAuthorityAction,
): boolean => {
  const rule = PERMIT_AUTHORITY_MATRIX.find(
    (r) => r.role === role && r.recordType === recordType,
  );
  if (!rule) return false;
  return rule.allowedActions.includes(action);
};

// ── Compliance Health Derivation (§8) ────────────────────────────────

/**
 * Derive compliance health tier from active signals.
 * No manual score — health is always derived from record truth.
 *
 * Priority: CRITICAL > AT_RISK > NORMAL. CLOSED is a separate terminal state.
 */
export const deriveHealthTier = (
  activeSignals: readonly ComplianceHealthSignalType[],
  isClosed: boolean = false,
): IComplianceHealthResult => {
  if (isClosed) {
    return { tier: 'CLOSED', activeSignals: [...activeSignals] };
  }

  if (activeSignals.length === 0) {
    return { tier: 'NORMAL', activeSignals: [] };
  }

  // Check if any active signal contributes to CRITICAL
  const hasCritical = activeSignals.some((signal) => {
    const config = COMPLIANCE_HEALTH_SIGNALS.find((s) => s.signalType === signal);
    return config?.contributesToTier === 'CRITICAL';
  });

  if (hasCritical) {
    return { tier: 'CRITICAL', activeSignals: [...activeSignals] };
  }

  // Check if any signal contributes to AT_RISK
  const hasAtRisk = activeSignals.some((signal) => {
    const config = COMPLIANCE_HEALTH_SIGNALS.find((s) => s.signalType === signal);
    return config?.contributesToTier === 'AT_RISK';
  });

  if (hasAtRisk) {
    return { tier: 'AT_RISK', activeSignals: [...activeSignals] };
  }

  return { tier: 'NORMAL', activeSignals: [...activeSignals] };
};

/**
 * §4.3: Derive thread health — worst child or root health in the thread.
 */
export const deriveThreadHealthTier = (
  memberTiers: readonly DerivedHealthTier[],
): DerivedHealthTier => {
  const priority: Record<DerivedHealthTier, number> = {
    CRITICAL: 0,
    AT_RISK: 1,
    NORMAL: 2,
    CLOSED: 3,
  };

  if (memberTiers.length === 0) return 'NORMAL';

  return memberTiers.reduce((worst, current) =>
    priority[current] < priority[worst] ? current : worst,
  );
};
