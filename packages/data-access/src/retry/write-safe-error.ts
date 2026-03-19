/**
 * P1-D1 Task 3.1: Write-safe error classification.
 *
 * Canonical error taxonomy for write operations. Consuming apps import
 * `WriteFailureReason` to decide error messaging and UX recovery actions.
 * C3 telemetry uses `classifyWriteFailure()` to populate `proxy.request.error`
 * event `failureReason` fields.
 */

import { HbcDataAccessError } from '../errors/index.js';

/**
 * Exhaustive set of user-visible write failure reasons.
 * Consuming apps use this to decide error messaging and UX recovery actions.
 */
export enum WriteFailureReason {
  /** Network unreachable or timeout; may succeed on retry. */
  NetworkUnreachable = 'NETWORK_UNREACHABLE',

  /** Backend service unavailable (503, 502, 504); may succeed on retry. */
  ServiceUnavailable = 'SERVICE_UNAVAILABLE',

  /** Rate limited (429); app may show "try again later" messaging. */
  RateLimited = 'RATE_LIMITED',

  /** Request validation failed (422); will not succeed on retry without data change. */
  ValidationFailed = 'VALIDATION_FAILED',

  /** Permission denied (401, 403); will not succeed on retry without auth change. */
  PermissionDenied = 'PERMISSION_DENIED',

  /** Conflict detected (409, e.g., concurrent edit); requires conflict resolution. */
  ConflictDetected = 'CONFLICT_DETECTED',

  /** Resource not found (404); the entity targeted by update/delete does not exist. */
  NotFound = 'NOT_FOUND',

  /** Generic server error (500); backend failed for an unclassified reason. */
  ServerError = 'SERVER_ERROR',

  /** Unknown or unexpected error; code not recognized. */
  UnknownError = 'UNKNOWN_ERROR',
}

/**
 * Classifies a data-access error as a specific user-facing failure reason.
 * Guides UI to show appropriate messaging and recovery options.
 *
 * @param error The HbcDataAccessError to classify
 * @returns WriteFailureReason enum value
 *
 * @example
 * ```typescript
 * try {
 *   await leadRepository.create(data, idempotency);
 * } catch (err) {
 *   const reason = classifyWriteFailure(err as HbcDataAccessError);
 *   if (reason === WriteFailureReason.ValidationFailed) {
 *     showInlineValidationError();
 *   } else if (reason === WriteFailureReason.NetworkUnreachable) {
 *     showRetryButton();
 *   }
 * }
 * ```
 */
export function classifyWriteFailure(error: HbcDataAccessError): WriteFailureReason {
  const code = error.code;

  if (code === 'NETWORK_ERROR' || code === 'TIMEOUT') {
    return WriteFailureReason.NetworkUnreachable;
  }

  if (code === 'SERVICE_UNAVAILABLE' || code === 'BAD_GATEWAY' || code === 'GATEWAY_TIMEOUT') {
    return WriteFailureReason.ServiceUnavailable;
  }

  if (code === 'RATE_LIMITED') {
    return WriteFailureReason.RateLimited;
  }

  if (code === 'VALIDATION_ERROR') {
    return WriteFailureReason.ValidationFailed;
  }

  if (code === 'UNAUTHORIZED' || code === 'FORBIDDEN') {
    return WriteFailureReason.PermissionDenied;
  }

  if (code === 'CONFLICT') {
    return WriteFailureReason.ConflictDetected;
  }

  if (code === 'NOT_FOUND') {
    return WriteFailureReason.NotFound;
  }

  if (code === 'SERVER_ERROR') {
    return WriteFailureReason.ServerError;
  }

  return WriteFailureReason.UnknownError;
}
