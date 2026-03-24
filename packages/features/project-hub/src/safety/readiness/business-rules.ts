/**
 * P3-E8-T08 Readiness evaluation business rules.
 * Decision logic, exception validation, override governance, auto-lapse.
 */

import type { ReadinessBlockerType, ReadinessDecision, ReadinessEvaluationLevel } from './enums.js';
import type { IReadinessBlocker, IReadinessOverride } from './types.js';
import { EXCEPTION_MIN_RATIONALE_LENGTH, OVERRIDE_REQUIRED_ACKNOWLEDGERS } from './constants.js';

// -- Readiness Decision Logic (§9) ------------------------------------------

/**
 * §9: Evaluate readiness decision from blocker counts.
 * HARD blockers → NOT_READY. SOFT only → READY_WITH_EXCEPTION. None → READY.
 */
export const evaluateReadiness = (
  hardBlockerCount: number,
  softBlockerCount: number,
): ReadinessDecision => {
  if (hardBlockerCount > 0) return 'NOT_READY';
  if (softBlockerCount > 0) return 'READY_WITH_EXCEPTION';
  return 'READY';
};

// -- Blocker Exception Rules (§7) -------------------------------------------

/**
 * §7: Only SOFT + excepable blockers can be excepted.
 * HARD blockers must be fully resolved.
 */
export const canExceptBlocker = (
  blockerType: ReadinessBlockerType,
  excepable: boolean,
): boolean => blockerType === 'SOFT' && excepable;

/**
 * §7: Exception rationale must be at least 20 characters.
 */
export const isExceptionValid = (rationale: string): boolean =>
  rationale.trim().length >= EXCEPTION_MIN_RATIONALE_LENGTH;

// -- Override Governance (§8) -----------------------------------------------

/**
 * §8: Override is complete when all required acknowledgers have signed.
 * Project/Subcontractor: Safety Manager + PM.
 * Activity: Safety Manager + PM + Superintendent.
 */
export const isOverrideComplete = (
  override: Pick<IReadinessOverride, 'safetyManagerAcknowledgment' | 'pmAcknowledgment' | 'superintendentAcknowledgment'>,
  evaluationLevel: ReadinessEvaluationLevel,
): boolean => {
  const requiredRoles = OVERRIDE_REQUIRED_ACKNOWLEDGERS[evaluationLevel];

  for (const role of requiredRoles) {
    if (role === 'SafetyManager' && override.safetyManagerAcknowledgment === null) return false;
    if (role === 'PM' && override.pmAcknowledgment === null) return false;
    if (role === 'Superintendent' && override.superintendentAcknowledgment === null) return false;
  }

  return true;
};

/**
 * §8: Get required acknowledger roles for an override at a given level.
 */
export const getRequiredAcknowledgersForOverride = (
  level: ReadinessEvaluationLevel,
): readonly string[] => OVERRIDE_REQUIRED_ACKNOWLEDGERS[level];

// -- Auto-Lapse Logic (§7, §8) ---------------------------------------------

/**
 * §7: Exception auto-lapses when expiresAt is past.
 * Null expiresAt = no auto-lapse.
 */
export const shouldAutoLapseException = (
  expiresAt: string | null,
  now: string,
): boolean => {
  if (expiresAt === null) return false;
  return new Date(now).getTime() > new Date(expiresAt).getTime();
};

/**
 * §8: Override auto-lapses when expiresAt is past.
 * Null expiresAt = no auto-lapse.
 */
export const shouldAutoLapseOverride = (
  expiresAt: string | null,
  now: string,
): boolean => {
  if (expiresAt === null) return false;
  return new Date(now).getTime() > new Date(expiresAt).getTime();
};

// -- Blocker Helpers --------------------------------------------------------

/**
 * Returns true if any blocker in the list is a HARD blocker and not excepted.
 */
export const isHardBlockerActive = (
  blockers: readonly IReadinessBlocker[],
): boolean => blockers.some((b) => b.blockerType === 'HARD' && !b.isExcepted);
