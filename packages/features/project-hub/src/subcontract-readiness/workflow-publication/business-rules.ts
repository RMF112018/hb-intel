/**
 * P3-E13-T08 Stage 5 Subcontract Execution Readiness Module workflow-publication business rules.
 * Timer validation, routed output guards, publication enforcement, shared package use.
 */

import type {
  ProhibitedLocalSubstitute,
  ReadinessTimerType,
  RequiredSharedPackage,
} from './enums.js';
import {
  PROHIBITED_LOCAL_SUBSTITUTES,
  READINESS_TIMER_DEFINITIONS,
  REQUIRED_SHARED_PACKAGES,
} from './constants.js';

// -- Timer Validation (T05 §2.1) ----------------------------------------------

/**
 * Returns true if the timer type is anchored to a submission event per T05 §2.1.
 */
export const isTimerAnchoredToSubmission = (
  timerType: ReadinessTimerType,
): boolean =>
  timerType === 'PENDING_EVALUATOR_REVIEW' || timerType === 'PENDING_EXCEPTION_APPROVAL';

/**
 * Returns the anchor description for a timer type per T05 §2.1.
 */
export const getTimerAnchor = (
  timerType: ReadinessTimerType,
): string | undefined =>
  READINESS_TIMER_DEFINITIONS.find((t) => t.timerType === timerType)?.anchor;

// -- Routed Output Guards (T05 §3) --------------------------------------------

/**
 * All work items are routed through shared work-intelligence surfaces per T05 §3.1.
 * Always returns true — no local substitutes allowed.
 */
export const isRoutedWorkItem = (): true => true;

/**
 * All escalations are typed and policy-driven per T05 §3.3.
 * Always returns true.
 */
export const isEscalationPolicyDriven = (): true => true;

// -- Publication Guards (T05 §4) -----------------------------------------------

/**
 * All publications are downstream outputs per T05 §4.
 * None replace the primary ledgers. Always returns true.
 */
export const isPublicationDownstreamOnly = (): true => true;

// -- Shared Package Use (T05 §5) -----------------------------------------------

/**
 * Returns true if the package is required per T05 §5.
 */
export const isSharedPackageRequired = (
  pkg: RequiredSharedPackage,
): boolean =>
  (REQUIRED_SHARED_PACKAGES as readonly string[]).includes(pkg);

// -- Local Substitute Prohibition (T05 §5.1) -----------------------------------

/**
 * Returns true if the local substitute is prohibited per T05 §5.1.
 */
export const isLocalSubstituteProhibited = (
  substitute: ProhibitedLocalSubstitute,
): boolean =>
  (PROHIBITED_LOCAL_SUBSTITUTES as readonly string[]).includes(substitute);

/**
 * Must not build local reminder tables per T05 §5.1. Always returns false.
 */
export const canUseLocalReminderTable = (): false => false;

/**
 * Must not build local notification systems per T05 §5.1. Always returns false.
 */
export const canUseLocalNotificationSystem = (): false => false;

/**
 * Must not build bespoke approval routing per T05 §5.1. Always returns false.
 */
export const canBuildBespokeApprovalRouting = (): false => false;
