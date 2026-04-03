/**
 * P7-04: Failure classification for provisioning saga.
 *
 * Examines error shape and retry context to assign a ProvisioningFailureClass
 * value. The admin UI reads failureClass for operator display — this function
 * populates the previously orphaned field.
 *
 * Classification is backend-only. The UI must never infer failureClass.
 */

import type { ProvisioningFailureClass } from '@hbc/models';

/** Context available at classification time. */
export interface IFailureClassificationContext {
  /** Current retry count for this project (0 on first run). */
  retryCount: number;
  /** Error message from the previous failed run, if any. */
  previousErrorMessage?: string;
}

/**
 * Classify a saga step failure into an operator-meaningful category.
 *
 * Priority order:
 * 1. `repeated` — same error class recurs on a retry (retryCount ≥ 1 + similar error)
 * 2. `permissions` — 403, permission-related errors, GraphPermissionNotConfirmedError
 * 3. `transient` — 429, throttle, timeout, connection errors
 * 4. `structural` — 400, validation errors, missing resources
 * 5. `admin-class` — fallback when no pattern matches (requires admin investigation)
 */
export function classifyFailure(
  error: unknown,
  context: IFailureClassificationContext,
): ProvisioningFailureClass {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const errorName = error instanceof Error ? error.name : '';
  const lowerMsg = message.toLowerCase();

  // Check for repeated failure (same error pattern on retry)
  if (context.retryCount >= 1 && context.previousErrorMessage) {
    if (isSimilarError(lowerMsg, context.previousErrorMessage.toLowerCase())) {
      return 'repeated';
    }
  }

  // Permissions: 403, permission-not-confirmed, access denied
  if (isPermissionsError(lowerMsg, errorName)) {
    return 'permissions';
  }

  // Transient: 429, throttle, timeout, connection reset, fetch failed
  if (isTransientError(lowerMsg)) {
    return 'transient';
  }

  // Structural: 400, validation error, missing resource (404), schema mismatch
  if (isStructuralError(lowerMsg)) {
    return 'structural';
  }

  // Fallback: unclassifiable failure requires admin investigation
  return 'admin-class';
}

function isPermissionsError(msg: string, errorName: string): boolean {
  return (
    errorName === 'GraphPermissionNotConfirmedError' ||
    msg.includes('(403)') ||
    msg.includes('403:') ||
    msg.includes('forbidden') ||
    msg.includes('access denied') ||
    msg.includes('permission not confirmed') ||
    msg.includes('unauthorized') ||
    msg.includes('insufficient privileges')
  );
}

function isTransientError(msg: string): boolean {
  return (
    msg.includes('429') ||
    msg.includes('throttl') ||
    msg.includes('econnreset') ||
    msg.includes('etimedout') ||
    msg.includes('fetch failed') ||
    msg.includes('timeout') ||
    msg.includes('service unavailable') ||
    msg.includes('(503)') ||
    msg.includes('(502)') ||
    msg.includes('gateway')
  );
}

function isStructuralError(msg: string): boolean {
  return (
    msg.includes('(400)') ||
    msg.includes('400:') ||
    msg.includes('validation') ||
    msg.includes('(404)') ||
    msg.includes('not found') ||
    msg.includes('malformed') ||
    msg.includes('invalid') ||
    msg.includes('schema')
  );
}

/**
 * Heuristic: two error messages are "similar" if they share the same
 * error code pattern (e.g. "(403)") or substantial prefix overlap.
 */
function isSimilarError(current: string, previous: string): boolean {
  // Extract HTTP status codes
  const codePattern = /\((\d{3})\)/;
  const currentCode = current.match(codePattern)?.[1];
  const previousCode = previous.match(codePattern)?.[1];
  if (currentCode && previousCode && currentCode === previousCode) {
    return true;
  }

  // Check substantial prefix overlap (first 50 chars or half, whichever is smaller)
  const compareLen = Math.min(50, Math.min(current.length, previous.length) / 2);
  if (compareLen > 10 && current.substring(0, compareLen) === previous.substring(0, compareLen)) {
    return true;
  }

  return false;
}
