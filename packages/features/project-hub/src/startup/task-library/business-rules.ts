/**
 * P3-E11-T10 Stage 2 Project Startup Task Library business rules.
 * Template immutability, dependency validation, overdue logic, blocker auto-creation,
 * stabilization editability, certification eligibility, completion percentage.
 */

import type {
  StartupTaskGatingImpact,
  StartupTaskResult,
  StartupTaskSeverity,
} from './enums.js';
import type { StartupReadinessStateCode } from '../foundation/enums.js';
import { IMMUTABLE_TEMPLATE_FIELDS } from './constants.js';

// -- Template Immutability (T03 §2) ------------------------------------------

/**
 * Returns true if the field is a template-inherited immutable field.
 * PATCH targeting these fields returns HTTP 409 per T03 §2.
 */
export const isImmutableTemplateField = (fieldName: string): boolean =>
  IMMUTABLE_TEMPLATE_FIELDS.includes(fieldName);

// -- Dependency Validation (T03 §5) ------------------------------------------

/**
 * Returns true if a task result of YES can be set given upstream dependency results.
 * Per T03 §5.1: YES requires all upstream dependencies have result = YES.
 * NO and NA are always allowed regardless of upstream state.
 */
export const canSetTaskResult = (
  result: StartupTaskResult,
  dependsOnResults: ReadonlyArray<{ taskNumber: string; result: StartupTaskResult | null }>,
): boolean => {
  if (result === 'NO' || result === 'NA') return true;
  // result === 'YES': check all upstream deps have YES
  return dependsOnResults.every((dep) => dep.result === 'YES');
};

// -- Overdue Logic (T03 §6) --------------------------------------------------

/**
 * Returns true if the task is overdue per T03 §6.2:
 * dueDate has passed AND result ≠ YES AND result ≠ NA.
 */
export const isTaskOverdue = (
  dueDate: string | null,
  result: StartupTaskResult | null,
  now: Date = new Date(),
): boolean => {
  if (dueDate === null) return false;
  if (result === 'YES' || result === 'NA') return false;
  return now > new Date(dueDate);
};

// -- Auto-Blocker Creation (T03 §8.3) ----------------------------------------

/**
 * Returns true if the system should auto-create a TaskBlocker stub.
 * Per T03 §8.3: CRITICAL task with result = NO triggers auto-creation.
 */
export const shouldAutoCreateBlocker = (
  severity: StartupTaskSeverity,
  result: StartupTaskResult | null,
): boolean =>
  severity === 'CRITICAL' && result === 'NO';

// -- Stabilization Editability (T03 §11) -------------------------------------

/**
 * Returns true if a task result can be edited in the given program state.
 * Per T03 §11:
 * - activeDuringStabilization=true: editable through STABILIZING, locked at BASELINE_LOCKED
 * - activeDuringStabilization=false: locked at MOBILIZED
 */
export const isTaskEditableDuringStabilization = (
  activeDuringStabilization: boolean,
  programState: StartupReadinessStateCode,
): boolean => {
  const alwaysEditable: StartupReadinessStateCode[] = [
    'DRAFT', 'ACTIVE_PLANNING', 'READINESS_REVIEW', 'READY_FOR_MOBILIZATION',
  ];
  if (alwaysEditable.includes(programState)) return true;

  if (programState === 'MOBILIZED') return activeDuringStabilization;
  if (programState === 'STABILIZING') return activeDuringStabilization;

  // BASELINE_LOCKED, ARCHIVED — never editable
  return false;
};

// -- Certification Eligibility (T03 §13) -------------------------------------

/** Minimal instance shape needed for certification eligibility check. */
interface CertEligibilityInstance {
  readonly result: StartupTaskResult | null;
  readonly severity: StartupTaskSeverity;
  readonly gatingImpact: StartupTaskGatingImpact;
  readonly hasActiveBlocker: boolean;
}

/** Minimal blocker shape needed for certification eligibility check. */
interface CertEligibilityBlocker {
  readonly instanceId: string;
  readonly description: string;
  readonly isAutoCreated: boolean;
  readonly blockerStatus: 'OPEN' | 'RESOLVED' | 'WAIVED';
  readonly linkedWaiverId: string | null;
}

/**
 * Returns true if STARTUP_TASK_LIBRARY certification may be submitted per T03 §13.1.
 * Requirements:
 * 1. Every instance has result ≠ null OR has at least one OPEN TaskBlocker with description
 * 2. Every CRITICAL instance with result = NO has blocker or approved waiver
 * 3. Every HIGH instance with result = NO or null has OPEN TaskBlocker
 * 4. No auto-created TaskBlocker stubs have empty description
 */
export const canSubmitTaskLibraryCertification = (
  instances: ReadonlyArray<CertEligibilityInstance & { instanceId: string }>,
  blockers: ReadonlyArray<CertEligibilityBlocker>,
): boolean => {
  // Rule 4: no auto-created stubs with empty description
  const hasEmptyAutoStubs = blockers.some(
    (b) => b.isAutoCreated && b.blockerStatus === 'OPEN' && !b.description,
  );
  if (hasEmptyAutoStubs) return false;

  for (const inst of instances) {
    const instBlockers = blockers.filter((b) => b.instanceId === inst.instanceId);
    const hasOpenBlocker = instBlockers.some((b) => b.blockerStatus === 'OPEN' && b.description);
    const hasWaivedBlocker = instBlockers.some((b) => b.linkedWaiverId !== null);

    // Rule 1: every instance must have result OR open blocker
    if (inst.result === null && !hasOpenBlocker) return false;

    // Rule 2: CRITICAL NO needs blocker or waiver
    if (inst.severity === 'CRITICAL' && inst.result === 'NO') {
      if (!hasOpenBlocker && !hasWaivedBlocker) return false;
    }

    // Rule 3: HIGH NO/null needs open blocker
    if (inst.severity === 'HIGH' && inst.gatingImpact === 'REQUIRES_BLOCKER_IF_OPEN') {
      if ((inst.result === 'NO' || inst.result === null) && !hasOpenBlocker) return false;
    }
  }

  return true;
};

// -- Completion Percentage (T03 §13.2) ----------------------------------------

/**
 * Computes task library completion percentage per T03 §13.2.
 * Formula: count(YES) / count(non-NA) × 100
 * NA excluded from both numerator and denominator.
 */
export const computeCompletionPercentage = (
  results: ReadonlyArray<StartupTaskResult | null>,
): number => {
  const nonNA = results.filter((r) => r !== 'NA');
  if (nonNA.length === 0) return 100;
  const yesCount = nonNA.filter((r) => r === 'YES').length;
  return (yesCount / nonNA.length) * 100;
};

// -- Gating Effect (T03 §4) -------------------------------------------------

/** Describes the system enforcement for a task's current state. */
export type GatingEffect =
  | 'blocks-submission'
  | 'requires-blocker-for-submission'
  | 'advisory-only'
  | 'no-enforcement';

/**
 * Returns the gating effect for a task given its severity, gating impact, and result.
 * Per T03 §4: determines what system enforcement applies.
 */
export const getTaskGatingEffect = (
  severity: StartupTaskSeverity,
  gatingImpact: StartupTaskGatingImpact,
  result: StartupTaskResult | null,
): GatingEffect => {
  // YES or NA — no enforcement regardless
  if (result === 'YES' || result === 'NA') return 'no-enforcement';

  // NO or null — enforcement depends on gating impact
  if (gatingImpact === 'BLOCKS_CERTIFICATION') return 'blocks-submission';
  if (gatingImpact === 'REQUIRES_BLOCKER_IF_OPEN') return 'requires-blocker-for-submission';
  return 'advisory-only';
};
