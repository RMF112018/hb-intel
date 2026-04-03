/**
 * P7-05 / P7-08: Shared recovery guidance types for provisioning failures.
 *
 * Defined in @hbc/models so both the backend (producer) and client packages
 * (consumers) share the same contract. The backend's recovery-guidance.ts
 * implements the logic; this file defines the shape.
 */

/** Recommended recovery action for the operator. */
export type RecoveryAction =
  | 'retry'
  | 'escalate'
  | 'investigate-permissions'
  | 'fix-configuration'
  | 'wait-and-retry'
  | 'contact-it';

/** Structured recovery guidance for a failed provisioning run. */
export interface IRecoveryGuidance {
  /** Whether a retry is likely to resolve the issue. */
  retryAdvisable: boolean;
  /** Primary recommended action. */
  recommendedAction: RecoveryAction;
  /** Human-readable explanation of what failed. */
  failureSummary: string;
  /** Human-readable explanation of what likely blocked the run. */
  likelyCause: string;
  /** Specific next step the operator should take. */
  nextStep: string;
  /** When escalation is more appropriate than retry. */
  escalationReason: string | null;
  /** Relevant runbook section reference. */
  runbookRef: string | null;
}

/** Categories of prelaunch validation failure. */
export type PrelaunchFailureCategory =
  | 'environment'
  | 'request-data'
  | 'permission'
  | 'configuration'
  | 'bootstrap'
  | 'entra-readiness';

/** A single prelaunch validation failure with operator-meaningful context. */
export interface IPrelaunchFailure {
  /** Machine-readable failure code (e.g. 'MISSING_ENV_SHAREPOINT_TENANT_URL'). */
  code: string;
  /** Failure category for grouping and display. */
  category: PrelaunchFailureCategory;
  /** Human-readable description of what is wrong. */
  message: string;
  /** Operator-facing remediation guidance. */
  remediation: string;
}

/** Result of prelaunch validation. */
export interface IPrelaunchValidationResult {
  /** True when all checks pass and provisioning may proceed. */
  ok: boolean;
  /** List of failures — empty when ok is true. */
  failures: IPrelaunchFailure[];
}
