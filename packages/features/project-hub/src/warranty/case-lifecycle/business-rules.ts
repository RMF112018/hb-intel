/**
 * P3-E14-T10 Stage 4 Project Warranty Module case-lifecycle business rules.
 * State machine validation, SLA computation, escalation, verification gate, re-open.
 */

import type { WarrantyCaseStatus, WarrantySlaStatus, ResolutionOutcome } from '../record-families/enums.js';
import type { WarrantySlaTier, WarrantySlaWindow } from './enums.js';
import type { IWarrantyNextMoveDef } from './types.js';
import {
  WARRANTY_CASE_TRANSITIONS,
  WARRANTY_NEXT_MOVE_DEFINITIONS,
  WARRANTY_SLA_APPROACHING_THRESHOLD_DAYS,
  WARRANTY_SLA_WINDOW_DEFINITIONS,
} from './constants.js';

// -- State Machine (T04 §3.2) ------------------------------------------------

/**
 * Returns true if the transition from → to is valid per T04 §3.2.
 */
export const isValidWarrantyCaseTransition = (
  from: WarrantyCaseStatus,
  to: WarrantyCaseStatus,
): boolean =>
  WARRANTY_CASE_TRANSITIONS.some((t) => t.from === from && t.to === to);

/**
 * Returns the required actor for a transition per T04 §3.2.
 */
export const getWarrantyTransitionActor = (
  from: WarrantyCaseStatus,
  to: WarrantyCaseStatus,
): string | undefined =>
  WARRANTY_CASE_TRANSITIONS.find((t) => t.from === from && t.to === to)?.actor;

// -- Next Move (T04 §4) -------------------------------------------------------

/**
 * Returns the next move definition for a case status per T04 §4.
 */
export const getWarrantyNextMove = (
  status: WarrantyCaseStatus,
): IWarrantyNextMoveDef | undefined =>
  WARRANTY_NEXT_MOVE_DEFINITIONS.find((d) => d.status === status);

// -- SLA Computation (T04 §5.4) -----------------------------------------------

/**
 * Computes SLA status per T04 §5.4.
 * Uses simple day-based comparison (business day computation is shared-package scope).
 */
export const computeWarrantySlaStatus = (
  deadlineDate: string | null,
  currentDate: string,
  approachingThresholdDays: number = WARRANTY_SLA_APPROACHING_THRESHOLD_DAYS,
): WarrantySlaStatus => {
  if (!deadlineDate) return 'NotApplicable';
  const deadline = new Date(deadlineDate);
  const current = new Date(currentDate);
  const diffMs = deadline.getTime() - current.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Overdue';
  if (diffDays <= approachingThresholdDays) return 'Approaching';
  return 'WithinSla';
};

// -- SLA Clock (T04 §5.3) ----------------------------------------------------

/**
 * Returns true if the SLA clock pauses at this status per T04 §5.3.
 * Clock pauses only at AwaitingOwner.
 */
export const doesWarrantySlaClockPause = (
  status: WarrantyCaseStatus,
): boolean =>
  status === 'AwaitingOwner';

// -- SLA Deadline Days (T04 §5.2) ---------------------------------------------

/**
 * Returns the SLA deadline in business days for the given tier and window per T04 §5.2.
 */
export const getWarrantySlaDeadlineDays = (
  tier: WarrantySlaTier,
  window: WarrantySlaWindow,
): number => {
  const def = WARRANTY_SLA_WINDOW_DEFINITIONS.find((d) => d.window === window);
  if (!def) return 0;
  return tier === 'Expedited' ? def.expeditedDays : def.standardDays;
};

// -- Re-Open (T04 §10) -------------------------------------------------------

/**
 * Returns true if the role can re-open a Closed case per T04 §10.
 * PX only.
 */
export const canWarrantyReopenCase = (
  role: string,
): boolean =>
  role === 'PX';

// -- Verification Gate (T04 §9) -----------------------------------------------

/**
 * Returns true if verification is required for the given resolution outcome per T04 §9.
 * All outcomes require verification except PmAccepted.
 */
export const isWarrantyVerificationRequired = (
  outcome: ResolutionOutcome,
): boolean =>
  outcome !== 'PmAccepted';

// -- Duplicate Target (T04 §11.2) --------------------------------------------

/**
 * Returns true if the target case status is valid for a duplicate reference per T04 §11.2.
 * A Closed case may not be the canonical target — it should be re-opened instead.
 */
export const isDuplicateTargetValid = (
  targetStatus: WarrantyCaseStatus,
): boolean =>
  targetStatus !== 'Closed' && targetStatus !== 'NotCovered' &&
  targetStatus !== 'Denied' && targetStatus !== 'Duplicate' && targetStatus !== 'Voided';
