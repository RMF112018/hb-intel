/**
 * P3-E11-T10 Stage 1 Project Startup Module foundation business rules.
 * State machine validation, certification gates, PX-exclusivity, waiver lapse.
 */

import type {
  StartupCertificationStatus,
  PXExclusiveAction,
  StartupReadinessStateCode,
  StartupTransitionTriggerType,
} from './enums.js';
import {
  PX_EXCLUSIVE_ACTIONS,
  STARTUP_RECORD_FAMILIES,
  STARTUP_STATE_TRANSITIONS,
} from './constants.js';

// -- State Machine Validation (T01 §4.2) ------------------------------------

/**
 * Returns true if the transition from `from` to `to` is valid per T01 §4.2.
 * Invalid transitions should return HTTP 409.
 */
export const isValidStateTransition = (
  from: StartupReadinessStateCode,
  to: StartupReadinessStateCode,
): boolean =>
  STARTUP_STATE_TRANSITIONS.some((t) => t.from === from && t.to === to);

/**
 * Returns true if the transition from `from` to `to` requires PX role.
 * Returns false if the transition is not found (caller should validate first).
 */
export const requiresPEForTransition = (
  from: StartupReadinessStateCode,
  to: StartupReadinessStateCode,
): boolean => {
  const transition = STARTUP_STATE_TRANSITIONS.find((t) => t.from === from && t.to === to);
  return transition?.requiresPE ?? false;
};

/**
 * Returns the trigger type for a valid transition per T01 §4.2.
 * Returns undefined if the transition is not valid.
 */
export const getTransitionTriggerType = (
  from: StartupReadinessStateCode,
  to: StartupReadinessStateCode,
): StartupTransitionTriggerType | undefined => {
  const transition = STARTUP_STATE_TRANSITIONS.find((t) => t.from === from && t.to === to);
  return transition?.triggerType;
};

// -- Certification Gate Checks (T10 §2 Stage 1) -----------------------------

/** Statuses that count as "cleared" for mobilization readiness. */
const CLEARED_CERT_STATUSES: readonly StartupCertificationStatus[] = ['ACCEPTED', 'WAIVED'];

/**
 * Returns true if all 6 ReadinessCertifications are in ACCEPTED or WAIVED state,
 * which is the prerequisite for advancing to READY_FOR_MOBILIZATION per T10 §2.
 */
export const canAdvanceToReadyForMobilization = (
  certStatuses: readonly StartupCertificationStatus[],
): boolean =>
  certStatuses.length === 6 &&
  certStatuses.every((s) => CLEARED_CERT_STATUSES.includes(s));

/**
 * Returns true if mobilization authorization can be issued per T10 §2 Stage 1:
 * (a) all 6 certs accepted/waived, (b) no open PROGRAM-scope blockers.
 */
export const canIssueMobilizationAuth = (
  certStatuses: readonly StartupCertificationStatus[],
  openProgramBlockerCount: number,
): boolean =>
  canAdvanceToReadyForMobilization(certStatuses) && openProgramBlockerCount === 0;

// -- Record Ownership (T02 §1) -----------------------------------------------

/**
 * Returns true if Startup is the SoT writer for the given record family.
 * All 28 values in StartupRecordFamily are Startup-owned by definition.
 */
export const isStartupOwnedRecord = (family: string): boolean =>
  (STARTUP_RECORD_FAMILIES as readonly string[]).includes(family);

// -- PX-Exclusive Actions (T09 §1, T10 §2 Stage 1) -------------------------

/**
 * Returns true if the action requires PX role.
 * Per T09 and T10 Stage 1: certification acceptance, waivers,
 * mobilization authorization, baseline lock are PX-exclusive.
 */
export const isPXExclusiveAction = (action: PXExclusiveAction): boolean =>
  (PX_EXCLUSIVE_ACTIONS as readonly string[]).includes(action);

// -- Waiver Lapse Check (T02 §3.9) ------------------------------------------

/**
 * Returns true if the waiver has lapsed: `plannedResolutionDate` has passed
 * and `waiverStatus` is not RESOLVED. Per T02 §3.9 lapse rule.
 */
export const isWaiverLapsed = (
  plannedResolutionDate: string,
  waiverStatus: string,
  now: Date = new Date(),
): boolean => {
  if (waiverStatus === 'RESOLVED') return false;
  const dueDate = new Date(plannedResolutionDate);
  return now > dueDate;
};

// -- Cross-Module Immutability ------------------------------------------------

/**
 * Startup never mutates cross-module data. Always returns false.
 * Enforces the read-only cross-module rule from T01 §8.2.
 */
export const canStartupMutateCrossModuleData = (): false => false;
