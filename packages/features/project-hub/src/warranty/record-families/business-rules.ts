/**
 * P3-E14-T10 Stage 2 Project Warranty Module record-families business rules.
 * Authority matrix, immutability, terminal states, PX-exclusive actions.
 */

import type {
  WarrantyAuthorityRole,
  WarrantyCaseStatus,
  WarrantyWriteAction,
} from './enums.js';
import {
  WARRANTY_TERMINAL_CASE_STATUSES,
  WARRANTY_WRITE_AUTHORITY_MATRIX,
} from './constants.js';

// -- Authority Matrix (T02 §6.2) ----------------------------------------------

/**
 * Returns true if the role is allowed to perform the action per T02 §6.2.
 */
export const canWarrantyRolePerformAction = (
  role: WarrantyAuthorityRole,
  action: WarrantyWriteAction,
): boolean => {
  const entry = WARRANTY_WRITE_AUTHORITY_MATRIX.find((e) => e.action === action);
  return entry !== undefined && (entry.allowedRoles as readonly string[]).includes(role);
};

// -- Immutability (T02 §6.4) --------------------------------------------------

/**
 * WarrantyCaseResolutionRecord is immutable after creation per T02 §6.4.
 * Always returns true.
 */
export const isWarrantyResolutionRecordImmutable = (): true => true;

/**
 * WarrantyCoverageDecision revisions are always additive per T02 §6.4.
 * Previous decisions are preserved on supersession. Always returns true.
 */
export const isWarrantyCoverageDecisionSupersede = (): true => true;

// -- PX-Exclusive Actions (T02 §6.4) ------------------------------------------

/**
 * Returns true if the role can re-open a Closed case per T02 §6.4.
 * PX only.
 */
export const canWarrantyReopenClosedCase = (
  role: WarrantyAuthorityRole,
): boolean =>
  role === 'PX';

/**
 * Returns true if the role can extend an SLA deadline per T02 §6.4.
 * PX only.
 */
export const canWarrantyExtendSlaDeadline = (
  role: WarrantyAuthorityRole,
): boolean =>
  role === 'PX';

// -- Terminal Case Status (T02 §1) --------------------------------------------

/**
 * Returns true if the case status is terminal per T02 §1.
 */
export const isWarrantyCaseStatusTerminal = (
  status: WarrantyCaseStatus,
): boolean =>
  (WARRANTY_TERMINAL_CASE_STATUSES as readonly string[]).includes(status);

/**
 * Returns true if the case status is active (non-terminal).
 */
export const isWarrantyCaseStatusActive = (
  status: WarrantyCaseStatus,
): boolean =>
  !isWarrantyCaseStatusTerminal(status);
