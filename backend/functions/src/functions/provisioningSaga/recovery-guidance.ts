/**
 * P7-05: Recovery guidance engine for provisioning failures.
 *
 * Produces structured, operator-meaningful recovery recommendations based on
 * the run's failureClass, failed step, and retry history. Pure function —
 * no service calls, no side effects.
 *
 * Consumed by:
 * - GET /api/provisioning-recovery-guidance/{projectId} (operator API)
 * - Future: admin detail modal rendering
 */

import type { IProvisioningStatus, ProvisioningFailureClass } from '@hbc/models';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Step name lookup
// ---------------------------------------------------------------------------

const STEP_NAMES: Record<number, string> = {
  1: 'Create Site',
  2: 'Create Document Library',
  3: 'Upload Template Files',
  4: 'Create Data Lists',
  5: 'Install Web Parts',
  6: 'Set Permissions',
  7: 'Associate Hub Site',
};

// ---------------------------------------------------------------------------
// Guidance logic
// ---------------------------------------------------------------------------

/**
 * Generate recovery guidance for a failed provisioning run.
 *
 * Returns structured guidance based on:
 * - `failureClass` (from P7-04 classifyFailure)
 * - `currentStep` (which step failed)
 * - `retryCount` (how many retries have been attempted)
 * - step-level error details
 */
export function getRecoveryGuidance(status: IProvisioningStatus): IRecoveryGuidance {
  if (status.overallStatus !== 'Failed') {
    return {
      retryAdvisable: false,
      recommendedAction: 'wait-and-retry',
      failureSummary: `Run is ${status.overallStatus} — no recovery action needed.`,
      likelyCause: 'The run has not failed.',
      nextStep: 'No action required. Monitor the run for completion.',
      escalationReason: null,
      runbookRef: null,
    };
  }

  const failedStep = status.steps.find((s) => s.status === 'Failed');
  const stepName = STEP_NAMES[status.currentStep] ?? `Step ${status.currentStep}`;
  const errorMsg = failedStep?.errorMessage ?? 'Unknown error';
  const failureClass = status.failureClass ?? 'admin-class';
  const retryCount = status.retryCount ?? 0;

  return buildGuidance(failureClass, stepName, status.currentStep, errorMsg, retryCount);
}

function buildGuidance(
  failureClass: ProvisioningFailureClass,
  stepName: string,
  stepNumber: number,
  errorMsg: string,
  retryCount: number,
): IRecoveryGuidance {
  switch (failureClass) {
    case 'transient':
      return buildTransientGuidance(stepName, errorMsg, retryCount);
    case 'permissions':
      return buildPermissionsGuidance(stepName, stepNumber, errorMsg);
    case 'structural':
      return buildStructuralGuidance(stepName, stepNumber, errorMsg);
    case 'repeated':
      return buildRepeatedGuidance(stepName, errorMsg, retryCount);
    case 'admin-class':
    default:
      return buildAdminClassGuidance(stepName, errorMsg, retryCount);
  }
}

function buildTransientGuidance(
  stepName: string,
  errorMsg: string,
  retryCount: number,
): IRecoveryGuidance {
  const maxRetries = 3;
  const retryAdvisable = retryCount < maxRetries;

  return {
    retryAdvisable,
    recommendedAction: retryAdvisable ? 'retry' : 'escalate',
    failureSummary: `Transient failure at "${stepName}": ${truncate(errorMsg)}`,
    likelyCause: 'A temporary platform issue (throttling, timeout, or connectivity) prevented the step from completing.',
    nextStep: retryAdvisable
      ? `Retry the provisioning run. ${maxRetries - retryCount} retry attempt(s) remain before escalation is recommended.`
      : 'Retry limit reached. Escalate to investigate whether the transient issue has become persistent.',
    escalationReason: retryAdvisable
      ? null
      : `${retryCount} retries attempted without success. The issue may no longer be transient.`,
    runbookRef: 'provisioning-runbook.md#how-to-manually-retry-a-failed-provisioning-run',
  };
}

function buildPermissionsGuidance(
  stepName: string,
  stepNumber: number,
  errorMsg: string,
): IRecoveryGuidance {
  const isGraphStep = stepNumber === 6;

  return {
    retryAdvisable: false,
    recommendedAction: 'investigate-permissions',
    failureSummary: `Permissions failure at "${stepName}": ${truncate(errorMsg)}`,
    likelyCause: isGraphStep
      ? 'The Entra ID Group.ReadWrite.All permission may have been revoked or was never granted. Step 6 requires this permission to create security groups.'
      : 'The provisioning service lacks required permissions to perform this operation. This may be a SharePoint site permission, Graph API permission, or app registration issue.',
    nextStep: isGraphStep
      ? 'Verify that Group.ReadWrite.All is granted in the Entra ID app registration. Contact IT if the permission was revoked. Once restored, set GRAPH_GROUP_PERMISSION_CONFIRMED=true and retry.'
      : 'Review the error details and verify that all required permissions are in place. Contact IT to restore any missing permissions before retrying.',
    escalationReason: 'Retry will not resolve a permissions issue. The permission must be restored first.',
    runbookRef: 'provisioning-runbook.md#how-to-escalate-a-stuck-run',
  };
}

function buildStructuralGuidance(
  stepName: string,
  stepNumber: number,
  errorMsg: string,
): IRecoveryGuidance {
  const isHubStep = stepNumber === 7;
  const isSiteStep = stepNumber === 1;

  let likelyCause = 'The request data or environment configuration has an issue that the provisioning service cannot resolve automatically.';
  let nextStep = 'Review the error details and correct the underlying configuration or request data before retrying.';

  if (isHubStep) {
    likelyCause = 'The hub site may not exist, may have been deleted, or the SHAREPOINT_HUB_SITE_ID configuration may be incorrect.';
    nextStep = 'Verify SHAREPOINT_HUB_SITE_ID points to a valid, active hub site. Correct the configuration and retry.';
  } else if (isSiteStep) {
    likelyCause = 'The SharePoint site creation failed due to a naming conflict, tenant configuration issue, or invalid site template.';
    nextStep = 'Check whether a site with this project number already exists. If so, archive or rename it. Then retry provisioning.';
  }

  return {
    retryAdvisable: false,
    recommendedAction: 'fix-configuration',
    failureSummary: `Structural failure at "${stepName}": ${truncate(errorMsg)}`,
    likelyCause,
    nextStep,
    escalationReason: 'Retry will not resolve a structural issue. The underlying configuration must be corrected first.',
    runbookRef: 'provisioning-runbook.md#how-to-escalate-a-stuck-run',
  };
}

function buildRepeatedGuidance(
  stepName: string,
  errorMsg: string,
  retryCount: number,
): IRecoveryGuidance {
  return {
    retryAdvisable: false,
    recommendedAction: 'escalate',
    failureSummary: `Repeated failure at "${stepName}" after ${retryCount} attempt(s): ${truncate(errorMsg)}`,
    likelyCause: 'The same error has occurred across multiple provisioning attempts, indicating a persistent issue rather than a transient one.',
    nextStep: 'Escalate to IT or engineering. Provide the project ID, correlation ID, and error details for investigation.',
    escalationReason: `The same failure pattern has persisted across ${retryCount} attempt(s). Further retries are unlikely to succeed without intervention.`,
    runbookRef: 'provisioning-runbook.md#how-to-escalate-a-stuck-run',
  };
}

function buildAdminClassGuidance(
  stepName: string,
  errorMsg: string,
  retryCount: number,
): IRecoveryGuidance {
  return {
    retryAdvisable: retryCount === 0,
    recommendedAction: retryCount === 0 ? 'retry' : 'escalate',
    failureSummary: `Unclassified failure at "${stepName}": ${truncate(errorMsg)}`,
    likelyCause: 'The error does not match any known failure pattern. Manual investigation is required to determine the root cause.',
    nextStep: retryCount === 0
      ? 'Try one retry to rule out a transient issue. If the failure recurs, escalate with full error details.'
      : 'Escalate to IT or engineering with the project ID, correlation ID, step number, and error message.',
    escalationReason: retryCount > 0
      ? 'The failure could not be classified and has recurred. Admin investigation is needed.'
      : null,
    runbookRef: 'provisioning-runbook.md#how-to-escalate-a-stuck-run',
  };
}

function truncate(msg: string, maxLen = 200): string {
  return msg.length > maxLen ? msg.substring(0, maxLen) + '…' : msg;
}
